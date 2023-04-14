#!/bin/sh

set -e

db_name="calendar"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE $db_name;
EOSQL
