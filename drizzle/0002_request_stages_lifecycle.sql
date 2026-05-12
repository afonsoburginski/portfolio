ALTER TABLE `request_stages` ADD COLUMN `work_status` text DEFAULT 'not_started' NOT NULL;
ALTER TABLE `request_stages` ADD COLUMN `started_at` text;
ALTER TABLE `request_stages` ADD COLUMN `due_date` text;
ALTER TABLE `request_stages` ADD COLUMN `finished_at` text;
