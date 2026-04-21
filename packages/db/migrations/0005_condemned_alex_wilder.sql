CREATE TYPE "public"."advance_status" AS ENUM('active', 'fully_recovered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('pan_card', 'aadhaar_card', 'photo', 'bank_proof', 'uan_card', 'esi_card', 'address_proof', 'qualification_certificate', 'experience_letter');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('active', 'inactive', 'exited');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."payroll_component_type" AS ENUM('earning', 'deduction', 'statutory', 'advance', 'arrears');--> statement-breakpoint
CREATE TYPE "public"."payroll_run_status" AS ENUM('draft', 'processing', 'calculated', 'finalized', 'voided', 'failed');--> statement-breakpoint
CREATE TYPE "public"."tds_regime" AS ENUM('old', 'new');--> statement-breakpoint
ALTER TYPE "public"."aggregate_type" ADD VALUE 'payroll_run';--> statement-breakpoint
ALTER TYPE "public"."aggregate_type" ADD VALUE 'salary_structure';--> statement-breakpoint
ALTER TYPE "public"."aggregate_type" ADD VALUE 'employee_advance';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'employee_created';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'employee_updated';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'employee_deactivated';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'salary_structure_created';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'salary_structure_updated';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'payroll_processed';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'payroll_finalized';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'payroll_voided';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'payslip_generated';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'advance_given';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'advance_recovered';--> statement-breakpoint
CREATE TABLE "employee_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_url" text NOT NULL,
	"verified" boolean DEFAULT false,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_code" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text,
	"phone" text,
	"date_of_birth" date,
	"gender" "gender",
	"pan" text NOT NULL,
	"aadhaar" text,
	"uan" text,
	"esi_number" text,
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" text,
	"address" text,
	"city" text,
	"state" text,
	"pincode" text,
	"date_of_joining" date NOT NULL,
	"date_of_exit" date,
	"designation" text,
	"department" text,
	"status" "employee_status" DEFAULT 'active' NOT NULL,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"financial_year" text NOT NULL,
	"regime" text DEFAULT 'new' NOT NULL,
	"declarations" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_salary_structures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"component_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"amount" numeric(18, 2),
	"percentage_of_basic" numeric(5, 2),
	"effective_from" date NOT NULL,
	"effective_to" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"component_code" text NOT NULL,
	"component_name" text NOT NULL,
	"component_type" "payroll_component_type" NOT NULL,
	"is_taxable" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_advances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"total_amount" numeric(18, 2) NOT NULL,
	"remaining_balance" numeric(18, 2) NOT NULL,
	"monthly_deduction" numeric(18, 2) NOT NULL,
	"installments" integer NOT NULL,
	"deducted_installments" integer DEFAULT 0,
	"advance_date" date NOT NULL,
	"month_reference" text NOT NULL,
	"status" "advance_status" DEFAULT 'active' NOT NULL,
	"narration" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_run_id" uuid NOT NULL,
	"component_code" text NOT NULL,
	"component_name" text NOT NULL,
	"component_type" text NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "payroll_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payroll_number" text NOT NULL,
	"employee_id" uuid NOT NULL,
	"month" text NOT NULL,
	"year" text NOT NULL,
	"fiscal_year" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"payment_date" date,
	"status" "payroll_run_status" DEFAULT 'draft' NOT NULL,
	"gross_earnings" numeric(18, 2) DEFAULT '0' NOT NULL,
	"gross_deductions" numeric(18, 2) DEFAULT '0' NOT NULL,
	"net_pay" numeric(18, 2) DEFAULT '0' NOT NULL,
	"pf_ee" numeric(18, 2) DEFAULT '0',
	"pf_er" numeric(18, 2) DEFAULT '0',
	"esi_ee" numeric(18, 2) DEFAULT '0',
	"esi_er" numeric(18, 2) DEFAULT '0',
	"tds_deducted" numeric(18, 2) DEFAULT '0',
	"professional_tax" numeric(18, 2) DEFAULT '0',
	"advance_deduction" numeric(18, 2) DEFAULT '0',
	"arrears" numeric(18, 2) DEFAULT '0',
	"narration" text,
	"journal_entry_id" uuid,
	"payslip_url" text,
	"is_distributed" boolean DEFAULT false,
	"created_by" uuid NOT NULL,
	"finalized_at" timestamp with time zone,
	"voided_at" timestamp with time zone,
	"void_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payslips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payroll_run_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"pdf_url" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_distributed" boolean DEFAULT false,
	"distributed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payroll_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pf_er_percentage" numeric(5, 2) DEFAULT '12',
	"pf_ee_percentage" numeric(5, 2) DEFAULT '12',
	"eps_percentage" numeric(5, 2) DEFAULT '8.33',
	"esi_er_percentage" numeric(5, 2) DEFAULT '3.25',
	"esi_ee_percentage" numeric(5, 2) DEFAULT '0.75',
	"esi_wage_ceiling" numeric(18, 2) DEFAULT '21000',
	"pf_wage_ceiling" numeric(18, 2) DEFAULT '15000',
	"professional_tax_slabs" jsonb DEFAULT '[{"maxSalary":10000,"tax":0},{"maxSalary":15000,"tax":100},{"maxSalary":20000,"tax":200},{"maxSalary":null,"tax":250}]'::jsonb,
	"tds_slabs" jsonb DEFAULT '{"new":[{"upTo":300000,"rate":0},{"upTo":700000,"rate":0.05},{"upTo":1000000,"rate":0.1},{"upTo":1200000,"rate":0.15},{"upTo":1500000,"rate":0.2},{"upTo":null,"rate":0.3}],"old":[{"upTo":250000,"rate":0},{"upTo":500000,"rate":0.05},{"upTo":1000000,"rate":0.2},{"upTo":null,"rate":0.3}]}'::jsonb,
	"payment_date" numeric(2, 0) DEFAULT '1',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_summary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"employee_name" text NOT NULL,
	"employee_code" text NOT NULL,
	"month" text NOT NULL,
	"year" text NOT NULL,
	"gross_earnings" numeric(18, 2) NOT NULL,
	"gross_deductions" numeric(18, 2) NOT NULL,
	"net_pay" numeric(18, 2) NOT NULL,
	"pf_total" numeric(18, 2) DEFAULT '0',
	"esi_total" numeric(18, 2) DEFAULT '0',
	"tds_deducted" numeric(18, 2) DEFAULT '0',
	"payment_date" date,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statutory_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"component" text NOT NULL,
	"rate" numeric(5, 2) NOT NULL,
	"wage_ceiling" numeric(18, 2),
	"effective_from" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statutory_liabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"month" text NOT NULL,
	"year" text NOT NULL,
	"fiscal_year" text NOT NULL,
	"pf_ee_total" numeric(18, 2) DEFAULT '0',
	"pf_er_total" numeric(18, 2) DEFAULT '0',
	"eps_total" numeric(18, 2) DEFAULT '0',
	"esi_ee_total" numeric(18, 2) DEFAULT '0',
	"esi_er_total" numeric(18, 2) DEFAULT '0',
	"tds_total" numeric(18, 2) DEFAULT '0',
	"professional_tax_total" numeric(18, 2) DEFAULT '0',
	"payable_by_date" date,
	"paid" boolean DEFAULT false,
	"paid_at" timestamp with time zone,
	"paid_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_config" ALTER COLUMN "auto_create_je" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "inventory_config" ALTER COLUMN "auto_create_je" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_preferences" ADD CONSTRAINT "tax_preferences_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_salary_structures" ADD CONSTRAINT "employee_salary_structures_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_salary_structures" ADD CONSTRAINT "employee_salary_structures_component_id_salary_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."salary_components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_advances" ADD CONSTRAINT "payroll_advances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_advances" ADD CONSTRAINT "payroll_advances_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_payroll_run_id_payroll_runs_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "public"."payroll_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payroll_run_id_payroll_runs_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "public"."payroll_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "employee_documents_employee_id_idx" ON "employee_documents" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employee_documents_tenant_id_idx" ON "employee_documents" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_tenant_id_employee_code_unique" ON "employees" USING btree ("tenant_id","employee_code");--> statement-breakpoint
CREATE INDEX "employees_tenant_id_status_idx" ON "employees" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "employees_tenant_id_pan_idx" ON "employees" USING btree ("tenant_id","pan");--> statement-breakpoint
CREATE INDEX "employees_tenant_id_uan_idx" ON "employees" USING btree ("tenant_id","uan");--> statement-breakpoint
CREATE INDEX "employees_user_id_idx" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tax_preferences_tenant_employee_fy_unique" ON "tax_preferences" USING btree ("tenant_id","employee_id","financial_year");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_salary_structures_tenant_employee_component_version_unique" ON "employee_salary_structures" USING btree ("tenant_id","employee_id","component_id","version");--> statement-breakpoint
CREATE INDEX "employee_salary_structures_employee_id_idx" ON "employee_salary_structures" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employee_salary_structures_active_idx" ON "employee_salary_structures" USING btree ("employee_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "salary_components_tenant_id_component_code_unique" ON "salary_components" USING btree ("tenant_id","component_code");--> statement-breakpoint
CREATE INDEX "salary_components_tenant_id_type_idx" ON "salary_components" USING btree ("tenant_id","component_type");--> statement-breakpoint
CREATE INDEX "payroll_advances_employee_id_idx" ON "payroll_advances" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "payroll_advances_status_idx" ON "payroll_advances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payroll_lines_payroll_run_id_idx" ON "payroll_lines" USING btree ("payroll_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payroll_runs_tenant_employee_month_year_unique" ON "payroll_runs" USING btree ("tenant_id","employee_id","month","year");--> statement-breakpoint
CREATE INDEX "payroll_runs_tenant_id_status_idx" ON "payroll_runs" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "payroll_runs_tenant_id_fiscal_year_idx" ON "payroll_runs" USING btree ("tenant_id","fiscal_year");--> statement-breakpoint
CREATE INDEX "payroll_runs_employee_id_idx" ON "payroll_runs" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payslips_payroll_run_id_unique" ON "payslips" USING btree ("payroll_run_id");--> statement-breakpoint
CREATE INDEX "payslips_employee_id_idx" ON "payslips" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payroll_config_tenant_id_unique" ON "payroll_config" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payroll_summary_tenant_employee_month_year_unique" ON "payroll_summary" USING btree ("tenant_id","employee_id","month","year");--> statement-breakpoint
CREATE INDEX "payroll_summary_month_year_idx" ON "payroll_summary" USING btree ("month","year");--> statement-breakpoint
CREATE INDEX "statutory_config_tenant_component_idx" ON "statutory_config" USING btree ("tenant_id","component");--> statement-breakpoint
CREATE INDEX "statutory_config_effective_from_idx" ON "statutory_config" USING btree ("effective_from");--> statement-breakpoint
CREATE UNIQUE INDEX "statutory_liabilities_tenant_month_year_unique" ON "statutory_liabilities" USING btree ("tenant_id","month","year");