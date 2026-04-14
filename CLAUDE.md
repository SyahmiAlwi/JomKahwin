# CLAUDE.md — JomKahwin!

Context for AI assistants and contributors. **User-facing setup and routes** stay in `README.md`; this file focuses on architecture and conventions.

## What it is

Malay-language wedding planning web app: guests, budget, checklist, timetable, suppliers, countdown, settings. Minimal UI, Supabase-backed, Malaysia-focused copy.

## Stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript strict, Tailwind v3, Radix primitives |
| Data | Supabase (Postgres, Auth, Storage) via `@supabase/ssr` + `@supabase/supabase-js` |
| Client data | TanStack React Query v5 |
| Motion / icons | Framer Motion, Lucide |
| PWA | `@ducanh2912/next-pwa` is a dependency; `next.config.mjs` does not wrap it yet — PWA may be inactive until configured |

## Local development

- **Port:** `7180` (`npm run dev`, `npm run start`).
- **Env:** Copy `.env.example` → `.env.local`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Repository layout (high signal)

- `src/app/` — App Router routes.
  - `(auth)/login` — Magic-link style auth (see README).
  - `auth/callback/route.ts` — Exchanges OAuth/code for session; redirects to `next` or `/dashboard`.
  - `(dashboard)/` — Authenticated shell; nested `dashboard/*` feature pages.
  - `onboarding/` — Multi-screen onboarding; real UI lives in `layout.tsx` + `screens/`; `page.tsx` is intentionally empty.
- `src/components/` — UI primitives (`components/ui/`), feature components, providers.
- `src/lib/` — Supabase clients (`supabase/client.ts`, `supabase/server.ts`), query modules under `supabase/queries/`, `activity-log.ts`, onboarding context.
- `src/middleware.ts` — Supabase session on edge; protects `/dashboard`; redirects logged-in users away from `/login`.
- `supabase/migrations/` — Apply **in order**: `001_initial_schema.sql`, `002_wedding_collaboration.sql`, `003_profiles.sql`.

## Auth and navigation flow

1. `/` (root `page.tsx`) — Client-side: no session → `/login`; session → `/dashboard`.
2. Middleware enforces dashboard vs login redirects for matching paths.
3. After email magic link / OAuth, `/auth/callback` establishes the session and redirects.

## Onboarding

- State: `OnboardingProvider` in `src/lib/contexts/onboarding-context.tsx` (screens 1–10, goals, pain points, demo budget, etc.).
- **Completion flag:** `localStorage` key `onboarding_completed` (`"true"`). Set by `completeOnboarding()` and `skipOnboarding()`.
- Dashboard layout (`src/app/(dashboard)/layout.tsx`) checks this on mount; if missing, redirects to `/onboarding`.
- Onboarding is **client-only gating**; it is not stored in Supabase by default.

## Wedding collaboration (Supabase)

- **Tables:** `weddings`, `wedding_members`, `activity_log`; domain tables gain `wedding_id` (see `002_wedding_collaboration.sql`).
- **RLS:** `is_wedding_member()`; policies allow members to read shared wedding-scoped data; inserts/updates still tied to `auth.uid()` patterns defined in migrations.
- **App:** `WeddingProvider` (`src/components/providers/wedding-provider.tsx`) calls RPCs **`get_or_create_wedding`** and **`get_wedding_members`**. Feature queries should respect `wedding_id` where the schema expects it.

## Providers (root)

`layout.tsx` wraps the tree with: `QueryProvider` → toast → `UserProvider`. Dashboard adds `WeddingProvider` around main content.

## Storage (profile photos)

- Preferred bucket: **`profile-photos`** (public). `UserProvider.uploadPhoto` falls back to **`avatars`** if the primary bucket is missing.
- URLs are stored on the user as `user_metadata.avatar_url`.

## Conventions for changes

- Match existing patterns: client Supabase in components/providers; server client in routes/middleware where already used.
- Prefer extending `src/lib/supabase/queries/*` for data access rather than ad-hoc queries scattered in UI.
- UI copy and `lang="ms"` assume Malay-first UX; keep tone consistent with existing screens.

## Scripts

```bash
npm run dev    # port 7180
npm run build
npm run start  # port 7180
npm run lint
```
