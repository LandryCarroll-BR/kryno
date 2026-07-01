CREATE TABLE "kryno_auth"."sessions" (
	"id" char(24) PRIMARY KEY,
	"user_id" char(24) NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"secret_hash" bytea NOT NULL,
	"last_verified_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kryno_auth"."users" (
	"id" char(24) PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"password_hash" bytea NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"role" text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kryno_auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "kryno_auth"."users"("id") ON DELETE CASCADE;