import type { User, ScoreHistory } from '../types/auth';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export async function signup(username: string, password: string): Promise<{ token: string; user: User }> {
  return request('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function signin(username: string, password: string): Promise<{ token: string; user: User }> {
  return request('/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function saveScore(score: number, token: string): Promise<void> {
  await request('/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ score }),
  });
}

export async function fetchScoreHistory(token: string): Promise<ScoreHistory> {
  return request('/scores/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
