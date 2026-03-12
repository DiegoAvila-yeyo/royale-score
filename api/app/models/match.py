# api/app/models/match.py
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid

class PlayerActionCreate(BaseModel):
    """Record a player action during the match"""
    match_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_id: int = Field(ge=1, le=5, description="Player number 1-5")
    team: Literal['home', 'away'] = Field(description="Which team the action belongs to")
    action_type: str = Field(description="Action type: 'Falta', 'Robo', 'Asist', 'Tapón', etc.")
    points: Optional[int] = Field(default=0, ge=0, le=4, description="Points scored if scoring action")
    quarter: int = Field(ge=1, le=4, description="Current game quarter")
    timestamp: datetime = Field(default_factory=datetime.now)

    class Config:
        json_schema_extra = {
            "example": {
                "match_id": "match_123",
                "player_id": 1,
                "team": "home",
                "action_type": "Puntos",
                "points": 2,
                "quarter": 1,
                "timestamp": "2026-03-11T14:30:00"
            }
        }


class MatchScoreSnapshot(BaseModel):
    """Current match score state"""
    home_score: int = Field(default=0, ge=0)
    away_score: int = Field(default=0, ge=0)
    quarter: int = Field(ge=1, le=4)
    time_left: int = Field(description="Seconds remaining in quarter")


class MatchCreate(BaseModel):
    """Create a new match"""
    home_team: str
    away_team: str
    location: Optional[str] = None
    date: datetime = Field(default_factory=datetime.now)


class MatchResponse(BaseModel):
    """Match response with current state"""
    match_id: str
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    quarter: int
    status: Literal['pending', 'in_progress', 'finished']
    created_at: datetime
    updated_at: datetime