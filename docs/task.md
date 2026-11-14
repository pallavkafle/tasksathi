# Tasks: TaskSathi

Legend: [x] done, [ ] todo. Lane A = primary Claude (api, shared, CI). Lane B = deepsheek (web). User = Pallav.

**Execution mode: sequential by default.** The user is the only one typing commands, so two lanes do not speed things up. Run lanes in parallel **only when one lane is blocked on an external dependency** (Atlas, Vercel, Render, Gemini key). Folder ownership and the contract-first rule still apply.

## Done
- [x] Day 1: monorepo scaffold, commit `58372c1` on `main` (18 files). Workspace linking, tsx run, prettier, typecheck, lint verified.

## P0: prep on `main` (User, 5 min)
- [ ] `pnpm --filter @tasksathi/api add -D "@types/node@~22"`
- [ ] Create `.gitattributes` with the line `* text=auto eol=lf`
- [ ] Create `.editorconfig` in the root:
```
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```
- [ ] Optional: `git config core.autocrlf false`
- [ ] Confirm root `package.json` has `packageManager` and `engines`
- [ ] Copy `prd.md`, `architecture.md`, `rule.md`, `design.md`, `task.md`, `memory.md` into `docs/`
- [ ] `pnpm typecheck; pnpm lint; pnpm format:check`, then commit `chore: pin node types, add gitattributes, editorconfig and docs`, push

## Order of work (default sequential)

| Step | Task | Who |
|---|---|---|
| 1 | P0 | User |
| 2 | C0 shared contract | A |
| 3 | C1 CI | A |
| 4 | A1 Express skeleton | A |
| 5 | B1 web scaffold | B |
| 6 | **Atlas cluster + new DB user** (do it while a step is in review) | User |
| 7 | A2 user model, then A3 real auth | A |
| 8 | B2 auth UI, then B3 API client **against the real A3 routes** | B |
| 9 | A4 tests, B4 integration (should be a formality) | A / B |
| 10 | A5 and B5 deploys | A / B |

Allowed parallel work: while the user sets up Atlas or a deploy account, the unblocked lane keeps going (for example B1/B2 while A2 waits on Atlas).

## Week 1 task details

### C0: contract (Lane A, merge first)
- Branch `feat/shared-contract`. Files `packages/shared/src/auth.ts`, `errors.ts`, re-exported from `index.ts`.
- Contents: register, login, user (`id`, `name`, `email`), auth response, error shape with `details: Array<{ path: string, message: string }>` optional.
- Done when: Zod schemas exist and `pnpm typecheck` passes.

### C1: CI (Lane A)
- Branch `feat/ci`. `.github/workflows/ci.yml`: checkout, pnpm setup (reads `packageManager`), Node 22 with pnpm cache, `install --frozen-lockfile`, lint, typecheck, format:check.
- Done when: green on a PR, and a throwaway branch with a deliberate type error fails CI (covers the skipped negative test).

### A1: Express skeleton (Lane A)
- Branch `feat/api-skeleton`.
- Install: `express cors helmet express-rate-limit pino pino-http`; dev: `@types/express@5 @types/cors` (install `@types/express@5` explicitly).
- Files: `config/env.ts` (includes `APP_VERSION`, default `"0.0.0"`), `errors/AppError.ts`, `errors/handler.ts`, `routes/health.ts`, `app.ts`, `server.ts` (graceful SIGTERM). Update scripts to `server.ts`. Set `trust proxy`.
- CORS: origin allowlist from env, `credentials: true`, allowed headers `Content-Type, Authorization`. The `cors` middleware answers `OPTIONS` preflight.
- Rate limiter applies globally with a stricter limit on `/auth/*`; **`/health` is exempt**.
- Done when: `/health` returns 200 `{status, uptime, version}`; unknown route returns a JSON 404 in the C0 error shape; bad env exits with a clear message; the request over the limit returns 429; `/health` is never rate limited.

### B1: Web scaffold (Lane B)
- Branch `feat/web-scaffold`. Next.js in `apps/web` (App Router, TS, Tailwind, src dir).
- **Pre-flight:** delete `apps/web/.gitkeep` first (create-next-app wants an empty folder). Run `npm view next version` and `npm view next peerDependencies` to see the current stable and what it supports, then `create-next-app --help` for the flags.
- **Next version:** use the **current stable major** (`create-next-app@latest`), not 15. Next 15 reached end of life on 21 Oct 2026. Record the exact installed version in `memory.md`. Write async request APIs (`await params`, `await cookies()`) from the start. Confirm the installed Next supports TypeScript 6.0 and ESLint 10; if not, stop and report before changing any pin.
- **tsconfig:** let Next generate `apps/web/tsconfig.json` (do not force `extends` the base), then manually add `"noUncheckedIndexedAccess": true` so web matches the strictness rule.
- **Do not skip Next lint rules.** Keep the root ESLint as the single config and add `eslint-plugin-react-hooks` and `@next/eslint-plugin-next` to the root, scoped to `apps/web/**` in `eslint.config.mjs`. Both must support ESLint 10: check peer warnings on install; if one does not, use that plugin's newest compatible version and do not downgrade ESLint.
- Add `@tasksathi/shared` as `workspace:*` and `transpilePackages: ["@tasksathi/shared"]` in `next.config.ts`.
- **Order matters:** create `apps/web/tsconfig.json` first, then append `&& tsc -p apps/web/tsconfig.json` to the root `typecheck`, so the branch does not fail its own CI.
- Init shadcn. Add dark and light theme tokens (see `design.md`).
- Done when: `pnpm --filter @tasksathi/web dev` renders, imports `APP_NAME` from shared, and root typecheck and lint pass.

