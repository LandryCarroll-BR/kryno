ALTER TABLE "kryno_climbing"."boulders" ADD COLUMN "created_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "kryno_climbing"."boulders" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "kryno_climbing"."climbing_sessions" ADD COLUMN "created_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "kryno_climbing"."climbing_sessions" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
UPDATE "kryno_climbing"."boulders" SET "created_at" = now(), "updated_at" = now();--> statement-breakpoint
UPDATE "kryno_climbing"."climbing_sessions" SET "created_at" = "started_at", "updated_at" = coalesce("ended_at", "started_at");--> statement-breakpoint
ALTER TABLE "kryno_climbing"."boulders" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "kryno_climbing"."boulders" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "kryno_climbing"."climbing_sessions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "kryno_climbing"."climbing_sessions" ALTER COLUMN "updated_at" SET NOT NULL;
