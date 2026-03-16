# Unified Ops

Unified dashboard pro applications, roster, shifts, tickets a Discord sync.

## Stack
- Next.js
- Prisma
- PostgreSQL
- GitHub Actions

## Local setup
1. `npm install`
2. zkopiruj `.env.example` na `.env`
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npm run dev`

## Docs
- `docs/architecture.md`
- `docs/database.md`
- `docs/deployment-vercel.md`
- `docs/deployment-bot.md`
- `docs/roadmap.md`