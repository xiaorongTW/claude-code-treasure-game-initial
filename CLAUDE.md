# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # Install dependencies
npm run dev           # Start both Vite (port 3000) and Express server (port 3001) concurrently
npm run dev:client    # Vite only
npm run dev:server    # Express server only (tsx watch)
npm run build         # Production build (outputs to build/)
```

No test runner or lint script is configured. TypeScript errors surface only via editor or `tsc`.

## Architecture

This is a full-stack app: a React + TypeScript SPA (Vite) paired with an Express + SQLite backend.

**Dual server entry points** — the project has two Express wiring files with different purposes:
- `server/index.ts` — used for local dev (`npm run dev:server`); listens on port 3001 and restricts CORS to `http://localhost:3000`
- `api/index.ts` — Vercel serverless entry; imported by `vercel.json` which rewrites `/api/(.*)` → `/api/index`; no port binding, CORS is open

Both import the same route modules from `server/routes/`. When adding or modifying API routes, update the shared route files — not the entry points.

**Frontend entry**: `src/main.tsx` wraps the app in `AuthProvider` before rendering `App`.

**Game logic** (`src/App.tsx`):
- 3 treasure chests from `Box[]` state; one randomly holds treasure
- `openBox()` plays audio, updates score (+150 treasure / -50 skeleton), and ends the game when treasure is found or all boxes are opened
- On game end, calls `saveScore()` if a logged-in user (`user` + `token`) is present (guests are never persisted)
- `motion/react` (Framer Motion) handles flip/reveal animations; `key.png` is used as a custom cursor on closed chests

**Auth flow**:
- `src/context/AuthContext.tsx` — React context providing `user`, `token`, `isGuest`, `login`, `enterGuestMode`, `logout`; persists JWT + user to `localStorage` (`treasure_token` / `treasure_user`) with expiry check on mount
- `src/components/auth/AuthScreen.tsx` — sign-up / sign-in form shown before the game
- `src/components/auth/ScoreHistoryDialog.tsx` — shown in the game-over screen for logged-in users
- `src/components/game/GameHeader.tsx` — displays score and auth controls
- `src/lib/api.ts` — thin fetch wrapper hitting `/api/*` routes (`signup`, `signin`, `saveScore`, `fetchScoreHistory`)
- `src/types/auth.ts` — shared `User` and `ScoreHistory` types

**Backend** (`server/`):
- `server/db.ts` — SQLite via `node-sqlite3-wasm`; DB file at `server/treasure.db` locally, `/tmp/treasure.db` on Vercel (ephemeral — data is lost on cold starts); exports typed helpers (`createUser`, `findUserByUsername`, `insertScore`, `getScoresByUserId`, `getBestScore`)
- `server/auth.ts` — bcrypt password hashing + JWT signing/verification
- `server/routes/authRoutes.ts` — `POST /api/auth/signup`, `POST /api/auth/signin`
- `server/routes/scoreRoutes.ts` — `POST /api/scores` (save), `GET /api/scores/me` (history); JWT-protected

**Local dev API proxy**: Vite proxies all `/api` requests to `http://localhost:3001`, so the frontend always calls relative `/api/*` paths regardless of environment.

**Import alias**: `@` resolves to `./src` (configured in `vite.config.ts`). The config also contains many versioned package aliases (e.g. `vaul@1.1.2 → vaul`) — these are a Figma export artifact and should not be removed.

**UI components**: `src/components/ui/` is a full shadcn/ui library (Radix UI + Tailwind). Only `Button` is used by the game. `src/components/figma/ImageWithFallback.tsx` is a Figma-generated image helper.

**Styling**: Tailwind via `src/index.css` and `src/styles/globals.css`. Theme uses amber tones throughout.
