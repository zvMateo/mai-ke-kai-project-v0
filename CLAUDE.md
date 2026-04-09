# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mai Ke Kai Surf House** — A Property Management System (PMS) for a boutique surf hostel in Costa Rica.

**Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Supabase, Tailwind CSS v4, pnpm

## Commands

```bash
pnpm dev                  # Start dev server (http://localhost:3000)
pnpm build                # Build for production
pnpm start                # Start production server
pnpm lint                 # Run ESLint
pnpm lint:fix             # Auto-fix ESLint issues
pnpm type-check           # TypeScript check without emitting
pnpm clean                # Remove build artifacts
pnpm build:analyze        # Build with bundle analysis
```

**No test framework is currently configured.**

## Architecture

### Directory Structure

```
app/           # Next.js App Router routes (public pages, admin panel, API routes)
components/    # React components (feature-based + ui/ shadcn primitives)
lib/
  actions/     # Server actions ('use server' functions for mutations)
  queries/     # TanStack Query hooks, keys, and fetchers
    mutations/ # Mutation hooks per entity
  stores/      # Zustand client state stores
  supabase/    # Supabase client instances (server, client, admin, proxy)
types/         # TypeScript type definitions
hooks/         # Custom React hooks
```

### Key Patterns

**Server vs Client Components:**

- Components are Server Components by default (no directive needed)
- Use `'use client'` only for interactive components, hooks, or browser APIs
- Server Actions use `'use server'` directive at the top of the file

**Data Layer:**

- **Supabase** for database, auth, and storage
  - Server context: `import { createClient } from '@/lib/supabase/server'`
  - Client context: `import { createClient } from '@/lib/supabase/client'`
- **TanStack Query** for server state — use hooks in `lib/queries/`
- **Zustand** for client state — stores in `lib/stores/`

**Mutations:**

- Prefer Server Actions (`lib/actions/`) for data mutations
- Server Actions call `revalidatePath()` after mutations
- Client components use TanStack Query mutations for optimistic updates

**Styling:**

- Tailwind CSS v4 with shadcn/ui components (New York style)
- Use `cn()` utility for conditional class merging
- Use `class-variance-authority` (cva) for component variants

**Forms:**

- React Hook Form + Zod validation (`@hookform/resolvers/zod`)

**Internationalization:**

- `next-intl` with 4 languages (en, es, fr, de)
- Translation messages in `messages/[locale].json`
- Plugin configured in `i18n/request.ts`

**Authentication:**

- Supabase Auth with SSR via `@supabase/ssr`
- Session managed through middleware (`middleware.ts`) using `lib/supabase/proxy`
- Signup flow uses a two-step process: `prepare-signup` -> `finalize-signup` API routes

**Deployment:**

- Deployed on Vercel with `output: 'standalone'` (configured in `next.config.mjs`)
- Vercel Cron jobs configured in `vercel.json` (e.g., expire bookings daily at 2 AM)
- Previously targeted Cloudflare/OpenNext — those dependencies have been removed

### Important Notes

- `typescript.ignoreBuildErrors` is `true` in `next.config.mjs` — type errors don't block builds
- `poweredByHeader` is `false` — X-Powered-By is suppressed
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.) are configured in `next.config.mjs`
- Image CDN sources: Cloudinary, Unsplash, Sanity
- Path alias: `@/*` maps to project root
- No console.log statements should be committed — use proper error handling
