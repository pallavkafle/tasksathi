# Memory: TaskSight (my notes)

## About me and the project
- I'm Pallav Kafle, a Computer Engineering student at Himalaya College of Engineering (TU). MERN and generative AI. Goal: AI Engineer.
- TaskSight replaces my deployed expense tracker (`Expense-Tracker`, stays live as the "before"). It is my main portfolio project.
- I'm also building TrailMind (my major project, CT 707), so time is limited: about 10 to 12 hours a week.
- Repo: C:\D_Drive_Backup\PROJECTS\tasksight · GitHub pallavkafle/tasksight. Windows, VS Code, PowerShell. Project name: TaskSight (renamed 2026-11-20 from TaskSathi after verifying GitHub/npm/domain availability).

## Current state
- **Done on `main`:** monorepo tooling, shared contract, CI (green, a deliberate type error failed it as expected), Express 5 skeleton (`3d39d59`), Next.js scaffold (`e88f418`).
- **Next:** review the web scaffold, set up Atlas, then the user model and auth.
- **Known gaps from the skeleton:** `express.json` runs before the rate limiter and `trust proxy` is fixed at 1. Both change in task 1.8.
- **Skeleton test results (2026-11-15):** `/health` 200; JSON 404 in the contract shape; CORS allowed for `localhost:3000` and blocked for an unknown origin; bad JSON gives 400; a bad `PORT` exits with a clear message; with the limit set to 3 the responses were 404, 404, 404, 429, 429 and `/health` stayed 200.
- **Installed versions:** see `rule.md` section 4.

## Key decisions

| Decision | Reason |
|---|---|
| Fresh repo, old tracker untouched | The stack changes in every file |
| Web-first installable PWA | A recruiter can open a link; TrailMind already covers Android |
| Next.js and Express as separate apps | Streaming, long jobs, a future mobile client |
| Same-origin API through Next.js rewrites (`SameSite=Lax` cookie, `Path=/api/auth`) | Third-party cookies fail on Safari and Firefox across Vercel and Render |
| Shared package exports raw TypeScript | Fast cross-package development; `transpilePackages` for web, `tsup` for the API build |
| Express 5 | Async errors reach the handler; `req.query` is read-only, so validation uses `req.valid` |
| Refresh grace window, default 10 s, from env | Two tabs refreshing at once must not log me out |
| Argon2id at 19456 KiB, t=2, p=1, concurrency cap 2; refresh tokens use sha256 | The Render free container has 512 MB RAM and 0.1 CPU |
| No mock API for the web client | Mocks hide cookie, proxy and refresh bugs |
| PWA is installable only in v1 | Service-worker caching of RSC payloads breaks navigation |
| 768-dimension embeddings, one chunk collection, async re-embedding | Atlas M0 limits; saves must not depend on the LLM |
| Embedded subtasks, 3 roles (owner, member, viewer) | Less complexity in v1 |
| Agent: 2 tools, version checks, TTL, idempotency key, role re-check | Stale proposals must not corrupt data |
| Replay evals on every PR, live evals on demand, no LLM judge | Free-tier quota and run-to-run variance |
| Models, IDs and limits from env and the AI Studio console | Providers change them without notice |
| No Python service in v1 | Scope; the README covers the Python-heavy job market |
| Squash merge for every PR | One commit per task on `main` |

## Lessons

| Problem | Fix |
|---|---|
| `corepack enable` failed (EPERM) | Use `npm i -g pnpm` |
| `npm.ps1` blocked | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Pasting several commands broke PowerShell | One command, Enter, wait |
| `pnpm add typescript` pulled 7.0.2 | Pin `typescript@~6.0.0` |
| `ERR_PNPM_IGNORED_BUILDS: esbuild` | `allowBuilds` in `pnpm-workspace.yaml` |
| Stray empty file in `apps/api` | Check `git status` and the file list before committing |
| Merged a PR normally instead of squashing and clicked Revert on it | Closed the revert PR, deleted the extra branches; use Squash and merge only |
| Typo in a branch name | `git branch -m` before the first push |

## Open items
- **Name check:** open `TaskSight.xyz` and `TaskSight.com`, search "Task Sathi" on LinkedIn and the Nepal company registry, and check `npm view TaskSight` and GitHub. I cannot confirm that a Kathmandu company with this name exists. Keep the name unless a live product in the same space turns up. If I rename, only the `@tasksight/*` scope and the docs change.
- **Atlas:** create the free cluster with a new DB user, keep the connection string only in `apps/api/.env`, delete or rotate the old leaked credentials. Check the search-index and connection limits in the Atlas UI.
- **Gemini:** create the API key (env only). Check model IDs and limits in AI Studio before Phase 3.
- **Accounts:** connect Render and Vercel to GitHub before the first deploy.
- **TrailMind:** decide how much time it gets during the 5 weeks (maintenance only is the plan).
- **Design:** pick the dashboard direction from my design experiments and turn it into tokens in `design.md`.
- **Verify later:** SSE through the Vercel rewrite; `req.ip` and `TRUST_PROXY_HOPS` behind Vercel and Render; whether Gemma handles structured JSON as well as Flash Lite.