# KG-materialisering (Plan 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fyll kunskapsgrafens navigerings-bindväv genom att registrera saknade noder och materialisera de tomma FK-baserade kanterna, så att `graph_neighborhood` blir traverserbar för navigation.

**Architecture:** Rena, idempotenta SQL-migrationer i `supabase/migrations/`. Varje kanttyp: (1) säkra predikatet i `rel_predicates`, (2) säkra att båda ändarnas noder finns i `entity_registry`, (3) `INSERT ... ON CONFLICT DO NOTHING` i `relationship` ur befintlig FK-data. Verifiering via REST count (`Prefer: count=exact`).

**Tech Stack:** PostgreSQL (Supabase), migrationsfiler applicerade med `supabase db push`, verifiering via PostgREST.

## Global Constraints

- **Icke-destruktivt:** endast additiva `INSERT ... ON CONFLICT DO NOTHING`. Aldrig `DELETE`/`UPDATE` av befintlig data.
- **Idempotent:** varje migration måste kunna köras två gånger med samma slutresultat (verifieras genom att köra count före/efter en andra körning).
- **Nod före kant:** `relationship.subject_id`/`object_id` har FK mot `entity_registry.id`. Registrera ALLTID noder innan kanter, i samma migration, i denna ordning.
- **Predikat före kant:** `relationship.predicate` har FK mot `rel_predicates.code`. Nya predikat in FÖRST.
- **Nod-id-konvention:** noder ur en tabell med egen uuid-PK använder `entity_registry.id = <källtabell>.id`. (Verifieras i Task 1 för kung/dynasti.)
- **Migrationsnamn:** `supabase/migrations/2026072315XXXX_<namn>.sql` (växande timestamp efter befintliga filer).
- **Apply-mekanism (VIKTIGT — ersätter `supabase db push` i alla task-steg):** Remote migrations-historiken är drivad (~20 migrationer applicerade utanför CLI:t, t.ex. `search_v2`). `supabase db push` skulle spela om dem och skada prod → FÅR EJ användas. Applicera i stället varje migrationsfil direkt via session-poolern:
  `PGPASSWORD="$PW" psql "postgresql://postgres.mnuifmcjspeaauzehasj@aws-0-eu-north-1.pooler.supabase.com:5432/postgres" -v ON_ERROR_STOP=1 -f supabase/migrations/<fil>.sql`
  där `PW` läses ur `.env` (`SUPABASE_DB_PASSWORD`). Migrationsfilen skrivs ändå till repot (versionshistorik); historik-raden i `supabase_migrations.schema_migrations` lämnas orörd för paritet med befintlig drift.
- **Verifieringskommando (mall):** `curl -s -o /dev/null -D - "$URL/rest/v1/<tabell>?<filter>&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Prefer: count=exact" | grep -i content-range` där `URL`/`KEY` läses ur `.env` (`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`, avklädda citattecken).

---

## Filstruktur

- `supabase/migrations/20260723150000_kg_node_id_assert.sql` — verifierar nod-id-konventionen (assert, ingen data)
- `supabase/migrations/20260723150100_kg_predicates.sql` — nya predikat i `rel_predicates`
- `supabase/migrations/20260723150200_kg_nodes_dynasty_estate.sql` — registrera saknade dynasti- + estate-noder
- `supabase/migrations/20260723150300_kg_edges_king_dynasty.sql` — `belongs_to_dynasty`
- `supabase/migrations/20260723150400_kg_edges_king_estate.sql` — `has_estate`
- `supabase/migrations/20260723150500_kg_nodes_church_parish_hundred.sql` — registrera church/parish/hundred-noder
- `supabase/migrations/20260723150600_kg_edges_church_parish_hundred.sql` — `belongs_to_parish` + `part_of_hundred`
- `supabase/migrations/20260723150700_kg_nodes_edges_god_cultsite.sql` — cult_site-noder + `has_cult_site`

---

## Referens: verifierade scheman (2026-07-23, live)

