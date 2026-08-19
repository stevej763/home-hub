#!/bin/sh
# initdb.sh
# Applies the weather-hub schema migrations, in order, against a target Postgres instance.
#
# Required env vars: DB_HOST, DB_PASSWORD
# Optional env vars: DB_USER (default postgres), DB_NAME (default weatherhub), DB_PORT (default 5432)

: "${DB_HOST:?DB_HOST must be set}"
: "${DB_PASSWORD:?DB_PASSWORD must be set}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-weatherhub}"
DB_PORT="${DB_PORT:-5432}"

export PGPASSWORD="$DB_PASSWORD"

# psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -a -f 000_createdb.sql
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -a -f 001_device.sql
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -a -f 002_temperature.sql
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -a -f 003_humidity.sql
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -a -f 004_pressure.sql
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -a -f 005_add_device_last_active_at_column.sql
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -a -f 006_location.sql
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -a -f 007_add_deveice_location_fk.sql
