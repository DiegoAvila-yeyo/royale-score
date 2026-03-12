from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import matches
from app.database import create_tables
from app.core.config import get_settings
from app.core.logging import configure_logging

settings = get_settings()
configure_logging(debug=settings.debug)

import logging
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RoyaleScore API",
    description="Real-time basketball scorekeeping & analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.on_event("startup")
def startup_event() -> None:
    create_tables()
    logger.info("RoyaleScore API started — database tables ready")


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matches.router, prefix="/api/v1")


@app.get("/", include_in_schema=False)
def root():
    return {
        "message": "RoyaleScore API is running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["infra"])
def health_check():
    return {"status": "ok"}
