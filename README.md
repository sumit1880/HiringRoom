# HiringRoom

Most "AI interview practice" tools ask a question, nod at whatever you type, and move on. Say "I don't know" and they'll still tell you your communication was excellent.

**This one doesn't do that.**

HiringRoom runs real mock interviews (Technical, Behavioral, System Design, Case Study) grounded in your actual resume, not a generic question bank. It tracks what's already been asked so it never repeats itself, notices when you're struggling and backs off instead of pretending you nailed it, and grades every answer against what you actually said. No credit for effort. No credit for confidence. No made-up strengths.

**Live demo:** https://hiring-room-zw14-ten.vercel.app

---

## How it works

**Resume-grounded questions.** Your resume is chunked and embedded with Gemini embeddings. The vectors live natively in Postgres, so there's no separate vector DB to run. Questions are pulled from what's actually in your resume.

**An interview that remembers the interview.** Every session tracks covered topics and a consecutive-struggle count, so the model has to explicitly choose to *dig deeper*, *simplify*, or *move on* instead of guessing fresh every turn.

**An evaluator that isn't trying to make you feel good.** Refuse to answer, and you get scored like you refused, not like you "showed engagement." Strengths are only listed if you actually demonstrated them.

**Not locked into one AI provider.** LLM calls go through a provider-abstraction layer with automatic fallback (Gemini → OpenRouter → Groq), so one vendor having a bad day doesn't take the app down with it.

## Features

- Four interview types: Technical, Behavioral, System Design, Case Study
- Configurable difficulty and duration, with interview expiration
- Multiple resumes per user; pick one per session
- Voice answers via the Web Speech API (speech-to-text)
- Feedback page with tabbed breakdown and per-answer scoring
- Dashboard built on your real session history
- Google OAuth sign-in with JWT sessions
- Redis-backed rate limiting on interview endpoints

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma (vectors stored natively in Postgres) |
| Cache / rate limiting | Redis |
| AI | Gemini (primary + embeddings), OpenRouter and Groq (fallback) |
| Auth | Google OAuth, JWT |
| CI/CD & hosting | GitHub Actions, Vercel (frontend), Render (backend), Neon (Postgres) |

## Getting started

### Prerequisites

- Node.js and npm
- A PostgreSQL database
- A Redis instance
- A Google OAuth client (client ID and secret)
- At least one AI provider API key. Gemini is the primary provider; OpenRouter and Groq enable fallback.

### Setup

Clone the repository:

```bash
git clone https://github.com/sumit1880/HiringRoom.git
cd HiringRoom
```

Create the environment files for `backend` and `frontend` and provide your database URL, Redis URL, JWT secret, Google OAuth credentials, and AI provider keys.

Run the backend:

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Run the frontend (in a second terminal):

```bash
cd frontend
npm install
npm run dev
```
