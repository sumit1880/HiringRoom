# Aptitude — AI Interview Coach (Frontend)

A frontend-only redesign of the AI Interview Coach: dark, glassmorphic, motion-driven UI built with React, TypeScript, Vite, and Tailwind. This repo contains **no backend code** — it's a pure client that talks to your existing API through a single, clearly-marked service layer.

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL. The app runs immediately with **mock data** (see "Connecting your backend" below) — no configuration required.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui (Radix primitives) · Framer Motion · React Router · TanStack Query · React Hook Form + Zod · Sonner · Lucide · React Dropzone · React Markdown · Recharts

## Project structure

```
src/
  components/
    ui/         shadcn-style primitives (Button, Card, Input, Tabs, Select, ...)
    layout/     AppShell, AppSidebar, MobileTabBar, PublicNavbar, route transitions
    shared/     AuroraBackground, Orb, Waveform, TiltCard, motion helpers, empty/error/skeleton states
  features/      one folder per screen — landing, auth, dashboard, resume,
                  interview-setup, live-interview, feedback, profile, settings
  hooks/         TanStack Query hooks + the auth context
  services/      API client + one service file per domain (auth, resume, interview, feedback, dashboard)
  types/         shared domain types
```

Each feature folder owns its page component plus any sub-components it needs — nothing is shared across features unless it's genuinely generic (in which case it lives in `components/shared`).

## Connecting your backend

All HTTP calls go through `src/services/apiClient.ts`. It reads `VITE_API_BASE_URL` from your `.env` (copy `.env.example` → `.env`) and attaches `Authorization: Bearer <token>` from `localStorage`. It does not assume any response shape beyond JSON.

Each file in `src/services/*Service.ts` (e.g. `authService.ts`, `resumeService.ts`) has a `USE_MOCKS` branch that returns realistic demo data so every screen — including loading, empty, and success states — is explorable without a live API. **To wire up your real backend:**

1. Set `VITE_API_BASE_URL` in `.env`.
2. In `src/services/mockData.ts`, flip `USE_MOCKS` to `false` (or delete the `if (USE_MOCKS) { ... }` branches in each service file).
3. Adjust the `api.get/post/put/patch/delete` paths in each service to match your actual endpoints, and align `src/types/index.ts` with your real response shapes.

Nothing in the component layer talks to `fetch` directly — components only ever import from `services/*` and `hooks/use*`, so this is the only place you need to touch.

## What's built out in full

- **Landing** — hero, bento feature grid, workflow steps, animated stats, testimonials, pricing, FAQ accordion, newsletter, footer
- **Auth** — Login, Register (with live password strength), Forgot Password, shared split-panel layout
- **Dashboard** — greeting, stat cards, score trend chart, AI insight card, recent interviews, achievements, quick actions
- **Resume** — drag & drop upload, progress + parsing-stage timeline, parsed summary and skills
- **Interview setup** — card-based selection for type, role, difficulty, duration, resume context
- **Live interview** — animated AI orb with state (idle/listening/thinking/speaking), waveform, question navigator, timer, answer editor, confidence meter
- **Feedback** — animated score ring, radar chart, score-history line chart, strengths/weaknesses, recommendations, celebration confetti for strong scores
- **Profile** — stats, skill progress bars, achievements grid, activity timeline
- **Settings** — tabbed account / notifications / security / privacy / preferences

All pages include loading (skeletons), empty, and error states, and are responsive from mobile through desktop (sidebar collapses to a bottom tab bar under `lg`).

## Design system

Tokens live in `src/index.css` (CSS variables) and `tailwind.config.js`. Palette: near-black `#0A0B0F` background, electric violet primary, cyan secondary. Type: Space Grotesk (display), Inter (body), JetBrains Mono (data/timers). Signature motif: the "Orb" — a state-driven gradient sphere reused across the hero, auth panel, dashboard insight card, and live interview.

`prefers-reduced-motion` is respected globally; all interactive elements have visible focus rings.

## Scripts

```bash
npm run dev       # start dev server
npm run build     # type-check + production build
npm run preview   # preview the production build locally
```
