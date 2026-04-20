ALTER TABLE "tenants" ADD COLUMN "onboarding_status" text DEFAULT 'in_progress' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "date_of_incorporation" date;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "onboarding_data" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "gst_config" jsonb DEFAULT '{}' NOT NULL;