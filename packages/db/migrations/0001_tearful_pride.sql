CREATE TABLE "account_cash_flow_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"cash_flow_category" "cash_flow_category" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"tag" "tag" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"kind" "account_kind" NOT NULL,
	"sub_type" "account_sub_type" NOT NULL,
	"parent_id" uuid,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_leaf" boolean DEFAULT true NOT NULL,
	"reconciliation_account" "reconciliation_account" DEFAULT 'none' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_flow_default_mapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_type" "account_sub_type" NOT NULL,
	"cash_flow_category" "cash_flow_category" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entry_number" text NOT NULL,
	"date" date NOT NULL,
	"narration" text NOT NULL,
	"reference_type" "reference_type" DEFAULT 'manual' NOT NULL,
	"reference_id" uuid,
	"status" "je_status" DEFAULT 'draft' NOT NULL,
	"fiscal_year" text NOT NULL,
	"reversal_of" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entry_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"debit" numeric(18, 2) DEFAULT '0' NOT NULL,
	"credit" numeric(18, 2) DEFAULT '0' NOT NULL,
	"description" text,
	CONSTRAINT "debit_non_negative" CHECK ("journal_entry_lines"."debit" >= 0),
	CONSTRAINT "credit_non_negative" CHECK ("journal_entry_lines"."credit" >= 0),
	CONSTRAINT "debit_xor_credit" CHECK (("journal_entry_lines"."debit" = 0 OR "journal_entry_lines"."credit" = 0)),
	CONSTRAINT "amount_required" CHECK (NOT ("journal_entry_lines"."debit" = 0 AND "journal_entry_lines"."credit" = 0))
);
--> statement-breakpoint
CREATE TABLE "narration_corrections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"old_narration" text NOT NULL,
	"new_narration" text NOT NULL,
	"corrected_by" uuid NOT NULL,
	"corrected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"fiscal_year" text NOT NULL,
	"period" text NOT NULL,
	"opening_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"debit_total" numeric(18, 2) DEFAULT '0' NOT NULL,
	"credit_total" numeric(18, 2) DEFAULT '0' NOT NULL,
	"closing_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fy_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"fiscal_year" text NOT NULL,
	"total_revenue" numeric(18, 2),
	"total_expenses" numeric(18, 2),
	"net_profit" numeric(18, 2),
	"retained_earnings" numeric(18, 2),
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "journal_entry_view" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"entry_number" text NOT NULL,
	"date" text NOT NULL,
	"narration" text NOT NULL,
	"reference_type" "reference_type",
	"reference_id" uuid,
	"status" "je_status",
	"fiscal_year" text NOT NULL,
	"total_debit" numeric(18, 2),
	"total_credit" numeric(18, 2),
	"line_count" integer,
	"created_by_name" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "entry_number_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"fiscal_year" text NOT NULL,
	"next_val" text DEFAULT '1' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiscal_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"year" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "fy_status" DEFAULT 'open' NOT NULL,
	"closed_by" uuid,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "projector_state" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"projector_name" text NOT NULL,
	"last_processed_sequence" text DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_cache_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"fiscal_year" text NOT NULL,
	"cache_version" text DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_cash_flow_overrides" ADD CONSTRAINT "account_cash_flow_overrides_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_tags" ADD CONSTRAINT "account_tags_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_reversal_of_fk" FOREIGN KEY ("reversal_of") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "narration_corrections" ADD CONSTRAINT "narration_corrections_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "narration_corrections" ADD CONSTRAINT "narration_corrections_corrected_by_users_id_fk" FOREIGN KEY ("corrected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_view" ADD CONSTRAINT "journal_entry_view_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_cash_flow_overrides_tenant_id_account_id_unique" ON "account_cash_flow_overrides" USING btree ("tenant_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_tags_account_id_tag_unique" ON "account_tags" USING btree ("account_id","tag");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_tenant_id_code_unique" ON "accounts" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "accounts_tenant_id_is_leaf_idx" ON "accounts" USING btree ("tenant_id","is_leaf");--> statement-breakpoint
CREATE UNIQUE INDEX "cash_flow_default_mapping_sub_type_unique" ON "cash_flow_default_mapping" USING btree ("sub_type");--> statement-breakpoint
CREATE UNIQUE INDEX "journal_entries_tenant_id_entry_number_unique" ON "journal_entries" USING btree ("tenant_id","entry_number");--> statement-breakpoint
CREATE UNIQUE INDEX "account_balances_tenant_account_fy_period_unique" ON "account_balances" USING btree ("tenant_id","account_id","fiscal_year","period");--> statement-breakpoint
CREATE INDEX "account_balances_tenant_fy_idx" ON "account_balances" USING btree ("tenant_id","fiscal_year");--> statement-breakpoint
CREATE UNIQUE INDEX "fy_summaries_tenant_fy_unique" ON "fy_summaries" USING btree ("tenant_id","fiscal_year");--> statement-breakpoint
CREATE INDEX "journal_entry_view_tenant_fy_idx" ON "journal_entry_view" USING btree ("tenant_id","fiscal_year");--> statement-breakpoint
CREATE INDEX "journal_entry_view_status_idx" ON "journal_entry_view" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "entry_number_counters_tenant_fy_unique" ON "entry_number_counters" USING btree ("tenant_id","fiscal_year");--> statement-breakpoint
CREATE UNIQUE INDEX "fiscal_years_tenant_id_year_unique" ON "fiscal_years" USING btree ("tenant_id","year");--> statement-breakpoint
CREATE INDEX "fiscal_years_tenant_status_idx" ON "fiscal_years" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "projector_state_tenant_name_unique" ON "projector_state" USING btree ("tenant_id","projector_name");--> statement-breakpoint
CREATE INDEX "projector_state_tenant_idx" ON "projector_state" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "report_cache_versions_tenant_fy_unique" ON "report_cache_versions" USING btree ("tenant_id","fiscal_year");