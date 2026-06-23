ALTER TABLE "climbing"."boulders" RENAME COLUMN "wall_angles" TO "wall_angle";
--> statement-breakpoint
ALTER TABLE "climbing"."boulders" RENAME COLUMN "movement_styles" TO "movement_style";
--> statement-breakpoint
ALTER TABLE "climbing"."boulders" ALTER COLUMN "wall_angle" SET DATA TYPE text USING "wall_angle"[1];
--> statement-breakpoint
ALTER TABLE "climbing"."boulders" ALTER COLUMN "movement_style" SET DATA TYPE text USING "movement_style"[1];
