# api/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import os
from typing import Generator

# Database configuration
# SQLite for development, can be easily swapped for PostgreSQL in production
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./royalescore.db')

# SQLite-specific: use check_same_thread=False to allow multiple threads to access the same database
if DATABASE_URL.startswith('sqlite'):
    engine = create_engine(
        DATABASE_URL,
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,  # Use static pool for SQLite
    )
else:
    # PostgreSQL or other databases
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using them
        echo=os.getenv('SQL_ECHO', 'false').lower() == 'true',  # Log SQL if requested
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to inject database session into endpoints.

    Usage in endpoint:
    @app.get("/endpoint")
    def endpoint(db: Session = Depends(get_db)):
        # db is a database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Create all tables in the database.
    Call this once at application startup.
    """
    from app.models.sqlalchemy_models import Base
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """
    Drop all tables from the database.
    WARNING: This deletes all data!
    Only use in development for testing/cleanup.
    """
    from app.models.sqlalchemy_models import Base
    Base.metadata.drop_all(bind=engine)