- `entity_registry(id uuid, entity_type text, label text, updated_at)` — 7 639 noder. Typer med antal: inscription 6434, carver 341, artefact 339, **king 212**, source 98, coin 32, god 26, theme 25, **dynasty 23**, road 10, landscape 6, city 6, fortress 1.
- `relationship(id, subject_id, predicate, object_id, qualifiers, source_ref, confidence, created_by, created_at)`.
- `rel_predicates(code, label_sv, label_en, subject_type, object_type, qualifier_schema, description)`. Befintliga koder inkl. `belongs_to_parish`, `part_of_hundred`, `located_in`, `kin_of`. **Saknas:** `belongs_to_dynasty`, `has_estate`, `has_cult_site`.
- `historical_kings(id, name, dynasty_id, reign_start, reign_end, ...)` — 212.
- `royal_dynasties(id, name, name_en, period_start, period_end, region, ...)` — 30 (varav 23 registrerade som noder → 7 saknas).
- `estates(id, name, estate_type, lat, lng, geom, first_attested, ...)` — 81, alla med lat/lng.
- `estate_holdings(id, estate_id, holder_kind, king_id, dynasty_id, ...)` — 21 rader, `king_id` satt i alla 21 → **15 distinkta kungar**.
- `ecclesiastical_sites(id, name, kind, lat, lng, landscape, parish, parish_id, hundred_id, diocese_id, ...)` — 4 146, med `parish_id`/`hundred_id`.
- `parishes(id, name, ...)` — 1 726. `hundreds(id, name, ...)` — 468.
- `cult_sites(id, name, lat, lng, deity, type, ...)` — 115 med `deity`. `gods(id, name, ...)` — 26.

**Not (YAGNI):** `place_names` (42 983) nodifieras INTE i v1. Ort→landskap-navigation löses som direktfråga i resolvern (Plan 3) via `place_names.province`; att registrera 43k noder har låg navigationsnytta och hög kostnad.

**Not (avvikelse från spec):** god→kultplats materialiseras här som graf-kant (`has_cult_site`, 115) för att driva brainstorming-mappen (v2); destinationskorten (Plan 3) kan även läsa `cult_sites.deity` direkt. Ort→landskap flyttat till resolver (se ovan).

---

## Task 1: Verifiera nod-id-konventionen

**Files:**
- Create: `supabase/migrations/20260723150000_kg_node_id_assert.sql`

**Interfaces:**
- Produces: bekräftar att `entity_registry.id = historical_kings.id` för entity_type 'king' och `= royal_dynasties.id` för 'dynasty'. Alla senare tasks förlitar sig på denna konvention.

- [ ] **Step 1: Skriv assert-migrationen**

```sql
-- 20260723150000_kg_node_id_assert.sql
-- Verifierar att king/dynasty-noder delar id med sina källtabeller. Ingen datamutation.
DO $$
DECLARE
  king_mismatch int;
  dyn_mismatch int;
BEGIN
  SELECT count(*) INTO king_mismatch
  FROM entity_registry er
  WHERE er.entity_type = 'king'
    AND NOT EXISTS (SELECT 1 FROM historical_kings k WHERE k.id = er.id);

  SELECT count(*) INTO dyn_mismatch
  FROM entity_registry er
  WHERE er.entity_type = 'dynasty'
    AND NOT EXISTS (SELECT 1 FROM royal_dynasties d WHERE d.id = er.id);

  IF king_mismatch > 0 THEN
    RAISE EXCEPTION 'Nod-id-konvention bruten: % king-noder saknar matchande historical_kings.id', king_mismatch;
  END IF;
  IF dyn_mismatch > 0 THEN
    RAISE EXCEPTION 'Nod-id-konvention bruten: % dynasty-noder saknar matchande royal_dynasties.id', dyn_mismatch;
  END IF;
  RAISE NOTICE 'OK: king/dynasty-noder följer id-konventionen.';
END $$;
```

- [ ] **Step 2: Applicera och verifiera att den passerar**

Run: `supabase db push`
Expected: körs utan `EXCEPTION`; loggar `OK: king/dynasty-noder följer id-konventionen.` Om den kastar EXCEPTION — STOPPA; konventionen gäller inte och alla följande tasks måste ritas om med en mappningstabell.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260723150000_kg_node_id_assert.sql
git commit -m "chore(kg): assert node-id convention for king/dynasty"
```

---

## Task 2: Nya predikat i rel_predicates

**Files:**
- Create: `supabase/migrations/20260723150100_kg_predicates.sql`

**Interfaces:**
- Produces: koderna `belongs_to_dynasty`, `has_estate`, `has_cult_site` finns i `rel_predicates` och kan användas som `relationship.predicate`.

- [ ] **Step 1: Verifiera att predikaten saknas (test-först)**

Run: `curl -s "$URL/rest/v1/rel_predicates?select=code&code=in.(belongs_to_dynasty,has_estate,has_cult_site)" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"`
Expected: `[]` (tom lista).

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260723150100_kg_predicates.sql
INSERT INTO rel_predicates (code, label_sv, label_en, subject_type, object_type, description) VALUES
  ('belongs_to_dynasty', 'tillhör dynasti', 'belongs to dynasty', 'king',   'dynasty',   'Kung tillhör kungadynasti (ur historical_kings.dynasty_id).'),
  ('has_estate',         'har gods',        'has estate',        'king',   'estate',    'Kung innehar kungsgård/förläning (ur estate_holdings.king_id).'),
  ('has_cult_site',      'har kultplats',   'has cult site',     'god',    'cult_site', 'Gud dyrkad på kultplats (ur cult_sites.deity).')
