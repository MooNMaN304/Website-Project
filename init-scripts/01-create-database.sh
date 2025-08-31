#!/bin/bash
set -e

# Get database name from environment variable, fallback to web_site
TARGET_DB_NAME="${DB_NAME:-web_site}"

echo "Initializing database: $TARGET_DB_NAME"

# Check if we're already in the target database (when POSTGRES_DB is set to target)
if [ "$POSTGRES_DB" = "$TARGET_DB_NAME" ]; then
    echo "Database $TARGET_DB_NAME is already the default database"
else
    # Create the target database if it doesn't exist
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        SELECT 'CREATE DATABASE ${TARGET_DB_NAME}'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${TARGET_DB_NAME}')\gexec
EOSQL
fi

echo "Database $TARGET_DB_NAME initialized successfully"
