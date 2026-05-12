CREATE TABLE `request_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`title` text NOT NULL,
	`amount` real NOT NULL,
	`position` real DEFAULT 0 NOT NULL,
	`is_extra` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`paid_at` text,
	`paid_method` text,
	`mp_payment_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `request_stages_request_id_idx` ON `request_stages` (`request_id`);