ON CONFLICT (code) DO NOTHING;
```

- [ ] **Step 3: Applicera**

Run: `supabase db push`
Expected: körs utan fel.

- [ ] **Step 4: Verifiera att predikaten nu finns**

Run: `curl -s "$URL/rest/v1/rel_predicates?select=code&code=in.(belongs_to_dynasty,has_estate,has_cult_site)" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"`
Expected: tre rader (`belongs_to_dynasty`, `has_estate`, `has_cult_site`).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260723150100_kg_predicates.sql
git commit -m "feat(kg): add belongs_to_dynasty, has_estate, has_cult_site predicates"
```

---

## Task 3: Registrera saknade dynasti- + estate-noder

**Files:**
- Create: `supabase/migrations/20260723150200_kg_nodes_dynasty_estate.sql`

**Interfaces:**
- Consumes: id-konventionen (Task 1).
- Produces: alla `royal_dynasties` finns som `entity_type='dynasty'`-noder; alla `estates` finns som `entity_type='estate'`-noder (id = källtabellens id).

- [ ] **Step 1: Verifiera nuläge (test-först)**

Run: `curl -s -o /dev/null -D - "$URL/rest/v1/entity_registry?select=id&entity_type=eq.estate&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Prefer: count=exact" | grep -i content-range`
Expected: `*/0` (inga estate-noder ännu).

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260723150200_kg_nodes_dynasty_estate.sql
-- Dynasti-noder (fyller de 7 som saknas; ON CONFLICT skyddar de 23 befintliga).
INSERT INTO entity_registry (id, entity_type, label)
SELECT d.id, 'dynasty', d.name
FROM royal_dynasties d
ON CONFLICT (id) DO NOTHING;

-- Estate-noder (ny typ).
INSERT INTO entity_registry (id, entity_type, label)
SELECT e.id, 'estate', e.name
FROM estates e
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 3: Applicera**

Run: `supabase db push`
Expected: körs utan fel.

- [ ] **Step 4: Verifiera nodantal**

Run: `curl -s -o /dev/null -D - "$URL/rest/v1/entity_registry?select=id&entity_type=eq.estate&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Prefer: count=exact" | grep -i content-range`
Expected: `*/81`.
Run samma med `entity_type=eq.dynasty`.
Expected: `*/30`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260723150200_kg_nodes_dynasty_estate.sql
git commit -m "feat(kg): register dynasty (30) and estate (81) nodes"
```

---

## Task 4: Kant `belongs_to_dynasty` (kung → dynasti)

**Files:**
- Create: `supabase/migrations/20260723150300_kg_edges_king_dynasty.sql`

**Interfaces:**
- Consumes: dynasti-noder (Task 3), predikatet (Task 2).
- Produces: `relationship`-rader med `predicate='belongs_to_dynasty'`, subject = king-nod, object = dynasty-nod.

- [ ] **Step 1: Verifiera nuläge (test-först)**

