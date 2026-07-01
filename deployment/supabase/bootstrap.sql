-- Run this once in the Supabase SQL editor before applying Drizzle migrations.
-- Replace every CHANGE_ME value with a distinct, generated password first.
-- Supabase's default database is named "postgres".

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'auth_role') THEN
    CREATE ROLE auth_role LOGIN;
  END IF;
END
$$;
ALTER ROLE auth_role LOGIN PASSWORD 'CHANGE_ME_AUTH_ROLE_PASSWORD';
GRANT CONNECT ON DATABASE postgres TO auth_role;
CREATE SCHEMA IF NOT EXISTS kryno_auth;
REVOKE ALL ON SCHEMA kryno_auth FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA kryno_auth TO auth_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'climbing_role') THEN
    CREATE ROLE climbing_role LOGIN;
  END IF;
END
$$;
ALTER ROLE climbing_role LOGIN PASSWORD 'CHANGE_ME_CLIMBING_ROLE_PASSWORD';
GRANT CONNECT ON DATABASE postgres TO climbing_role;
CREATE SCHEMA IF NOT EXISTS kryno_climbing;
REVOKE ALL ON SCHEMA kryno_climbing FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA kryno_climbing TO climbing_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gym_role') THEN
    CREATE ROLE gym_role LOGIN;
  END IF;
END
$$;
ALTER ROLE gym_role LOGIN PASSWORD 'CHANGE_ME_GYM_ROLE_PASSWORD';
GRANT CONNECT ON DATABASE postgres TO gym_role;
CREATE SCHEMA IF NOT EXISTS kryno_gym;
REVOKE ALL ON SCHEMA kryno_gym FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA kryno_gym TO gym_role;

COMMIT;
