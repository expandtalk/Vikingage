# Kameral värdering & jordnatur — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Skilja `jordnatur` från `fiscal_system` (städa överlappningen) och införa en kameral värderingsmodell (`estate_valuations` med jordetal i penningland).

**Architecture:** Additiva SQL-migrationer mot live-DB via psql/pooler (se [[psql-prod-migration-reference]]). Kontrollerade värden i `vocabulary`. Ny värderingstabell + omräkningsfunktion. Bygger på [[transfer-mechanisms-model]].

**Tech Stack:** PostgreSQL (Supabase), psql, `supabase gen types --linked`.

## Global Constraints

- **Apply:** `PGPASSWORD="$PW" PGCLIENTENCODING=UTF8 psql "postgresql://postgres.mnuifmcjspeaauzehasj@aws-0-eu-north-1.pooler.supabase.com:5432/postgres" -v ON_ERROR_STOP=1 -f <fil>` (`PW`=`SUPABASE_DB_PASSWORD` ur `.env`). ALDRIG `supabase db push`.
- **ASCII-koder**, å/ä bara i `label_sv`.
- **Icke-destruktivt** utom: (a) `land_skatt`→jordnatur-migrering (10 rader), (b) DELETE av 5 felplacerade `fiscal_system`-koder (0 data refererar dem efter a).
- **`vocabulary` PK = (scheme, code)**.

## Filstruktur

- `supabase/migrations/20260724170000_jordnatur.sql`
- `supabase/migrations/20260724170100_estate_valuations.sql`
- `src/integrations/supabase/types.ts` (regen)
- `scripts/kg/verify-cameral.sh` (verifiering)

## Referens (verifierat 2026-07-24)

- `estate_holdings.fiscal_system`-data: `ledung`(12), `land_skatt`(10, hex `6c616e645f736b617474`=ren ASCII), `mynt`(5). Ingen data använder skatte/fralse/krono/kyrka (bara vokabulärkoder ur transfer-planen).
- Trigger `check_estate_holding_vocab()` validerar acquired_via/holder_kind/from_holder_kind/fiscal_system mot `vocabulary`. Ska utökas med `jordnatur`.
- RLS-mönster (estate_holdings): `_admin` (ALL, `is_admin()`), `_read` (SELECT, `true`). `is_admin()` finns.

---

## Task 1: jordnatur-dimension + fiscal_system-städning

**Files:** Create `supabase/migrations/20260724170000_jordnatur.sql`

**Interfaces:** Produces `estate_holdings.jordnatur text` (validerad); `vocabulary` scheme `jordnatur` (4); `fiscal_system` bantad till ledung/rusttjanst/mynt/uppsala_od.

- [ ] **Step 1: Test-först**

Run: `PGPASSWORD="$PW" psql "$CONN" -At -c "select count(*) from information_schema.columns where table_name='estate_holdings' and column_name='jordnatur'"` → `0`
Run: `PGPASSWORD="$PW" psql "$CONN" -At -c "select count(*) from estate_holdings where fiscal_system='land_skatt'"` → `10`

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260724170000_jordnatur.sql
-- 1. Kolumn.
ALTER TABLE estate_holdings ADD COLUMN IF NOT EXISTS jordnatur text;

-- 2. jordnatur-vokabulär.
INSERT INTO vocabulary (scheme, code, label_sv, label_en) VALUES
  ('jordnatur','skatte','skattejord','tax land'),
  ('jordnatur','fralse','frälsejord','noble land'),
  ('jordnatur','krono','kronojord','crown land'),
  ('jordnatur','kyrko','kyrkojord','church land')
ON CONFLICT (scheme, code) DO NOTHING;

-- 3. Utöka valideringstriggern med jordnatur (behåll övriga kontroller).
CREATE OR REPLACE FUNCTION public.check_estate_holding_vocab()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.acquired_via IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='acquisition_mode' AND code=NEW.acquired_via) THEN
    RAISE EXCEPTION 'estate_holdings: okänd acquired_via "%"', NEW.acquired_via; END IF;
  IF NEW.holder_kind IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='holder_kind' AND code=NEW.holder_kind) THEN
    RAISE EXCEPTION 'estate_holdings: okänd holder_kind "%"', NEW.holder_kind; END IF;
  IF NEW.from_holder_kind IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='holder_kind' AND code=NEW.from_holder_kind) THEN
    RAISE EXCEPTION 'estate_holdings: okänd from_holder_kind "%"', NEW.from_holder_kind; END IF;
  IF NEW.fiscal_system IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='fiscal_system' AND code=NEW.fiscal_system) THEN
    RAISE EXCEPTION 'estate_holdings: okänd fiscal_system "%"', NEW.fiscal_system; END IF;
  IF NEW.jordnatur IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='jordnatur' AND code=NEW.jordnatur) THEN
    RAISE EXCEPTION 'estate_holdings: okänd jordnatur "%"', NEW.jordnatur; END IF;
  RETURN NEW;
END $$;

-- 4. Datamigrering: land_skatt = årlig jordskatt = jordnatur skatte. Render okänt → NULL.
UPDATE estate_holdings SET jordnatur='skatte', fiscal_system=NULL WHERE fiscal_system='land_skatt';

