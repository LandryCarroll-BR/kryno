DELETE FROM "kryno_gym"."gym_routes"
WHERE "boulder_id" IS NULL;--> statement-breakpoint
DELETE FROM "kryno_gym"."gym_routes"
WHERE "boulder_id" IN (
  SELECT "boulder_id"
  FROM "kryno_gym"."gym_routes"
  GROUP BY "boulder_id"
  HAVING COUNT(*) > 1
);--> statement-breakpoint
ALTER TABLE "kryno_gym"."gym_routes" ALTER COLUMN "boulder_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "gym_routes_boulder_id_unique" ON "kryno_gym"."gym_routes" ("boulder_id");
