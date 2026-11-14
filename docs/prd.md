# PRD: TaskSathi

**Tagline:** TaskSathi, your AI task companion. (Sathi / साथी = companion in Nepali)
**Owner:** Pallav Kafle (Computer Engineering student, Himalaya College of Engineering, TU, Nepal)
**Status:** Day 1 complete (monorepo scaffold). Building Week 1.

## 1. Problem and purpose
Pallav built a basic MERN expense tracker (v1, deployed, stays live untouched). It is tutorial-level. He also holds generative AI and LLM certificates and wants to become an **AI Engineer**. TaskSathi is a rebuild as an AI-powered task platform, built as the flagship hiring portfolio piece.

## 2. Goals and success criteria

| Goal | Success looks like |
|---|---|
| Boost hiring chances | Live demo link + README + 2-min video a recruiter grasps in under 2 minutes |
| Show AI Engineer skills | RAG with citations, structured outputs, approval-gated agent, **eval suite in CI**, cost/latency tracking |
| Show engineering depth | TypeScript strict, Zod validation, refresh-token auth, RBAC, tests, CI, Docker |
| Be finishable | Core scope in ~5 weeks at ~10-12 hrs/week (stretch to 6-7 if the TrailMind project needs time) |

Why this shape: AI Engineer is roughly a software engineer who ships LLM features reliably; RAG is the top GenAI skill signal; an eval suite is the strongest portfolio signal; a live URL beats a repo with no deployment.

## 3. Users
- **Primary (demo):** a recruiter or hiring manager who clicks a link and judges in about 2 minutes.
- **Product persona:** an individual or small team managing tasks in workspaces.

## 4. v1 scope (locked, 6 features)

| # | Feature | Behavior | Proves |
|---|---|---|---|
| 1 | **Natural-language quick-add** | Command bar: "submit report Friday, high priority" becomes a validated task shown as a confirm chip before saving. Zod-validated JSON, one retry on invalid output | Structured output, validation, retries |
| 2 | **Ask Sathi (RAG)** | Questions answered from the user's own workspace, cites task IDs, every cited ID is validated to exist | Retrieval, grounding, hallucination control |
| 3 | **Evals + cost dashboard** | Eval suite runs in CI with thresholds. Every AI call logs feature, model, tokens in/out, latency, cost, success | Eval discipline, cost engineering |
| 4 | **Kanban + workspaces + RBAC** | Workspaces with roles (owner/admin/member/viewer), Kanban board, filters, cursor pagination | Backend depth, access control |
| 5 | **AI subtask breakdown** | Task to a validated array of subtasks | Prompt and schema design |
| 6 | **Agent with approval** | Model proposes create/update/reschedule actions, UI shows a diff, nothing is written until the user approves | Tool use, agent safety |

## 5. Non-goals
- **v1.5 (after v1):** focus sessions (Pomodoro), AI "Today plan", habit streaks, weekly AI review, calendar view, Web Push reminders, voice quick-add.
- **v2 (optional):** Expo/React Native client on the same API, real-time collaboration (Socket.io).
- **Out of scope:** Slack/Notion integrations, document storage, goals donut, billing, fine-tuning.

## 6. Platform decision
Web-first **installable PWA**, not native Android. Reasons: a recruiter can click a link, the TrailMind project already shows Android work, one codebase.

## 7. Functional requirements by area
- **Auth:** register, login, refresh (rotating, reuse detection), logout, `me`. Password minimum 8 characters.
- **Workspaces:** create, list, invite members, assign roles. All task data is scoped to a workspace.
- **Tasks:** CRUD, title, description, status, priority, due date, labels, assignee, subtasks via `parentId`, filters, sorting, cursor pagination.
- **AI:** parse-task, subtasks, ask (streaming), agent propose and approve.
- **Ops:** `/health`, AI usage and cost summary.

## 8. Non-functional requirements
- **Security:** see `rule.md`.
- **Quota resilience:** free-tier LLM limits are tight (see `architecture.md`). The app must never fail a recruiter's click: caching, per-user limits, seeded demo workspace, cached-sample fallback.
- **Privacy:** free-tier requests may be used to improve Google products, so **synthetic demo data only**.
- **Accessibility:** WCAG AA contrast (4.5:1), mobile-first, large touch targets.
- **Performance:** the Render free tier cold start (~50 s) must be handled in the UI with a wake/loading state.

## 9. Milestones

| Week | Build | Done when |
|---|---|---|
| 1 | Monorepo, auth v2, tests, CI, skeleton deploy | CI green, live login on Vercel + Render |
| 2 | Workspaces, RBAC, task CRUD, Kanban, nav shell, theme | A teammate can use it unaided |
| 3 | `llm/` layer, command bar, NL quick-add, `AiLog` | "Submit report Friday, high priority" creates the correct task |
| 4 | Embeddings, vector search, Ask Sathi, subtasks, eval suite v1 | Evals run in CI, score table in README |
| 5 | Agent with approval, polish, README, diagrams, demo video | Pallav can walk an interviewer through it |

## 10. Portfolio deliverables
README with one-liner, live demo, screenshots/GIF, architecture diagram, **eval results table**, tech decisions with reasons, "what I'd do next", link to v1 as the "before". 2-minute video: command bar, task created, Ask Sathi with citations, eval table.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Scope creep | v1 locked to the 6 features |
| Quota burned by visitors | Cache, per-user limits, seeded demo, cached fallback |
| Model names and limits change | Model IDs from env vars, provider-agnostic `llm/` layer |
| Time split with TrailMind | Plan sized to 10-12 hrs/week, stretch to 6-7 weeks |
| Render cold start | Loading state, keep-alive ping |
| Secret leakage | `.env` ignored, secret scanning, rotate the old leaked Atlas password |
