# PHASE 8D - Final QA Test Plan: 10-Player Action Logging in SQLite

**Date:** March 11, 2026
**Status:** Ready for Execution
**Scope:** Comprehensive testing of 10-player action recording across home and away teams

---

## Executive Summary

This QA test plan verifies that the unified single-court basketball scouting system correctly:
1. Records actions for all 10 players (5 home, 5 away) independently
2. Maintains data integrity in SQLite with proper foreign key relationships
3. Tracks game state (score, quarter, game clock) accurately for each action
4. Supports undo/redo functionality with database consistency

---

## Prerequisites

### Backend Start-up
```bash
cd api
source venv/bin/activate  # or activate on Windows
pip install -r requirements.txt  # if not already installed
python main.py
```
Backend should start on `http://localhost:8000`

### Frontend Start-up (in separate terminal)
```bash
npm run dev
```
Frontend opens on `http://localhost:3000`

### Database Setup
- SQLite database creates automatically at: `api/royalscore.db`
- Tables auto-created on first backend startup via `create_tables()` in `main.py`

---

## Test Cases

### Test 1: Create Match with Full Rosters
**Goal:** Initialize a match with 10 players (5 home, 5 away)

**Steps:**
1. Navigate to frontend homepage
2. System should auto-create a match on load
3. Backend creates match in `matches` table
4. All 10 players visible on UnifiedCourt

**Verification:**
```sql
-- Check match created
SELECT match_id, home_team_id, away_team_id, status, current_quarter FROM matches LIMIT 1;

-- Should return:
-- | match_id (UUID) | home_team_id | away_team_id | status | current_quarter |
-- | ...             | 1            | 2            | in_progress | 1 |

-- Check teams created
SELECT team_id, name FROM teams;
-- LOCAL, VISITANTE teams should exist
```

**Expected Result:** ✅ Match created, both teams in database, status = 'in_progress'

---

### Test 2: Record Action for Home Player #1
**Goal:** Test action logging for first home player

**Steps:**
1. Click on Player #1 (blue, PG position, left side)
2. ActionModal appears showing "Player #1 | Local | Q1"
3. Click "Falta" (Foul) action
4. Modal closes, action appears in EventLog

**Database Verification:**
```sql
-- Check action recorded
SELECT action_id, player_id, match_id, team_id, action_type,
       quarter, game_clock_ms, home_score, away_score, created_at
FROM action_log
WHERE match_id = (SELECT match_id FROM matches LIMIT 1)
ORDER BY created_at DESC LIMIT 1;

-- Should return:
-- | action_id | player_id | match_id | team_id | action_type | quarter | game_clock_ms | ... |
-- | UUID      | 1 (or composite) | <match_id> | 1 (home) | Falta | 1 | <ms> | ... |
```

**Expected Result:** ✅ ActionLogModel entry created with correct:
- `action_type` = 'Falta'
- `quarter` = 1
- `team_id` = home team ID
- `game_clock_ms` = current clock time
- `home_score` = current home score
- `away_score` = current away score

---

### Test 3: Record Mixed Actions for All 10 Players
**Goal:** Verify action logging works independently for all 10 players

**Steps:**
1. Record different action types for each player:
   - Player 1 (Home): Falta
   - Player 2 (Home): Robo
   - Player 3 (Home): Asist
   - Player 4 (Home): Tapón
   - Player 5 (Home): Puntos (+2)
   - Player 6 (Away): Falta
   - Player 7 (Away): Robo
   - Player 8 (Away): Asist
   - Player 9 (Away): Tapón
   - Player 10 (Away): Puntos (+3)

**Database Verification:**
```sql
-- Count actions by team
SELECT team_id, COUNT(*) as action_count
FROM action_log
WHERE match_id = (SELECT match_id FROM matches LIMIT 1)
GROUP BY team_id;

-- Expected: 5 home actions, 5 away actions

-- List all actions
SELECT player_id, action_type, team_id, home_score, away_score
FROM action_log
WHERE match_id = (SELECT match_id FROM matches LIMIT 1)
ORDER BY created_at;

-- Verify action sequence and score updates
```

