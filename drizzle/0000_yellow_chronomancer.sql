CREATE TYPE "public"."product_category" AS ENUM('Phones', 'Computers', 'Smart Watches', 'Headphones', 'Accessories');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending_payment');--> statement-breakpoint
CREATE TYPE "public"."shipping_method" AS ENUM('free', 'express', 'schedule');--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"slug" varchar(120) PRIMARY KEY NOT NULL,
	"category" varchar(80) NOT NULL,
	"title" varchar(200) NOT NULL,
	"summary" text NOT NULL,
	"image" varchar(250) NOT NULL,
	"read_time" varchar(30) NOT NULL,
	"paragraphs" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"guest_id" uuid NOT NULL,
	"product_id" varchar(100) NOT NULL,
	"quantity" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_guest_id_product_id_pk" PRIMARY KEY("guest_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(250) NOT NULL,
	"short_name" varchar(180) NOT NULL,
	"price" integer NOT NULL,
	"old_price" integer,
	"image" varchar(250) NOT NULL,
	"category" "product_category" NOT NULL,
	"brand" varchar(80) NOT NULL,
	"color" varchar(80) NOT NULL,
	"memory" varchar(30),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"label" varchar(80) NOT NULL,
	"tag" varchar(30) NOT NULL,
	"street" varchar(200) NOT NULL,
	"city" varchar(120) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_drafts" (
	"guest_id" uuid PRIMARY KEY NOT NULL,
	"address_id" uuid,
	"shipping_method" "shipping_method" DEFAULT 'free' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"status" "order_status" DEFAULT 'pending_payment' NOT NULL,
	"address" jsonb NOT NULL,
	"items" jsonb NOT NULL,
	"shipping_method" "shipping_method" NOT NULL,
	"subtotal" integer NOT NULL,
	"discount" integer NOT NULL,
	"tax" integer NOT NULL,
	"shipping" integer NOT NULL,
	"total" integer NOT NULL,
	"promo_code" varchar(30),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(80) NOT NULL,
	"last_name" varchar(80) NOT NULL,
	"email" varchar(254) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"guest_id" uuid NOT NULL,
	"product_id" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_guest_id_product_id_pk" PRIMARY KEY("guest_id","product_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "orders_guest_idempotency_idx" ON "orders" USING btree ("guest_id","idempotency_key");