# Närhets-motorn (härledd betydelse × närhet) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ersätt `entity_answer_context`:s `prominence > 0`-hårdfilter för sevärda platser med en
**härledd betydelse × närhet**-rankning, så tunna orter (Lidingö) surfar sina EGNA lokala lämningar
i stället för 1 generisk träff eller grannstadens monument.

**Architecture:** En ren, testbar SQL-funktion `heritage_significance(...)` härleder en betydelse-vikt
ur signaler vi HAR (RAÄ-typ, prominence, popularity, kurerad slug, namnkvalitet). `entity_answer_context`:s
`sites`-CTE byter från "topp-prominence inom 25 km" till "topp `significance/(1+avstånd)` inom radie,
generiskt skräp uteslutet". Inga nya tabeller, ingen ny data — bara bättre urval av befintligt.

**Tech Stack:** PostgreSQL/PL-pgSQL (Supabase), SQL-verifiering via `execute_sql` (kodbasens mönster
för DB-tester; ingen vitest för SQL).

## Global Constraints

- **INGEN GISSNING:** betydelse härleds bara ur befintliga kolumner (`heritage_sites.raa_type`,
  `heritage_sites.place_slug`, `search_document.prominence`, `search_document.popularity`). Ingen
  fabricerad signal.
- **Migrationer:** applicera via `apply_migration` (EJ `db push` = drift). Spegla i
  `supabase/migrations/`. Se [[psql-prod-migration-reference]].
- **DB-ändringar är LIVE direkt** i prod — verifiera efter varje migration.
- **Rör ej signal-logiken:** `rebuild_search_document` nollställer prominence/popularity ([[search-rebuild-signal-wipe.md]]) — denna plan LÄSER dem, skriver dem ej.
- Exakt center-RPC som ändras: `public.entity_answer_context(text)` — bara `sites`-CTE + dess `jsonb_agg`.

---

### Task 1: `heritage_significance`-funktion (härledd betydelse)

**Files:**
- Create/Modify (migration): `supabase/migrations/20260812140000_heritage_significance.sql`

**Interfaces:**
- Produces: `public.heritage_significance(p_raa_type text, p_prominence numeric, p_popularity numeric, p_has_slug boolean) RETURNS numeric` — STABLE, IMMUTABLE-lik. Högre = mer sevärt. Task 2 anropar den.

- [ ] **Step 1: Skriv funktionen (migration)**

```sql
-- Härledd "sevärdhet" ur signaler vi HAR. Bastyp-vikt (kyrka/borg/runsten/skeppssättning tunga;
-- röse/stensättning mellan; "Fornlämningsliknande"/vägmärke/milstolpe lätta) + prominence + popularity
-- + kurerad-slug-boost. Ingen fabricerad signal.
CREATE OR REPLACE FUNCTION public.heritage_significance(
  p_raa_type text, p_prominence numeric, p_popularity numeric, p_has_slug boolean
) RETURNS numeric
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT
    (CASE
       WHEN p_raa_type ILIKE '%kyrk%' OR p_raa_type ILIKE '%kloster%' OR p_raa_type ILIKE '%borg%'
         OR p_raa_type ILIKE '%runsten%' OR p_raa_type ILIKE '%runristning%' OR p_raa_type ILIKE '%skeppssättning%'
         OR p_raa_type ILIKE '%hällristning%' OR p_raa_type ILIKE '%slott%' OR p_raa_type ILIKE '%fornborg%' THEN 5.0
       WHEN p_raa_type ILIKE '%gravfält%' OR p_raa_type ILIKE '%domarring%' OR p_raa_type ILIKE '%bildsten%'
         OR p_raa_type ILIKE '%offer%' OR p_raa_type ILIKE '%hög%' OR p_raa_type ILIKE '%bro%' THEN 3.5
       WHEN p_raa_type ILIKE '%röse%' OR p_raa_type ILIKE '%stensättning%' OR p_raa_type ILIKE '%färdväg%'
         OR p_raa_type ILIKE '%hålväg%' OR p_raa_type ILIKE '%husgrund%' OR p_raa_type ILIKE '%milstolpe%' THEN 2.0
       WHEN p_raa_type ILIKE '%fornlämningsliknande%' OR p_raa_type ILIKE '%vägmärke%'
         OR p_raa_type ILIKE '%väghållnings%' OR p_raa_type ILIKE '%uppgift%' THEN 0.4
       ELSE 1.0
     END)
    + coalesce(p_prominence,0) * 2.0
    + least(coalesce(p_popularity,0), 5) * 0.4
    + (CASE WHEN p_has_slug THEN 3.0 ELSE 0 END)
$function$;
```

