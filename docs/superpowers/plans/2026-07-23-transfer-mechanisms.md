# Överföringsmekanismer & morgongåva — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Utöka `estate_holdings` så att en holding bär förvärvsmekanism, givare och fiskalt system på ett kontrollerat, sökbart sätt — med morgongåvan (SDHK 5485) som verifierande fall.

**Architecture:** Additiva SQL-migrationer mot live-DB via psql (session-pooler). Kontrollerade värden i `vocabulary` (scheman `acquisition_mode`/`holder_kind`/`fiscal_system`) + valideringstrigger. Nya givar-kolumner speglar innehavar-polymorfin. Verifiering via psql-count och en rollback-baserad integrationsfixtur.

**Tech Stack:** PostgreSQL (Supabase), migrationsfiler applicerade med psql, `supabase gen types` för TypeScript-typer.

## Global Constraints

- **Icke-destruktivt & additivt:** endast `INSERT ... ON CONFLICT DO NOTHING`, `ALTER TABLE ADD COLUMN IF NOT EXISTS`, `CREATE ... IF NOT EXISTS`. Enda undantag: en `UPDATE` som migrerar `acquired_via='förläning'`→`'forlaning'` (5 rader).
- **Idempotent:** varje migration körbar två gånger med samma resultat.
- **ASCII-koder:** vokabulärkoder är ASCII (`morgongava`, `forlaning`, `fralse`, `uppsala_od`); å/ä bara i `label_sv`.
- **Apply-mekanism (ersätter `supabase db push`):** migrations-historiken är drivad → `db push` FÅR EJ användas. Applicera varje fil via:
  `PGPASSWORD="$PW" psql "postgresql://postgres.mnuifmcjspeaauzehasj@aws-0-eu-north-1.pooler.supabase.com:5432/postgres" -v ON_ERROR_STOP=1 -f <fil>` där `PW` = `SUPABASE_DB_PASSWORD` ur `.env`.
- **Verifiering:** psql-count (`-At -c "select ..."`). `PGCLIENTENCODING` lämnas UTF8 (skriv aldrig icke-ASCII i frågesträngar).
- **`vocabulary` PK = (scheme, code)** → `ON CONFLICT (scheme, code) DO NOTHING`.

---

## Filstruktur

- `supabase/migrations/20260723160000_transfer_vocab.sql` — vokabulär (3 scheman) + `förläning`→`forlaning`
- `supabase/migrations/20260723160100_estate_holdings_transferor.sql` — givar-kolumner + index
- `supabase/migrations/20260723160200_estate_holdings_validate.sql` — valideringstrigger
- `src/integrations/supabase/types.ts` — regenereras (nya kolumner)
- `scripts/kg/verify-transfer-model.sh` — rollback-baserad integrationsfixtur (SDHK 5485)

## Referens (verifierat 2026-07-23)

- `estate_holdings(id, estate_id, king_id, dynasty_id, holder_kind, holder_name, role, acquired_via, from_holder, period_start, period_end, fiscal_system, confidence, source, note, created_at, updated_at)`. Inga CHECK/trigger. `acquired_via`: förläning(5)/null(22). `holder_kind`: king(21)/dynasty(5)/bryte(1). `fiscal_system`: fri text.
- `vocabulary(scheme, code, label_sv, label_en, parent_code, category, ...)`, PK (scheme, code). Befintliga scheman: coord_confidence, coord_source, country, material, material_type, meter, object_category, ornament_style, runetype (inga kollisioner).
- `historical_kings` (212, varav 21 female) — Magnus Eriksson finns; Gunhild Arvidsdotter finns EJ.
- `estates(id, name, estate_type, lat, lng, geom, first_attested, description, source, confidence, ...)` — `estate_type` fri text (kungsgård/husaby/borg/handelsplats/uppsala_öd/mötesplats; `nybygge` saknas men kräver ingen migration).

**Spec-förfining:** `holder_kind`-schemat får **6 koder** (spec sa 5): `king, consort, dynasty, bryte, institution, person`. `person` behövs för `from_holder_kind`. Befintliga värden (king/dynasty/bryte) förblir giltiga.

---

## Task 1: Vokabulär + migrera förläning-koden

**Files:**
- Create: `supabase/migrations/20260723160000_transfer_vocab.sql`

**Interfaces:**
- Produces: scheman `acquisition_mode` (9), `holder_kind` (6), `fiscal_system` (7) i `vocabulary`; alla `estate_holdings.acquired_via='förläning'` → `'forlaning'`.

- [ ] **Step 1: Test-först — scheman saknas, förläning finns**

