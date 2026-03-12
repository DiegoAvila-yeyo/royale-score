# Backward-compatible re-export — new code should import from app.schemas.match
from app.schemas.match import (  # noqa: F401
    PlayerActionCreate,
    MatchScoreSnapshot,
    MatchCreate,
    MatchResponse,
)
