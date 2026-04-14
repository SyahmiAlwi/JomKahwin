-- ============================================================
-- JomKahwin! — Migration 004: Checklist Enhancements
-- ============================================================
-- Run MANUALLY in Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS / DO NOTHING patterns).
-- ============================================================

-- 1. Add new columns to checklist_tasks
ALTER TABLE checklist_tasks
  ADD COLUMN IF NOT EXISTS status       TEXT    NOT NULL DEFAULT 'not_yet'
    CHECK (status IN ('not_yet', 'in_progress', 'settle', 'kiv')),
  ADD COLUMN IF NOT EXISTS assigned_to  UUID[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes        TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_important BOOLEAN NOT NULL DEFAULT false;

-- 2. Backfill status from existing `completed` boolean
UPDATE checklist_tasks
SET status = CASE WHEN completed THEN 'settle' ELSE 'not_yet' END
WHERE TRUE;

-- Done.
-- After running this migration, the old `completed` column is still present
-- but will no longer be the source of truth — `status` takes over.
