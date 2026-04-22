export interface User {
  id: number;
  username: string;
}

export interface ScoreRecord {
  id: number;
  score: number;
  played_at: number;
}

export interface ScoreHistory {
  scores: ScoreRecord[];
  bestScore: number | null;
}
