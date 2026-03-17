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

## Auth modes (phase 2 app-layer prep)
- `AUTH_MODE=dev` (default): resolves a seeded local actor using `DEV_GUILD_SLUG`.
- `AUTH_MODE=discord_oauth`: uses request-authenticated identity headers as an app-layer contract for upcoming Discord OAuth/session integration.
- Current MVP pages continue to work in `dev` mode.

## Discord sync orchestration (app-layer only)
- The web app only **enqueues** Discord sync jobs and writes audit logs.
- Job creation is centralized in `src/lib/discord/sync-jobs.ts` and used by both:
  - accepted application flow
  - roster member update flow
- No Discord gateway client or long-running worker is implemented in this repo.

## Env variables
### Required now
- `DATABASE_URL`
- `AUTH_MODE` (`dev` recommended for local MVP)
- `DEV_GUILD_SLUG`

### Required later (Discord OAuth)
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`

### Required later (web app → bot sync boundary)
- `DISCORD_SYNC_WEBHOOK_SECRET`
- `DISCORD_SYNC_BOT_API_BASE_URL`

## MVP modules
- Dashboard metrics with live database counts.
- Applications: template list, submit flow, accept/reject review actions.
- Roster: member list, profile page, editable roster fields.
- Shifts: start shift and view recent shift history.
- Tickets: create panel, create ticket, list tickets.
- Discord Sync: inspect recent sync jobs and payload summary.

## Docs
- `docs/architecture.md`
- `docs/database.md`
- `docs/deployment-vercel.md`
