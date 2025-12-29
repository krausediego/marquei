-- Create Keycloak schema
CREATE SCHEMA IF NOT EXISTS keycloak;

-- Grant privileges on schema
GRANT ALL ON SCHEMA keycloak TO marquei;
GRANT ALL ON ALL TABLES IN SCHEMA keycloak TO marquei;
ALTER DEFAULT PRIVILEGES IN SCHEMA keycloak GRANT ALL ON TABLES TO marquei;