**Expected Result:** ✅ All 10 actions recorded with:
- Correct `action_type` values
- Proper `team_id` differentiation
- Score snapshots accurate (`home_score`, `away_score`)
- Game clock properly tracking (`game_clock_ms` increases with time)

---

### Test 4: Verify Foreign Key Relationships
**Goal:** Ensure data integrity with proper column references

**Steps:**
1. Execute SQL to verify foreign keys are valid
2. Check that no orphaned records exist

**Database Verification:**
```sql
-- Verify all action_log entries reference valid players/teams/matches
SELECT al.action_id, al.player_id, al.team_id, al.match_id,
       CASE WHEN m.match_id IS NULL THEN 'MISSING_MATCH' ELSE 'OK' END as match_check,
       CASE WHEN t.team_id IS NULL THEN 'MISSING_TEAM' ELSE 'OK' END as team_check
FROM action_log al
LEFT JOIN matches m ON al.match_id = m.match_id
LEFT JOIN teams t ON al.team_id = t.team_id
WHERE al.match_id = (SELECT match_id FROM matches LIMIT 1);

-- All results should show 'OK' for both checks
```

**Expected Result:** ✅ All foreign key references valid, no missing matches or teams

---

### Test 5: Game State Sequence
**Goal:** Verify score and quarter tracking across multiple actions

**Steps:**
1. Record home team scores: +2, +3, +2 (7 points total)
2. Record away team scores: +3, +2 (5 points total)
3. Advance to Q2
4. Record more actions in Q2

**Database Verification:**
```sql
-- Check score progression
SELECT quarter, action_type, home_score, away_score, created_at
FROM action_log
WHERE match_id = (SELECT match_id FROM matches LIMIT 1)
ORDER BY created_at;

-- Home score progression: 0 → 2 → 5 → 7 (after scoring actions)
-- Away score progression: 0 → 3 → 5

-- Check quarter updates
SELECT current_quarter, home_score, away_score
FROM matches
WHERE match_id = (SELECT match_id FROM matches LIMIT 1);
```

**Expected Result:** ✅ Score updates sequential and accurate, quarter changes reflect in both `matches` and `action_log` tables

---

### Test 6: Undo Functionality
**Goal:** Verify undo reverses database actions correctly

**Steps:**
1. Record action: Player #1 Falta (creates ActionLog entry)
2. Click Undo button (in EventLog sidebar)
3. Action should disappear from EventLog
4. Scores should revert if applicable

**Database Verification:**
```sql
-- Before undo: Check action exists
SELECT COUNT(*) FROM action_log
WHERE match_id = (SELECT match_id FROM matches LIMIT 1);
-- Should return: 9 (or your count)

-- After undo: Action should be marked deleted or removed
-- Note: Current implementation may soft-delete or hard-delete
-- Verify based on implementation details

SELECT COUNT(*) FROM action_log
WHERE match_id = (SELECT match_id FROM matches LIMIT 1);
-- Should return: 8 (one less)
```

**Expected Result:** ✅ Undo correctly removes action from database and reverts UI state

---

### Test 7: SQLite Data Persistence
**Goal:** Verify data survives application restart

**Steps:**
1. Record 5 actions in match
2. Note the match_id and action count
3. Restart backend server
4. Check SQLite still contains the actions

**Database Verification:**
```bash
# Check SQLite file exists and has data
sqlite3 api/royalscore.db ".tables"
# Should show: teams, players, matches, action_log, player_match_stats, quarter_scores

sqlite3 api/royalscore.db "SELECT COUNT(*) FROM action_log;"
# Should show same count as before restart
```

**Expected Result:** ✅ SQLite persists data across restarts, no data loss

---

### Test 8: Performance Test
**Goal:** Verify system handles high action volume without degradation

