CREATE TABLE "climbing"."boulders" (
	"id" char(24) PRIMARY KEY,
	"creator_climber_id" char(24) NOT NULL,
	"name" text NOT NULL,
	"grade" text NOT NULL,
	"wall_angles" text[] NOT NULL,
	"movement_styles" text[] NOT NULL
);
