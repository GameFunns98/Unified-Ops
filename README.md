# Unified Ops App

Unified dashboard pro applications, roster, shifts, tickets a Discord sync.

## Stack
- Next.js
- Prisma
- PostgreSQL
- GitHub Actions

## Local setup
1. npm install
2. Copy `.env.example` to `.env` and set `DATABASE_URL` for your local PostgreSQL instance.
3. npx prisma generate
4. npx prisma migrate dev --name init
5. npm run prisma:seed
6. npm run dev

## Docs
- docs/architecture.md
- docs/database.md
- docs/deployment-vercel.md
