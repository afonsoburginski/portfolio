-- Auto-derived request status from request_stages (Postgres port of the SQLite
-- triggers, final logic from the old 0011 migration).
--
-- A request transitions only when there is a real signal of work/payment:
--   - all non-extra stages have work_status='done'            -> 'delivered'
--   - any stage is 'paid' OR work_status != 'not_started'     -> 'in_progress'
--   - otherwise keep the current status (usually 'quoted')
-- Terminal/user-driven states ('cancelled','rejected','approved') are never touched.

CREATE OR REPLACE FUNCTION request_derive_status() RETURNS trigger AS $$
DECLARE
  rid text := COALESCE(NEW.request_id, OLD.request_id);
BEGIN
  UPDATE requests
  SET status = CASE
    WHEN status IN ('cancelled', 'rejected', 'approved') THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = rid AND is_extra = false) = 0 THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = rid AND is_extra = false AND work_status != 'done') = 0 THEN 'delivered'
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = rid AND (status = 'paid' OR work_status != 'not_started')) > 0 THEN 'in_progress'
    ELSE status
  END,
  updated_at = to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  WHERE id = rid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS request_stages_derive_status_ai ON request_stages;--> statement-breakpoint
DROP TRIGGER IF EXISTS request_stages_derive_status_au ON request_stages;--> statement-breakpoint
DROP TRIGGER IF EXISTS request_stages_derive_status_ad ON request_stages;--> statement-breakpoint
CREATE TRIGGER request_stages_derive_status_ai
AFTER INSERT ON request_stages
FOR EACH ROW EXECUTE FUNCTION request_derive_status();--> statement-breakpoint
CREATE TRIGGER request_stages_derive_status_au
AFTER UPDATE ON request_stages
FOR EACH ROW EXECUTE FUNCTION request_derive_status();--> statement-breakpoint
CREATE TRIGGER request_stages_derive_status_ad
AFTER DELETE ON request_stages
FOR EACH ROW EXECUTE FUNCTION request_derive_status();
