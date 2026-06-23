CREATE TABLE "climbing"."climbing_attempts" (
	"id" char(24) PRIMARY KEY,
	"session_id" char(24) NOT NULL,
	"boulder_id" char(24) NOT NULL,
	"ordinal" integer NOT NULL,
	"outcome" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "climbing_attempts_session_boulder_ordinal_unique" ON "climbing"."climbing_attempts" ("session_id","boulder_id","ordinal");--> statement-breakpoint
ALTER TABLE "climbing"."climbing_attempts" ADD CONSTRAINT "climbing_attempts_session_id_climbing_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "climbing"."climbing_sessions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "climbing"."climbing_attempts" ADD CONSTRAINT "climbing_attempts_boulder_id_boulders_id_fkey" FOREIGN KEY ("boulder_id") REFERENCES "climbing"."boulders"("id") ON DELETE CASCADE;