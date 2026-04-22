import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes.js';
import { scoreRoutes } from './routes/scoreRoutes.js';

// Triggers schema creation on startup
import './db.js';

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
