#!/usr/bin/env bash
# Backfyller search_document.embedding via edge-funktionen embed-search (gte-small).
# Adaptiv batch: försöker 10, faller tillbaka till 5 vid WORKER_RESOURCE_LIMIT.
# Kör: SUPABASE_SERVICE_ROLE_KEY=... bash scripts/backfill-embeddings.sh   (idempotent)
set -uo pipefail
# Privilegierad funktion — kräver service-role-nyckel (inte den publika anon-nyckeln).
# Läser i första hand miljövariabeln; faller tillbaka på .env om den råkar finnas där.
KEY="${SUPABASE_SERVICE_ROLE_KEY:-$(grep '^SUPABASE_SERVICE_ROLE_KEY=' .env 2>/dev/null | cut -d= -f2- | tr -d '\r')}"
[ -z "$KEY" ] && { echo "Sätt SUPABASE_SERVICE_ROLE_KEY (miljövariabel eller .env) — krävs för embed-search."; exit 1; }
URL="https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/embed-search"
BATCH=10
FAILS=0
while true; do
  RES=$(curl -s --max-time 120 -X POST "$URL" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d "{\"batch\":$BATCH}")
  REMAINING=$(echo "$RES" | grep -oE '"remaining":[0-9]+' | cut -d: -f2)
  if [ -z "$REMAINING" ]; then
    FAILS=$((FAILS+1))
    BATCH=5
    echo "$(date +%H:%M:%S) FEL ($FAILS): $RES — backar till batch=$BATCH"
    [ "$FAILS" -ge 30 ] && { echo "För många fel — avbryter."; exit 1; }
    sleep 3
    continue
  fi
  FAILS=0
  echo "$(date +%H:%M:%S) kvar: $REMAINING (batch $BATCH)"
  [ "$REMAINING" -eq 0 ] && break
  sleep 0.3
done
echo "KLART — alla dokument embeddade."
