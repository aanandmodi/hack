"""StadiumIQ — AI-powered stadium experience platform.

FastAPI application entry point with CORS, routing, and health check.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""
    logger.info("🏟️  StadiumIQ agent system is LIVE")
    logger.info("📡  Waiting for connections on port 8000...")
    yield
    logger.info("🛑  StadiumIQ shutting down")


app = FastAPI(
    title="StadiumIQ API",
    description="AI-powered stadium experience platform — crowd flow, queue management, intelligent routing",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "stadiumiq", "version": "1.0.0"}