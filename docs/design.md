# Design: TaskSathi

Implemented by Lane B in `apps/web`.

## 1. Principles
- The command bar is the main input. It creates tasks and answers questions.
- Dark emerald-black glass is the default theme, with a light theme.
- Mobile-first, large touch targets, bottom nav on mobile.
- WCAG AA contrast (4.5:1) for all text, including muted labels.
- AI output is never applied silently: quick-add shows a confirm chip, agent actions show a diff, answers show citations.
- Restraint: one sans font, tabular numbers for counts, one emerald-to-teal accent used sparingly for glow and active states.

## 2. Theme tokens
CSS variables via Tailwind and shadcn. Both themes define the same names. Hex values are starting points and must pass the contrast check.

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | near-black with a green tint (#07100d) | off-white (#f6f7f6) |
| `--surface` | translucent glass (white at 4-6% opacity, blurred) | white with a soft border |
| `--border` | white at 8-10% opacity | neutral gray |
| `--text` | near-white | near-black |
| `--muted` | gray-green, 4.5:1 or better | mid gray, 4.5:1 or better |
| `--accent` | emerald (#10b981 family) | darker emerald for contrast |
| `--accent-2` | teal | teal |
| `--danger` | red | red |

Radii 12 to 16px, 1px low-opacity borders, soft shadows, no heavy gradients. Glass only on floating surfaces (command bar, cards, dialogs).

## 3. Layout references

| Reference | Used for |
|---|---|
| Glowing "Ask" input with `+`, Tools, a mode selector and a mic | Command bar. Ctrl/Cmd+K on desktop, pinned at the bottom on mobile |
| Sidebar with nested groups and count badges | Main nav: Today, Inbox (n), Projects (nested), Calendar, Ask Sathi, Insights. A bottom nav on mobile |
| Light monochrome bento dashboard | Home: greeting, stats cards, weekly chart, in-progress cards, add-task tile |

## 4. v1 screens
1. **Home:** greeting, stats cards with sparklines, weekly progress chart, in-progress cards, add-task tile.
2. **Board:** Kanban columns by status, drag and drop, filters, priority and due-date chips, assignee initials, subtask progress bars.
3. **Ask Sathi:** the command bar with a conversation area. Answers stream in with clickable task citations.

Also `/login`, `/register` (react-hook-form with the shared Zod schemas) and a protected app layout. Calendar and Insights appear in the nav only when built.

## 5. Components
shadcn base: Button, Input, Card, Dialog, DropdownMenu, Tabs, Badge, Toast, Skeleton, Command. Custom: `CommandBar`, `TaskCard`, `KanbanColumn`, `ConfirmChip`, `DiffView`, `CitationChip`, `WakeScreen`.

## 6. States and behavior
- **Loading:** skeletons for lists. `WakeScreen` when the API is waking (about a minute after idle).
- **Errors:** render the API error shape. Field errors appear inline for `VALIDATION_ERROR`.
- **Quick-add failure or rate limit:** open a pre-filled manual form. Task creation is never blocked.
- **Empty states:** one short line and a primary action.
- **Quota exhausted:** a short notice and cached sample answers.
- **Kanban on touch:** dnd-kit `TouchSensor` with `activationConstraint: { delay: 250, tolerance: 5 }` and correct `touch-action` CSS so scrolling and dragging do not conflict.
- **Motion:** small Framer Motion transitions only; respect `prefers-reduced-motion`.

## 7. PWA
Installable only: web manifest and icons. No offline caching in v1. A later service worker may cache static assets only, with `/api/*` and React Server Component requests kept network-only, because caching them by URL serves broken payloads. Push notifications and voice input come later.

## 8. Branding
Name: TaskSathi. Tagline: "your AI task companion". The README explains the name: Sathi (साथी) means companion in Nepali.