**Steps:**
1. Record 50 actions rapidly (10 per player)
2. Monitor response time and UI responsiveness
3. Check database query performance

**Database Verification:**
```sql
-- Check query performance
EXPLAIN QUERY PLAN
SELECT * FROM action_log
WHERE match_id = (SELECT match_id FROM matches LIMIT 1)
ORDER BY created_at DESC LIMIT 10;

-- Check index usage (if indexes exist)
SELECT name FROM sqlite_master
WHERE type='index' AND name LIKE 'idx%';
```

**Expected Result:** ✅ System remains responsive, queries complete in <100ms, UI doesn't lag

---

## Success Criteria Summary

| Test | Criteria | Status |
|------|----------|--------|
| 1 | Match created with correct teams | ⬜ |
| 2 | Single action logged correctly | ⬜ |
| 3 | All 10 players record actions independently | ⬜ |
| 4 | Foreign key relationships valid | ⬜ |
| 5 | Score and quarter tracking accurate | ⬜ |
| 6 | Undo functionality works | ⬜ |
| 7 | SQLite persists data across restarts | ⬜ |
| 8 | Performance acceptable under load | ⬜ |

---

## SQL Inspection Utilities

### View Current Match State
```sql
SELECT m.match_id, m.home_score, m.away_score, m.current_quarter,
       m.period_type, m.status, COUNT(al.action_id) as action_count
FROM matches m
LEFT JOIN action_log al ON m.match_id = al.match_id
GROUP BY m.match_id;
```

### List All Actions with Context
```sql
SELECT al.action_id, al.action_type,
       CASE WHEN al.team_id = m.home_team_id THEN 'HOME' ELSE 'AWAY' END as team_name,
       al.quarter, CAST(al.game_clock_ms / 60000 AS INTEGER) || ':' ||
       PRINTF('%02d', (CAST(al.game_clock_ms AS INTEGER) % 60000) / 1000) as game_clock,
       al.home_score, al.away_score, al.created_at
FROM action_log al
JOIN matches m ON al.match_id = m.match_id
ORDER BY al.created_at DESC;
```

### View Player Stats Aggregation
```sql
SELECT pms.player_id, pms.points, pms.field_goals_made,
       pms.field_goals_attempted, pms.rebounds, pms.assists,
       pms.steals, pms.blocks, pms.fouls
FROM player_match_stats pms
WHERE pms.match_id = (SELECT match_id FROM matches LIMIT 1);
```

---

## Troubleshooting Guide

### Issue: Database Lock
**Symptom:** "database is locked" error
**Solution:** Ensure only one FastAPI instance is running. Kill any lingering processes:
```bash
lsof -i :8000
kill -9 <PID>
```

### Issue: Actions Not Saving
**Symptom:** Button clicks don't record actions
**Solution:**
1. Check backend console for errors
2. Verify `/api/v1/matches/{id}/action` endpoint is reachable
3. Check browser console for network errors

### Issue: SQLite File Corruption
**Symptom:** "database disk image is malformed"
**Solution:**
```bash
# Backup and reset
cp api/royalscore.db api/royalscore.db.backup
rm api/royalscore.db
# Restart backend to recreate
```

---

## Automation Opportunity

For future CI/CD, create automated test script:
```python
# tests/test_qa_phase8d.py
import requests
import sqlite3

def test_create_match():
    """Test match creation"""
    response = requests.post('http://localhost:8000/api/v1/matches',
                            json={'home_team': 'LOCAL', 'away_team': 'VISITANTE'})
    assert response.status_code == 200
    assert 'match_id' in response.json()

def test_record_action():
    """Test action recording for all 10 players"""
    # Create match
    # For each player 1-10: record action
    # Assert ActionLog entries exist
    # Assert scores updated correctly
    pass
```

---

## Sign-Off

**QA Performed By:** Claude Code
**Date:** March 11, 2026
**Approval:** PENDING USER VALIDATION

**Next Steps:** Execute test plan manually or via automation, update checklist above as tests pass.

