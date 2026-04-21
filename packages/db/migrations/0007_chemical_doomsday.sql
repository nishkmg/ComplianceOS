CREATE TYPE "public"."gst_return_status" AS ENUM('draft', 'generated', 'filed', 'amended');--> statement-breakpoint
CREATE TYPE "public"."gst_return_type" AS ENUM('gstr1', 'gstr2b', 'gstr3b', 'gstr9', 'gstr4');--> statement-breakpoint
CREATE TYPE "public"."gst_tax_type" AS ENUM('igst', 'cgst', 'sgst', 'cess');--> statement-breakpoint
CREATE TYPE "public"."gst_transaction_type" AS ENUM('payment', 'interest', 'penalty', 'refund', 'itc_utilization');--> statement-breakpoint
CREATE TABLE "gst_return_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gst_return_id" uuid NOT NULL,
	"table_number" text NOT NULL,
	"table_description" text NOT NULL,
	"transaction_type" text NOT NULL,
	"place_of_supply" text NOT NULL,
	"taxable_value" numeric(18, 2) DEFAULT '0' NOT NULL,
	"igst_amount" numeric(18, 2) DEFAULT '0',
	"cgst_amount" numeric(18, 2) DEFAULT '0',
	"sgst_amount" numeric(18, 2) DEFAULT '0',
	"cess_amount" numeric(18, 2) DEFAULT '0',
	"total_tax_amount" numeric(18, 2) DEFAULT '0',
	"source_document_id" uuid,
	"source_document_type" text,
	"source_document_number" text,
	"source_document_date" date,
	"gstin" text,
	"party_name" text,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "gst_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"return_number" text NOT NULL,
	"return_type" "gst_return_type" NOT NULL,
	"tax_period_month" text NOT NULL,
	"tax_period_year" text NOT NULL,
	"fiscal_year" text NOT NULL,
	"status" "gst_return_status" DEFAULT 'draft' NOT NULL,
	"filing_date" date,
	"due_date" date NOT NULL,
	"total_outward_supplies" numeric(18, 2) DEFAULT '0',
	"total_eligible_itc" numeric(18, 2) DEFAULT '0',
	"total_tax_payable" numeric(18, 2) DEFAULT '0',
	"total_tax_paid" numeric(18, 2) DEFAULT '0',
	"interest_amount" numeric(18, 2) DEFAULT '0',
	"penalty_amount" numeric(18, 2) DEFAULT '0',
	"late_fee_amount" numeric(18, 2) DEFAULT '0',
	"arn" text,
	"remarks" text,
	"created_by" uuid NOT NULL,
	"filed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gst_cash_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transaction_type" "gst_transaction_type" NOT NULL,
	"tax_type" "gst_tax_type" NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"transaction_date" date NOT NULL,
	"reference_type" text,
	"reference_id" uuid,
	"reference_number" text,
	"challan_number" text,
	"challan_date" date,
	"bank_name" text,
	"narration" text,
	"fiscal_year" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gst_itc_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tax_type" "gst_tax_type" NOT NULL,
	"opening_balance" numeric(18, 2) DEFAULT '0',
	"itc_available" numeric(18, 2) DEFAULT '0',
	"itc_reversed" numeric(18, 2) DEFAULT '0',
	"itc_utilized" numeric(18, 2) DEFAULT '0',
	"closing_balance" numeric(18, 2) DEFAULT '0',
	"tax_period_month" text NOT NULL,
	"tax_period_year" text NOT NULL,
	"fiscal_year" text NOT NULL,
	"source_document_id" uuid,
	"source_document_type" text,
	"source_document_number" text,
	"supplier_gstin" text,
	"supplier_name" text,
	"ineligible_reason" text,
	"narration" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gst_liability_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tax_type" "gst_tax_type" NOT NULL,
	"liability_type" text NOT NULL,
	"opening_balance" numeric(18, 2) DEFAULT '0',
	"tax_payable" numeric(18, 2) DEFAULT '0',
	"tax_paid" numeric(18, 2) DEFAULT '0',
	"interest_payable" numeric(18, 2) DEFAULT '0',
	"interest_paid" numeric(18, 2) DEFAULT '0',
	"penalty_payable" numeric(18, 2) DEFAULT '0',
	"penalty_paid" numeric(18, 2) DEFAULT '0',
	"closing_balance" numeric(18, 2) DEFAULT '0',
	"tax_period_month" text NOT NULL,
	"tax_period_year" text NOT NULL,
	"fiscal_year" text NOT NULL,
	"source_document_id" uuid,
	"source_document_type" text,
	"source_document_number" text,
	"reference_type" text,
	"reference_id" uuid,
	"narration" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gst_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"gstin" text NOT NULL,
	"legal_name" text NOT NULL,
	"trade_name" text,
	"registration_date" timestamp with time zone,
	"state_code" text NOT NULL,
	"state_name" text NOT NULL,
	"business_type" text NOT NULL,
	"taxpayer_type" text NOT NULL,
	"filing_frequency" text NOT NULL,
	"is_composition_dealer" boolean DEFAULT false,
	"composition_limit" numeric(18, 2),
	"aggregate_turnover" numeric(18, 2) DEFAULT '0',
	"principal_place_of_business" text,
	"additional_places_of_business" jsonb,
	"authorized_signatory" text,
	"email" text,
	"phone" text,
	"mobile" text,
	"api_credentials" jsonb,
	"is_api_enabled" boolean DEFAULT false,
	"last_sync_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gstr_table_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"return_type" text NOT NULL,
	"table_number" text NOT NULL,
	"table_description" text NOT NULL,
	"account_ids" jsonb,
	"tax_rate" numeric(5, 2),
	"tax_type" text,
	"place_of_supply" text,
	"is_active" boolean DEFAULT true,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gst_return_lines" ADD CONSTRAINT "gst_return_lines_gst_return_id_gst_returns_id_fk" FOREIGN KEY ("gst_return_id") REFERENCES "public"."gst_returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_returns" ADD CONSTRAINT "gst_returns_fiscal_year_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year") REFERENCES "public"."fiscal_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_returns" ADD CONSTRAINT "gst_returns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_returns" ADD CONSTRAINT "gst_returns_filed_by_users_id_fk" FOREIGN KEY ("filed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_cash_ledger" ADD CONSTRAINT "gst_cash_ledger_fiscal_year_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year") REFERENCES "public"."fiscal_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_cash_ledger" ADD CONSTRAINT "gst_cash_ledger_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_itc_ledger" ADD CONSTRAINT "gst_itc_ledger_fiscal_year_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year") REFERENCES "public"."fiscal_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_itc_ledger" ADD CONSTRAINT "gst_itc_ledger_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_liability_ledger" ADD CONSTRAINT "gst_liability_ledger_fiscal_year_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year") REFERENCES "public"."fiscal_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_liability_ledger" ADD CONSTRAINT "gst_liability_ledger_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_config" ADD CONSTRAINT "gst_config_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gst_config" ADD CONSTRAINT "gst_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gstr_table_mappings" ADD CONSTRAINT "gstr_table_mappings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gstr_table_mappings" ADD CONSTRAINT "gstr_table_mappings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gst_return_lines_gst_return_id_idx" ON "gst_return_lines" USING btree ("gst_return_id");--> statement-breakpoint