### A2: User model (Lane A)
- Branch `feat/api-user-model`. Needs the Atlas cluster and a **new** DB user (User tasks below).
- Files: `db/connect.ts`, `models/User.ts`: unique email index, refresh-token array with `tokenHash`, `familyId`, `expiresAt`, `previousTokenHash`, `previousUsedAt`.
- Mongoose `toJSON` transform: output `id`, `name`, `email` only. Never `_id`, `passwordHash`, or `refreshTokens`.
- Done when: the server connects to Atlas; a script creates a user; a duplicate email is rejected; serialized output has exactly `id`, `name`, `email`.

### A3: Auth routes (Lane A)
- Branch `feat/api-auth`. argon2 (add to `allowBuilds`; fall back to bcryptjs). Verify dispatches on hash prefix (`$argon2id$` vs `$2a$` or `$2b$`) so a later migration is possible. `jose` for the access token. Refresh token is random 256-bit, stored as a sha256 hash with a family id.
- **Refresh grace window (10 s):** the server cannot return an old token (only hashes are stored), so:
  - Presented token is current: rotate normally, set the new cookie.
  - Presented token is the **previous** token and was rotated **less than 10 s ago**: not an error; rotate again within the same family and set a fresh cookie.
  - Presented token was rotated **more than 10 s ago**, or is unknown: treat as reuse, revoke the family, return 401.
- Routes: register, login, refresh, logout, `/auth/me`, `requireAuth` middleware.
- Done when: all routes match `architecture.md` section 4 in Thunder Client; the grace-window and reuse cases behave as above.

### B2: Auth UI (Lane B)
- Branch `feat/web-auth-ui`. `/login`, `/register` with react-hook-form + zodResolver using shared schemas; field errors, loading state, error-shape rendering. No fetch calls yet.
- Done when: forms validate client-side with no API running.

### B3: API client (Lane B, after A3 is merged)
- Branch `feat/web-api-client`. **No mock adapter.** Built against the real A3 routes on `localhost:4000`.
- `lib/api.ts` typed fetch (`NEXT_PUBLIC_API_URL`, `credentials: "include"`, error-shape parsing).
- Single-flight refresh on 401, exactly as specified in `architecture.md` section 5. Not optional. **Cross-review `lib/api.ts` with the other AI before merging.**
- In-memory auth provider (token never in localStorage); protected `(app)` layout. No ID mapping: the API already returns `id`.
- Done when: login, protected page, logout, and a page reload keeping the session via `/auth/refresh` all work against real HTTP.

### A4: API tests (Lane A)
- Branch `feat/api-tests`. Vitest + Supertest + mongodb-memory-server (first run downloads a large MongoDB binary: cache it in CI to avoid timeouts).
- Cases: register, duplicate email, login, wrong password, refresh, refresh within the grace window, reuse after the window, logout, `/me` without a token, validation errors, 429.
- Done when: `pnpm test` is green locally and in CI.

### B4: Integration (Lane B + A)
- Branch `feat/web-integrate`. Verify CORS, cookies, and reload-keeps-session end to end; fix leftovers. Dev note: `localhost:3000` and `localhost:4000` are same-site, so a `sameSite=lax` cookie is sent with `credentials: include`.
- Done when: real login works in the browser and nothing needed debugging beyond small fixes.

### A5: API deploy (Lane A)
- Branch `feat/api-deploy`. `apps/api/tsup.config.ts` with `noExternal: ["@tasksathi/shared"]`; scripts `build: "tsup"`, `start: "node dist/index.js"`. Render build command `pnpm install --prod=false && pnpm --filter @tasksathi/api build`. Set `APP_VERSION`, CORS origin, and secrets in Render env.
- Done when: live `/health` on Render.

### B5: Web deploy (Lane B)
- Branch `feat/web-deploy`. Vercel project, env vars, `sameSite=none; secure` cookie check on the live domains.
- Done when: live login works end to end.

## User tasks (blockers)
- [ ] Atlas free cluster with a **new** DB user, done before A2 (target: right after B1)
- [ ] Rotate the old leaked Atlas password
- [ ] Gemini API key from Google AI Studio (env only; needed Week 3)
- [ ] Render and Vercel accounts connected to GitHub (needed before A5/B5)

## Later weeks (not started)
- **Week 2:** workspaces + RBAC, task CRUD, Kanban, filters, cursor pagination, indexes, nav shell + theme.
- **Week 3:** `llm/` layer (limiter, cache, retry), command bar, NL quick-add, `AiLog`.
- **Week 4:** background embeddings, vector search, Ask Sathi, subtasks, eval suite v1 + CI thresholds.
- **Week 5:** approval-gated agent, rate-limit and cache polish, README + diagrams, seed data, 2-min demo video.
- Week 1 may stretch slightly because of the sequential order; that is accepted in exchange for a clean integration.
