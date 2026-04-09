-- ============================================================
-- JomKahwin! — Migration 003: User Profiles
-- ============================================================
-- Run MANUALLY in Supabase SQL Editor.
-- Do NOT run via CLI unless you have verified all dependencies.
-- ============================================================


-- ============================================================
-- 1. profiles table
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  birth_date  DATE,
  gender      TEXT        CHECK (gender IN ('lelaki', 'perempuan')),
  wedding_date DATE,
  bio         TEXT,
  avatar_url  TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. auto-update updated_at on every row change
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 3. auto-create profile row when a new auth user signs up
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop first so this migration is safe to re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 4. RLS policies
-- ============================================================

-- SELECT: own row, OR caller shares a wedding with the profile owner
CREATE POLICY "profiles: select own or wedding partner"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM wedding_members wm_caller
      JOIN wedding_members wm_owner
        ON wm_caller.wedding_id = wm_owner.wedding_id
      WHERE wm_caller.user_id = auth.uid()
        AND wm_owner.user_id  = profiles.id
    )
  );

-- INSERT: only the user themselves can create their own profile row
CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: only the user themselves can edit their own profile
CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING      (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No DELETE policy — profile rows are intentionally permanent
-- (they cascade-delete automatically when the auth.users row is removed)


-- ============================================================
-- 5. One-time backfill for pre-existing auth users
-- ============================================================

INSERT INTO profiles (id, full_name)
SELECT
  id,
  raw_user_meta_data->>'full_name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