Run: `curl -s -o /dev/null -D - "$URL/rest/v1/relationship?select=id&predicate=eq.belongs_to_dynasty&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Prefer: count=exact" | grep -i content-range`
Expected: `*/0`.

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260723150300_kg_edges_king_dynasty.sql
-- Kung -> dynasti ur historical_kings.dynasty_id.
-- OBS: dynasti-noder är dubbeltypade (dynasty + source) MEDVETET (se dynasty-as-source-intent).
-- Kräver därför bara att dynasti-noden FINNS (valfri typ), inte entity_type='dynasty'.
-- belongs_to_dynasty.object_type sattes till '*' i 20260723150150 för att trigger-typecheck
-- ska tillåta detta.
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT k.id, 'belongs_to_dynasty', k.dynasty_id, 'historical_kings.dynasty_id', 'certain'
FROM historical_kings k
WHERE k.dynasty_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = k.dynasty_id)
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = k.id AND er.entity_type = 'king')
ON CONFLICT DO NOTHING;
```

- [ ] **Step 3: Applicera**

Run: `supabase db push`
Expected: körs utan fel.

- [ ] **Step 4: Verifiera att kanter skapats**

Run: `curl -s -o /dev/null -D - "$URL/rest/v1/relationship?select=id&predicate=eq.belongs_to_dynasty&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Prefer: count=exact" | grep -i content-range`
Expected: `*/N` där N > 0 (antal kungar med registrerad dynasti; ~150+).

- [ ] **Step 5: Verifiera idempotens**

Run: `supabase db push` igen (ingen ny migration), sedan samma count.
Expected: oförändrat N (ON CONFLICT hindrar dubbletter).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260723150300_kg_edges_king_dynasty.sql
git commit -m "feat(kg): materialize belongs_to_dynasty edges (king->dynasty)"
```

---

## Task 5: Kant `has_estate` (kung → kungsgård)

**Files:**
- Create: `supabase/migrations/20260723150400_kg_edges_king_estate.sql`

**Interfaces:**
- Consumes: estate-noder (Task 3), predikatet (Task 2).
- Produces: `relationship`-rader `predicate='has_estate'`, subject = king-nod, object = estate-nod, med `period`/`role` i `qualifiers`.

- [ ] **Step 1: Verifiera nuläge (test-först)**

Run: `curl -s -o /dev/null -D - "$URL/rest/v1/relationship?select=id&predicate=eq.has_estate&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Prefer: count=exact" | grep -i content-range`
Expected: `*/0`.

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260723150400_kg_edges_king_estate.sql
-- Kung -> kungsgård ur estate_holdings.king_id. Kvalificera med roll/period/förvärvssätt.
INSERT INTO relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
SELECT h.king_id,
       'has_estate',
       h.estate_id,
       jsonb_strip_nulls(jsonb_build_object(
         'role', h.role,
         'period_start', h.period_start,
         'period_end', h.period_end,
         'acquired_via', h.acquired_via,
         'fiscal_system', h.fiscal_system
       )),
       'estate_holdings',
       COALESCE(h.confidence, 'uncertain')
FROM estate_holdings h
WHERE h.king_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = h.king_id AND er.entity_type = 'king')
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = h.estate_id AND er.entity_type = 'estate')
ON CONFLICT DO NOTHING;
```

- [ ] **Step 3: Applicera**

Run: `supabase db push`
Expected: körs utan fel.

- [ ] **Step 4: Verifiera**

Run: `curl -s -o /dev/null -D - "$URL/rest/v1/relationship?select=id&predicate=eq.has_estate&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Prefer: count=exact" | grep -i content-range`
Expected: `*/N`, 1 ≤ N ≤ 21 (täckning: ~15 distinkta kungar, 21 holdings). Notera N i commit-meddelandet som uppmätt täckning.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260723150400_kg_edges_king_estate.sql
git commit -m "feat(kg): materialize has_estate edges (king->estate); coverage ~15 kings"
```

---

## Task 6: Registrera church/parish/hundred-noder

**Files:**
- Create: `supabase/migrations/20260723150500_kg_nodes_church_parish_hundred.sql`

**Interfaces:**
- Produces: `entity_type` 'church' (ur ecclesiastical_sites), 'parish' (ur parishes), 'hundred' (ur hundreds), id = källtabellens id.

- [ ] **Step 1: Verifiera nuläge (test-först)**

Run: `curl -s -o /dev/null -D - "$URL/rest/v1/entity_registry?select=id&entity_type=eq.church&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Prefer: count=exact" | grep -i content-range`
Expected: `*/0`.

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260723150500_kg_nodes_church_parish_hundred.sql
INSERT INTO entity_registry (id, entity_type, label)
SELECT c.id, 'church', c.name FROM ecclesiastical_sites c
ON CONFLICT (id) DO NOTHING;

INSERT INTO entity_registry (id, entity_type, label)
SELECT p.id, 'parish', p.name FROM parishes p
ON CONFLICT (id) DO NOTHING;

INSERT INTO entity_registry (id, entity_type, label)
SELECT h.id, 'hundred', h.name FROM hundreds h
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 3: Applicera**

Run: `supabase db push`
Expected: körs utan fel.

- [ ] **Step 4: Verifiera**

