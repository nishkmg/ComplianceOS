CREATE TYPE "public"."ocr_scan_type" AS ENUM('invoice', 'receipt');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('purchase_receipt', 'sales_delivery', 'stock_adjustment', 'warehouse_transfer', 'opening_balance');--> statement-breakpoint
CREATE TYPE "public"."valuation_method" AS ENUM('fifo', 'weighted_average');--> statement-breakpoint
CREATE TABLE "product_tax_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"hsn_code" text NOT NULL,
	"gst_rate" numeric(5, 2) NOT NULL,
	"cess_rate" numeric(5, 2) DEFAULT '0',
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"hsn_code" text NOT NULL,
	"unit_of_measure" text DEFAULT 'nos' NOT NULL,
	"purchase_rate" numeric(18, 2),
	"sales_rate" numeric(18, 2),
	"gst_rate" numeric(5, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_layers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid,
	"batch_number" text,
	"quantity" numeric(18, 4) NOT NULL,
	"remaining_quantity" numeric(18, 4) NOT NULL,
	"unit_cost" numeric(18, 2) NOT NULL,
	"total_value" numeric(18, 2) NOT NULL,
	"receipt_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid,
	"movement_type" "stock_movement_type" NOT NULL,
	"quantity" numeric(18, 4) NOT NULL,
	"unit_cost" numeric(18, 2),
	"total_value" numeric(18, 2),
	"reference_type" text,
	"reference_id" uuid,
	"narration" text,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_stock" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid,
	"quantity" numeric(18, 4) DEFAULT '0' NOT NULL,
	"weighted_average_cost" numeric(18, 2),
	"last_movement_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"valuation_method" "valuation_method" DEFAULT 'fifo' NOT NULL,
	"default_warehouse_id" uuid,
	"auto_create_je" text DEFAULT 'true' NOT NULL,
	"inventory_asset_account_id" uuid,
	"cogs_account_id" uuid,
	"adjustment_account_id" uuid
);
--> statement-breakpoint
ALTER TABLE "ocr_scan_results" ADD COLUMN "scan_type" "ocr_scan_type" DEFAULT 'invoice' NOT NULL;--> statement-breakpoint
ALTER TABLE "ocr_scan_results" ADD COLUMN "parsed_vendor_address" text;--> statement-breakpoint
ALTER TABLE "ocr_scan_results" ADD COLUMN "parsed_vendor_gstin" text;--> statement-breakpoint
ALTER TABLE "ocr_scan_results" ADD COLUMN "parsed_expense_category" text;--> statement-breakpoint
ALTER TABLE "ocr_scan_results" ADD COLUMN "linked_journal_entry_id" uuid;--> statement-breakpoint
ALTER TABLE "inventory_layers" ADD CONSTRAINT "inventory_layers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_tax_categories_tenant_hsn_unique" ON "product_tax_categories" USING btree ("tenant_id","hsn_code");--> statement-breakpoint
CREATE UNIQUE INDEX "products_tenant_id_sku_unique" ON "products" USING btree ("tenant_id","sku");--> statement-breakpoint
CREATE INDEX "products_tenant_id_hsn_code_idx" ON "products" USING btree ("tenant_id","hsn_code");--> statement-breakpoint
CREATE INDEX "products_tenant_id_is_active_idx" ON "products" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE INDEX "inventory_layers_tenant_product_idx" ON "inventory_layers" USING btree ("tenant_id","product_id");--> statement-breakpoint
CREATE INDEX "inventory_layers_remaining_qty_idx" ON "inventory_layers" USING btree ("remaining_quantity");--> statement-breakpoint
CREATE INDEX "inventory_layers_receipt_date_idx" ON "inventory_layers" USING btree ("receipt_date");--> statement-breakpoint
CREATE INDEX "stock_movements_tenant_product_idx" ON "stock_movements" USING btree ("tenant_id","product_id");--> statement-breakpoint
CREATE INDEX "stock_movements_type_idx" ON "stock_movements" USING btree ("movement_type");--> statement-breakpoint
CREATE INDEX "stock_movements_reference_idx" ON "stock_movements" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_stock_tenant_product_warehouse_unique" ON "warehouse_stock" USING btree ("tenant_id","product_id","warehouse_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_config_tenant_id_unique" ON "inventory_config" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ocr_scan_results_scan_type_idx" ON "ocr_scan_results" USING btree ("scan_type");