Run: `PGPASSWORD="$PW" psql "$CONN" -At -c "select count(*) from vocabulary where scheme in ('acquisition_mode','holder_kind','fiscal_system');"`
Expected: `0`
Run: `PGPASSWORD="$PW" psql "$CONN" -At -c "select count(*) from estate_holdings where acquired_via='förläning';"`
Expected: `5`

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260723160000_transfer_vocab.sql
INSERT INTO vocabulary (scheme, code, label_sv, label_en) VALUES
  ('acquisition_mode','morgongava','morgongåva','morning gift'),
  ('acquisition_mode','hemfoljd','hemföljd','dowry'),
  ('acquisition_mode','arv','arv','inheritance'),
  ('acquisition_mode','forlaning','förläning','enfeoffment'),
  ('acquisition_mode','donation','donation','donation'),
  ('acquisition_mode','kop','köp','purchase'),
  ('acquisition_mode','pant','pant','mortgage'),
  ('acquisition_mode','byte','byte','exchange'),
  ('acquisition_mode','konfiskation','konfiskation','confiscation'),
  ('holder_kind','king','kung','king'),
  ('holder_kind','consort','gemål','consort'),
  ('holder_kind','dynasty','dynasti','dynasty'),
  ('holder_kind','bryte','bryte','steward'),
  ('holder_kind','institution','institution','institution'),
  ('holder_kind','person','person','person'),
  ('fiscal_system','skatte','skatte','tax land'),
  ('fiscal_system','fralse','frälse','noble-exempt'),
  ('fiscal_system','rusttjanst','rusttjänst','cavalry service'),
  ('fiscal_system','krono','krono','crown land'),
  ('fiscal_system','kyrka','kyrkojord','church land'),
  ('fiscal_system','ledung','ledung/roden','naval levy'),
  ('fiscal_system','uppsala_od','uppsala öd','royal domain')
ON CONFLICT (scheme, code) DO NOTHING;

-- Migrera befintlig fri-text-kod till vokabulärkoden.
UPDATE estate_holdings SET acquired_via = 'forlaning' WHERE acquired_via = 'förläning';
```

- [ ] **Step 3: Applicera**

Run: `PGPASSWORD="$PW" psql "$CONN" -v ON_ERROR_STOP=1 -f supabase/migrations/20260723160000_transfer_vocab.sql`
Expected: körs utan fel (`INSERT 0 22`, `UPDATE 5`).

- [ ] **Step 4: Verifiera**

Run: `PGPASSWORD="$PW" psql "$CONN" -At -c "select scheme, count(*) from vocabulary where scheme in ('acquisition_mode','holder_kind','fiscal_system') group by scheme order by scheme;"`
Expected: `acquisition_mode|9`, `fiscal_system|7`, `holder_kind|6`
Run: `PGPASSWORD="$PW" psql "$CONN" -At -c "select count(*) from estate_holdings where acquired_via='förläning';"`
Expected: `0`

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260723160000_transfer_vocab.sql
git commit -m "feat(estates): transfer-mode/holder-kind/fiscal-system vocabulary + migrate förläning code"
```

---

## Task 2: Givar-kolumner + index

**Files:**
- Create: `supabase/migrations/20260723160100_estate_holdings_transferor.sql`

**Interfaces:**
- Produces: `estate_holdings.from_holder_kind text`, `from_king_id uuid→historical_kings`, `from_dynasty_id uuid→royal_dynasties`; index `(estate_id, period_start)`.

- [ ] **Step 1: Test-först — kolumnerna saknas**

Run: `PGPASSWORD="$PW" psql "$CONN" -At -c "select count(*) from information_schema.columns where table_name='estate_holdings' and column_name in ('from_holder_kind','from_king_id','from_dynasty_id');"`
Expected: `0`

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260723160100_estate_holdings_transferor.sql
ALTER TABLE estate_holdings
  ADD COLUMN IF NOT EXISTS from_holder_kind text,
  ADD COLUMN IF NOT EXISTS from_king_id uuid REFERENCES historical_kings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS from_dynasty_id uuid REFERENCES royal_dynasties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_estate_holdings_estate_period
  ON estate_holdings (estate_id, period_start);
```

- [ ] **Step 3: Applicera**

Run: `PGPASSWORD="$PW" psql "$CONN" -v ON_ERROR_STOP=1 -f supabase/migrations/20260723160100_estate_holdings_transferor.sql`
Expected: `ALTER TABLE`, `CREATE INDEX`.

- [ ] **Step 4: Verifiera kolumner + FK**

Run: `PGPASSWORD="$PW" psql "$CONN" -At -c "select count(*) from information_schema.columns where table_name='estate_holdings' and column_name in ('from_holder_kind','from_king_id','from_dynasty_id');"`
Expected: `3`
Run: `PGPASSWORD="$PW" psql "$CONN" -At -c "select count(*) from pg_constraint where conrelid='estate_holdings'::regclass and contype='f' and conname like '%from_%';"`
Expected: `2` (from_king_id, from_dynasty_id).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260723160100_estate_holdings_transferor.sql
git commit -m "feat(estates): add transferor columns (from_holder_kind/from_king_id/from_dynasty_id) + tenure index"
```

