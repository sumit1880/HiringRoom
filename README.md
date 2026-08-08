TheHiringRoom

Most "AI interview practice" tools ask a question, nod at whatever you type, and move on. Say "I don't know" and they'll still tell you your communication was excellent.

This one doesn't do that.

TheHiringRoom runs real mock interviews — Technical, Behavioral, System Design, Case Study — grounded in your actual resume, not a generic question bank. It tracks what's already been asked so it never repeats itself, notices when you're struggling and backs off instead of pretending you nailed it, and grades every answer against what you actually said. No credit for effort. No credit for confidence. No made-up strengths.

How it actually works
Resume-grounded questions. Your resume gets chunked and embedded (vectors live natively in Postgres — no separate vector DB to babysit), and questions are pulled from what's actually in it.
An interview that remembers the interview. Every session tracks covered topics and consecutive struggle count, so the model has to explicitly choose: dig deeper, simplify, or move on — instead of guessing fresh every turn.
An evaluator that isn't trying to make you feel good. Refuse to answer, and you get scored like you refused — not like you "showed engagement." Strengths only get listed if you actually demonstrated them.
Not locked into one AI provider. LLM calls run through a provider-abstraction layer with fallback, so one vendor having a bad day doesn't take the app down with it.
Stack

TypeScript · React · Node/Express · PostgreSQL + Prisma · Redis · Google OAuth/JWT · GitHub Actions CI · Render + Vercel

Running it
bash
# backend
cd backend && npm install && npm run dev

# frontend
cd frontend && npm install && npm run dev

Full setup details in frontend/README.md.

Where it's at

Core interview engine and the strict evaluation pipeline are live. Interview endpoints are now Redis-backed rate limited.
