// src/services/gameService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface PlayerAction {
  match_id?: string;
  player_id: number;
  team: 'home' | 'away';
  action_type: string;
  points?: number;
  quarter: number;
  game_clock_ms?: number;
}

interface MatchSnapshot {
  home_score: number;
  away_score: number;
  quarter: number;
  time_left: number;
}

interface MatchData {
  home_team: string;
  away_team: string;
  location?: string;
}

interface ActionQueueItem {
  action: PlayerAction;
  timestamp: number;
  retryCount: number;
}

class GameService {
  private matchId: string | null = null;
  private actionQueue: ActionQueueItem[] = [];
  private isProcessing = false;
  private readonly QUEUE_KEY = 'royalscore_action_queue';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 2000;

  constructor() {
    // Load persisted queue from localStorage
    this.loadQueueFromStorage();
    // Start queue processor
    this.startQueueProcessor();
  }

  setMatchId(id: string) {
    this.matchId = id;
  }

  getMatchId() {
    return this.matchId;
  }

  /**
   * ANALYTICS & MATCH DATA
   */

  async getMatchAnalytics(matchId: string) {
    try {
      const res = await fetch(`${API_URL}/matches/${matchId}/analytics`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Error fetching match analytics:", err);
      return null;
    }
  }

  async getPlayerStats(matchId: string, playerId: string) {
    try {
      const res = await fetch(`${API_URL}/matches/${matchId}/player/${playerId}/stats`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Error fetching player stats:", err);
      return null;
    }
  }

  async getMatchTimeline(matchId: string) {
    try {
      const res = await fetch(`${API_URL}/matches/${matchId}/timeline`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Error fetching timeline:", err);
      return null;
    }
  }

  // Match Management
  async createMatch(matchData: MatchData) {
    try {
      const res = await fetch(`${API_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.matchId = data.match_id;
      return data;
    } catch (err) {
      console.error("Error creating match:", err);
      throw err;
    }
  }

  async getMatch(matchId: string) {
    try {
      const res = await fetch(`${API_URL}/matches/${matchId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Error fetching match:", err);
      throw err;
    }
  }

  /**
   * OFFLINE-AWARE PLAYER ACTIONS WITH QUEUE
   */

  async recordPlayerAction(action: PlayerAction) {
    if (!this.matchId) {
      console.warn("No match ID set. Action not recorded.");
      return;
    }

    // Add to queue for processing
    const queueItem: ActionQueueItem = {
      action: { ...action, match_id: this.matchId },
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.actionQueue.push(queueItem);
    this.persistQueue();
    this.processQueue(); // Start processing immediately

    return { status: "queued" };
  }

  /**
   * QUEUE MANAGEMENT FOR OFFLINE SUPPORT
   */

  private async processQueue() {
    if (this.isProcessing || this.actionQueue.length === 0) return;

    this.isProcessing = true;

    while (this.actionQueue.length > 0) {
      const queueItem = this.actionQueue[0];

      try {
        const res = await fetch(`${API_URL}/matches/${queueItem.action.match_id}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(queueItem.action),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("Action synced to server:", data);

        // Remove from queue on success
        this.actionQueue.shift();
        this.persistQueue();
      } catch (err) {
        queueItem.retryCount++;

        if (queueItem.retryCount >= this.MAX_RETRIES) {
          console.error(
            `Action failed after ${this.MAX_RETRIES} retries:`,
            queueItem.action
          );
          // Remove failed item after max retries
          this.actionQueue.shift();
          this.persistQueue();
        } else {
          console.warn(
            `Retrying action (attempt ${queueItem.retryCount}/${this.MAX_RETRIES})...`
          );
          // Wait before retry
          await this.delay(this.RETRY_DELAY_MS);
        }
      }
    }

    this.isProcessing = false;
  }

  private startQueueProcessor() {
    // Check queue every 5 seconds
    setInterval(() => {
      if (this.actionQueue.length > 0) {
        this.processQueue();
      }
    }, 5000);
  }

  private loadQueueFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.QUEUE_KEY);
      if (stored) {
        this.actionQueue = JSON.parse(stored);
        console.log(`Loaded ${this.actionQueue.length} queued actions from storage`);
      }
    } catch (err) {
      console.error("Error loading queue from storage:", err);
    }
  }

  private persistQueue() {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.actionQueue));
    } catch (err) {
      console.error("Error persisting queue to storage:", err);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Score Updates
  async updateScore(snapshot: MatchSnapshot) {
    if (!this.matchId) {
      console.warn("No match ID set. Score not updated.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/matches/${this.matchId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Error updating score:", err);
      return null;
    }
  }

  // Match Status
  async updateMatchStatus(status: 'pending' | 'in_progress' | 'finished') {
    if (!this.matchId) {
      console.warn("No match ID set. Status not updated.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/matches/${this.matchId}/status/${status}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Error updating match status:", err);
      return null;
    }
  }

  // Match Actions History
  async getMatchActions(matchId?: string) {
    const id = matchId || this.matchId;
    if (!id) {
      console.warn("No match ID provided.");
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/matches/${id}/actions`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Error fetching match actions:", err);
      return null;
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const res = await fetch(`${API_URL.split('/api')[0]}/health`, {
        method: "GET",
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Get current queue size
  getQueueSize(): number {
    return this.actionQueue.length;
  }

  // Clear queue (useful for testing)
  clearQueue() {
    this.actionQueue = [];
    this.persistQueue();
  }
}

// Export singleton instance
export const gameService = new GameService();