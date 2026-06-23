CREATE TABLE "climbing"."climbing_sessions" (
	"id" char(24) PRIMARY KEY,
	"climber_id" char(24) NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "climbing_sessions_one_active_per_climber" ON "climbing"."climbing_sessions" ("climber_id") WHERE "ended_at" is null;