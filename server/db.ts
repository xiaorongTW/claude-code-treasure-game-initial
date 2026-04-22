import { Database } from 'node-sqlite3-wasm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(process.env.VERCEL ? '/tmp' : __dirname, 'treasure.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS scores (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   INTEGER NOT NULL REFERENCES users(id),
    score     INTEGER NOT NULL,
    played_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
`);

export interface UserRow {
  id: number;
  username: string;
  password: string;
  created_at: number;
}

export interface ScoreRow {
  id: number;
  user_id: number;
  score: number;
  played_at: number;
}

export function createUser(username: string, hashedPassword: string): UserRow {
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
  return findUserByUsername(username)!;
}

export function findUserByUsername(username: string): UserRow | undefined {
  return db.get('SELECT * FROM users WHERE username = ?', [username]) as UserRow | undefined;
}

export function insertScore(userId: number, score: number): void {
  db.run('INSERT INTO scores (user_id, score) VALUES (?, ?)', [userId, score]);
}

export function getScoresByUserId(userId: number, limit = 10): ScoreRow[] {
  return db.all('SELECT * FROM scores WHERE user_id = ? ORDER BY played_at DESC LIMIT ?', [userId, limit]) as ScoreRow[];
}

export function getBestScore(userId: number): number | null {
  const row = db.get('SELECT MAX(score) as best FROM scores WHERE user_id = ?', [userId]) as { best: number | null } | undefined;
  return row?.best ?? null;
}
