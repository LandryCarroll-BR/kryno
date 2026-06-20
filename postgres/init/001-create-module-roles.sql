CREATE ROLE auth_role LOGIN PASSWORD 'auth_local';

GRANT CONNECT, CREATE ON DATABASE kryno TO auth_role;

CREATE SCHEMA auth AUTHORIZATION auth_role;

REVOKE ALL ON SCHEMA auth FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM auth_role;

ALTER ROLE auth_role SET search_path = auth;
