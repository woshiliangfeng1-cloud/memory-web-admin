"""Memory Web Admin — FastAPI Backend"""
import sys
import os
import secrets
import hashlib

# Add memory-mcp-server to path for importing existing modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "memory-mcp-server"))

from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

from api_routes import router as api_router

app = FastAPI(title="Memory Web Admin", version="1.0.0")

# ─── Auth Config ─────────────────────────────────────────────────
AUTH_PASSWORD_HASH = hashlib.sha256(
    os.environ.get("ADMIN_PASSWORD", "Fl25919617").encode()
).hexdigest()
# In-memory session store: token -> True
_sessions: dict[str, bool] = {}

class LoginBody(BaseModel):
    password: str

@app.post("/api/login")
async def login(body: LoginBody, response: Response):
    if hashlib.sha256(body.password.encode()).hexdigest() == AUTH_PASSWORD_HASH:
        token = secrets.token_hex(32)
        _sessions[token] = True
        response.set_cookie(
            key="session",
            value=token,
            httponly=True,
            samesite="lax",
            max_age=86400 * 7,  # 7 days
        )
        return {"ok": True}
    raise HTTPException(status_code=401, detail="Wrong password")

@app.get("/api/auth-check")
async def auth_check(request: Request):
    token = request.cookies.get("session")
    if token and _sessions.get(token):
        return {"authenticated": True}
    raise HTTPException(status_code=401, detail="Not authenticated")

@app.post("/api/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session")
    if token:
        _sessions.pop(token, None)
    response.delete_cookie("session")
    return {"ok": True}

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    # Allow: login, auth-check, static assets, SPA html
    if (
        path in ("/api/login", "/api/auth-check", "/api/logout")
        or path.startswith("/assets")
        or not path.startswith("/api")
    ):
        return await call_next(request)
    # All other /api/* require auth
    token = request.cookies.get("session")
    if not token or not _sessions.get(token):
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
    return await call_next(request)

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
