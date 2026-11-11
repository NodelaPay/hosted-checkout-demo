ALTER TABLE "checkout_drafts" ADD COLUMN "promo_code" varchar(30);--> statement-breakpoint
ALTER TABLE "checkout_drafts" ADD COLUMN "scheduled_date" varchar(10);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "scheduled_date" varchar(10);