$ErrorActionPreference = "Stop"

# =========================
# CONFIG
# =========================
$RepoName = "unified-ops-app"
$GitHubUsername = "TVE_GITHUB_JMENO"

# =========================
# HELPERS
# =========================
function New-Dir {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Write-FileUtf8 {
    param(
        [string]$Path,
        [string]$Content
    )
    $parent = Split-Path -Parent $Path
    if ($parent -and -not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

# =========================
# ROOT CHECK
# =========================
$currentFolder = Split-Path -Leaf (Get-Location)
Write-Host "Aktualni slozka: $currentFolder" -ForegroundColor Cyan

# =========================
# CREATE DIRECTORIES
# =========================
@(
    ".github",
    ".github\ISSUE_TEMPLATE",
    ".github\workflows",
    "app",
    "src",
    "src\lib",
    "src\lib\api",
    "src\lib\audit",
    "src\lib\discord",
    "src\lib\services",
    "src\types",
    "prisma",
    "docs",
    "public"
) | ForEach-Object { New-Dir $_ }

# =========================
# .gitignore
# =========================
Write-FileUtf8 ".gitignore" @'
node_modules/
.next/
out/
dist/
coverage/
.env
.env.local
.env.production
.vercel/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.DS_Store
Thumbs.db
'@

# =========================
# README.md
# =========================
Write-FileUtf8 "README.md" @'
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
'@

# =========================
# .env.example
# =========================
Write-FileUtf8 ".env.example" @'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unified_ops?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DISCORD_BOT_TOKEN=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/callback/discord"
'@

# =========================
# docs
# =========================
Write-FileUtf8 "docs\architecture.md" @'
# Architecture

## Modules
- Applications
- Roster
- Shifts
- Tickets
- Discord Sync

## Core stack
- Next.js app router
- Prisma ORM
- PostgreSQL
- Vercel for app
- External host for bot/worker
'@

Write-FileUtf8 "docs\database.md" @'
# Database

Sem pridej:
- domain model
- hlavni entity
- vztahy
- migration notes
- index strategy
'@

Write-FileUtf8 "docs\deployment-vercel.md" @'
# Deployment Vercel

## Scope
- frontend
- dashboard
- public pages
- route handlers

## Nedavat na Vercel
- nonstop Discord bot
- queue worker
'@

Write-FileUtf8 "docs\deployment-bot.md" @'
# Deployment Bot

Sem pridej:
- host pro bota
- env setup
- startup command
- restart strategy
- Discord intents
'@

Write-FileUtf8 "docs\roadmap.md" @'
# Roadmap

## Milestone 1
- foundation
- prisma
- auth stub

## Milestone 2
- applications

## Milestone 3
- roster

## Milestone 4
- shifts, tickets, discord sync
'@

# =========================
# GitHub issue templates
# =========================
Write-FileUtf8 ".github\ISSUE_TEMPLATE\bug_report.yml" @'
name: Bug report
description: Nahlasit chybu
title: "[Bug]: "
labels: ["bug"]
body:
  - type: textarea
    id: summary
    attributes:
      label: Popis
      description: Co je spatne
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Kroky k reprodukci
      description: Jak chybu vyvolat
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Ocekavane chovani
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Skutecne chovani
    validations:
      required: true
'@

Write-FileUtf8 ".github\ISSUE_TEMPLATE\feature_request.yml" @'
name: Feature request
description: Navrh nove funkce
title: "[Feature]: "
labels: ["feature"]
body:
  - type: input
    id: module
    attributes:
      label: Modul
      placeholder: applications / roster / shifts / tickets / backend
    validations:
      required: true

  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: Co chybi nebo co je spatne
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Navrhovane reseni
    validations:
      required: true
'@

Write-FileUtf8 ".github\ISSUE_TEMPLATE\task.yml" @'
name: Task
description: Technicky ukol
title: "[Task]: "
labels: ["enhancement"]
body:
  - type: input
    id: module
    attributes:
      label: Modul
      placeholder: backend / database / infra / docs
    validations:
      required: true

  - type: textarea
    id: task
    attributes:
      label: Zadani
    validations:
      required: true

  - type: textarea
    id: done
    attributes:
      label: Definition of done
    validations:
      required: true
'@

# =========================
# PR template
# =========================
Write-FileUtf8 ".github\pull_request_template.md" @'
## Co tenhle PR dela
- 

## Zmeneny modul
- [ ] applications
- [ ] roster
- [ ] shifts
- [ ] tickets
- [ ] backend
- [ ] database
- [ ] docs
- [ ] infra

## Checklist
- [ ] kod buildi
- [ ] lint prosel
- [ ] typy sedi
- [ ] zadne tajne udaje v commitu
- [ ] dokumentace upravena, pokud bylo potreba
'@

# =========================
# CODEOWNERS
# =========================
Write-FileUtf8 ".github\CODEOWNERS" @"
* @$GitHubUsername
/app/ @$GitHubUsername
/src/ @$GitHubUsername
/prisma/ @$GitHubUsername
/docs/ @$GitHubUsername
"@

# =========================
# GitHub Actions CI
# =========================
Write-FileUtf8 ".github\workflows\ci.yml" @'
name: CI

on:
  pull_request:
  push:
    branches:
      - main
      - develop

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Prisma validate
        run: npx prisma validate

      - name: Prisma generate
        run: npx prisma generate

      - name: Lint
        run: npm run lint --if-present

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Build
        run: npm run build --if-present
'@

# =========================
# package.json
# =========================
Write-FileUtf8 "package.json" @'
{
  "name": "unified-ops-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "typecheck": "tsc --noEmit"
  }
}
'@

# =========================
# tsconfig.json
# =========================
Write-FileUtf8 "tsconfig.json" @'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
'@

# =========================
# next-env.d.ts
# =========================
Write-FileUtf8 "next-env.d.ts" @'
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Tento soubor nemente rucne.
'@

# =========================
# prisma\schema.prisma
# =========================
Write-FileUtf8 "prisma\schema.prisma" @'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
'@

# =========================
# app skeleton
# =========================
Write-FileUtf8 "app\layout.tsx" @'
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
'@

Write-FileUtf8 "app\page.tsx" @'
export default function HomePage() {
  return (
    <main>
      <h1>Unified Ops</h1>
      <p>Projekt byl vytvoren bootstrap skriptem.</p>
    </main>
  );
}
'@

# =========================
# src placeholders
# =========================
Write-FileUtf8 "src\lib\prisma.ts" @'
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
'@

Write-FileUtf8 "src\types\api.ts" @'
export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: {
    message: string;
    details?: unknown;
  };
};
'@

# =========================
# optional git init
# =========================
if (-not (Test-Path ".git")) {
    git init | Out-Null
    git checkout -b main | Out-Null
    git branch develop | Out-Null
}

Write-Host ""
Write-Host "Hotovo." -ForegroundColor Green
Write-Host "Vytvorene soubory a slozky pro GitHub setup jsou pripraveny." -ForegroundColor Green
Write-Host ""
Write-Host "Dalsi kroky:" -ForegroundColor Yellow
Write-Host "1. Dopln do skriptu GitHub jmeno misto TVE_GITHUB_JMENO" -ForegroundColor Yellow
Write-Host "2. Spust: npm install" -ForegroundColor Yellow
Write-Host "3. Spust: git add ." -ForegroundColor Yellow
Write-Host "4. Spust: git commit -m ""chore: bootstrap github setup""" -ForegroundColor Yellow