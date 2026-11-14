# Rules: TaskSathi (every AI and human must follow)

## 1. Working agreement
- Lane A (primary Claude) owns `apps/api`, `packages/shared`, `.github`. Lane B (deepsheek) owns `apps/web`. Neither edits the other's folders.
- Root files (`package.json`, `tsconfig.base.json`, `eslint.config.mjs`, `pnpm-workspace.yaml`, `.npmrc`) change only through a PR whose description says so.
- **The API contract in `architecture.md` section 4 is frozen.** Propose changes to the user; do not change them silently.
- Locked decisions (stack, scope, folder layout) change only with a concrete reason, flagged explicitly to the user.
- **Sequential by default.** The user is the only one typing commands, so two lanes do not speed things up. Run lanes in parallel only when one lane is blocked on an external dependency (Atlas, Vercel, Render, Gemini key).
- **No mocks for the API.** The web client is built against the real API (A3 lands before B3) so cookies, CORS, refresh and error shapes are exercised from the start.
- Be critical when reviewing: list gaps, risks, and over-scoped items first.
- Be concise: tables and code, no long preambles.

## 2. Git workflow
- One branch per task, named `feat/api-*`, `feat/web-*`, `chore/*`. PR into `main`, squash merge.
- Commit messages are conventional: `feat(api): ...`, `fix(web): ...`, `chore: ...`, `docs: ...`.
- Never commit `.env`, secrets, `node_modules`, `dist`, `.next`.
- Pre-commit sanity check (list every file with its size, no stray empties):
```powershell
Get-ChildItem -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch 'node_modules' } | ForEach-Object { "{0,6}  {1}" -f $_.Length, $_.FullName.Replace("$PWD\","") }
```
- PR gate: `pnpm lint && pnpm typecheck && pnpm format:check` pass; `pnpm test` once tests exist.
- Before merging, paste `git diff main...HEAD` to the other AI for critique.
- **Security-critical code needs cross-review, not just green CI:** the web `lib/api.ts` refresh logic, the API refresh-token rotation, `requireAuth`, and RBAC checks. A bug there means false logouts or a token leak.
- Before pushing any branch: `git fetch`, `git rebase origin/main`, and re-run `pnpm install` if any `package.json` changed. Several branches touch the root `package.json`, so this avoids conflicts.
- Lockfile conflicts: `git checkout origin/main -- pnpm-lock.yaml`, then `pnpm install`. Never hand-edit it.
- Worktrees are optional, only for a real parallel stretch: `git worktree add ..\tasksathi-web -b feat/web-scaffold`, then run `pnpm install` inside each worktree.
- Line endings: `.gitattributes` (`* text=auto eol=lf`) and a root `.editorconfig` (`end_of_line = lf`) keep files LF on Windows.

## 3. Environment rules (Windows, PowerShell)
- Use **PowerShell syntax only**. Not cmd, not bash.
- **One command, press Enter, wait, then the next command.** Never paste several lines at once. PowerShell treats them as continuations and throws parse errors.
- Do not use corepack (EPERM without admin). pnpm is installed with `npm i -g pnpm`.
- If scripts are blocked: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- Native dependency postinstall scripts (argon2, bcrypt, sharp, esbuild) must be listed under `allowBuilds` in `pnpm-workspace.yaml`. `onlyBuiltDependencies` is no longer honored.

## 4. Version pins (do not upgrade without a reason)
- Node 22.16.0, pnpm 12.18.0, TypeScript **~6.0.3** (use `~`, not `^`; typescript-eslint 8.x does not support TS 7), ESLint 10, typescript-eslint 8.72.2, Prettier 3.10.1, Zod 4.6.7, tsx 4.23.15.
- `@types/node` pinned to `~22` to match the runtime.
- Express **5** (async errors reach the error handler without wrappers; wildcard routes use `/*splat`), `@types/express@5`.
- Check `pnpm add` results before accepting a new major version of anything.

## 5. TypeScript and code style
- TypeScript strict with `noUncheckedIndexedAccess`. No `any`. Unused vars prefixed `_`.
- `moduleResolution: "Bundler"`. Do not switch to NodeNext (it forces `.js` import extensions).
- Prettier: semicolons, double quotes, trailing commas, printWidth 100.
- One ESLint config at the root. Frontend rules (`eslint-plugin-react-hooks`, `@next/eslint-plugin-next`) are added there, scoped to `apps/web/**`. Do not skip Next lint rules. Verify both plugins support ESLint 10; if not, use their newest compatible versions and do not downgrade ESLint.
- Feature-based modules. Validate every request body, query, and params with Zod, using schemas from `@tasksathi/shared` where shared with the web app.
- Add short comments where intent is not obvious. Keep files small and single-purpose.
- Zod 4 deprecates `z.string().email()`. It still works. Switch to `z.email()` only if lint flags it.

## 6. Security rules
- Secrets live only in env files. `.env` is gitignored, `.env.example` (placeholders) is committed. Never paste keys or connection strings into chat.
- The old leaked Atlas credentials (from the old `mern training` repo) must be rotated. Create a **new** DB user for TaskSathi.
- Central error handler. Never return raw errors or stack traces to clients; use the C0 error shape.
- helmet, a CORS origin allowlist (no wildcard with credentials), rate limits (strictest on `/auth/*` and `/ai/*`), `trust proxy` set for Render.
- Access token in memory only (never localStorage). Refresh token is httpOnly, stored hashed, rotated, with reuse detection.
- RBAC check on every workspace route. Always scope DB queries by workspace and user. Whitelist fields on updates (no mass assignment).
- Passwords: minimum 8 characters, hashed with argon2 (or bcryptjs fallback).

## 7. AI rules
- Never hardcode model IDs; read from env.
- All LLM calls go through the `llm/` layer (limiter, retry with backoff, cache, logging). No direct provider SDK calls elsewhere.
- Every AI call writes an `AiLog` row.
- Treat task and comment text as untrusted input. Retrieved text must never trigger actions. Writes need explicit user approval.
- Validate every model output with Zod. Validate every cited task ID exists.
- Demo and synthetic data only, because free-tier requests may be used by Google for product improvement.

## 8. Testing rules
- Vitest + Supertest + mongodb-memory-server for the API. Test failure paths, not just the happy path (wrong password, token reuse, missing token, validation errors).
- A change is not done until lint, typecheck, format check, and tests pass.
- Prove the tooling catches mistakes at least once (a deliberate type error must fail CI).

## 9. Definition of done (any task)
1. Acceptance criteria in `task.md` met and the expected command output matches.
2. PR gate green locally and in CI.
3. Other AI reviewed the diff.
4. `memory.md` updated (state, decisions, new lessons).
5. No stray files, no secrets.

## 10. How an AI should answer the user (Pallav)
- Direct, informal, brief. Tables and concise code. No long preambles.
- Give exact commands and say which file each snippet belongs to.
- Say what output to expect from each test.
- Do not create extra files the user did not ask for.
