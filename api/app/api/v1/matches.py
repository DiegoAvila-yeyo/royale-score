import logging
import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.match import (
    MatchCreate,
    MatchResponse,
    MatchScoreSnapshot,
    PlayerActionCreate,
)
from app.models.sqlalchemy_models import (
    ActionLogModel,
    MatchModel,
    PlayerMatchStatsModel,
    QuarterScoreModel,
    TeamModel,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/matches", tags=["matches"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_match_or_404(match_id: str, db: Session) -> MatchModel:
    match = db.query(MatchModel).filter(MatchModel.match_id == match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match {match_id} not found",
        )
    return match


def _get_or_create_team(name: str, db: Session) -> TeamModel:
    team = db.query(TeamModel).filter(TeamModel.name == name).first()
    if not team:
        team = TeamModel(name=name)
        db.add(team)
        db.flush()
    return team


def _build_match_response(match: MatchModel, db: Session) -> MatchResponse:
    home = db.query(TeamModel).filter(TeamModel.team_id == match.home_team_id).first()
    away = db.query(TeamModel).filter(TeamModel.team_id == match.away_team_id).first()
    return MatchResponse(
        match_id=match.match_id,
        home_team=home.name if home else "Unknown",
        away_team=away.name if away else "Unknown",
        home_score=match.home_score,
        away_score=match.away_score,
        quarter=match.current_quarter,
        status=match.status,
        created_at=match.created_at,
        updated_at=match.updated_at,
    )


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
def create_match(match: MatchCreate, db: Session = Depends(get_db)):
    """Create a new basketball match with both teams."""
    try:
        home_team = _get_or_create_team(match.home_team, db)
        away_team = _get_or_create_team(match.away_team, db)

        match_id = str(uuid.uuid4())
        new_match = MatchModel(
            match_id=match_id,
            home_team_id=home_team.team_id,
            away_team_id=away_team.team_id,
            home_score=0,
            away_score=0,
            current_quarter=1,
            period_type="REGULATION",
            status="in_progress",
            started_at=datetime.utcnow(),
        )
        db.add(new_match)
        db.commit()
        db.refresh(new_match)
        logger.info("Match created: %s (%s vs %s)", match_id, match.home_team, match.away_team)
        return _build_match_response(new_match, db)
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to create match")
        raise HTTPException(status_code=500, detail=f"Failed to create match: {exc}") from exc


@router.get("/{match_id}", response_model=MatchResponse)
def get_match(match_id: str, db: Session = Depends(get_db)):
    """Get match details and current score."""
    match = _get_match_or_404(match_id, db)
    return _build_match_response(match, db)


@router.post("/{match_id}/action")
def record_player_action(
    match_id: str, action: PlayerActionCreate, db: Session = Depends(get_db)
):
    """Record a player action atomically and persist to SQLite."""
    try:
        match = _get_match_or_404(match_id, db)

        # Update score atomically
        if action.action_type == "Puntos" and action.points > 0:
            if action.team == "home":
                match.home_score += action.points
            else:
                match.away_score += action.points

        team_id = match.home_team_id if action.team == "home" else match.away_team_id

        # player_ref is a lightweight string key (no FK dependency on roster table)
        player_ref = f"{action.player_id}_{action.team}"

        new_action = ActionLogModel(
            action_id=str(uuid.uuid4()),
            match_id=match_id,
            player_ref=player_ref,
            team_id=team_id,
            action_type=action.action_type,
            action_value=action.points or 0,
            quarter=action.quarter,
            game_clock_ms=action.game_clock_ms,
            home_score=match.home_score,
            away_score=match.away_score,
        )
        db.add(new_action)
        match.updated_at = datetime.utcnow()
        db.commit()

        logger.info(
            "[%s] %s • player=%s • action=%s • pts=%s",
            match_id, action.team, action.player_id, action.action_type, action.points,
        )

        return {
            "status": "success",
            "action_id": new_action.action_id,
            "match": {
                "match_id": match.match_id,
                "home_score": match.home_score,
                "away_score": match.away_score,
                "quarter": match.current_quarter,
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to record action for match %s", match_id)
        raise HTTPException(status_code=500, detail=f"Failed to record action: {exc}") from exc


@router.post("/{match_id}/score")
def update_score(match_id: str, snapshot: MatchScoreSnapshot, db: Session = Depends(get_db)):
    """Sync match score and quarter state."""
    try:
        match = _get_match_or_404(match_id, db)
        match.home_score = snapshot.home_score
        match.away_score = snapshot.away_score
        match.current_quarter = snapshot.quarter
        match.updated_at = datetime.utcnow()
        db.commit()
        return {
            "status": "success",
            "match": {
                "match_id": match.match_id,
                "home_score": match.home_score,
                "away_score": match.away_score,
                "quarter": match.current_quarter,
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to update score for match %s", match_id)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{match_id}/actions")
def get_match_actions(match_id: str, db: Session = Depends(get_db)):
    """Get all actions for a match, ordered by period and game clock."""
    _get_match_or_404(match_id, db)
    actions = (
        db.query(ActionLogModel)
        .filter(ActionLogModel.match_id == match_id)
        .order_by(ActionLogModel.quarter, ActionLogModel.game_clock_ms.desc())
        .all()
    )
    return {
        "match_id": match_id,
        "total_actions": len(actions),
        "actions": [
            {
                "action_id": a.action_id,
                "player_ref": a.player_ref,
                "action_type": a.action_type,
                "action_value": a.action_value,
                "quarter": a.quarter,
                "game_clock_ms": a.game_clock_ms,
                "home_score": a.home_score,
                "away_score": a.away_score,
                "created_at": a.created_at.isoformat(),
            }
            for a in actions
        ],
    }


@router.get("/{match_id}/timeline")
def get_match_timeline(match_id: str, db: Session = Depends(get_db)):
    """Get scoring timeline suitable for charts."""
    _get_match_or_404(match_id, db)
    scoring_actions = (
        db.query(ActionLogModel)
        .filter(
            ActionLogModel.match_id == match_id,
            ActionLogModel.action_type == "Puntos",
        )
        .order_by(ActionLogModel.quarter, ActionLogModel.game_clock_ms.desc())
        .all()
    )
    return {
        "match_id": match_id,
        "timeline": [
            {
                "quarter": a.quarter,
                "game_clock_ms": a.game_clock_ms,
                "player_ref": a.player_ref,
                "points": a.action_value,
                "home_score": a.home_score,
                "away_score": a.away_score,
                "created_at": a.created_at.isoformat(),
            }
            for a in scoring_actions
        ],
    }


@router.get("/{match_id}/analytics")
def get_match_analytics(match_id: str, db: Session = Depends(get_db)):
    """Aggregated per-player stats for a match."""
    _get_match_or_404(match_id, db)
    actions = (
        db.query(ActionLogModel)
        .filter(ActionLogModel.match_id == match_id)
        .all()
    )
    player_stats: dict = {}
    for a in actions:
        ref = a.player_ref  # e.g. "7_away"
        if ref not in player_stats:
            player_stats[ref] = {
                "player_ref": ref,
                "points": 0, "fouls": 0, "steals": 0,
                "assists": 0, "blocks": 0, "rebounds": 0, "turnovers": 0,
            }
        stats = player_stats[ref]
        if a.action_type == "Puntos":       stats["points"] += a.action_value or 0
        elif a.action_type == "Falta":      stats["fouls"] += 1
        elif a.action_type == "Robo":       stats["steals"] += 1
        elif a.action_type == "Asist":      stats["assists"] += 1
        elif a.action_type == "Tapón":      stats["blocks"] += 1
        elif a.action_type == "Rebound":    stats["rebounds"] += 1
        elif a.action_type == "Turnover":   stats["turnovers"] += 1

    return {"match_id": match_id, "player_stats": list(player_stats.values())}


@router.put("/{match_id}/status/{status_value}")
def update_match_status(match_id: str, status_value: str, db: Session = Depends(get_db)):
    """Update match lifecycle status."""
    if status_value not in ("pending", "in_progress", "finished"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="status must be: pending | in_progress | finished",
        )
    try:
        match = _get_match_or_404(match_id, db)
        match.status = status_value
        if status_value == "finished":
            match.ended_at = datetime.utcnow()
        match.updated_at = datetime.utcnow()
        db.commit()
        return {
            "status": "success",
            "match": {
                "match_id": match.match_id,
                "status": match.status,
                "ended_at": match.ended_at.isoformat() if match.ended_at else None,
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to update status for match %s", match_id)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/{match_id}/quarter/{quarter_num}")
def advance_quarter(match_id: str, quarter_num: int, db: Session = Depends(get_db)):
    """Advance to the specified quarter / overtime period."""
    try:
        match = _get_match_or_404(match_id, db)
        if quarter_num > 4 and match.period_type == "REGULATION":
            match.period_type = "OVERTIME"
            match.overtime_periods += 1
        match.current_quarter = quarter_num
        match.updated_at = datetime.utcnow()
        db.commit()
        return {
            "status": "success",
            "match": {
                "match_id": match.match_id,
                "quarter": match.current_quarter,
                "period_type": match.period_type,
                "overtime_periods": match.overtime_periods,
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to advance quarter for match %s", match_id)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
