-- Invoicing schema: invoices, payments, invoice_config, receivables_summary
--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'partially_paid', 'paid', 'voided');
--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bank', 'online', 'cheque');
--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('recorded', 'voided');
--> statement-breakpoint
CREATE TYPE "public"."credit_note_status" AS ENUM('draft', 'issued', 'voided');
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"date" date NOT NULL,
	"due_date" date NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"customer_gstin" text,
	"customer_address" text,
	"customer_state" text,
	"status" "invoice_status" NOT NULL DEFAULT 'draft',
	"subtotal" numeric(18, 2) NOT NULL,
	"cgst_total" numeric(18, 2) NOT NULL,
	"sgst_total" numeric(18, 2) NOT NULL,
	"igst_total" numeric(18, 2) NOT NULL,
	"discount_total" numeric(18, 2) NOT NULL,
	"grand_total" numeric(18, 2) NOT NULL,
	"currency" text NOT NULL DEFAULT 'INR',
	"notes" text,
	"terms" text,
	"fiscal_year" text NOT NULL,
	"created_by" uuid NOT NULL,
	"sent_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"pdf_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subtotal_non_negative" CHECK (subtotal >= 0),
	CONSTRAINT "grand_total_non_negative" CHECK (grand_total >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_tenant_id_invoice_number_unique" ON "invoices"("tenant_id", "invoice_number");
--> statement-breakpoint
CREATE INDEX "invoices_tenant_id_status_idx" ON "invoices"("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX "invoices_tenant_id_customer_name_idx" ON "invoices"("tenant_id", "customer_name");
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");
--> statement-breakpoint
CREATE TABLE "invoice_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(18, 2) NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"gst_rate" numeric(5, 2) NOT NULL,
	"cgst_amount" numeric(18, 2) NOT NULL,
	"sgst_amount" numeric(18, 2) NOT NULL,
	"igst_amount" numeric(18, 2) NOT NULL,
	"discount_percent" numeric(5, 2) NOT NULL DEFAULT 0,
	"discount_amount" numeric(18, 2) NOT NULL DEFAULT 0,
	CONSTRAINT "quantity_non_negative" CHECK (quantity >= 0),
	CONSTRAINT "unit_price_non_negative" CHECK (unit_price >= 0),
	CONSTRAINT "gst_rate_non_negative" CHECK (gst_rate >= 0)
);
--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id");
--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id");
--> statement-breakpoint
CREATE TABLE "credit_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"date" date NOT NULL,
	"due_date" date,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"customer_gstin" text,
	"customer_address" text,
	"customer_state" text,
	"status" "credit_note_status" NOT NULL DEFAULT 'draft',
	"subtotal" numeric(18, 2) NOT NULL,
	"cgst_total" numeric(18, 2) NOT NULL,
	"sgst_total" numeric(18, 2) NOT NULL,
	"igst_total" numeric(18, 2) NOT NULL,
	"discount_total" numeric(18, 2) NOT NULL,
	"grand_total" numeric(18, 2) NOT NULL,
	"currency" text NOT NULL DEFAULT 'INR',
	"notes" text,
	"terms" text,
	"fiscal_year" text NOT NULL,
	"created_by" uuid NOT NULL,
	"original_invoice_id" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "credit_notes_tenant_id_invoice_number_unique" ON "credit_notes"("tenant_id", "invoice_number");
--> statement-breakpoint
CREATE INDEX "credit_notes_tenant_id_customer_name_idx" ON "credit_notes"("tenant_id", "customer_name");
--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");
--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_original_invoice_id_fkey" FOREIGN KEY ("original_invoice_id") REFERENCES "invoices"("id");
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payment_number" text NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"reference_number" text,
	"customer_name" text NOT NULL,
	"notes" text,
	"status" "payment_status" NOT NULL DEFAULT 'recorded',
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "payments_tenant_id_payment_number_unique" ON "payments"("tenant_id", "payment_number");
--> statement-breakpoint
CREATE INDEX "payments_tenant_id_customer_name_idx" ON "payments"("tenant_id", "customer_name");
--> statement-breakpoint
CREATE INDEX "payments_tenant_id_date_idx" ON "payments"("tenant_id", "date");
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");
--> statement-breakpoint
CREATE TABLE "payment_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"allocated_amount" numeric(18, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "payment_allocations_payment_id_invoice_id_unique" ON "payment_allocations"("payment_id", "invoice_id");
--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id");
--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id");
--> statement-breakpoint
CREATE TABLE "invoice_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"prefix" text NOT NULL DEFAULT 'INV',
	"next_number" bigint NOT NULL DEFAULT 1,
	"logo_url" text,
	"company_name" text,
	"company_address" text,
	"company_gstin" text,
	"payment_terms" text,
	"bank_details" jsonb,
	"notes" text,
	"terms" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_config_tenant_id_unique" ON "invoice_config"("tenant_id");
--> statement-breakpoint
CREATE TABLE "receivables_summary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_name" text NOT NULL,
	"customer_gstin" text,
	"total_outstanding" numeric(18, 2) NOT NULL,
	"current_0_30" numeric(18, 2) NOT NULL,
	"aging_31_60" numeric(18, 2) NOT NULL,
	"aging_61_90" numeric(18, 2) NOT NULL,
	"aging_90_plus" numeric(18, 2) NOT NULL,
	"last_payment_date" date,
	"last_payment_amount" numeric(18, 2)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "receivables_summary_tenant_id_customer_name_unique" ON "receivables_summary"("tenant_id", "customer_name");
