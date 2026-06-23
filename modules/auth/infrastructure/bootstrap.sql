CREATE ROLE auth_role LOGIN PASSWORD 'auth_local';

GRANT CONNECT, CREATE ON DATABASE kryno TO auth_role;
