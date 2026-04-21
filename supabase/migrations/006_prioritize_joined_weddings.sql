-- ============================================================
-- Migration 006: Prioritize recently joined wedding
-- Run this in Supabase SQL Editor
-- ============================================================

-- Update the get_or_create_wedding function to ORDER BY joined_at DESC
-- This ensures that if a user belongs to multiple weddings (e.g., their own + a joined one),
-- the system will prioritize the most recently joined one.

CREATE OR REPLACE FUNCTION get_or_create_wedding()
RETURNS TABLE(id UUID, invite_code TEXT, owner_id UUID)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wedding_id  UUID;
  v_invite_code TEXT;
  v_owner_id    UUID;
BEGIN
  -- Check if user is already a member of any wedding
  -- ADDED: ORDER BY joined_at DESC so the most recent joined wedding is loaded
  SELECT wm.wedding_id INTO v_wedding_id
  FROM wedding_members wm
  WHERE wm.user_id = auth.uid()
  ORDER BY wm.joined_at DESC
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
