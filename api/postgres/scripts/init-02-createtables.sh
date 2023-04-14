#!/bin/sh

set -e

db_name="calendar"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db_name" <<-EOSQL
    CREATE TABLE events (
      id          SERIAL PRIMARY KEY,
      uuid        VARCHAR(64) NOT NULL UNIQUE,
      title	      TEXT NOT NULL,
      description TEXT NOT NULL,
      date_from   DATE NOT NULL,
      date_to     DATE NOT NULL,
      created_at  TIMESTAMP NOT NULL
    );
EOSQL
