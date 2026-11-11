CREATE TABLE "product_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar(100) NOT NULL,
	"guest_id" uuid,
	"author_name" varchar(80) NOT NULL,
	"rating" integer NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "product_reviews_guest_idx" ON "product_reviews" USING btree ("product_id","guest_id");