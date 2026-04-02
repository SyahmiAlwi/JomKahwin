# JomKahwin!

Aplikasi perancang perkahwinan yang minimalis, teratur, dan memudahkan — dibina khas untuk pasangan Malaysia.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| Styling | Tailwind CSS v3 |
| UI Components | Radix UI primitives |
| Data Fetching | TanStack React Query v5 |
| Animations | Framer Motion |
| Icons | Lucide React |
| PWA | @ducanh2912/next-pwa |

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd JomKahwin!

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local:
#   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# 4. Start development server (runs on port 7180)
npm run dev
```

Open [http://localhost:7180](http://localhost:7180) in your browser.

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Run the migration file in the Supabase SQL editor:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. In **Storage**, create a public bucket named `profile-photos` for user profile pictures.
4. Copy your project URL and anon key into `.env.local`.

## Available Routes

| Route | Description |
|---|---|
| `/login` | Magic-link authentication |
| `/dashboard` | Home — majlis countdown & stats overview |
| `/dashboard/guests` | Guest list — groups, pax counts, RSVP tracking |
| `/dashboard/budget` | Budget tracker — income funds & expense categories |
| `/dashboard/checklist` | Wedding to-do checklist |
| `/dashboard/timetable` | Event timetable / rundown |
| `/dashboard/suppliers` | Vendor / supplier directory |
| `/dashboard/settings` | Profile & account settings |

## Scripts

```bash
npm run dev      # Development server (port 7180)
npm run build    # Production build
npm run start    # Production server (port 7180)
npm run lint     # ESLint
```
