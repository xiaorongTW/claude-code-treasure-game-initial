import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findUserByUsername } from '../db.js';
import { signToken } from '../auth.js';

export const authRoutes = Router();

authRoutes.post('/signup', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    res.status(400).json({ error: 'Username must be 3-20 alphanumeric characters or underscores' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  if (findUserByUsername(username)) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = createUser(username, hashedPassword);
  const token = signToken(user.id, user.username);

  res.status(201).json({ token, user: { id: user.id, username: user.username } });
});

authRoutes.post('/signin', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = findUserByUsername(username);
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = signToken(user.id, user.username);
  res.json({ token, user: { id: user.id, username: user.username } });
});
