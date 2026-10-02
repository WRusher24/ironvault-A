# IronVault — Deployment & Local Development Guide

IronVault (آيرون فالت) is a production-ready, mobile-first progressive overload &
personal record (PR) tracking platform built with **Next.js (App Router)**, **Tailwind CSS v4**,
**Drizzle ORM + PostgreSQL**, and **Vercel Blob** for exercise photo storage.

The entire user interface is native Arabic with full RTL support (`dir="rtl"`,
Tailwind logical properties `ms-/me-/ps-/pe-`), while exercise names, notes, and
weights can be typed in English or Arabic interchangeably.

---

## 1. Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, React 19, Server Components)   |
| Styling    | Tailwind CSS v4 (RTL logical properties throughout)    |
| Database   | PostgreSQL via Drizzle ORM (`drizzle-kit push`)        |
| Auth       | Email **or** phone + password, scrypt hashing, DB sessions + httpOnly cookie |
| Storage    | Vercel Blob (production) / local `/public/uploads` fallback (dev) |
| Charts     | Hand-rolled SVG line charts (zero dependencies)        |
| Icons      | lucide-react                                           |

---

## 2. Run Locally

### 2.1 Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally (or a hosted URL — Neon works great)

### 2.2 Install dependencies

```bash
npm install
```

### 2.3 Configure environment variables

Create `.env` in the project root:

```bash
# Required — PostgreSQL connection string
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db

# Optional (production photo uploads) — without it, uploads fall back to ./public/uploads
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

### 2.4 Push the schema & seed the demo vault

```bash
npx drizzle-kit push       # creates users, sessions, categories, exercises, pr_entries
node scripts/seed.mjs      # creates the seeded ADMIN account + realistic PR history
```

Seeded credentials (safe for local/demo — change in production):

| Field    | Value                |
| -------- | -------------------- |
| Email    | `admin@ironvault.app` |
| Password | `IronVault#2026`     |

The seed is idempotent: re-running it wipes and re-creates the admin vault only —
other accounts are never touched.

### 2.5 Start the dev server

```bash
npm run dev
# open http://localhost:3000 → redirects to /login
```

### 2.6 Production smoke test locally

```bash
npm run build
npm run start
curl http://localhost:3000/api/health   # → {"ok":true}
```

---

## 3. Deploy to Vercel

### 3.1 Push the repo

```bash
git init && git add -A && git commit -m "IronVault launch"
git remote add origin <your-repo-url> && git push -u origin main
```

### 3.2 Create the PostgreSQL database (Neon — serverless)

1. In the Vercel dashboard → **Storage** → **Create Database** → **Neon Postgres**
   (or create a project directly at [neon.tech](https://neon.tech)).
2. Copy the pooled connection string, e.g.
   `postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/dbname?sslmode=require`

### 3.3 Create the Vercel Blob store (exercise photos)

1. Vercel dashboard → **Storage** → **Create Database** → **Blob**.
2. Name it e.g. `ironvault-photos`.
3. Connect it to your project — Vercel injects `BLOB_READ_WRITE_TOKEN` automatically.

### 3.4 Environment variables (Project → Settings → Environment Variables)

| Name                    | Value                                    | Scope               |
| ----------------------- | ---------------------------------------- | ------------------- |
| `DATABASE_URL`          | Neon pooled connection string            | Production, Preview |
| `BLOB_READ_WRITE_TOKEN` | Auto-injected when the Blob store linked | Production, Preview |

### 3.5 Initialize the production schema & seed

From your machine, pointing at the production database for a one-off bootstrap:

```bash
DATABASE_URL="postgresql://...neon..." npx drizzle-kit push --force
DATABASE_URL="postgresql://...neon..." node scripts/seed.mjs
```

> `drizzle.config.json` reads a hard-coded local URL by default; override per-run with the
> `DATABASE_URL` env as shown, or edit the config to `process.env.DATABASE_URL`.

### 3.6 Deploy

```bash
vercel --prod
# or simply push to main when Git integration is active
```

### 3.7 Custom domains

1. Vercel dashboard → Project → **Settings → Domains**.
2. Add `ironvault.example.com`, point a **CNAME** to `cname.vercel-dns.com`.
3. HTTPS is issued automatically. No app changes are needed — sessions are
   `SameSite=Lax` cookies on `/`, so any domain attached to the deployment works.

---

## 4. Security & Isolation Notes

- **Passwords** are hashed with Node `crypto.scrypt` (per-user 128-bit salt, constant-time compare).
- **Sessions** are 32-byte random tokens; only their SHA-256 hash is stored server-side,
  delivered to the browser as an `httpOnly; SameSite=Lax; Secure(prod)` cookie, 30-day expiry.
- **Data isolation**: every domain table carries `user_id` and **every** query (pages + API)
  filters by the session user's id, enforced in `WHERE` clauses — User B can never read or
  mutate User A's categories, exercises, or PR history.
- **Uploads** are validated (MIME allow-list, 5 MB cap) and namespaced per user.

## 5. Useful Commands

| Command                 | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Local dev server (Turbopack)                     |
| `npm run build`         | Production build                                 |
| `npm run start`         | Serve the production build                       |
| `npm run typecheck`     | Strict TypeScript checking                       |
| `npx drizzle-kit push`  | Apply `src/db/schema.ts` to the database         |
| `node scripts/seed.mjs` | (Re)seed the admin demo vault                    |
| `curl /api/health`      | Liveness probe (checks DB connectivity)          |