-- 5. Städa bort felplacerade fiscal_system-koder (jordnatur-koder + migrerad land_skatt).
--    Inga estate_holdings-rader refererar dem efter steg 4.
DELETE FROM vocabulary WHERE scheme='fiscal_system' AND code IN ('skatte','fralse','krona','krono','kyrka','land_skatt');
```

- [ ] **Step 3: Applicera** — `PGPASSWORD=... psql ... -f supabase/migrations/20260724170000_jordnatur.sql`. Expected: ALTER/INSERT/CREATE FUNCTION/UPDATE 10/DELETE.

- [ ] **Step 4: Verifiera**

Run: jordnatur-vokabulär = 4: `select count(*) from vocabulary where scheme='jordnatur'` → `4`
Run: fiscal_system-vokabulär = 4: `select count(*) from vocabulary where scheme='fiscal_system'` → `4` (ledung/rusttjanst/mynt/uppsala_od)
Run: `select count(*) from estate_holdings where fiscal_system='land_skatt'` → `0`; `select count(*) from estate_holdings where jordnatur='skatte'` → `10`
Run (befintlig data validerar): `BEGIN; UPDATE estate_holdings SET updated_at=now(); ROLLBACK;` → `UPDATE 27` utan fel.

- [ ] **Step 5: Commit**
```bash
git add supabase/migrations/20260724170000_jordnatur.sql
git commit -m "feat(estates): jordnatur dimension + split from fiscal_system (land_skatt->skatte, cleanup)"
```

---

## Task 2: estate_valuations + jordetal

**Files:** Create `supabase/migrations/20260724170100_estate_valuations.sql`

**Interfaces:** Produces tabell `estate_valuations` + funktion `jordetal_to_penningland(int,int,int,int) -> int`.

- [ ] **Step 1: Test-först** — `select count(*) from information_schema.tables where table_name='estate_valuations'` → `0`

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260724170100_estate_valuations.sql
CREATE TABLE IF NOT EXISTS estate_valuations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  year int NOT NULL CHECK (year BETWEEN 800 AND 1700),
  jordetal_penningland int CHECK (jordetal_penningland >= 0),
  jordetal_notation text,
  cameral_units text,
  source text,
  confidence text DEFAULT 'probable',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_estate_valuations_estate_year ON estate_valuations (estate_id, year);

ALTER TABLE estate_valuations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS valuations_read ON estate_valuations;
CREATE POLICY valuations_read ON estate_valuations FOR SELECT USING (true);
DROP POLICY IF EXISTS valuations_admin ON estate_valuations;
CREATE POLICY valuations_admin ON estate_valuations FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Jordetal -> kanoniskt penningland. 1 markland=192, 1 öresland=24, 1 örtugland=8 penningland.
CREATE OR REPLACE FUNCTION jordetal_to_penningland(markland int, oresland int, ortugland int, penningland int)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(markland,0)*192 + coalesce(oresland,0)*24 + coalesce(ortugland,0)*8 + coalesce(penningland,0)
$$;
```

- [ ] **Step 3: Applicera** via psql. Expected: CREATE TABLE/INDEX/POLICY×2/FUNCTION.

- [ ] **Step 4: Verifiera**

Run: `select count(*) from information_schema.tables where table_name='estate_valuations'` → `1`
Run: `select jordetal_to_penningland(0,3,0,4)` → `76`; `select jordetal_to_penningland(1,0,0,0)` → `192`
Run RLS: `select relrowsecurity from pg_class where relname='estate_valuations'` → `t`

- [ ] **Step 5: Commit**
```bash
git add supabase/migrations/20260724170100_estate_valuations.sql
git commit -m "feat(estates): estate_valuations table + jordetal_to_penningland()"
```

---

## Task 3: Regen types + verifieringsskript

**Files:** Modify `src/integrations/supabase/types.ts`; Create `scripts/kg/verify-cameral.sh`

- [ ] **Step 1: Regen types (--linked, ej Docker)**
```bash
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```
- [ ] **Step 2: Verifiera** — `grep -c "estate_valuations" src/integrations/supabase/types.ts` → ≥1; `grep -c "jordnatur" src/integrations/supabase/types.ts` → ≥1.
- [ ] **Step 3: tsc** — `npx tsc --noEmit` → exit 0.

- [ ] **Step 4: Verifieringsskript (rollback-fixtur)**
```bash
#!/usr/bin/env bash
# scripts/kg/verify-cameral.sh — bevisar jordnatur + estate_valuations (rollback).
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
  RAISE NOTICE 'OK: estate_valuations bär UH 1540-fixtur, jordetal=76 pl';
END $$;
ROLLBACK;
SQL
echo "OK: kameral modell verifierad (rollback)"
```
Run: `bash scripts/kg/verify-cameral.sh` → NOTICE OK + "OK: kameral modell verifierad".

- [ ] **Step 5: Commit**
```bash
git add src/integrations/supabase/types.ts scripts/kg/verify-cameral.sh
git commit -m "chore(types): regen for estate_valuations/jordnatur + cameral rollback fixture"
```

---

## Self-Review
- **Spec-täckning:** jordnatur (3.1)→T1; fiscal cleanup (3.2)→T1; estate_valuations (3.3)→T2; jordetal penningland+funktion (3.4)→T2; trigger jordnatur (3.5)→T1; typer→T3; SDHK/UH-exempel→T3-fixtur.
- **Placeholder-scan:** ingen; all SQL komplett.
- **Typ-konsistens:** jordnatur-koder (skatte/fralse/krono/kyrko) konsekventa; DELETE täcker både 'krona'/'krono' och 'kyrka' (transfer-planen la 'kyrka'/'krono') för säkerhets skull.
- **Beroende:** T1 (kolumn+vocab+trigger) → T2 (tabell) → T3 (typer).
