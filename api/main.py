# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1 import matches
from app.database import create_tables

app = FastAPI(
    title="RoyaleScore Backend",
    description="Basketball scorekeeping and match tracking API",
    version="1.0.0"
)


# Startup event: create database tables
@app.on_event("startup")
def startup_event():
    """Initialize database tables on application startup"""
    create_tables()
    print("✓ Database tables initialized")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(matches.router, prefix="/api/v1")

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "RoyaleScore API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "matches": "/api/v1/matches",
            "match_detail": "/api/v1/matches/{match_id}",
            "record_action": "/api/v1/matches/{match_id}/action",
            "update_score": "/api/v1/matches/{match_id}/score",
            "match_actions": "/api/v1/matches/{match_id}/actions",
            "update_status": "/api/v1/matches/{match_id}/status/{status_value}"
        }
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}