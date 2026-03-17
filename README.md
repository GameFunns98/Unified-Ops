# Unified Ops App

Local MVP dashboard for applications, roster management, shifts, and tickets.

## Stack
- Next.js App Router
- Prisma
- PostgreSQL

## Local setup
1. `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. `npx prisma generate`
4. `npx prisma migrate dev --name init`
5. `npm run prisma:seed`
6. `npm run dev`

## Local dev auth model (MVP)
- No OAuth is required yet.
- The app resolves a local dev actor from seeded data (`DEV_GUILD_SLUG`, first active guild member).
- This keeps flows testable locally while Discord auth/integration is deferred.

## MVP modules
- Dashboard metrics with live database counts.
- Applications: template list, submit flow, accept/reject review actions.
- Roster: member list, profile page, editable roster fields.
- Shifts: start shift and view recent shift history.
- Tickets: create panel, create ticket, list tickets.

## Docs
- `docs/architecture.md`
- `docs/database.md`
- `docs/deployment-vercel.md`
