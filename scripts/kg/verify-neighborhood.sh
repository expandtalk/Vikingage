#!/usr/bin/env bash
# scripts/kg/verify-neighborhood.sh — spot-check att grafen nu är traverserbar för navigation.
# Kör: bash scripts/kg/verify-neighborhood.sh   (läser .env i repo-roten)
set -euo pipefail
PW=$(grep '^SUPABASE_DB_PASSWORD=' .env | cut -d= -f2- | tr -d '\r"')
CONN="postgresql://postgres.mnuifmcjspeaauzehasj@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

# Välj en kung som har både dynasti- och kungsgårds-kant.
KING=$(PGPASSWORD="$PW" psql "$CONN" -At -c \
  "select r1.subject_id
     from relationship r1
     join relationship r2 on r2.subject_id = r1.subject_id and r2.predicate='belongs_to_dynasty'
    where r1.predicate='has_estate' limit 1;")
if [ -z "$KING" ]; then echo "FAIL: ingen kung med både has_estate och belongs_to_dynasty"; exit 1; fi

echo "Testkung: $KING"
PGPASSWORD="$PW" psql "$CONN" -At -F' -> ' -c \
  "select predicate, other_type, other_label from graph_neighborhood('$KING'::uuid) order by predicate;"

# Assertion: grannskapet ska innehålla navigerings-predikaten.
HITS=$(PGPASSWORD="$PW" psql "$CONN" -At -c \
  "select count(*) from graph_neighborhood('$KING'::uuid) where predicate in ('has_estate','belongs_to_dynasty');")
if [ "$HITS" -ge 2 ]; then
  echo "OK: grafen är traverserbar för navigation (has_estate + belongs_to_dynasty i grannskapet)"
else
  echo "FAIL: förväntade navigerings-predikat saknas i grannskapet (hits=$HITS)"; exit 1
fi
