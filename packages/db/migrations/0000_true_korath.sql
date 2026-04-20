CREATE TYPE "public"."account_kind" AS ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense');--> statement-breakpoint
CREATE TYPE "public"."account_sub_type" AS ENUM('CurrentAsset', 'FixedAsset', 'Bank', 'Cash', 'Inventory', 'CurrentLiability', 'LongTermLiability', 'Capital', 'Drawing', 'Reserves', 'OperatingRevenue', 'OtherRevenue', 'DirectExpense', 'IndirectExpense');--> statement-breakpoint
CREATE TYPE "public"."aggregate_type" AS ENUM('journal_entry', 'account', 'fiscal_year');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('sole_proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited', 'huf');--> statement-breakpoint
CREATE TYPE "public"."cash_flow_category" AS ENUM('operating', 'investing', 'financing');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('journal_entry_created', 'journal_entry_modified', 'journal_entry_deleted', 'journal_entry_posted', 'journal_entry_voided', 'journal_entry_reversed', 'account_created', 'account_modified', 'account_deactivated', 'fiscal_year_created', 'fiscal_year_closed', 'narration_corrected');--> statement-breakpoint
CREATE TYPE "public"."fy_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."gst_registration" AS ENUM('regular', 'composition', 'none');--> statement-breakpoint
CREATE TYPE "public"."industry" AS ENUM('retail_trading', 'manufacturing', 'services_professional', 'freelancer_consultant', 'regulated_professional');--> statement-breakpoint
CREATE TYPE "public"."je_status" AS ENUM('draft', 'posted', 'voided');--> statement-breakpoint
CREATE TYPE "public"."module" AS ENUM('accounting', 'invoicing', 'inventory', 'payroll', 'gst', 'ocr', 'itr');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_account" AS ENUM('bank', 'none');--> statement-breakpoint
CREATE TYPE "public"."reference_type" AS ENUM('invoice', 'payment', 'receipt', 'journal', 'payroll', 'inventory', 'opening_balance', 'manual');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'accountant', 'manager', 'employee');--> statement-breakpoint
CREATE TYPE "public"."set_by" AS ENUM('auto', 'manual');--> statement-breakpoint
CREATE TYPE "public"."state" AS ENUM('andhra_pradesh', 'arunachal_pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa', 'gujarat', 'haryana', 'himachal_pradesh', 'jharkhand', 'karnataka', 'kerala', 'madhya_pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil_nadu', 'telangana', 'tripura', 'uttar_pradesh', 'uttarakhand', 'west_bengal', 'andaman_nicobar', 'chandigarh', 'dadra_nagar_haveli_daman_diu', 'delhi', 'jammu_kashmir', 'ladakh', 'lakshadweep', 'puducherry');--> statement-breakpoint
CREATE TYPE "public"."tag" AS ENUM('trade_receivable', 'trade_payable', 'gst', 'tds', 'tds_payable', 'finance_cost', 'depreciation', 'tax', 'employee_benefits', 'manufacturing', 'inventory_adjustment', 'trading', 'returns', 'opening_balance');--> statement-breakpoint
CREATE TABLE "tenant_module_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"module" "module" NOT NULL,
	"enabled" text DEFAULT 'false' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"set_by" "set_by" DEFAULT 'auto'
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"business_type" "business_type",
	"pan" text NOT NULL,
	"gstin" text,
	"address" text NOT NULL,
	"state" "state" NOT NULL,
	"industry" "industry",
	"gst_registration" "gst_registration",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" "role" DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "tenant_module_config" ADD CONSTRAINT "tenant_module_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;