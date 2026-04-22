CREATE TYPE "public"."income_head" AS ENUM('salary', 'house_property', 'business_profit', 'capital_gains', 'other_sources');--> statement-breakpoint
CREATE TYPE "public"."itr_return_status" AS ENUM('draft', 'computed', 'filed', 'verified');--> statement-breakpoint
CREATE TYPE "public"."itr_return_type" AS ENUM('itr3', 'itr4', 'itr5', 'itr1', 'itr2');--> statement-breakpoint
CREATE TYPE "public"."presumptive_scheme" AS ENUM('44ad', '44ada', '44ae', 'none');--> statement-breakpoint
CREATE TYPE "public"."tax_regime" AS ENUM('old', 'new');--> statement-breakpoint
ALTER TYPE "public"."aggregate_type" ADD VALUE 'gst_challan';--> statement-breakpoint
ALTER TYPE "public"."aggregate_type" ADD VALUE 'gst_payment';--> statement-breakpoint
ALTER TYPE "public"."aggregate_type" ADD VALUE 'gst_return';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'gst_challan_created';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'gst_payment_made';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'itc_reconciled';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'itc_utilized';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'purchase_posted';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'purchase_voided';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'itc_reversed';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'gst_refund_claimed';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'gstr3b_generated';--> statement-breakpoint
ALTER TYPE "public"."gst_return_status" ADD VALUE 'completed';--> statement-breakpoint
ALTER TYPE "public"."gst_return_type" ADD VALUE 'itc_reconciliation';--> statement-breakpoint
CREATE TABLE "itr_return_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_id" uuid NOT NULL,
	"schedule_code" text NOT NULL,
	"field_code" text NOT NULL,
	"field_value" numeric(18, 2) DEFAULT '0' NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "itr_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"assessment_year" text NOT NULL,
	"financial_year" text NOT NULL,
	"return_type" "itr_return_type" NOT NULL,
	"status" "itr_return_status" DEFAULT 'draft' NOT NULL,
	"tax_regime" "tax_regime",
	"presumptive_scheme" "presumptive_scheme",
	"gross_total_income" numeric(18, 2) DEFAULT '0',
	"total_deductions" numeric(18, 2) DEFAULT '0',
	"total_income" numeric(18, 2) DEFAULT '0',
	"tax_payable" numeric(18, 2) DEFAULT '0',
	"surcharge" numeric(18, 2) DEFAULT '0',
	"cess" numeric(18, 2) DEFAULT '0',
	"rebate_87a" numeric(18, 2) DEFAULT '0',
	"advance_tax_paid" numeric(18, 2) DEFAULT '0',
	"self_assessment_tax" numeric(18, 2) DEFAULT '0',
	"tds_tcs_credit" numeric(18, 2) DEFAULT '0',
	"total_tax_paid" numeric(18, 2) DEFAULT '0',
	"balance_payable" numeric(18, 2) DEFAULT '0',
	"refund_due" numeric(18, 2) DEFAULT '0',
	"generated_at" timestamp with time zone,
	"filed_at" timestamp with time zone,
	"itr_ack_number" text,
	"verification_date" timestamp with time zone,
	"verification_mode" text,
	"itr_json_url" text,
	"created_by" uuid NOT NULL,
	"filed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itr_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_id" uuid NOT NULL,
	"schedule_code" text NOT NULL,
	"schedule_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"total_amount" numeric(18, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advance_tax_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"assessment_year" text NOT NULL,
	"installment_number" text NOT NULL,
	"due_date" date NOT NULL,
	"payable_amount" numeric(18, 2) DEFAULT '0',
	"paid_amount" numeric(18, 2) DEFAULT '0',
	"paid_date" date,
	"challan_number" text,
	"challan_date" date,
	"interest_234b" numeric(18, 2) DEFAULT '0',
	"interest_234c" numeric(18, 2) DEFAULT '0',
	"balance" numeric(18, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "self_assessment_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"assessment_year" text NOT NULL,
	"tax_payable" numeric(18, 2) DEFAULT '0',
	"advance_tax_paid" numeric(18, 2) DEFAULT '0',
	"tds_tcs_credit" numeric(18, 2) DEFAULT '0',
	"balance_payable" numeric(18, 2) DEFAULT '0',
	"paid_amount" numeric(18, 2) DEFAULT '0',
	"challan_number" text,
	"challan_date" date,
	"paid_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itr_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tax_regime" "tax_regime" NOT NULL,
	"presumptive_scheme" "presumptive_scheme" DEFAULT 'none' NOT NULL,
	"presumptive_rate" numeric(5, 2) DEFAULT '0',
	"eligible_deductions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tds_applicable" text DEFAULT 'false' NOT NULL,
	"advance_tax_applicable" text DEFAULT 'false' NOT NULL,
	"regime_opt_out_date" date,
	"regime_lockin_until" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itr_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"return_id" uuid,
	"financial_year" text NOT NULL,
	"snapshot_type" text NOT NULL,
	"snapshot_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itr_field_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_type" "itr_return_type" NOT NULL,
	"field_code" text NOT NULL,
	"field_name" text NOT NULL,
	"description" text,
	"source_table" text,
	"source_field" text,
	"calculation_logic" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
ALTER TABLE "itr_return_lines" ADD CONSTRAINT "itr_return_lines_return_id_itr_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."itr_returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itr_returns" ADD CONSTRAINT "itr_returns_financial_year_fiscal_years_id_fk" FOREIGN KEY ("financial_year") REFERENCES "public"."fiscal_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itr_returns" ADD CONSTRAINT "itr_returns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itr_returns" ADD CONSTRAINT "itr_returns_filed_by_users_id_fk" FOREIGN KEY ("filed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itr_schedules" ADD CONSTRAINT "itr_schedules_return_id_itr_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."itr_returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itr_config" ADD CONSTRAINT "itr_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "itr_return_lines_return_id_idx" ON "itr_return_lines" USING btree ("return_id");--> statement-breakpoint
CREATE INDEX "itr_return_lines_schedule_code_idx" ON "itr_return_lines" USING btree ("schedule_code");--> statement-breakpoint
CREATE UNIQUE INDEX "itr_returns_tenant_ay_fy_type_unique" ON "itr_returns" USING btree ("tenant_id","assessment_year","financial_year","return_type");--> statement-breakpoint
CREATE INDEX "itr_returns_tenant_id_fy_status_idx" ON "itr_returns" USING btree ("tenant_id","financial_year","status");--> statement-breakpoint
CREATE INDEX "itr_returns_tenant_id_ay_idx" ON "itr_returns" USING btree ("tenant_id","assessment_year");--> statement-breakpoint
CREATE INDEX "itr_schedules_return_id_idx" ON "itr_schedules" USING btree ("return_id");--> statement-breakpoint
CREATE INDEX "itr_schedules_schedule_code_idx" ON "itr_schedules" USING btree ("schedule_code");--> statement-breakpoint
CREATE UNIQUE INDEX "advance_tax_ledger_tenant_ay_installment_unique" ON "advance_tax_ledger" USING btree ("tenant_id","assessment_year","installment_number");--> statement-breakpoint
CREATE INDEX "advance_tax_ledger_tenant_id_ay_idx" ON "advance_tax_ledger" USING btree ("tenant_id","assessment_year");--> statement-breakpoint
CREATE INDEX "self_assessment_ledger_tenant_id_ay_idx" ON "self_assessment_ledger" USING btree ("tenant_id","assessment_year");--> statement-breakpoint
CREATE UNIQUE INDEX "itr_config_tenant_id_unique" ON "itr_config" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "itr_config_tenant_id_idx" ON "itr_config" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "itr_snapshots_tenant_id_fy_type_idx" ON "itr_snapshots" USING btree ("tenant_id","financial_year","snapshot_type");--> statement-breakpoint
CREATE INDEX "itr_field_mappings_return_type_idx" ON "itr_field_mappings" USING btree ("return_type");--> statement-breakpoint
CREATE INDEX "itr_field_mappings_field_code_idx" ON "itr_field_mappings" USING btree ("field_code");