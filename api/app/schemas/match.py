from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


class PlayerActionCreate(BaseModel):
    """Record a player action during the match."""
    match_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_id: int = Field(ge=1, le=10, description="Player number 1-10 (5 home + 5 away)")
    team: Literal["home", "away"] = Field(description="Which team the action belongs to")
    action_type: str = Field(description="Action type: Falta, Robo, Asist, Tapón, etc.")
    points: int = Field(default=0, ge=0, le=4, description="Points scored (0 if non-scoring action)")
    quarter: int = Field(ge=1, le=10, description="Current game quarter (≤4 regulation, >4 OT)")
    game_clock_ms: int = Field(default=0, ge=0, description="Milliseconds remaining in the period")
    timestamp: datetime = Field(default_factory=datetime.now)

    model_config = {
        "json_schema_extra": {
            "example": {
                "match_id": "match_123",
                "player_id": 7,
                "team": "away",
                "action_type": "Puntos",
                "points": 3,
                "quarter": 2,
                "game_clock_ms": 345000,
            }
        }
    }


class MatchScoreSnapshot(BaseModel):
    """Current match score state for sync."""
    home_score: int = Field(default=0, ge=0)
    away_score: int = Field(default=0, ge=0)
    quarter: int = Field(ge=1, le=10)
    time_left: int = Field(ge=0, description="Seconds remaining in period")


class MatchCreate(BaseModel):
    """Create a new match."""
    home_team: str = Field(min_length=1, max_length=80)
    away_team: str = Field(min_length=1, max_length=80)
    location: Optional[str] = Field(default=None, max_length=120)
    date: datetime = Field(default_factory=datetime.now)


class MatchResponse(BaseModel):
    """Match response with current state."""
    match_id: str
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    quarter: int
    status: Literal["pending", "in_progress", "finished"]
    created_at: datetime
    updated_at: datetime
