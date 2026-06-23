CREATE ROLE climbing_role LOGIN PASSWORD 'climbing_local';

GRANT CONNECT, CREATE ON DATABASE kryno TO climbing_role;
