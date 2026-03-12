# api/app/api/v1/matches.py
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sqlalchemy_models import MatchModel, TeamModel, ActionLogModel, PlayerMatchStatsModel, QuarterScoreModel
from app.models.match import (
    PlayerActionCreate,
    MatchCreate,
    MatchResponse,
    MatchScoreSnapshot,
)
from typing import List
from datetime import datetime
import uuid

router = APIRouter(prefix="/matches", tags=["matches"])


@router.post("/", response_model=MatchResponse)
async def create_match(match: MatchCreate, db: Session = Depends(get_db)):
    """Create a new basketball match with teams in database"""
    try:
        # Get or create teams
        home_team = db.query(TeamModel).filter(TeamModel.name == match.home_team).first()
        if not home_team:
            home_team = TeamModel(name=match.home_team)
            db.add(home_team)
            db.flush()

        away_team = db.query(TeamModel).filter(TeamModel.name == match.away_team).first()
        if not away_team:
            away_team = TeamModel(name=match.away_team)
            db.add(away_team)
            db.flush()

        # Create match record
        match_id = str(uuid.uuid4())
        new_match = MatchModel(
            match_id=match_id,
            home_team_id=home_team.team_id,
            away_team_id=away_team.team_id,
            home_score=0,
            away_score=0,
            current_quarter=1,
            period_type='REGULATION',
            status='in_progress',
            started_at=datetime.utcnow(),
        )
        db.add(new_match)
        db.commit()

        return MatchResponse(
            match_id=match_id,
            home_team=home_team.name,
            away_team=away_team.name,
            home_score=0,
            away_score=0,
            quarter=1,
            status='in_progress',
            created_at=new_match.created_at,
            updated_at=new_match.updated_at,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create match: {str(e)}"
        )


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(match_id: str, db: Session = Depends(get_db)):
    """Get match details and current score"""
    match = db.query(MatchModel).filter(MatchModel.match_id == match_id).first()

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match {match_id} not found"
        )

    home_team = db.query(TeamModel).filter(TeamModel.team_id == match.home_team_id).first()
    away_team = db.query(TeamModel).filter(TeamModel.team_id == match.away_team_id).first()

    return MatchResponse(
        match_id=match.match_id,
        home_team=home_team.name if home_team else "Unknown",
        away_team=away_team.name if away_team else "Unknown",
        home_score=match.home_score,
        away_score=match.away_score,
        quarter=match.current_quarter,
        status=match.status,
        created_at=match.created_at,
        updated_at=match.updated_at,
    )


@router.post("/{match_id}/action")
async def record_player_action(match_id: str, action: PlayerActionCreate, db: Session = Depends(get_db)):
    """Record a player action during the match - persist to database"""
    try:
        # Verify match exists
        match = db.query(MatchModel).filter(MatchModel.match_id == match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Match {match_id} not found"
            )

        # Update score if it's a scoring action
        if action.action_type == "Puntos" and action.points > 0:
            if action.team == "home":
                match.home_score += action.points
            else:
                match.away_score += action.points

        # Record action in database
        action_id = str(uuid.uuid4())
        team_id = match.home_team_id if action.team == "home" else match.away_team_id

        new_action = ActionLogModel(
            action_id=action_id,
            match_id=match_id,
            player_id=f"player_{action.player_id}_{action.team}",  # Composite ID for now
            team_id=team_id,
            action_type=action.action_type,
            action_value=action.points or 0,
            quarter=action.quarter,
            game_clock_ms=0,  # Will be updated from frontend
            home_score=match.home_score,
            away_score=match.away_score,
        )
        db.add(new_action)
        match.updated_at = datetime.utcnow()
        db.commit()

        print(f"[{match_id}] Action recorded: Team {action.team} - Player {action.player_id} - {action.action_type}")

        return {
            "status": "success",
            "message": f"Action recorded: {action.action_type}",
            "action_id": action_id,
            "match": {
                "match_id": match.match_id,
                "home_score": match.home_score,
                "away_score": match.away_score,
                "quarter": match.current_quarter,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record action: {str(e)}"
        )


@router.post("/{match_id}/score")
async def update_score(match_id: str, snapshot: MatchScoreSnapshot, db: Session = Depends(get_db)):
    """Update match score and state in database"""
    try:
        match = db.query(MatchModel).filter(MatchModel.match_id == match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Match {match_id} not found"
            )

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
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update score: {str(e)}"
        )


@router.get("/{match_id}/actions")
async def get_match_actions(match_id: str, db: Session = Depends(get_db)):
    """Get all actions for a match from database"""
    actions = db.query(ActionLogModel).filter(ActionLogModel.match_id == match_id).all()

    return {
        "match_id": match_id,
        "actions": [
            {
                "action_id": a.action_id,
                "action_type": a.action_type,
                "quarter": a.quarter,
                "game_clock_ms": a.game_clock_ms,
                "home_score": a.home_score,
                "away_score": a.away_score,
                "created_at": a.created_at.isoformat(),
            }
            for a in actions
        ],
        "total_actions": len(actions)
    }


@router.put("/{match_id}/status/{status_value}")
async def update_match_status(match_id: str, status_value: str, db: Session = Depends(get_db)):
    """Update match status in database"""
    if status_value not in ["pending", "in_progress", "finished"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status value. Must be: pending, in_progress, or finished"
        )

    try:
        match = db.query(MatchModel).filter(MatchModel.match_id == match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Match {match_id} not found"
            )

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
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )


@router.post("/{match_id}/quarter/{quarter_num}")
async def advance_quarter(match_id: str, quarter_num: int, db: Session = Depends(get_db)):
    """Advance to next quarter"""
    try:
        match = db.query(MatchModel).filter(MatchModel.match_id == match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Match {match_id} not found"
            )

        if quarter_num > 4 and match.period_type == 'REGULATION':
            match.period_type = 'OVERTIME'
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
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to advance quarter: {str(e)}"
        )