Run count för `entity_type=eq.church` → Expected `*/4146`; `parish` → `*/1726`; `hundred` → `*/468`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260723150500_kg_nodes_church_parish_hundred.sql
git commit -m "feat(kg): register church (4146), parish (1726), hundred (468) nodes"
```

---

## Task 7: Kanter `belongs_to_parish` + `part_of_hundred` (kyrka → socken/härad)

**Files:**
- Create: `supabase/migrations/20260723150600_kg_edges_church_parish_hundred.sql`

**Interfaces:**
- Consumes: church/parish/hundred-noder (Task 6).
- Produces: `relationship` `belongs_to_parish` (church→parish) och `part_of_hundred` (church→hundred).

- [ ] **Step 1: Verifiera subject/object-typ på befintliga predikat**

Run: `curl -s "$URL/rest/v1/rel_predicates?select=code,subject_type,object_type&code=in.(belongs_to_parish,part_of_hundred)" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"`
Expected: två rader. Om `subject_type` inte tillåter 'church' (t.ex. hårt satt till annan typ och en CHECK/trigger validerar), lägg först en migration som breddar `subject_type` till NULL (fri) eller 'church'. Om `subject_type` redan är NULL/fri → fortsätt direkt.

- [ ] **Step 2: Verifiera nuläge (test-först)**

Run count `predicate=eq.belongs_to_parish` → Expected `*/0`.

- [ ] **Step 3: Skriv migrationen**

```sql
-- 20260723150600_kg_edges_church_parish_hundred.sql
-- Kyrka -> socken (befintlig FK parish_id). belongs_to_parish subject_type='*' (church OK), object 'parish'.
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT c.id, 'belongs_to_parish', c.parish_id, 'ecclesiastical_sites.parish_id', 'certain'
FROM ecclesiastical_sites c
WHERE c.parish_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = c.parish_id AND er.entity_type = 'parish')
ON CONFLICT DO NOTHING;

-- Socken -> härad (semantiskt korrekt part_of_hundred: subject 'parish', object 'hundred').
-- Via parishes.hundred_external_id -> hundreds.external_id. Ger kyrka->socken->härad som 2-hopp.
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT p.id, 'part_of_hundred', h.id, 'parishes.hundred_external_id', 'certain'
FROM parishes p
JOIN hundreds h ON h.external_id = p.hundred_external_id
WHERE p.hundred_external_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = p.id AND er.entity_type = 'parish')
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = h.id AND er.entity_type = 'hundred')
ON CONFLICT DO NOTHING;
```
Not: `part_of_hundred` är parish→hundred (inte church→hundred) — semantiskt korrekt, och alla 857 kyrkor med `hundred_id` har även `parish_id` (0 orphans), så härad nås via 2-hopp.

- [ ] **Step 4: Applicera**

Run: `supabase db push`
Expected: körs utan fel.

- [ ] **Step 5: Verifiera**

Run count `predicate=eq.belongs_to_parish` → Expected `*/N`, N > 0. Samma för `part_of_hundred`.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260723150600_kg_edges_church_parish_hundred.sql
git commit -m "feat(kg): materialize belongs_to_parish + part_of_hundred (church->parish/hundred)"
```

---

## Task 8: Cult_site-noder + `has_cult_site` (gud → kultplats)

**Files:**
- Create: `supabase/migrations/20260723150700_kg_nodes_edges_god_cultsite.sql`

**Interfaces:**
- Consumes: predikatet `has_cult_site` (Task 2), befintliga god-noder (26).
- Produces: `entity_type='cult_site'`-noder (id = cult_sites.id) + `relationship` `has_cult_site` (god→cult_site), matchat på `cult_sites.deity` mot `gods.name`.

- [ ] **Step 1: Verifiera match-nyckeln**

Run: `curl -s "$URL/rest/v1/cult_sites?select=deity&deity=not.is.null&limit=200" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"` och `curl -s "$URL/rest/v1/gods?select=name" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"`
Expected: kontrollera att `deity`-värden (t.ex. "Oden", "Frej", "Tor") matchar `gods.name`. Om normalisering krävs (skiftläge/varianter) — gör matchningen `lower(trim())` i migrationen (redan så nedan). Notera ev. helt omatchade deity-värden.

- [ ] **Step 2: Skriv migrationen**

```sql
-- 20260723150700_kg_nodes_edges_god_cultsite.sql
-- Cult_site-noder.
INSERT INTO entity_registry (id, entity_type, label)
SELECT cs.id, 'cult_site', cs.name FROM cult_sites cs
ON CONFLICT (id) DO NOTHING;

