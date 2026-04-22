Deploy the current project's frontend to GitHub Pages. Follow these steps exactly:

## Step 1 — Discover GitHub identity and target repo

Run `gh auth status` to confirm the GitHub CLI is authenticated. If it fails, tell the user to run `! gh auth login` and stop.

Run `gh api user --jq '.login'` to get the authenticated GitHub username. Store this as GITHUB_USER.

The repo name to use on GitHub is derived from the project directory name (lowercased, spaces replaced with hyphens). Confirm the intended repo name with the user before proceeding if $ARGUMENTS is empty; otherwise use $ARGUMENTS as the repo name.

## Step 2 — Create or locate the GitHub remote

Run `git remote -v` to list remotes. Look for a remote whose URL contains `github.com`.

If no GitHub remote exists:
- Run `gh repo view GITHUB_USER/<repo-name> 2>/dev/null` to check if the repo already exists on GitHub.
- If it does not exist, run `gh repo create <repo-name> --public --source=. --remote=github` to create it and add the remote named `github`.
- If it already exists, run `git remote add github https://github.com/GITHUB_USER/<repo-name>.git`.

If a GitHub remote already exists, note its name (likely `origin` or `github`) and use it from here on.

## Step 3 — Configure Vite base path for GitHub Pages

GitHub Pages serves the project at `https://GITHUB_USER.github.io/<repo-name>/`, so Vite must be built with `base: '/<repo-name>/'`.

Read `vite.config.ts`. Inside the `defineConfig({...})` object, add or update the `base` field to `'/<repo-name>/'` immediately before the `plugins` field. Make sure the value matches the exact repo name.

## Step 4 — Add gh-pages tooling

Check `package.json` for `"gh-pages"` in devDependencies. If missing, run `npm install --save-dev gh-pages`.

In `package.json` scripts, add or update:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

## Step 5 — Ensure the repo has at least one commit on the default branch

Run `git log --oneline -1 2>/dev/null`. If there are no commits:
- Stage all project files: `git add -A`
- Commit: `git commit -m "Initial commit"`
- Push to the GitHub remote's default branch: `git push github main` (or `master` if that's the default).

If commits exist but the branch hasn't been pushed to the GitHub remote, push it now.

## Step 6 — Deploy to GitHub Pages

Run `npm run deploy`. This runs the Vite build then pushes the `build/` folder to the `gh-pages` branch on the GitHub remote.

If the deploy script fails because `gh-pages` cannot determine the remote, pass the remote explicitly: `npx gh-pages -d build -r <github-remote-url>`.

## Step 7 — Enable GitHub Pages in repo settings (if not already enabled)

Run:
```
gh api --method POST repos/GITHUB_USER/<repo-name>/pages \
  -f source[branch]=gh-pages \
  -f source[path]=/ 2>/dev/null || true
```

This is idempotent — it's safe to run even if Pages is already enabled.

## Step 8 — Report the live URL

The project will be live at:

```
https://GITHUB_USER.github.io/<repo-name>/
```

Print this URL to the user. Note that GitHub Pages can take 1–3 minutes to go live after the first deploy. The user can check deployment status at `https://github.com/GITHUB_USER/<repo-name>/actions`.

> **Note**: This project has an Express + SQLite backend. GitHub Pages hosts static files only, so backend features (auth, score saving, leaderboard) will not work in the deployed version. The game is fully playable in guest mode.
