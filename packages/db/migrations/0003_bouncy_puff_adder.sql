CREATE TYPE "public"."credit_note_status" AS ENUM('draft', 'issued', 'voided');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'partially_paid', 'paid', 'voided');--> statement-breakpoint
CREATE TYPE "public"."ocr_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'converted');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bank', 'online', 'cheque');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('recorded', 'voided');--> statement-breakpoint
ALTER TYPE "public"."aggregate_type" ADD VALUE 'invoice';--> statement-breakpoint
ALTER TYPE "public"."aggregate_type" ADD VALUE 'credit_note';--> statement-breakpoint
ALTER TYPE "public"."aggregate_type" ADD VALUE 'payment';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'invoice_created';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'invoice_modified';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'invoice_deleted';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'invoice_posted';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'invoice_voided';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'invoice_sent';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'credit_note_created';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'credit_note_modified';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'credit_note_issued';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'credit_note_voided';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'payment_recorded';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'payment_voided';--> statement-breakpoint
CREATE TABLE "event_store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"aggregate_type" "aggregate_type" NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" "event_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"sequence" bigint NOT NULL,
	"actor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"aggregate_type" "aggregate_type" NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"sequence" bigint NOT NULL,
	"state" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
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
	"status" "credit_note_status" DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(18, 2) NOT NULL,
	"cgst_total" numeric(18, 2) NOT NULL,
	"sgst_total" numeric(18, 2) NOT NULL,
	"igst_total" numeric(18, 2) NOT NULL,
	"discount_total" numeric(18, 2) NOT NULL,
	"grand_total" numeric(18, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
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
	"discount_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "quantity_non_negative" CHECK ("invoice_lines"."quantity" >= 0),
	CONSTRAINT "unit_price_non_negative" CHECK ("invoice_lines"."unit_price" >= 0),
	CONSTRAINT "gst_rate_non_negative" CHECK ("invoice_lines"."gst_rate" >= 0)
);
--> statement-breakpoint
CREATE TABLE "invoice_view" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"date" date NOT NULL,
	"due_date" date NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"customer_gstin" text,
	"customer_state" text,
	"status" text NOT NULL,
	"subtotal" numeric(18, 2) NOT NULL,
	"cgst_total" numeric(18, 2) NOT NULL,
	"sgst_total" numeric(18, 2) NOT NULL,
	"igst_total" numeric(18, 2) NOT NULL,
	"discount_total" numeric(18, 2) NOT NULL,
	"grand_total" numeric(18, 2) NOT NULL,
	"fiscal_year" text NOT NULL,
	"created_by" uuid NOT NULL,
	"sent_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"pdf_url" text,
	"days_overdue" numeric(5, 0),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
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
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(18, 2) NOT NULL,
	"cgst_total" numeric(18, 2) NOT NULL,
	"sgst_total" numeric(18, 2) NOT NULL,
	"igst_total" numeric(18, 2) NOT NULL,
	"discount_total" numeric(18, 2) NOT NULL,
	"grand_total" numeric(18, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"notes" text,
	"terms" text,
	"fiscal_year" text NOT NULL,
	"created_by" uuid NOT NULL,
	"sent_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"pdf_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subtotal_non_negative" CHECK ("invoices"."subtotal" >= 0),
	CONSTRAINT "grand_total_non_negative" CHECK ("invoices"."grand_total" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payment_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"allocated_amount" numeric(18, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
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
	"status" "payment_status" DEFAULT 'recorded' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"prefix" text DEFAULT 'INV' NOT NULL,
	"next_number" bigint DEFAULT 1 NOT NULL,
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
CREATE TABLE "email_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"customer_email" text NOT NULL,
	"customer_name" text NOT NULL,
	"pdf_url" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"queued_at" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ocr_scan_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" numeric(18, 0),
	"raw_text" text,
	"parsed_vendor_name" text,
	"parsed_invoice_number" text,
	"parsed_invoice_date" text,
	"parsed_due_date" text,
	"parsed_subtotal" numeric(18, 2),
	"parsed_cgst_total" numeric(18, 2),
	"parsed_sgst_total" numeric(18, 2),
	"parsed_igst_total" numeric(18, 2),
	"parsed_total" numeric(18, 2),
	"parsed_line_items" text,
	"confidence_score" numeric(5, 2),
	"status" "ocr_status" DEFAULT 'pending' NOT NULL,
	"linked_invoice_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "onboarding_status" text DEFAULT 'in_progress' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "date_of_incorporation" date;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "onboarding_data" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "gst_config" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "event_store" ADD CONSTRAINT "event_store_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_original_invoice_id_invoices_id_fk" FOREIGN KEY ("original_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_scan_results" ADD CONSTRAINT "ocr_scan_results_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_store_aggregate_id_sequence_unique" ON "event_store" USING btree ("aggregate_id","sequence");--> statement-breakpoint
CREATE INDEX "event_store_tenant_id_idx" ON "event_store" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "event_store_sequence_idx" ON "event_store" USING btree ("sequence");--> statement-breakpoint
CREATE UNIQUE INDEX "snapshots_aggregate_id_sequence_unique" ON "snapshots" USING btree ("aggregate_id","sequence");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_notes_tenant_id_invoice_number_unique" ON "credit_notes" USING btree ("tenant_id","invoice_number");--> statement-breakpoint
CREATE INDEX "credit_notes_tenant_id_customer_name_idx" ON "credit_notes" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_view_tenant_id_invoice_id_unique" ON "invoice_view" USING btree ("tenant_id","invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_view_tenant_id_status_idx" ON "invoice_view" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "invoice_view_tenant_id_customer_name_idx" ON "invoice_view" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_tenant_id_invoice_number_unique" ON "invoices" USING btree ("tenant_id","invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_tenant_id_status_idx" ON "invoices" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "invoices_tenant_id_customer_name_idx" ON "invoices" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_allocations_payment_id_invoice_id_unique" ON "payment_allocations" USING btree ("payment_id","invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_tenant_id_payment_number_unique" ON "payments" USING btree ("tenant_id","payment_number");--> statement-breakpoint
CREATE INDEX "payments_tenant_id_customer_name_idx" ON "payments" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "payments_tenant_id_date_idx" ON "payments" USING btree ("tenant_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_config_tenant_id_unique" ON "invoice_config" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "receivables_summary_tenant_id_customer_name_unique" ON "receivables_summary" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "ocr_scan_results_tenant_id_idx" ON "ocr_scan_results" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ocr_scan_results_status_idx" ON "ocr_scan_results" USING btree ("status");