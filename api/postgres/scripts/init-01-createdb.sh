#!/bin/sh

set -e

db_name="calendar"
db_name_test="${db_name}_test"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE $db_name;
	CREATE DATABASE $db_name_test;
EOSQL
