CREATE TABLE "kryno_gym"."gym_areas" (
	"id" char(24) PRIMARY KEY,
	"gym_id" char(24) NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kryno_gym"."gym_routes" (
	"id" char(24) PRIMARY KEY,
	"area_id" char(24) NOT NULL,
	"order" integer NOT NULL,
	"position_label" text,
	"set_on" date NOT NULL,
	"setter_name" text,
	"boulder_id" char(24)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "gym_areas_gym_id_lower_name_unique" ON "kryno_gym"."gym_areas" ("gym_id",lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "gym_routes_area_id_order_unique" ON "kryno_gym"."gym_routes" ("area_id","order");--> statement-breakpoint
ALTER TABLE "kryno_gym"."gym_areas" ADD CONSTRAINT "gym_areas_gym_id_gyms_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "kryno_gym"."gyms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "kryno_gym"."gym_routes" ADD CONSTRAINT "gym_routes_area_id_gym_areas_id_fkey" FOREIGN KEY ("area_id") REFERENCES "kryno_gym"."gym_areas"("id") ON DELETE CASCADE;