CREATE INDEX "gst_return_lines_table_number_idx" ON "gst_return_lines" USING btree ("table_number");--> statement-breakpoint
CREATE INDEX "gst_return_lines_source_document_idx" ON "gst_return_lines" USING btree ("source_document_id","source_document_type");--> statement-breakpoint
CREATE UNIQUE INDEX "gst_returns_tenant_return_type_period_unique" ON "gst_returns" USING btree ("tenant_id","return_type","tax_period_month","tax_period_year");--> statement-breakpoint
CREATE INDEX "gst_returns_tenant_id_status_idx" ON "gst_returns" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "gst_returns_tenant_id_fiscal_year_idx" ON "gst_returns" USING btree ("tenant_id","fiscal_year");--> statement-breakpoint
CREATE INDEX "gst_returns_tax_period_idx" ON "gst_returns" USING btree ("tax_period_year","tax_period_month");--> statement-breakpoint
CREATE INDEX "gst_cash_ledger_tenant_id_idx" ON "gst_cash_ledger" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "gst_cash_ledger_tax_type_idx" ON "gst_cash_ledger" USING btree ("tax_type");--> statement-breakpoint
CREATE INDEX "gst_cash_ledger_transaction_date_idx" ON "gst_cash_ledger" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "gst_cash_ledger_fiscal_year_idx" ON "gst_cash_ledger" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "gst_itc_ledger_tenant_id_idx" ON "gst_itc_ledger" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "gst_itc_ledger_tax_type_idx" ON "gst_itc_ledger" USING btree ("tax_type");--> statement-breakpoint
CREATE INDEX "gst_itc_ledger_tax_period_idx" ON "gst_itc_ledger" USING btree ("tax_period_year","tax_period_month");--> statement-breakpoint
CREATE INDEX "gst_itc_ledger_fiscal_year_idx" ON "gst_itc_ledger" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "gst_liability_ledger_tenant_id_idx" ON "gst_liability_ledger" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "gst_liability_ledger_tax_type_idx" ON "gst_liability_ledger" USING btree ("tax_type");--> statement-breakpoint
CREATE INDEX "gst_liability_ledger_tax_period_idx" ON "gst_liability_ledger" USING btree ("tax_period_year","tax_period_month");--> statement-breakpoint
CREATE INDEX "gst_liability_ledger_fiscal_year_idx" ON "gst_liability_ledger" USING btree ("fiscal_year");--> statement-breakpoint
CREATE UNIQUE INDEX "gst_config_tenant_id_unique" ON "gst_config" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "gst_config_gstin_idx" ON "gst_config" USING btree ("gstin");--> statement-breakpoint
CREATE UNIQUE INDEX "gstr_table_mappings_tenant_return_table_unique" ON "gstr_table_mappings" USING btree ("tenant_id","return_type","table_number");--> statement-breakpoint
CREATE INDEX "gstr_table_mappings_return_type_idx" ON "gstr_table_mappings" USING btree ("return_type");