- [ ] **Step 2: Applicera migrationen**

Kör `apply_migration` (name: `heritage_significance`, query = filens innehåll).

- [ ] **Step 3: Verifiera rangordningen (SQL-test)**

Kör `execute_sql`:
```sql
SELECT
  heritage_significance('Kyrka', null, null, false)              AS kyrka,      -- ~5.0
  heritage_significance('Fornlämningsliknande lämning', null, null, false) AS skrap, -- ~0.4
  heritage_significance('Röse', null, null, false)               AS rose,       -- ~2.0
  heritage_significance('Kyrka', null, null, true)               AS kyrka_slug, -- ~8.0 (slug-boost)
  (heritage_significance('Kyrka', null, null, false) > heritage_significance('Fornlämningsliknande lämning', null, null, false)) AS kyrka_slar_skrap; -- true
```
Expected: `kyrka` ≈ 5, `skrap` ≈ 0.4, `rose` ≈ 2, `kyrka_slug` ≈ 8, `kyrka_slar_skrap` = true.

- [ ] **Step 4: Committa migrationsfilen**

```bash
git add -f supabase/migrations/20260812140000_heritage_significance.sql
git commit -m "feat(sok): heritage_significance — harledd sevardhet ur RAA-typ/prominence/popularity/slug"
```

---

### Task 2: Rankad `sites`-CTE i `entity_answer_context`

**Files:**
- Modify (migration): `supabase/migrations/20260812141000_answer_context_sites_significance.sql`
  — enda ändringen mot nuvarande funktion är `sites`-CTE:n + dess `jsonb_agg`-ordering.

**Interfaces:**
- Consumes: `heritage_significance(...)` (Task 1).
- Produces: oförändrad JSON-form på `entity_answer_context` (`sites` = `[{id,name,type,lat,lng}]`), men bättre urval.

- [ ] **Step 1: Fånga baslinjen FÖRE ändring (test-observation)**

Kör `execute_sql`:
```sql
WITH v AS (SELECT entity_answer_context('Lidingö') j), k AS (SELECT entity_answer_context('Kalmar') j)
SELECT 'Lidingö' q, (SELECT jsonb_agg(s->>'name') FROM (SELECT jsonb_array_elements((SELECT j FROM v)->'sites') s) t) sites
UNION ALL SELECT 'Kalmar', (SELECT jsonb_agg(s->>'name') FROM (SELECT jsonb_array_elements((SELECT j FROM k)->'sites') s) t);
```
Notera: Lidingö ger idag ~1 site; Kalmar ger Kalmar slott m.fl. (spara för jämförelse i Step 4).

- [ ] **Step 2: Skriv migrationen — byt ENDAST `sites`-CTE + dess agg**

Hämta nuvarande funktionsdefinition (`SELECT pg_get_functiondef('public.entity_answer_context(text)'::regprocedure);`),
klistra in HELA `CREATE OR REPLACE FUNCTION ...` i migrationen, och byt ut `sites`-CTE:n mot:

