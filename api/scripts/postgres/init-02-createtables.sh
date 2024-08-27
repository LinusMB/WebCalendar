#!/bin/sh

set -e

db_name="calendar"
db_name_test="${db_name}_test"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db_name" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS btree_gist;
    
    CREATE TABLE events (
      id          SERIAL PRIMARY KEY,
      uuid        VARCHAR(64) NOT NULL UNIQUE,
      title	      TEXT NOT NULL,
      description TEXT NOT NULL,
      date_from   TIMESTAMP NOT NULL,
      date_to     TIMESTAMP NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE events ADD CONSTRAINT event_overlap EXCLUDE USING gist (
        tsrange(date_from, date_to, '[)') WITH &&
    );
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db_name_test" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS btree_gist;

    CREATE TABLE events (
      id          SERIAL PRIMARY KEY,
      uuid        VARCHAR(64) NOT NULL UNIQUE,
      title	      TEXT NOT NULL,
      description TEXT NOT NULL,
      date_from   TIMESTAMP NOT NULL,
      date_to     TIMESTAMP NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE events ADD CONSTRAINT event_overlap EXCLUDE USING gist (
        tsrange(date_from, date_to, '[)') WITH &&
    );
EOSQL