---

## Task 3: Valideringstrigger mot vokabulären

**Files:**
- Create: `supabase/migrations/20260723160200_estate_holdings_validate.sql`

**Interfaces:**
- Consumes: vokabulären (Task 1), givar-kolumnerna (Task 2).
- Produces: trigger `trg_estate_holding_vocab` som avvisar okända koder i `acquired_via`/`holder_kind`/`from_holder_kind`/`fiscal_system`.

- [ ] **Step 1: Skriv migrationen**

```sql
-- 20260723160200_estate_holdings_validate.sql
CREATE OR REPLACE FUNCTION check_estate_holding_vocab()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.acquired_via IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM vocabulary WHERE scheme='acquisition_mode' AND code=NEW.acquired_via) THEN
    RAISE EXCEPTION 'estate_holdings: okänd acquired_via "%"', NEW.acquired_via;
  END IF;
  IF NEW.holder_kind IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM vocabulary WHERE scheme='holder_kind' AND code=NEW.holder_kind) THEN
    RAISE EXCEPTION 'estate_holdings: okänd holder_kind "%"', NEW.holder_kind;
  END IF;
  IF NEW.from_holder_kind IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM vocabulary WHERE scheme='holder_kind' AND code=NEW.from_holder_kind) THEN
    RAISE EXCEPTION 'estate_holdings: okänd from_holder_kind "%"', NEW.from_holder_kind;
  END IF;
  IF NEW.fiscal_system IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM vocabulary WHERE scheme='fiscal_system' AND code=NEW.fiscal_system) THEN
    RAISE EXCEPTION 'estate_holdings: okänd fiscal_system "%"', NEW.fiscal_system;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_estate_holding_vocab ON estate_holdings;
CREATE TRIGGER trg_estate_holding_vocab
  BEFORE INSERT OR UPDATE ON estate_holdings
  FOR EACH ROW EXECUTE FUNCTION check_estate_holding_vocab();
```

- [ ] **Step 2: Applicera**

Run: `PGPASSWORD="$PW" psql "$CONN" -v ON_ERROR_STOP=1 -f supabase/migrations/20260723160200_estate_holdings_validate.sql`
Expected: `CREATE FUNCTION`, `CREATE TRIGGER`.

- [ ] **Step 3: Test — giltig kod passerar (rollback), ogiltig avvisas**

Run:
```bash
PGPASSWORD="$PW" psql "$CONN" -c "BEGIN; UPDATE estate_holdings SET acquired_via='morgongava' WHERE id=(select id from estate_holdings limit 1); ROLLBACK;"
```
Expected: `UPDATE 1` + `ROLLBACK` (giltig kod tillåts).
Run:
```bash
PGPASSWORD="$PW" psql "$CONN" -c "BEGIN; UPDATE estate_holdings SET acquired_via='hittepa' WHERE id=(select id from estate_holdings limit 1); ROLLBACK;"
```
Expected: `ERROR: estate_holdings: okänd acquired_via "hittepa"` (ogiltig kod avvisas).

- [ ] **Step 4: Verifiera att befintlig data fortfarande validerar**

Run: `PGPASSWORD="$PW" psql "$CONN" -c "BEGIN; UPDATE estate_holdings SET updated_at=now(); ROLLBACK;"`
Expected: `UPDATE 27` + `ROLLBACK` (alla befintliga rader passerar triggern — bevisar att förläning-migreringen + befintliga holder_kind är giltiga).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260723160200_estate_holdings_validate.sql
git commit -m "feat(estates): validate acquired_via/holder_kind/fiscal_system against vocabulary (trigger)"
```

---

## Task 4: Regenerera TypeScript-typer

**Files:**
- Modify: `src/integrations/supabase/types.ts`

**Interfaces:**
- Produces: `estate_holdings`-typen inkluderar `from_holder_kind`, `from_king_id`, `from_dynasty_id`.

- [ ] **Step 1: Generera**

Run:
```bash
PW=$(grep '^SUPABASE_DB_PASSWORD=' .env | cut -d= -f2- | tr -d '\r"')
DBURL="postgresql://postgres.mnuifmcjspeaauzehasj:${PW}@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"
supabase gen types typescript --db-url "$DBURL" > src/integrations/supabase/types.ts
```
(Om `PW` innehåller URL-specialtecken `@ : / ?` — percent-koda dem i `DBURL`.)
Expected: filen skrivs utan fel.

- [ ] **Step 2: Verifiera att nya kolumner finns i typen**

Run: `grep -n "from_king_id" src/integrations/supabase/types.ts`
Expected: minst en träff (i `estate_holdings`-Row/Insert/Update).

- [ ] **Step 3: Bygg-kontroll (typerna kompilerar)**

Run: `npm run build 2>&1 | tail -5` (eller `npx tsc --noEmit`)
Expected: inga nya typfel från `estate_holdings`.

- [ ] **Step 4: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore(types): regenerate supabase types for estate_holdings transferor columns"
```

