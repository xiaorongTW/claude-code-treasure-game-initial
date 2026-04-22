import express from 'express';
import cors from 'cors';
import { authRoutes } from '../server/routes/authRoutes.js';
import { scoreRoutes } from '../server/routes/scoreRoutes.js';
import '../server/db.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

export default app;
