CREATE TABLE "auth"."sessions" (
	"id" char(24) PRIMARY KEY,
	"userId" char(24) NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"secretHash" bytea NOT NULL,
	"lastVerifiedAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" char(24) PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"passwordHash" bytea NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"role" text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
