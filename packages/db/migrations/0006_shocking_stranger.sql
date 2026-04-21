ALTER TABLE "payroll_config" ADD COLUMN "salary_expense_account_id" uuid;--> statement-breakpoint
ALTER TABLE "payroll_config" ADD COLUMN "pf_payable_account_id" uuid;--> statement-breakpoint
ALTER TABLE "payroll_config" ADD COLUMN "esi_payable_account_id" uuid;--> statement-breakpoint
ALTER TABLE "payroll_config" ADD COLUMN "tds_payable_account_id" uuid;--> statement-breakpoint
ALTER TABLE "payroll_config" ADD COLUMN "pt_payable_account_id" uuid;--> statement-breakpoint
ALTER TABLE "payroll_config" ADD COLUMN "employee_payable_account_id" uuid;