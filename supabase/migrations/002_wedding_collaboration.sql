-- ============================================================
-- JomKahwin! — Wedding Collaboration Schema
-- ============================================================

-- Weddings table — one wedding per couple
CREATE TABLE IF NOT EXISTS weddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 6),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wedding members — users who have joined a wedding (owner + partner)
CREATE TABLE IF NOT EXISTS wedding_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wedding_id, user_id)
);

-- Activity log — audit trail for all mutations
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_name TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add wedding_id to existing tables
ALTER TABLE events            ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;
ALTER TABLE guests            ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;
ALTER TABLE checklist_tasks   ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;
ALTER TABLE budget_categories ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;
ALTER TABLE budget_expenses   ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;
ALTER TABLE budget_funds      ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE weddings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log    ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is a member of a given wedding
CREATE OR REPLACE FUNCTION is_wedding_member(p_wedding_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM wedding_members
    WHERE wedding_id = p_wedding_id AND user_id = auth.uid()
  );
END;
$$;

-- Weddings — visible to all members of that wedding
CREATE POLICY "weddings: member access"
  ON weddings FOR ALL
  USING      (is_wedding_member(id) OR owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Wedding members — visible/insertable to members of same wedding
CREATE POLICY "wedding_members: member read"
  ON wedding_members FOR SELECT
  USING (is_wedding_member(wedding_id));

CREATE POLICY "wedding_members: self insert"
  ON wedding_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Activity log — members can read + insert for their wedding
CREATE POLICY "activity_log: member access"
  ON activity_log FOR ALL
  USING      (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id) AND user_id = auth.uid());

-- Update RLS on existing tables to include wedding member access
-- Events
DROP POLICY IF EXISTS "events: own rows" ON events;
CREATE POLICY "events: wedding member access"
  ON events FOR ALL
  USING      (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)))
  WITH CHECK (user_id = auth.uid());

-- Guests
DROP POLICY IF EXISTS "guests: own rows" ON guests;
CREATE POLICY "guests: wedding member access"
  ON guests FOR ALL
  USING      (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)))
  WITH CHECK (user_id = auth.uid());

-- Checklist tasks
DROP POLICY IF EXISTS "checklist_tasks: own rows" ON checklist_tasks;
CREATE POLICY "checklist_tasks: wedding member access"
  ON checklist_tasks FOR ALL
  USING      (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)))
  WITH CHECK (user_id = auth.uid());

-- Budget categories
DROP POLICY IF EXISTS "budget_categories: own rows" ON budget_categories;
CREATE POLICY "budget_categories: wedding member access"
  ON budget_categories FOR ALL
  USING      (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)))
  WITH CHECK (user_id = auth.uid());

-- Budget expenses
DROP POLICY IF EXISTS "budget_expenses: own rows" ON budget_expenses;
CREATE POLICY "budget_expenses: wedding member access"
  ON budget_expenses FOR ALL
  USING      (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)))
  WITH CHECK (user_id = auth.uid());

-- Budget funds
DROP POLICY IF EXISTS "budget_funds: own rows" ON budget_funds;
CREATE POLICY "budget_funds: wedding member access"
  ON budget_funds FOR ALL
  USING      (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)))
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Functions
-- ============================================================

-- Get or create the current user's wedding
CREATE OR REPLACE FUNCTION get_or_create_wedding()
RETURNS TABLE(id UUID, invite_code TEXT, owner_id UUID)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wedding_id  UUID;
  v_invite_code TEXT;
  v_owner_id    UUID;
BEGIN
  -- Check if user is already a member of any wedding
  SELECT wm.wedding_id INTO v_wedding_id
  FROM wedding_members wm
  WHERE wm.user_id = auth.uid()
  LIMIT 1;

  IF v_wedding_id IS NULL THEN
    -- Create a new wedding and add owner as member
    INSERT INTO weddings (owner_id)
    VALUES (auth.uid())
    RETURNING weddings.id, weddings.invite_code, weddings.owner_id
    INTO v_wedding_id, v_invite_code, v_owner_id;

    INSERT INTO wedding_members (wedding_id, user_id)
    VALUES (v_wedding_id, auth.uid());
  ELSE
    SELECT w.invite_code, w.owner_id
    INTO v_invite_code, v_owner_id
    FROM weddings w
    WHERE w.id = v_wedding_id;
  END IF;

  RETURN QUERY SELECT v_wedding_id, v_invite_code, v_owner_id;
END;
$$;

-- Join a wedding using its invite code
CREATE OR REPLACE FUNCTION join_wedding_by_code(code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wedding_id UUID;
BEGIN
  SELECT id INTO v_wedding_id FROM weddings WHERE invite_code = code;

  IF v_wedding_id IS NULL THEN
    RAISE EXCEPTION 'Kod jemputan tidak sah.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM wedding_members
    WHERE wedding_id = v_wedding_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Anda sudah menjadi ahli perkahwinan ini.';
  END IF;

  INSERT INTO wedding_members (wedding_id, user_id)
  VALUES (v_wedding_id, auth.uid());

  RETURN TRUE;
END;
$$;

-- Get all members of a wedding with their user metadata
CREATE OR REPLACE FUNCTION get_wedding_members(p_wedding_id UUID)
RETURNS TABLE(
  user_id    UUID,
  joined_at  TIMESTAMPTZ,
  full_name  TEXT,
  avatar_url TEXT
) LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  IF NOT is_wedding_member(p_wedding_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    wm.user_id,
    wm.joined_at,
    COALESCE((u.raw_user_meta_data->>'full_name')::TEXT, split_part(u.email, '@', 1)) AS full_name,
    (u.raw_user_meta_data->>'avatar_url')::TEXT AS avatar_url
  FROM wedding_members wm
  JOIN auth.users u ON u.id = wm.user_id
  WHERE wm.wedding_id = p_wedding_id
  ORDER BY wm.joined_at ASC;
END;
$$;

-- Regenerate invite code for the wedding owner
CREATE OR REPLACE FUNCTION regenerate_invite_code()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_code TEXT;
BEGIN
  UPDATE weddings
  SET invite_code = substring(gen_random_uuid()::text, 1, 6)
  WHERE owner_id = auth.uid()
  RETURNING invite_code INTO new_code;

  IF new_code IS NULL THEN
    RAISE EXCEPTION 'Anda bukan pemilik perkahwinan ini.';
  END IF;

  RETURN new_code;
END;
$$;
