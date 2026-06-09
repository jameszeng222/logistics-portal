CREATE TABLE `air_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer,
	`origin_country` text NOT NULL,
	`origin_airport` text NOT NULL,
	`dest_country` text NOT NULL,
	`dest_airport` text NOT NULL,
	`unit_price` real NOT NULL,
	`dim_divisor` integer DEFAULT 6000,
	`min_charge` real DEFAULT 0,
	`effective_date` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `box_specs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text NOT NULL,
	`length_cm` real NOT NULL,
	`width_cm` real NOT NULL,
	`height_cm` real NOT NULL,
	`gross_weight_kg` real NOT NULL,
	`qty_per_box` integer DEFAULT 1,
	`notes` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_unique` ON `brands` (`name`);--> statement-breakpoint
CREATE TABLE `channels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`dim_divisor` integer DEFAULT 6000 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `channels_name_unique` ON `channels` (`name`);--> statement-breakpoint
CREATE TABLE `delivery_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brand_id` integer,
	`channel_id` integer,
	`provider_id` integer,
	`shipment_date` text NOT NULL,
	`delivery_date` text,
	`promised_days` integer,
	`actual_days` integer,
	`on_time` integer DEFAULT 0,
	`inspected` integer DEFAULT 0,
	`qty` integer DEFAULT 0,
	`weight_kg` real DEFAULT 0,
	`logistics_cost` real DEFAULT 0,
	`sales_amount` real DEFAULT 0,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_delivery_brand` ON `delivery_records` (`brand_id`);--> statement-breakpoint
CREATE INDEX `idx_delivery_channel` ON `delivery_records` (`channel_id`);--> statement-breakpoint
CREATE INDEX `idx_delivery_provider` ON `delivery_records` (`provider_id`);--> statement-breakpoint
CREATE INDEX `idx_delivery_date` ON `delivery_records` (`shipment_date`);--> statement-breakpoint
CREATE TABLE `dim_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel_name` text NOT NULL,
	`dim_divisor` integer NOT NULL,
	`is_default` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dim_rules_channel_name_unique` ON `dim_rules` (`channel_name`);--> statement-breakpoint
CREATE TABLE `member_report_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_name` text NOT NULL,
	`template` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_report_templates_member_name_unique` ON `member_report_templates` (`member_name`);--> statement-breakpoint
CREATE TABLE `member_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer,
	`member_name` text NOT NULL,
	`color` text,
	`content_blocks` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`report_id`) REFERENCES `weekly_reports`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `provider_status_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer,
	`old_status` text,
	`new_status` text,
	`reason` text,
	`changed_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`channel_id` integer,
	`contact_person` text,
	`contact_phone` text,
	`email` text,
	`address` text,
	`status` text DEFAULT 'active' NOT NULL,
	`cooperation_start_date` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sea_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer,
	`origin_port` text NOT NULL,
	`dest_port` text NOT NULL,
	`unit_price` real NOT NULL,
	`min_charge` real DEFAULT 0,
	`effective_date` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ups_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`price_type` text NOT NULL,
	`agent_name` text,
	`destination_region` text NOT NULL,
	`zone` integer,
	`unit_price` real NOT NULL,
	`peak_surcharge` real DEFAULT 0,
	`fuel_surcharge` real DEFAULT 0,
	`effective_date` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `weekly_issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer,
	`description` text NOT NULL,
	`assignee` text,
	`solution` text,
	`difficulty` text,
	`progress` text,
	`status` text DEFAULT 'open' NOT NULL,
	`carry_over` integer DEFAULT 0,
	`source_issue_id` integer,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`report_id`) REFERENCES `weekly_reports`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `weekly_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week_number` integer NOT NULL,
	`year` integer NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`this_week_notes` text,
	`next_week_plan` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `weekly_timeliness` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer,
	`channel_id` integer,
	`promised_time` text,
	`actual_time` text,
	`achievement_rate` real,
	`reason` text,
	FOREIGN KEY (`report_id`) REFERENCES `weekly_reports`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE no action
);
