-- Migration 0046: billing — tenant plan + subscriptions
-- B1 of the payments track: tenants gain a plan (default free) and a
-- subscriptions table for provider records (populated by the webhook).

ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "plan" text NOT NULL DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "plan_status" text NOT NULL DEFAULT 'active';--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "plan" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "provider" text NOT NULL DEFAULT 'razorpay',
  "provider_subscription_id" text,
  "amount_paise" bigint NOT NULL DEFAULT 0,
  "currency" text NOT NULL DEFAULT 'INR',
  "period" text NOT NULL DEFAULT 'monthly',
  "current_period_end" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint

ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='subscriptions') THEN
    CREATE POLICY tenant_isolation ON subscriptions
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
END $$;--> statement-breakpoint