---

## Task 5: Integrationsfixtur — SDHK 5485 (rollback)

**Files:**
- Create: `scripts/kg/verify-transfer-model.sh`

**Interfaces:**
- Consumes: hela schemat (Task 1–3).

- [ ] **Step 1: Skriv verifieringsskriptet**

```bash
#!/usr/bin/env bash
# scripts/kg/verify-transfer-model.sh — bevisar att modellen bär morgongåve-fallet SDHK 5485.
# Allt sker i EN transaktion som RULLAS TILLBAKA — ingen permanent data skapas.
set -euo pipefail
PW=$(grep '^SUPABASE_DB_PASSWORD=' .env | cut -d= -f2- | tr -d '\r"')
CONN="postgresql://postgres.mnuifmcjspeaauzehasj@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

PGPASSWORD="$PW" psql "$CONN" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
-- Mottagaren (finns ej i historical_kings) läggs in som person.
WITH giver AS (SELECT id FROM historical_kings WHERE name='Magnus Eriksson' LIMIT 1),
     rcv AS (
       INSERT INTO historical_kings (name, gender, status)
       VALUES ('Gunhild Arvidsdotter [TEST]', 'female', 'historical') RETURNING id
     ),
     es AS (
       INSERT INTO estates (name, estate_type, source)
       VALUES ('Nybygge I [TEST]','nybygge','SDHK 5485'),
              ('Nybygge II [TEST]','nybygge','SDHK 5485') RETURNING id
     )
INSERT INTO estate_holdings
  (estate_id, king_id, holder_kind, acquired_via, from_holder_kind, from_king_id, period_start, source, confidence)
SELECT es.id, (SELECT id FROM rcv), 'consort', 'morgongava', 'person',
       (SELECT id FROM giver), 1330, 'SDHK 5485', 'probable'
FROM es;

-- Assertion 1: två morgongåve-holdings grupperade på källan.
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM estate_holdings
   WHERE source='SDHK 5485' AND acquired_via='morgongava' AND holder_kind='consort';
  IF n <> 2 THEN RAISE EXCEPTION 'FAIL: förväntade 2 morgongåve-holdings, fick %', n; END IF;
  RAISE NOTICE 'OK: 2 morgongåve-holdings (SDHK 5485), consort-mottagare, från Magnus Eriksson';
END $$;
ROLLBACK;
SQL
echo "OK: transfer-modellen bär SDHK 5485-fallet (rollback — ingen permanent data)"
```

- [ ] **Step 2: Kör**

Run: `bash scripts/kg/verify-transfer-model.sh`
Expected: `NOTICE: OK: 2 morgongåve-holdings ...` följt av `OK: transfer-modellen bär SDHK 5485-fallet`.

- [ ] **Step 3: Commit**

```bash
git add scripts/kg/verify-transfer-model.sh
git commit -m "test(estates): SDHK 5485 morgongåva rollback fixture proves transfer model"
```

---

## Self-Review

**Spec-täckning:**
- 3.1 acquisition_mode (9) → Task 1 ✓
- 3.2 transferor-kolumner → Task 2 ✓
- 3.3 holder_kind (6, incl. person — förfining) → Task 1 ✓
- 3.3b fiscal_system (7) → Task 1 ✓
- 3.4 tidsskivat index → Task 2 ✓
- 3.5 valideringstrigger → Task 3 ✓
- 4 SDHK 5485-exempel → Task 5 (rollback) ✓
- 3.6 KG-integration → medvetet utanför (egen uppgift, noteras i spec)
- Icke-mål (jordetal/backfill/event-tabell) → ej med ✓

**Placeholder-scan:** inga TBD; all SQL komplett; kommandon konkreta.

**Typ-konsistens:** vokabulärkoder ASCII och identiska mellan Task 1 (definition) och Task 3/5 (användning: `morgongava`, `consort`, `person`, `forlaning`). Kolumnnamn (`from_holder_kind`, `from_king_id`, `from_dynasty_id`) konsekventa Task 2→4→5.

**Beroendekedja:** Task 1 (vokabulär) → Task 3 (trigger validerar mot den) ; Task 2 (kolumner) → Task 3 (from_holder_kind) → Task 5 (fixtur använder alla). Task 4 (typer) efter Task 2.
