-- ============================================================
-- JomKahwin! — Initial Schema
-- ============================================================

-- Events
CREATE TABLE IF NOT EXISTS events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  date       DATE,
  type       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guests
CREATE TABLE IF NOT EXISTS guests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  relation    TEXT,
  phone       TEXT,
  group_name  TEXT,
  group_color TEXT,
  pax         INTEGER NOT NULL DEFAULT 1,
  rsvp_status TEXT NOT NULL DEFAULT 'pending'
                   CHECK (rsvp_status IN ('hadir', 'tidak', 'pending')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklist tasks
CREATE TABLE IF NOT EXISTS checklist_tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id   UUID REFERENCES events(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  phase      TEXT NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budget categories (one row = one spending category with a total allocation)
CREATE TABLE IF NOT EXISTS budget_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id   UUID REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT 'text-blue-500 bg-blue-100',
  allocated  NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budget expenses (individual line-items per category)
CREATE TABLE IF NOT EXISTS budget_expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  description TEXT,
  amount      NUMERIC NOT NULL DEFAULT 0,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budget funds (savings / income contributions)
CREATE TABLE IF NOT EXISTS budget_funds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount      NUMERIC NOT NULL DEFAULT 0,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Row Level Security — users can only touch their own rows
-- ============================================================

ALTER TABLE events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_tasks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_expenses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_funds      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events: own rows"
  ON events FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guests: own rows"
  ON guests FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checklist_tasks: own rows"
  ON checklist_tasks FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_categories: own rows"
  ON budget_categories FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_expenses: own rows"
  ON budget_expenses FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_funds: own rows"
  ON budget_funds FOR ALL
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