```sql
sites AS (
  SELECT h.id, h.name, h.raa_type, h.lat, h.lng,
    heritage_significance(h.raa_type, sd.prominence, sd.popularity, h.place_slug IS NOT NULL)
      / (1 + (ST_Distance(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography, ST_SetSRID(ST_MakePoint(ctr.lng,ctr.lat),4326)::geography) / 4000.0)) AS score
  FROM heritage_sites h LEFT JOIN search_document sd ON sd.entity_type='heritage_site' AND sd.entity_id = h.id, ctr
  WHERE h.lat IS NOT NULL AND ctr.lat IS NOT NULL AND NOT EXISTS (SELECT 1 FROM theme)
    AND ST_DWithin(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography, ST_SetSRID(ST_MakePoint(ctr.lng,ctr.lat),4326)::geography, 15000)
    -- Uteslut generiskt skräp (namnlöst/vägmärke/fornlämningsliknande) — de ska aldrig vara "sevärda".
    AND heritage_significance(h.raa_type, sd.prominence, sd.popularity, h.place_slug IS NOT NULL) >= 1.0
    AND h.name IS NOT NULL AND h.name !~* '^(vägmärke|fornlämningsliknande|uppgift om)'
  ORDER BY score DESC, h.name LIMIT 10
),
```
Och i final-SELECT byt `'sites'`-aggets `ORDER BY score DESC, name` (oförändrat namn `score` — behålls).
Radie sänkt 25000→15000 (bygde-skala; härledd betydelse fyller på lokalt i st.f. att nå grannstad).

- [ ] **Step 3: Applicera migrationen**

Kör `apply_migration` (name: `answer_context_sites_significance`).

- [ ] **Step 4: Verifiera — Lidingö rikare, Kalmar ej regredierad, skräp borta**

Kör `execute_sql` (samma fråga som Step 1) + kontroll:
```sql
WITH v AS (SELECT entity_answer_context('Lidingö') j)
SELECT jsonb_array_length(COALESCE((SELECT j FROM v)->'sites','[]')) AS lidingo_n_sites,   -- FÖRVÄNTAS > 1
  (SELECT bool_or((s->>'name') ILIKE '%vägmärke%' OR (s->>'name') ILIKE '%fornlämningslik%')
     FROM jsonb_array_elements((SELECT j FROM v)->'sites') s) AS har_skrap;                 -- FÖRVÄNTAS false/null
```
Expected: `lidingo_n_sites` > 1 (fler lokala Lidingö-lämningar), `har_skrap` = false/null.
Kör även Kalmar-frågan: Kalmar slott/domkyrka ska fortfarande vara topp (ingen regression).

- [ ] **Step 5: Committa migrationen**

```bash
git add -f supabase/migrations/20260812141000_answer_context_sites_significance.sql
git commit -m "feat(sok): Narhets-motor — sites rankas pa harledd betydelse x narhet (ersatter prominence>0-golv)"
```

---

## Self-Review

**Spec coverage:** Denna plan implementerar §"Närhets-motorn / härledd betydelse" (sekvens-steg 1,
delen som ger störst effekt utan ny data). Äventyrslager, legend-höger/ikoner, markör-dedup =
SYSKONPLANER (ej i denna). Universell slug-resolvning = steg 2 (separat plan).

**Placeholders:** Inga TODO/TBD; alla SQL-block kompletta; kolumnnamn verifierade mot DB 2026-08-12
(`heritage_sites.raa_type/name/place_slug`, `search_document.prominence/popularity`).

**Typkonsistens:** `heritage_significance(text, numeric, numeric, boolean)` samma signatur i Task 1
(definition) och Task 2 (två anrop). CTE-kolumnen heter `score` genomgående (urval + agg-ordering).

**Notering (medveten avgränsning):** planen rör bara `sites` i sök-svaret. Samma `heritage_significance`
återanvänds sedan av PlaceMap/dossier och av en ev. `features_near_ranked`-RPC i nästa plan — den är
byggd återanvändbar just därför.
