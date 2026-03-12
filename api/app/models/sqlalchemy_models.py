# api/app/models/sqlalchemy_models.py
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum, Boolean, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()


class TeamModel(Base):
    """Database model for teams"""
    __tablename__ = "teams"

    team_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True)
    league_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    home_matches = relationship("MatchModel", foreign_keys="MatchModel.home_team_id", back_populates="home_team")
    away_matches = relationship("MatchModel", foreign_keys="MatchModel.away_team_id", back_populates="away_team")
    players = relationship("PlayerModel", back_populates="team")


class PlayerModel(Base):
    """Database model for players"""
    __tablename__ = "players"

    player_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("teams.team_id"), nullable=False)
    jersey_number = Column(Integer, nullable=False)
    position = Column(String(3), nullable=False)  # PG, SG, SF, PF, C
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    team = relationship("TeamModel", back_populates="players")
    action_logs = relationship("ActionLogModel", back_populates="player")
    match_stats = relationship("PlayerMatchStatsModel", back_populates="player")


class MatchModel(Base):
    """Database model for matches"""
    __tablename__ = "matches"

    match_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    home_team_id = Column(String(36), ForeignKey("teams.team_id"), nullable=False)
    away_team_id = Column(String(36), ForeignKey("teams.team_id"), nullable=False)
    home_score = Column(Integer, default=0, nullable=False)
    away_score = Column(Integer, default=0, nullable=False)
    current_quarter = Column(Integer, default=1, nullable=False)
    period_type = Column(String(20), default='REGULATION', nullable=False)  # REGULATION or OVERTIME
    overtime_periods = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default='pending', nullable=False)  # pending, in_progress, finished
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    home_team = relationship("TeamModel", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team = relationship("TeamModel", foreign_keys=[away_team_id], back_populates="away_matches")
    action_logs = relationship("ActionLogModel", back_populates="match")
    player_stats = relationship("PlayerMatchStatsModel", back_populates="match")
    quarter_scores = relationship("QuarterScoreModel", back_populates="match")


class ActionLogModel(Base):
    """Database model for game actions/events"""
    __tablename__ = "action_log"

    action_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_id = Column(String(36), ForeignKey("matches.match_id"), nullable=False)
    # Stored as a composite string (e.g. "7_away") — no FK to players table
    # because roster players are tracked in frontend state for the MVP.
    player_ref = Column(String(20), nullable=False)
    team_id = Column(String(36), ForeignKey("teams.team_id"), nullable=False)
    action_type = Column(String(20), nullable=False)
    action_value = Column(Integer, nullable=True)
    quarter = Column(Integer, nullable=False)
    game_clock_ms = Column(Integer, nullable=False, default=0)
    home_score = Column(Integer, nullable=False)
    away_score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    match = relationship("MatchModel", back_populates="action_logs")

    __table_args__ = (
        # Fast timeline queries: all actions for a match ordered by period + clock
        Index("idx_action_match_quarter", "match_id", "quarter", "game_clock_ms"),
    )


class PlayerMatchStatsModel(Base):
    """Database model for aggregated player stats per match"""
    __tablename__ = "player_match_stats"

    stat_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_id = Column(String(36), ForeignKey("matches.match_id"), nullable=False)
    player_id = Column(String(36), ForeignKey("players.player_id"), nullable=False)

    # Scoring stats
    points = Column(Integer, default=0, nullable=False)
    field_goals_made = Column(Integer, default=0, nullable=False)
    field_goals_attempted = Column(Integer, default=0, nullable=False)
    three_pointers_made = Column(Integer, default=0, nullable=False)
    three_pointers_attempted = Column(Integer, default=0, nullable=False)
    free_throws_made = Column(Integer, default=0, nullable=False)
    free_throws_attempted = Column(Integer, default=0, nullable=False)

    # Rebounding stats
    rebounds = Column(Integer, default=0, nullable=False)
    rebounds_offensive = Column(Integer, default=0, nullable=False)
    rebounds_defensive = Column(Integer, default=0, nullable=False)

    # Other stats
    assists = Column(Integer, default=0, nullable=False)
    steals = Column(Integer, default=0, nullable=False)
    blocks = Column(Integer, default=0, nullable=False)
    fouls = Column(Integer, default=0, nullable=False)
    turnovers = Column(Integer, default=0, nullable=False)
    plus_minus = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    match = relationship("MatchModel", back_populates="player_stats")
    player = relationship("PlayerModel", back_populates="match_stats")


class QuarterScoreModel(Base):
    """Database model for quarter-by-quarter score breakdown"""
    __tablename__ = "quarter_scores"

    quarter_score_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_id = Column(String(36), ForeignKey("matches.match_id"), nullable=False)
    quarter_number = Column(Integer, nullable=False)
    period_type = Column(String(20), nullable=False)  # REGULATION or OVERTIME
    overtime_number = Column(Integer, nullable=True)  # if OVERTIME, which OT
    home_score_in_period = Column(Integer, nullable=False)
    away_score_in_period = Column(Integer, nullable=False)
    home_fouls = Column(Integer, default=0, nullable=False)
    away_fouls = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    match = relationship("MatchModel", back_populates="quarter_scores")
