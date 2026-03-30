"""REST API routes — reusing memory_engine & qdrant_store directly."""
import sys
import os
import json
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "memory-mcp-server"))

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io

import config
from memory_engine import remember, recall, forget, list_all_memories, get_stats
from qdrant_store import (
    get_client,
    get_collection_stats,
    list_memories,
    search_all_collections,
    delete_memory,
    upsert_memory,
    ensure_collections,
)
from embedding import embed_text, get_dim

router = APIRouter()


# ─── Pydantic Models ────────────────────────────────────────────

class MemoryCreate(BaseModel):
    text: str
    type: str = "fact"
    tags: list[str] = []

class MemoryUpdate(BaseModel):
    text: Optional[str] = None
    tags: Optional[list[str]] = None

class SearchRequest(BaseModel):
    query: str
    type: Optional[str] = None
    top_k: int = 5

class ConfigUpdate(BaseModel):
    dedup_exact: Optional[float] = None
    dedup_merge: Optional[float] = None
    dedup_related: Optional[float] = None


# ─── Stats & Health ──────────────────────────────────────────────

@router.get("/stats")
async def api_stats():
    """Overall memory statistics."""
    return get_stats()


@router.get("/health")
async def api_health():
    """Qdrant health + system info."""
    try:
        client = get_client()
        collections = get_collection_stats()
        total_vectors = sum(c.get("points_count", 0) for c in collections.values())
        return {
            "status": "healthy",
            "qdrant": {
                "host": config.QDRANT_HOST,
                "port": config.QDRANT_PORT,
                "collections": collections,
                "total_vectors": total_vectors,
            },
            "embedding": {
                "model": config.EMBEDDING_MODEL,
                "dim": get_dim(),
            },
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@router.get("/config")
async def api_get_config():
    """Current configuration."""
    return {
        "qdrant_host": config.QDRANT_HOST,
        "qdrant_port": config.QDRANT_PORT,
        "embedding_model": config.EMBEDDING_MODEL,
        "embedding_dim": config.EMBEDDING_DIM,
        "dedup_exact": config.DEDUP_EXACT_THRESHOLD,
        "dedup_merge": config.DEDUP_MERGE_THRESHOLD,
        "dedup_related": config.DEDUP_RELATED_THRESHOLD,
        "default_user_id": config.DEFAULT_USER_ID,
        "default_top_k": config.DEFAULT_TOP_K,
    }


@router.put("/config")
async def api_update_config(body: ConfigUpdate):
    """Update dedup thresholds (runtime only)."""
    if body.dedup_exact is not None:
        config.DEDUP_EXACT_THRESHOLD = body.dedup_exact
    if body.dedup_merge is not None:
        config.DEDUP_MERGE_THRESHOLD = body.dedup_merge
    if body.dedup_related is not None:
        config.DEDUP_RELATED_THRESHOLD = body.dedup_related
    return {"message": "Config updated", "config": await api_get_config()}


# ─── Memory CRUD ─────────────────────────────────────────────────

@router.get("/memories")
async def api_list_memories(
    type: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """List memories with pagination."""
    tags = [tag] if tag else None
    # list_all_memories doesn't support offset, so we use qdrant_store directly
    from qdrant_store import list_memories as qs_list
    type_map = config.MEMORY_TYPE_MAP

    results = []
    if type and type in type_map:
        collections = [(type, type_map[type])]
    else:
        collections = [(t, c) for t, c in type_map.items()]

    for mem_type, collection in collections:
        filters = {"user_id": config.DEFAULT_USER_ID}
        if tags:
            filters["tags"] = tags
        items = qs_list(collection, filters=filters, limit=limit, offset=offset)
        for item in items:
            item["memory_type"] = mem_type
        results.extend(items)

    # Sort by created_at descending
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    if not type:
        results = results[offset : offset + limit]
    return {"items": results, "total": len(results)}


@router.get("/memories/{memory_id}")
async def api_get_memory(memory_id: str):
    """Get single memory by ID."""
    for mem_type, collection in config.MEMORY_TYPE_MAP.items():
        try:
            client = get_client()
            points = client.retrieve(collection, ids=[memory_id], with_payload=True)
            if points:
                p = points[0]
                result = {"id": str(p.id), "memory_type": mem_type, **p.payload}
                return result
        except Exception:
            continue
    raise HTTPException(status_code=404, detail="Memory not found")


@router.post("/memories")
async def api_create_memory(body: MemoryCreate):
    """Create a new memory."""
    result = remember(text=body.text, memory_type=body.type, tags=body.tags)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.put("/memories/{memory_id}")
async def api_update_memory(memory_id: str, body: MemoryUpdate):
    """Update memory content/tags."""
    # Find memory first
    for mem_type, collection in config.MEMORY_TYPE_MAP.items():
        try:
            client = get_client()
            points = client.retrieve(
                collection, ids=[memory_id], with_payload=True, with_vectors=True
            )
            if points:
                p = points[0]
                payload = dict(p.payload)
                vector = p.vector

                if body.text is not None:
                    payload["content"] = body.text
                    vector = embed_text(body.text)
                if body.tags is not None:
                    payload["tags"] = body.tags

                payload["updated_at"] = datetime.utcnow().isoformat()
                upsert_memory(collection, vector, payload, point_id=memory_id)
                return {"id": memory_id, "action": "updated", "type": mem_type}
        except Exception:
            continue
    raise HTTPException(status_code=404, detail="Memory not found")


@router.delete("/memories/{memory_id}")
async def api_delete_memory(memory_id: str, type: Optional[str] = None):
    """Delete a memory."""
    result = forget(memory_id, memory_type=type)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ─── Search ──────────────────────────────────────────────────────

@router.post("/search")
async def api_search(body: SearchRequest):
    """Semantic search across memories."""
    results = recall(query=body.query, memory_type=body.type, top_k=body.top_k)
    return {"results": results, "query": body.query}


# ─── Tags ────────────────────────────────────────────────────────

@router.get("/tags")
async def api_tags():
    """Get all tags with usage counts."""
    tag_counts: dict[str, int] = {}
    for mem_type, collection in config.MEMORY_TYPE_MAP.items():
        items = list_memories(
            collection, filters={"user_id": config.DEFAULT_USER_ID}, limit=1000
        )
        for item in items:
            for tag in item.get("tags", []):
                tag_counts[tag] = tag_counts.get(tag, 0) + 1

    tags = [{"name": k, "count": v} for k, v in sorted(tag_counts.items(), key=lambda x: -x[1])]
    return {"tags": tags}


# ─── Import / Export ─────────────────────────────────────────────

@router.get("/export")
async def api_export():
    """Export all memories as JSON download."""
    all_memories = []
    for mem_type, collection in config.MEMORY_TYPE_MAP.items():
        items = list_memories(
            collection, filters={"user_id": config.DEFAULT_USER_ID}, limit=10000
        )
        for item in items:
            item["memory_type"] = mem_type
        all_memories.extend(items)

    content = json.dumps(all_memories, ensure_ascii=False, indent=2)
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8")),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=memory_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"},
    )


@router.post("/import")
async def api_import(file: UploadFile = File(...)):
    """Import memories from JSON file."""
    content = await file.read()
    try:
        memories = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")

    results = {"created": 0, "duplicate": 0, "merged": 0, "errors": 0}
    for mem in memories:
        text = mem.get("content", "")
        mem_type = mem.get("memory_type", mem.get("type", "fact"))
        tags = mem.get("tags", [])
        if not text:
            results["errors"] += 1
            continue
        result = remember(text=text, memory_type=mem_type, tags=tags)
        action = result.get("action", "error")
        if action in results:
            results[action] += 1
        else:
            results["errors"] += 1

    return {"message": "Import complete", **results}
