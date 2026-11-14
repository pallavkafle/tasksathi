# Design: TaskSathi (UI/UX)

Owner of implementation: Lane B (apps/web). Source of truth for look and feel.

## 1. Principles
- **Command bar first.** The primary input creates tasks and answers questions. It is not a chatbot gimmick.
- **Dark emerald-black glass by default**, with a light theme. Matches Pallav's portfolio brand.
- **Mobile-first** with large touch targets. Bottom nav on mobile.
- **Accessibility:** WCAG AA contrast (4.5:1) for all text. Avoid light-gray-on-light-gray labels.
- AI results are never trusted silently: quick-add shows a confirm chip, agent actions show a diff, answers show citations.

## 2. Theme tokens
Implement as CSS variables (Tailwind + shadcn). Both themes define the same token names.

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | near-black with a green tint (#07100d) | off-white (#f6f7f6) |
| `--surface` | translucent dark glass (white at 4-6% opacity + blur) | white with a soft border |
| `--border` | white at 8-10% opacity | neutral gray |
| `--text` | near-white | near-black |
| `--muted` | gray-green, must still pass 4.5:1 | mid gray, must still pass 4.5:1 |
| `--accent` | emerald (#10b981 family) | emerald, darker shade for contrast |
| `--accent-2` | teal | teal |
| `--danger` | red | red |

Glow on the command bar: emerald to teal gradient. Exact hex values may be tuned, but contrast must be checked.

## 3. Reference layouts (3 screenshots chosen by Pallav)

| Reference | Used for |
|---|---|
| Gemini-style glowing "Ask" input (with `+`, Tools, "Fast" selector, mic) | **Command bar.** "Fast" = model mode, Tools = actions (add task, search, plan my day), mic = voice quick-add (v1.5). Ctrl/Cmd+K on desktop, pinned at the bottom on mobile |
| Sidebar with nested groups and count badges | **Main nav:** Today, Inbox (n), Projects (nested), Calendar, Ask Sathi, Insights. Becomes a bottom nav on mobile |
| Light monochrome bento dashboard | **Home:** greeting, dark stats card, weekly chart, in-progress task cards, dashed "Add task" tile |

## 4. v1 screens (only three views)
1. **Home (bento):** greeting, stats card, weekly progress chart, in-progress cards, add-task tile. Deferred: goals donut, integrations, documents.
2. **Board (Kanban):** columns by status, drag and drop (dnd-kit), filters, priority and due-date chips.
3. **Ask Sathi:** the command bar with a conversation area. Answers stream in, with clickable task citations.

Plus auth pages: `/login`, `/register` (react-hook-form + zodResolver using shared schemas), and a protected `(app)` layout.

## 5. Components (shadcn base)
Button, Input, Card, Dialog, DropdownMenu, Tabs, Badge, Toast, Skeleton, Command (for the Ctrl+K bar). Custom: `CommandBar`, `TaskCard`, `KanbanColumn`, `ConfirmChip` (quick-add confirm), `DiffView` (agent approval), `CitationChip`, `WakeScreen` (API cold-start loading state).

## 6. States and behavior
- **Loading:** skeletons, not spinners, for lists. `WakeScreen` when the API is cold (first request after idle can take ~50 s).
- **Errors:** render the contract error shape `{ error: { code, message, details? } }`. Field errors inline for `VALIDATION_ERROR`.
- **Empty states:** a short line plus a primary action.
- **Quota exhausted:** show a friendly notice and serve cached sample answers; never a broken screen.
- **Motion:** Framer Motion for small transitions only; respect `prefers-reduced-motion`.

## 7. PWA
Manifest + service worker (installable), offline read of cached tasks, share target. Web Push and voice input are v1.5.

## 8. Branding
Name: TaskSathi. Tagline: "your AI task companion." Explain the name in the README and about text: Sathi (साथी) means companion in Nepali.
