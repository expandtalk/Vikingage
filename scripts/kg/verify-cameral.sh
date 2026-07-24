#!/usr/bin/env bash
# scripts/kg/verify-cameral.sh — bevisar jordnatur + estate_valuations (rollback, ingen permanent data).
set -euo pipefail
PW=$(grep '^SUPABASE_DB_PASSWORD=' .env | cut -d= -f2- | tr -d '\r"')
CONN="postgresql://postgres.mnuifmcjspeaauzehasj@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"
PGPASSWORD="$PW" PGCLIENTENCODING=UTF8 psql "$CONN" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
WITH e AS (INSERT INTO estates (name, estate_type, lat, lng) VALUES ('Kameraltest [TEST]','nybygge',59.0,17.0) RETURNING id)
INSERT INTO estate_valuations (estate_id, year, jordetal_penningland, jordetal_notation, cameral_units, source)
SELECT e.id, 1540, jordetal_to_penningland(0,3,0,4), '0:3:0:4', '1 sk', 'UH 1540' FROM e;
DO $$ DECLARE v int; BEGIN
  SELECT jordetal_penningland INTO v FROM estate_valuations WHERE source='UH 1540' AND jordetal_notation='0:3:0:4';
  IF v <> 76 THEN RAISE EXCEPTION 'FAIL: jordetal % <> 76', v; END IF;
  RAISE NOTICE 'OK: estate_valuations bar UH 1540-fixtur, jordetal=76 pl';
END $$;
ROLLBACK;
SQL
echo "OK: kameral modell verifierad (rollback)"
