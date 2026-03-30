"""Memory Web Admin — FastAPI Backend"""
import sys
import os

# Add memory-mcp-server to path for importing existing modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "memory-mcp-server"))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from api_routes import router as api_router

app = FastAPI(title="Memory Web Admin", version="1.0.0")

# CORS for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix="/api")

# Serve frontend static files (production build)
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve SPA — all non-API routes return index.html"""
        file_path = static_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(static_dir / "index.html")


if __name__ == "__main__":
    import uvicorn

    # Ensure Qdrant collections exist
    from qdrant_store import ensure_collections
    ensure_collections()

    uvicorn.run(app, host="0.0.0.0", port=18090)
