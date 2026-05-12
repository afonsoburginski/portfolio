-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-derived request status from request_stages
-- A request becomes 'delivered' only when ALL non-extra stages have
-- work_status='done'. Until then, any presence of stages keeps it 'in_progress'.
-- 'cancelled' and 'rejected' are terminal user-driven states and never touched.
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS request_stages_derive_status_ai;
DROP TRIGGER IF EXISTS request_stages_derive_status_au;
DROP TRIGGER IF EXISTS request_stages_derive_status_ad;

CREATE TRIGGER request_stages_derive_status_ai
AFTER INSERT ON request_stages
FOR EACH ROW
BEGIN
  UPDATE requests
  SET status = CASE
    WHEN status IN ('cancelled', 'rejected') THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND is_extra = 0) = 0 THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND is_extra = 0 AND work_status != 'done') = 0 THEN 'delivered'
    ELSE 'in_progress'
  END,
  updated_at = datetime('now')
  WHERE id = NEW.request_id;
END;

CREATE TRIGGER request_stages_derive_status_au
AFTER UPDATE ON request_stages
FOR EACH ROW
BEGIN
  UPDATE requests
  SET status = CASE
    WHEN status IN ('cancelled', 'rejected') THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND is_extra = 0) = 0 THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = NEW.request_id AND is_extra = 0 AND work_status != 'done') = 0 THEN 'delivered'
    ELSE 'in_progress'
  END,
  updated_at = datetime('now')
  WHERE id = NEW.request_id;
END;

CREATE TRIGGER request_stages_derive_status_ad
AFTER DELETE ON request_stages
FOR EACH ROW
BEGIN
  UPDATE requests
  SET status = CASE
    WHEN status IN ('cancelled', 'rejected') THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = OLD.request_id AND is_extra = 0) = 0 THEN status
    WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = OLD.request_id AND is_extra = 0 AND work_status != 'done') = 0 THEN 'delivered'
    ELSE 'in_progress'
  END,
  updated_at = datetime('now')
  WHERE id = OLD.request_id;
END;

-- Backfill existing requests that already have stages
UPDATE requests
SET status = CASE
  WHEN status IN ('cancelled', 'rejected') THEN status
  WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = requests.id AND is_extra = 0) = 0 THEN status
  WHEN (SELECT COUNT(*) FROM request_stages WHERE request_id = requests.id AND is_extra = 0 AND work_status != 'done') = 0 THEN 'delivered'
  ELSE 'in_progress'
END,
updated_at = datetime('now')
WHERE id IN (SELECT DISTINCT request_id FROM request_stages);

-- ─────────────────────────────────────────────────────────────────────────────
-- User preferences (per-user key/value store; used by admin dashboard toggles)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE `user_preferences` (
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY (`user_id`, `key`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
