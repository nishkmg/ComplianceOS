CREATE TABLE IF NOT EXISTS "hsn_master" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" varchar(8) NOT NULL,
  "description" text NOT NULL,
  "gst_rate" numeric(5,2),
  "effective_from" date NOT NULL,
  "effective_to" date,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "hsn_master_code_unique" ON "hsn_master" ("code");
CREATE INDEX IF NOT EXISTS "hsn_master_effective_from_idx" ON "hsn_master" ("effective_from");