-- Gud -> kultplats, matchat på deity ~ gods.name (skiftlägesokänsligt).
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT g.id, 'has_cult_site', cs.id, 'cult_sites.deity', 'uncertain'
FROM cult_sites cs
JOIN gods g ON lower(trim(g.name)) = lower(trim(cs.deity))
WHERE cs.deity IS NOT NULL
ON CONFLICT DO NOTHING;
```

- [ ] **Step 3: Applicera**

Run: `supabase db push`
Expected: körs utan fel.

- [ ] **Step 4: Verifiera**

Run count `entity_type=eq.cult_site` → Expected `*/115`.
Run count `predicate=eq.has_cult_site` → Expected `*/N`, N > 0 (idealt nära 115; lägre om vissa deity-värden inte matchar en god-nod — notera N).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260723150700_kg_nodes_edges_god_cultsite.sql
git commit -m "feat(kg): register cult_site nodes + materialize has_cult_site edges (god->cult_site)"
```

---

## Task 9: Integrationstest — graf-traversering

**Files:**
- Create: `scripts/kg/verify-neighborhood.sh`

**Interfaces:**
- Consumes: `graph_neighborhood(p_id)` RPC + alla kanter ovan.

- [ ] **Step 1: Skriv verifieringsskriptet**

```bash
#!/usr/bin/env bash
# scripts/kg/verify-neighborhood.sh — spot-check att grafen nu är traverserbar.
set -euo pipefail
URL=$(grep '^VITE_SUPABASE_URL=' .env | cut -d= -f2- | tr -d '\r"')
KEY=$(grep '^VITE_SUPABASE_PUBLISHABLE_KEY=' .env | cut -d= -f2- | tr -d '\r"')
# Hämta en kung som har en estate-kant.
KING=$(curl -s "$URL/rest/v1/relationship?select=subject_id&predicate=eq.has_estate&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" | python -c "import sys,json;d=json.load(sys.stdin);print(d[0]['subject_id'] if d else '')")
[ -z "$KING" ] && { echo "FAIL: ingen has_estate-kant hittades"; exit 1; }
echo "Testkung: $KING"
NB=$(curl -s "$URL/rest/v1/rpc/graph_neighborhood" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d "{\"p_id\":\"$KING\"}")
echo "$NB" | python -c "import sys,json;d=json.load(sys.stdin);ps=set(r.get('predicate') for r in d);print('predikat i grannskapet:',sorted(ps));assert any(p in ps for p in ('has_estate','belongs_to_dynasty')),'FAIL: förväntade navigerings-predikat saknas';print('OK: grafen är traverserbar för navigation')"
```

- [ ] **Step 2: Kör**

Run: `bash scripts/kg/verify-neighborhood.sh`
Expected: skriver ut `OK: grafen är traverserbar för navigation` (grannskapet innehåller `has_estate` och/eller `belongs_to_dynasty`).

- [ ] **Step 3: Commit**

```bash
git add scripts/kg/verify-neighborhood.sh
git commit -m "test(kg): add graph-neighborhood traversal spot-check"
```

---

## Self-Review

**Spec-täckning (mot spec-avsnitt 6.1–6.2, v1):**
- Nod-skörd (6.1): dynasty (Task 3), estate (Task 3), church (Task 6), parish/hundred (Task 6), cult_site (Task 8). ✓
- kung→dynasti (6.2): Task 4. ✓
- kung→kungsgård `has_estate` (6.2): Task 5. ✓
- gud→kultplats (6.2): Task 8. ✓
- kyrka→socken/härad (6.2): Task 7. ✓
- ort→landskap (6.2): **medvetet flyttad till resolver (Plan 3)** — dokumenterad avvikelse (place_names 43k, YAGNI). Ingen task här.

**Placeholder-scan:** inga TBD/TODO; all SQL komplett; verifieringskommandon konkreta.

**Typ-konsistens:** entity_type-strängar konsekventa ('king','dynasty','estate','church','parish','hundred','cult_site','god'); predikatkoder konsekventa mellan Task 2 (definition) och Task 4/5/7/8 (användning).

**Beroendekedja:** Task 1 (assert) → 2 (predikat) → 3 (noder) → 4,5 (king-kanter) ; 6 (noder) → 7 (kyrk-kanter) ; 2 → 8 (gud-kanter). Task 9 sist.
