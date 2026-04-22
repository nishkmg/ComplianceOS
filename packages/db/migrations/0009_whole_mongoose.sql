ALTER TYPE "public"."aggregate_type" ADD VALUE 'itr_return';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'income_computed';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'tax_computed';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'itr_generated';--> statement-breakpoint
ALTER TYPE "public"."itr_return_status" ADD VALUE 'generated' BEFORE 'filed';--> statement-breakpoint
ALTER TYPE "public"."itr_return_status" ADD VALUE 'voided';--> statement-breakpoint
CREATE TABLE "itr_advance_tax_projection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"assessment_year" text NOT NULL,
	"installment_1_paid" numeric(18, 2) DEFAULT '0',
	"installment_2_paid" numeric(18, 2) DEFAULT '0',
	"installment_3_paid" numeric(18, 2) DEFAULT '0',
	"installment_4_paid" numeric(18, 2) DEFAULT '0',
	"total_advance_tax_paid" numeric(18, 2) DEFAULT '0',
	"interest_234b" numeric(18, 2) DEFAULT '0',
	"interest_234c" numeric(18, 2) DEFAULT '0',
	"last_updated_at" timestamp with time zone,
	"event_sequence_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itr_annual_income_projection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"financial_year" text NOT NULL,
	"salary_income" numeric(18, 2) DEFAULT '0',
	"house_property_income" numeric(18, 2) DEFAULT '0',
	"business_income" numeric(18, 2) DEFAULT '0',
	"capital_gains" numeric(18, 2) DEFAULT '0',
	"other_sources" numeric(18, 2) DEFAULT '0',
	"gross_total_income" numeric(18, 2) DEFAULT '0',
	"total_deductions" numeric(18, 2) DEFAULT '0',
	"total_income" numeric(18, 2) DEFAULT '0',
	"last_computed_at" timestamp with time zone,
	"event_sequence_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itr_tax_summary_projection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"assessment_year" text NOT NULL,
	"financial_year" text NOT NULL,
	"tax_regime" text,
	"tax_on_total_income" numeric(18, 2) DEFAULT '0',
	"rebate_87a" numeric(18, 2) DEFAULT '0',
	"surcharge" numeric(18, 2) DEFAULT '0',
	"cess" numeric(18, 2) DEFAULT '0',
	"total_tax_payable" numeric(18, 2) DEFAULT '0',
	"tds_tcs_credit" numeric(18, 2) DEFAULT '0',
	"advance_tax_paid" numeric(18, 2) DEFAULT '0',
	"self_assessment_tax" numeric(18, 2) DEFAULT '0',
	"balance_payable" numeric(18, 2) DEFAULT '0',
	"refund_due" numeric(18, 2) DEFAULT '0',
	"last_computed_at" timestamp with time zone,
	"event_sequence_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "itr_advance_tax_projection_tenant_ay_unique" ON "itr_advance_tax_projection" USING btree ("tenant_id","assessment_year");--> statement-breakpoint
CREATE INDEX "itr_advance_tax_projection_tenant_id_idx" ON "itr_advance_tax_projection" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "itr_annual_income_projection_tenant_fy_unique" ON "itr_annual_income_projection" USING btree ("tenant_id","financial_year");--> statement-breakpoint
CREATE INDEX "itr_annual_income_projection_tenant_id_idx" ON "itr_annual_income_projection" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "itr_tax_summary_projection_tenant_ay_unique" ON "itr_tax_summary_projection" USING btree ("tenant_id","assessment_year");--> statement-breakpoint
CREATE INDEX "itr_tax_summary_projection_tenant_id_idx" ON "itr_tax_summary_projection" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "itr_tax_summary_projection_financial_year_idx" ON "itr_tax_summary_projection" USING btree ("financial_year");