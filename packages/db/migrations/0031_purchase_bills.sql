-- Migration 0031: purchase bills (payables)
-- New module: vendor bills with due dates, aging, and payment allocation.
-- Also extends reference_type with 'purchase_bill' for the JE link.

ALTER TYPE "reference_type" ADD VALUE IF NOT EXISTS 'purchase_bill';--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "purchase_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bill_number" text NOT NULL,
	"vendor_account_id" uuid NOT NULL,
	"vendor_name" text NOT NULL,
	"vendor_gstin" text,
	"vendor_state" text,
	"bill_date" date NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric(18,2) NOT NULL,
	"cgst_total" numeric(18,2) DEFAULT '0' NOT NULL,
	"sgst_total" numeric(18,2) DEFAULT '0' NOT NULL,
	"igst_total" numeric(18,2) DEFAULT '0' NOT NULL,
	"grand_total" numeric(18,2) NOT NULL,
	"paid_amount" numeric(18,2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"fiscal_year" text NOT NULL,
	"narration" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "purchase_bill_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bill_id" uuid NOT NULL REFERENCES "purchase_bills"("id") ON DELETE CASCADE,
	"account_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(18,2) NOT NULL,
	"unit_price" numeric(18,2) NOT NULL,
	"amount" numeric(18,2) NOT NULL,
	"gst_rate" numeric(5,2) NOT NULL,
	"cgst_amount" numeric(18,2) DEFAULT '0' NOT NULL,
	"sgst_amount" numeric(18,2) DEFAULT '0' NOT NULL,
	"igst_amount" numeric(18,2) DEFAULT '0' NOT NULL
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "purchase_bills_tenant_status_idx" ON "purchase_bills" ("tenant_id", "status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_bills_tenant_due_date_idx" ON "purchase_bills" ("tenant_id", "due_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "purchase_bills_tenant_vendor_number_unique" ON "purchase_bills" ("tenant_id", "vendor_account_id", "bill_number");--> statement-breakpoint
