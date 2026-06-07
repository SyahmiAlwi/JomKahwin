-- ── 007 Notes ────────────────────────────────────────────────────────────────
-- Shared wedding notepad: text + image attachments, visible to all wedding members.

CREATE TABLE IF NOT EXISTS notes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id   UUID        REFERENCES weddings(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT,
  body         TEXT,
  images       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-bump updated_at on every write
CREATE OR REPLACE FUNCTION notes_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER notes_updated_at_trigger
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION notes_set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS notes_wedding_id_idx ON notes(wedding_id);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx  ON notes(updated_at DESC);

-- RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON notes FOR SELECT
  USING (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)));

CREATE POLICY "notes_insert" ON notes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (wedding_id IS NULL OR is_wedding_member(wedding_id))
  );

CREATE POLICY "notes_update" ON notes FOR UPDATE
  USING  (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)))
  WITH CHECK (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)));

CREATE POLICY "notes_delete" ON notes FOR DELETE
  USING (user_id = auth.uid() OR (wedding_id IS NOT NULL AND is_wedding_member(wedding_id)));

-- Storage bucket (run in Supabase dashboard or via CLI):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('note-images', 'note-images', true)
-- ON CONFLICT DO NOTHING;
