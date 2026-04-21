-- ============================================================
-- Migration 005: Join Request Approval Flow
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Join requests table
CREATE TABLE IF NOT EXISTS wedding_join_requests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id     UUID        NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  requester_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT,
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, requester_id)
);

ALTER TABLE wedding_join_requests ENABLE ROW LEVEL SECURITY;

-- Requester can see their own requests; wedding members can see requests for their wedding
CREATE POLICY "join_requests: access"
  ON wedding_join_requests FOR ALL
  USING (
    requester_id = auth.uid()
    OR is_wedding_member(wedding_id)
  )
  WITH CHECK (requester_id = auth.uid());

-- ============================================================
-- 2. Replace join_wedding_by_code — now creates a request
--    instead of directly adding to wedding_members
-- ============================================================

-- Must drop first: return type changed from BOOLEAN → TEXT
DROP FUNCTION IF EXISTS join_wedding_by_code(text);

CREATE OR REPLACE FUNCTION join_wedding_by_code(code TEXT)
RETURNS TEXT   -- returns 'requested' | error
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wedding_id     UUID;
  v_requester_name TEXT;
BEGIN
  -- Find the wedding
  SELECT id INTO v_wedding_id FROM weddings WHERE invite_code = code;

  IF v_wedding_id IS NULL THEN
    RAISE EXCEPTION 'Kod jemputan tidak sah.';
  END IF;

  -- Check already a member
  IF EXISTS (
    SELECT 1 FROM wedding_members
    WHERE wedding_id = v_wedding_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Anda sudah menjadi ahli perkahwinan ini.';
  END IF;

  -- Check already has a pending request
  IF EXISTS (
    SELECT 1 FROM wedding_join_requests
    WHERE wedding_id = v_wedding_id
      AND requester_id = auth.uid()
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Anda sudah menghantar permintaan. Sila tunggu kelulusan.';
  END IF;

  -- Get requester display name
  SELECT COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
  INTO   v_requester_name
  FROM   auth.users
  WHERE  id = auth.uid();

  -- Insert join request
  INSERT INTO wedding_join_requests (wedding_id, requester_id, requester_name)
  VALUES (v_wedding_id, auth.uid(), v_requester_name)
  ON CONFLICT (wedding_id, requester_id)
    DO UPDATE SET status = 'pending', created_at = now();

  RETURN 'requested';
END;
$$;

-- ============================================================
-- 3. New function: owner accepts or rejects a request
-- ============================================================

CREATE OR REPLACE FUNCTION respond_to_join_request(
  p_request_id UUID,
  p_action     TEXT   -- 'accept' | 'reject'
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wedding_id   UUID;
  v_requester_id UUID;
BEGIN
  -- Fetch request info
  SELECT wedding_id, requester_id
  INTO   v_wedding_id, v_requester_id
  FROM   wedding_join_requests
  WHERE  id = p_request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Permintaan tidak dijumpai atau sudah diproses.';
  END IF;

  -- Caller must be a member of that wedding
  IF NOT is_wedding_member(v_wedding_id) THEN
    RAISE EXCEPTION 'Akses ditolak.';
  END IF;

  IF p_action = 'accept' THEN
    -- Add requester to wedding members
    INSERT INTO wedding_members (wedding_id, user_id)
    VALUES (v_wedding_id, v_requester_id)
    ON CONFLICT DO NOTHING;

    -- Mark request accepted
    UPDATE wedding_join_requests
    SET status = 'accepted'
    WHERE id = p_request_id;

  ELSIF p_action = 'reject' THEN
    UPDATE wedding_join_requests
    SET status = 'rejected'
    WHERE id = p_request_id;

  ELSE
    RAISE EXCEPTION 'Tindakan tidak sah. Guna ''accept'' atau ''reject''.';
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================
-- 4. Function: get pending requests for current user's wedding
-- ============================================================

CREATE OR REPLACE FUNCTION get_join_requests()
RETURNS TABLE (
  id             UUID,
  requester_id   UUID,
  requester_name TEXT,
  status         TEXT,
  created_at     TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_wedding_id UUID;
BEGIN
  SELECT wm.wedding_id INTO v_wedding_id
  FROM   wedding_members wm
  WHERE  wm.user_id = auth.uid()
  LIMIT  1;

  IF v_wedding_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT r.id, r.requester_id, r.requester_name, r.status, r.created_at
  FROM   wedding_join_requests r
  WHERE  r.wedding_id = v_wedding_id
  ORDER  BY r.created_at DESC;
END;
$$;

-- ============================================================
-- 5. Function: check current user's own pending request status
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_join_request(p_invite_code TEXT)
RETURNS TABLE (
  id         UUID,
  status     TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_wedding_id UUID;
BEGIN
  SELECT id INTO v_wedding_id FROM weddings WHERE invite_code = p_invite_code;

  IF v_wedding_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT r.id, r.status, r.created_at
  FROM   wedding_join_requests r
  WHERE  r.wedding_id    = v_wedding_id
    AND  r.requester_id  = auth.uid()
  LIMIT 1;
END;
$$;
