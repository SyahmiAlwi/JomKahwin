-- ============================================================
-- Migration: wedding_vendors (fresh / reset)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop policies first, then table (safe — no real data yet)
DROP POLICY IF EXISTS "wedding members can manage vendors"      ON wedding_vendors;
DROP POLICY IF EXISTS "wedding_vendors: wedding member access"  ON wedding_vendors;
DROP TABLE IF EXISTS wedding_vendors;

-- Recreate with correct schema
CREATE TABLE wedding_vendors (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id         UUID        REFERENCES weddings(id) ON DELETE CASCADE,
  user_id            UUID        NOT NULL REFERENCES auth.users(id),
  name               TEXT        NOT NULL,
  category           TEXT        NOT NULL DEFAULT 'Lain-lain',
  phone              TEXT        NOT NULL DEFAULT '',
  estimated_price    NUMERIC     NOT NULL DEFAULT 0,
  amount_paid        NUMERIC     NOT NULL DEFAULT 0,
  status             TEXT        NOT NULL DEFAULT 'Shortlisted',
  notes              TEXT        NOT NULL DEFAULT '',
  budget_category_id UUID        REFERENCES budget_categories(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE wedding_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wedding_vendors: wedding member access"
  ON wedding_vendors FOR ALL
  USING (
    user_id = auth.uid()
    OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id))
  )
  WITH CHECK (user_id = auth.uid());
