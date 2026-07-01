CREATE TABLE "gym"."gym_memberships" (
	"gym_id" char(24),
	"member_id" char(24),
	"joined_at" timestamp with time zone NOT NULL,
	CONSTRAINT "gym_memberships_pkey" PRIMARY KEY("gym_id","member_id")
);
--> statement-breakpoint
CREATE INDEX "gym_memberships_member_id_index" ON "gym"."gym_memberships" ("member_id");--> statement-breakpoint
ALTER TABLE "gym"."gym_memberships" ADD CONSTRAINT "gym_memberships_gym_id_gyms_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"."gyms"("id") ON DELETE CASCADE;