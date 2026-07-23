#!/usr/bin/env bash
# scripts/kg/verify-transfer-model.sh — bevisar att modellen bär morgongåve-fallet SDHK 5485.
# Allt sker i EN transaktion som RULLAS TILLBAKA — ingen permanent data skapas.
set -euo pipefail
PW=$(grep '^SUPABASE_DB_PASSWORD=' .env | cut -d= -f2- | tr -d '\r"')
CONN="postgresql://postgres.mnuifmcjspeaauzehasj@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

PGPASSWORD="$PW" PGCLIENTENCODING=UTF8 psql "$CONN" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
-- Mottagaren (finns ej i historical_kings) läggs in som person.
WITH giver AS (SELECT id FROM historical_kings WHERE name='Magnus Eriksson' LIMIT 1),
     rcv AS (
       -- name + region är NOT NULL i historical_kings.
       INSERT INTO historical_kings (name, gender, status, region)
       VALUES ('Gunhild Arvidsdotter [TEST]', 'female', 'historical', 'Sweden') RETURNING id
     ),
     es AS (
       -- lat/lng är NOT NULL i estates; placeholder-koord (rullas tillbaka).
       INSERT INTO estates (name, estate_type, lat, lng, source)
       VALUES ('Nybygge I [TEST]','nybygge',59.30,17.60,'SDHK 5485'),
              ('Nybygge II [TEST]','nybygge',59.31,17.61,'SDHK 5485') RETURNING id
     )
INSERT INTO estate_holdings
  (estate_id, king_id, holder_kind, acquired_via, from_holder_kind, from_king_id, period_start, source, confidence)
SELECT es.id, (SELECT id FROM rcv), 'consort', 'morgongava', 'person',
       (SELECT id FROM giver), 1330, 'SDHK 5485', 'probable'
FROM es;

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM estate_holdings
   WHERE source='SDHK 5485' AND acquired_via='morgongava' AND holder_kind='consort';
  IF n <> 2 THEN RAISE EXCEPTION 'FAIL: forvantade 2 morgongave-holdings, fick %', n; END IF;
  RAISE NOTICE 'OK: 2 morgongave-holdings (SDHK 5485), consort-mottagare, fran Magnus Eriksson';
END $$;
ROLLBACK;
SQL
echo "OK: transfer-modellen bar SDHK 5485-fallet (rollback - ingen permanent data)"
