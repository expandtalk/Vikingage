#!/usr/bin/env bash
# Backfyller search_document.embedding via edge-funktionen embed-search (gte-small).
# Adaptiv batch: försöker 10, faller tillbaka till 5 vid WORKER_RESOURCE_LIMIT.
# Kör: bash scripts/backfill-embeddings.sh   (säker att avbryta/återuppta — idempotent)
set -uo pipefail
ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udWlmbWNqc3BlYWF1emVoYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzQ1MzQsImV4cCI6MjA2MzYxMDUzNH0.ZkAhIwMPRe4lgAH8MxUCNjM39Vh4hyk9IVdmX0jC-z8"
URL="https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/embed-search"
BATCH=10
FAILS=0
while true; do
  RES=$(curl -s --max-time 120 -X POST "$URL" -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" -d "{\"batch\":$BATCH}")
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
