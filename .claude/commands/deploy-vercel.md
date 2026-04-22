Deploy this project to Vercel. Follow these steps exactly:

## Step 1 — Check Vercel CLI
Run `vercel --version` to check if the Vercel CLI is installed.
- If not installed, run `npm install -g vercel` and confirm it succeeds before continuing.

## Step 2 — Create vercel.json
Create `vercel.json` in the project root with this content:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" }
  ]
}
```

## Step 3 — Create the serverless API entry point
Create the file `api/index.ts` with the following content that wraps the Express app for Vercel serverless:
```ts
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
```
Note: This replaces the hard-coded CORS origin so both localhost and the Vercel domain work.

## Step 4 — Fix the SQLite DB path for serverless
Open `server/db.ts`. The current DB path uses `__dirname` which resolves to a read-only location in Vercel's serverless environment.
Change the database path line to use `/tmp/treasure.db` so it writes to the writable temp directory:
```ts
const db = new Database(path.join('/tmp', 'treasure.db'));
```
Warn the user: **On Vercel, `/tmp` is ephemeral — data resets between cold starts. This is acceptable for a demo but not production.**

## Step 5 — Set the JWT_SECRET environment variable
Run `vercel env add JWT_SECRET` and when prompted enter a strong random secret (generate one with `openssl rand -hex 32` if the user doesn't have one). Set it for all environments (Production, Preview, Development).

## Step 6 — Deploy
Run `vercel --prod` to deploy. If this is the first deployment, answer the interactive prompts:
- Link to existing project? → No (create new)
- Project name → accept default or use `treasure-game`
- Root directory → `.` (current directory)

## Step 7 — Return the URL
After deployment succeeds, extract the production URL from the output and show it to the user clearly:
```
Your project is live at: https://<your-project>.vercel.app
```

## Important notes
- If `vercel --prod` fails due to TypeScript errors in the `api/` folder, check `tsconfig.json` includes the `api/` directory.
- If the deploy succeeds but API calls fail (404/500), verify the `vercel.json` rewrites and that `api/index.ts` exports the Express app as default.
- If the user is not logged in to Vercel, `vercel --prod` will prompt them to log in first — follow the browser auth flow.
