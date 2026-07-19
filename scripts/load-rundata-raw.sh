#!/usr/bin/env bash
# P0: laddar scripts/data/rundata-raw/*.sql till Supabase via psql (session-pooler).
# Lösenord läses ur .env (SUPABASE_DB_PASSWORD) — skrivs aldrig ut.
# Kör: bash scripts/load-rundata-raw.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PW=$(grep '^SUPABASE_DB_PASSWORD=' .env | cut -d= -f2- | tr -d '\r')
[ -z "$PW" ] && { echo "SUPABASE_DB_PASSWORD saknas i .env"; exit 1; }
export PGPASSWORD="$PW"
export PGCLIENTENCODING=UTF8

URL="postgresql://postgres.mnuifmcjspeaauzehasj@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"
DIR="scripts/data/rundata-raw"

echo "== Schema =="
psql "$URL" -v ON_ERROR_STOP=1 -q -f "$DIR/000_schema.sql"

for f in "$DIR"/0*_data.sql "$DIR"/1*_data.sql; do
  [ -e "$f" ] || continue
  echo "== $(basename "$f") =="
  psql "$URL" -v ON_ERROR_STOP=1 -q -f "$f"
done

echo "== Verifiering: radantal per tabell =="
psql "$URL" -v ON_ERROR_STOP=1 -At -c "
select t.tablename || '=' || (xpath('/row/cnt/text()',
  query_to_xml(format('select count(*) as cnt from rundata_raw.%I', t.tablename), false, true, '')))[1]::text
from pg_tables t where t.schemaname='rundata_raw' and t.tablename <> '_meta'
order by t.tablename;"
echo "KLART"
