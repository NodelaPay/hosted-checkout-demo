CREATE TYPE "public"."payment_status" AS ENUM('creating', 'pending', 'paid', 'cancelled', 'expired');--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'paid';--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"guest_id" uuid NOT NULL,
	"reference" varchar(120) NOT NULL,
	"invoice_id" varchar(100),
	"checkout_url" varchar(1000),
	"status" "payment_status" DEFAULT 'creating' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_reference_idx" ON "payments" USING btree ("reference");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_invoice_idx" ON "payments" USING btree ("invoice_id");