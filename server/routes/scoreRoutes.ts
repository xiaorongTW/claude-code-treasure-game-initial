import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { insertScore, getScoresByUserId, getBestScore } from '../db.js';

export const scoreRoutes = Router();

scoreRoutes.post('/', requireAuth, (req, res) => {
  const { score } = req.body as { score?: unknown };

  if (typeof score !== 'number' || !Number.isInteger(score)) {
    res.status(400).json({ error: 'Score must be an integer' });
    return;
  }

  insertScore(req.user!.userId, score);
  res.status(201).json({ ok: true });
});

scoreRoutes.get('/me', requireAuth, (req, res) => {
  const scores = getScoresByUserId(req.user!.userId, 10);
  const bestScore = getBestScore(req.user!.userId);
  res.json({ scores, bestScore });
});
