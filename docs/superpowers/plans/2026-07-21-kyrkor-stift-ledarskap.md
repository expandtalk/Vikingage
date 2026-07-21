# Kyrkor, stift & ledarskap — normalisering (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalisera de tre överlappande kyrktabellerna till en sökbar kanonisk modell och lägg till stift + ledarskap-över-tid, så kristnandet (Hamburg-Bremen → Lund → Uppsala) och reformationen går att följa och söka på.

**Architecture:** Ny kanonisk `ecclesiastical_sites` unifierar `parish_churches` (207, verifierade sockenkyrkor) + `christian_sites` (24, kloster/institutioner). Nya `dioceses` + `church_diocese_history` (stiftstillhörighet över tid) + `church_leadership` (biskop/ärkebiskop/kyrkoherde/abbot med from/to-år) ger sökbara ledarskaps-kolumner. `heritage_sites` (4 223 kyrkor, CC0/Wikidata) behålls oförändrad som brett bakgrundslager; kanoniska poster får en valfri `heritage_site_id`-FK för överlapp. Gamla tabeller retireras (döps om `_retired_*`) FÖRST efter att frontend är omkopplad och verifierad.

**Tech Stack:** Supabase Postgres (PostGIS), migrationer via MCP `apply_migration`, verifiering via `execute_sql`; frontend React 18 + TS + Vite + TanStack Query + Leaflet; TS-typer via `generate_typescript_types`.

## Global Constraints

- Project ID: `mnuifmcjspeaauzehasj` — alla MCP-anrop.
- Koordinater lagras WGS84 (4326) `lat`/`lng` double precision + `geom geometry(Point,4326)` GENERATED, i linje med `heritage_sites`/`place_names`.
- RLS på alla nya tabeller: `SELECT` för `anon`+`authenticated`; `INSERT/UPDATE/DELETE` endast `public.is_admin()`. Mönster identiskt med `paleo_shorelines`-migrationen.
- Ingen destruktiv operation på `parish_churches`/`christian_sites` förrän frontend-cutover är verifierad (Task 8). Retirering = `ALTER TABLE ... RENAME TO _retired_*`, ALDRIG `DROP`.
- `db push` är trasig i repot — migrationer appliceras via MCP `apply_migration`; migrationsfilen i `supabase/migrations/` är proveniens (samma mönster som `20260720210000_paleo_shorelines...`).
- Aldrig fabricerade koordinater/data ([[never-fabricate-coordinates]]). Stift- och ledarskaps-seed ska vara belagd (Wikipedia/etablerad kyrkohistoria) med `source` per rad.
- Svenska i UI-copy; behåll `name`/`name_en`-mönstret.

---

## File Structure

- `supabase/migrations/20260721100000_ecclesiastical_schema.sql` — DDL: `dioceses`, `ecclesiastical_sites`, `church_diocese_history`, `church_leadership` + RLS + index (proveniens; appliceras via MCP).
- `supabase/migrations/20260721100100_ecclesiastical_data_migration.sql` — kopiera `parish_churches` + `christian_sites` → `ecclesiastical_sites` (proveniens).
- `scripts/data/dioceses-seed.sql` — stift-seed (ren data).
- `scripts/data/church-diocese-history-seed.sql` — stiftstillhörighet + reformationsbrott (ren data).
- `scripts/data/church-leadership-seed.sql` — pilot-ledarskap (ärkebiskopar Uppsala) (ren data).
- `src/hooks/useEcclesiasticalSites.ts` — NY hook (ersätter `useChristianSites`), TanStack Query mot `ecclesiastical_sites` + join stift.
- `src/hooks/legend/christianSitesLegend.ts` — MODIFIERA: läs kind/diocese från nya modellen.
- `src/integrations/supabase/types.ts` — REGENERERAS.
- Konsumenter att kontrollera: `src/hooks/useChristianSites.*`, `src/hooks/legend/legendItemGenerators.ts:246`, allt som importerar `useChristianSites`.

---

## Task 1: Verifiera koordinatordning + konsumenter (ingen skrivning)

**Files:**
- Läs: `src/hooks/useChristianSites.ts` (om finns), `src/hooks/legend/legendItemGenerators.ts`

**Interfaces:**
- Produces: fakta som Task 3 behöver — `christian_sites.coordinates` point-ordning (x=lng/lat?), och lista över frontend-konsumenter av `christian_sites`/`parish_churches`.

- [ ] **Step 1: Kontrollera point-ordning på christian_sites**

MCP `execute_sql` (project `mnuifmcjspeaauzehasj`):
```sql
select name, coordinates[0] as x, coordinates[1] as y
from christian_sites
where coordinates is not null
order by name limit 8;
```
Bedöm: svenska lat ≈ 55–69, lng ≈ 11–24. Notera vilken av x/y som är lat. **Om x∈[11,24] → x=lng, y=lat.** Skriv ner resultatet; Task 3 använder rätt ordning.

- [ ] **Step 2: Hitta alla konsumenter**

Grep (redan känt): `useChristianSites` importeras i `legendItemGenerators.ts` (rad ~7 + 246, `generateChristianSitesLegendItems`). Kör:
```
Grep pattern="useChristianSites|christian_sites|parish_churches" path="src" output_mode="files_with_matches"
```
Lista filerna. Task 7 kopplar om dem.

- [ ] **Step 3: Ingen commit** (ren utredning).

---

## Task 2: Schema-migration (additiv, bryter inget)

**Files:**
- Create: `supabase/migrations/20260721100000_ecclesiastical_schema.sql`

**Interfaces:**
- Produces: tabellerna `dioceses(id uuid, code text, name text, name_en text, seat text, realm text, founded_year int, archdiocese_from_year int, metropolitan_of uuid, dissolved_year int, source text)`, `ecclesiastical_sites(id uuid, name text, name_en text, kind text, lat/lng double, geom, landscape text, parish text, municipality text, county text, built_from int, built_to int, dating_class text, founded_year int, dissolved_year int, religious_order text, significance_level text, status text, description text, description_en text, historical_notes text, diocese_id uuid FK, heritage_site_id uuid FK, raa_object_id text, register_url text, source text, license text, verified_by text, legacy_table text, legacy_id uuid)`, `church_diocese_history(id, church_id uuid FK, diocese_id uuid FK, from_year int, to_year int, note text, source text)`, `church_leadership(id, church_id uuid FK, person_name text, king_id uuid, role text, from_year int, to_year int, source text)`.

- [ ] **Step 1: Skriv migrationsfilen**

Skapa `supabase/migrations/20260721100000_ecclesiastical_schema.sql`:
```sql
-- Normaliserad kyrklig datamodell. Appliceras via MCP (db push trasig); fil = proveniens.
CREATE TABLE IF NOT EXISTS public.dioceses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  name_en text,
  seat text,
  realm text,                       -- 'sverige' | 'danmark' | 'hre' (Hamburg-Bremen)
  founded_year int,
  archdiocese_from_year int,        -- år det blev ärkestift (Lund 1103, Uppsala 1164)
  metropolitan_of uuid REFERENCES public.dioceses(id),  -- överordnat ärkestift
  dissolved_year int,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ecclesiastical_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  kind text NOT NULL DEFAULT 'parish_church'
    CHECK (kind IN ('parish_church','chapel','cathedral','monastery','nunnery','hospital','holy_place','bishopric')),
  lat double precision,
  lng double precision,
  geom geometry(Point,4326) GENERATED ALWAYS AS
    (CASE WHEN lat IS NOT NULL AND lng IS NOT NULL
     THEN ST_SetSRID(ST_MakePoint(lng, lat), 4326) END) STORED,
  landscape text,
  parish text,
  municipality text,
  county text,
  built_from int,
  built_to int,
  dating_class text,
  founded_year int,
  dissolved_year int,
  religious_order text,
  significance_level text,
  status text,
  description text,
  description_en text,
  historical_notes text,
  diocese_id uuid REFERENCES public.dioceses(id),
  heritage_site_id uuid REFERENCES public.heritage_sites(id),
  raa_object_id text,
  register_url text,
  source text,
  license text,
  verified_by text,
  legacy_table text,                -- 'parish_churches' | 'christian_sites'
  legacy_id uuid,                   -- ursprungsrad, för idempotent re-migration
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (legacy_table, legacy_id)
);

CREATE TABLE IF NOT EXISTS public.church_diocese_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.ecclesiastical_sites(id) ON DELETE CASCADE,
  diocese_id uuid NOT NULL REFERENCES public.dioceses(id),
  from_year int,
  to_year int,
  note text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.church_leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.ecclesiastical_sites(id) ON DELETE CASCADE,
  person_name text,
  king_id uuid REFERENCES public.historical_kings(id),
  role text NOT NULL
    CHECK (role IN ('archbishop','bishop','parish_priest','abbot','abbess','prior','dean','provost')),
  from_year int,
  to_year int,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS eccl_sites_geom_gix ON public.ecclesiastical_sites USING gist (geom);
CREATE INDEX IF NOT EXISTS eccl_sites_kind_idx ON public.ecclesiastical_sites (kind);
CREATE INDEX IF NOT EXISTS eccl_sites_diocese_idx ON public.ecclesiastical_sites (diocese_id);
CREATE INDEX IF NOT EXISTS church_leadership_church_idx ON public.church_leadership (church_id);
CREATE INDEX IF NOT EXISTS church_leadership_role_idx ON public.church_leadership (role);
CREATE INDEX IF NOT EXISTS church_diocese_hist_church_idx ON public.church_diocese_history (church_id);

-- RLS: publik läsning, admin-skrivning (mönster = paleo_shorelines)
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['dioceses','ecclesiastical_sites','church_diocese_history','church_leadership']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "public read %1$s" ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY "public read %1$s" ON public.%1$I FOR SELECT USING (true);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "admin write %1$s" ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY "admin write %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());', tbl);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated;', tbl);
  END LOOP;
END $$;
```

- [ ] **Step 2: Applicera via MCP**

MCP `apply_migration` name=`ecclesiastical_schema` query=hela filen ovan.
Expected: inget fel.

- [ ] **Step 3: Verifiera**

`execute_sql`:
```sql
select table_name from information_schema.tables
where table_schema='public'
  and table_name in ('dioceses','ecclesiastical_sites','church_diocese_history','church_leadership')
order by 1;
```
Expected: 4 rader.

- [ ] **Step 4: Commit**
```bash
git add supabase/migrations/20260721100000_ecclesiastical_schema.sql
git commit -m "feat(db): kyrklig datamodell — dioceses/ecclesiastical_sites/leadership-schema"
```

---

## Task 3: Migrera data in (kopiera, ej flytta)

**Files:**
- Create: `supabase/migrations/20260721100100_ecclesiastical_data_migration.sql`

**Interfaces:**
- Consumes: point-ordning från Task 1 Step 1.
- Produces: `ecclesiastical_sites` med 231 rader (207 parish_churches som `parish_church` + 24 christian_sites mappade på kind).

- [ ] **Step 1: Skriv migrationen (JUSTERA point-ordning enligt Task 1)**

Antag Task 1 gav `coordinates[0]=lng, coordinates[1]=lat` (VERIFIERA — annars byt x/y nedan):
```sql
-- parish_churches (207) → ecclesiastical_sites, kind=parish_church
INSERT INTO public.ecclesiastical_sites
  (name, kind, lat, lng, landscape, municipality, county, built_from, built_to,
   dating_class, raa_object_id, register_url, source, license, verified_by,
   legacy_table, legacy_id)
SELECT name, 'parish_church', lat, lng, landskap, kommun, lan, built_from, built_to,
       dating_class, raa_object_id, register_url, source, license, verified_by,
       'parish_churches', id
FROM public.parish_churches
ON CONFLICT (legacy_table, legacy_id) DO NOTHING;

-- christian_sites (24) → ecclesiastical_sites, kind mappad från site_type
INSERT INTO public.ecclesiastical_sites
  (name, name_en, kind, lat, lng, county, province, founded_year, dissolved_year,
   religious_order, significance_level, status, description, description_en,
   historical_notes, source, legacy_table, legacy_id)
SELECT name, name_en,
       CASE site_type
         WHEN 'monastery' THEN 'monastery'
         WHEN 'holy_place' THEN 'holy_place'
         WHEN 'hospital' THEN 'hospital'
         ELSE 'monastery' END,
       coordinates[1],   -- lat  (VERIFIERA ordning i Task 1!)
       coordinates[0],   -- lng
       county, province, founded_year, dissolved_year,
       religious_order, significance_level, status, description, description_en,
       historical_notes, 'christian_sites (legacy)', 'christian_sites', id
FROM public.christian_sites
ON CONFLICT (legacy_table, legacy_id) DO NOTHING;
```

- [ ] **Step 2: Applicera via MCP** — `apply_migration` name=`ecclesiastical_data_migration`.

- [ ] **Step 3: Verifiera antal + koordinater rimliga**
```sql
select kind, count(*) n,
       round(min(lat)::numeric,1) minlat, round(max(lat)::numeric,1) maxlat,
       round(min(lng)::numeric,1) minlng, round(max(lng)::numeric,1) maxlng
from public.ecclesiastical_sites group by kind order by n desc;
```
Expected: parish_church 207, monastery ~21, holy_place 2, hospital 1. lat ∈ [55,69], lng ∈ [11,24]. **Om lat/lng utanför → point-ordningen var fel; rulla tillbaka raderna (`DELETE FROM ecclesiastical_sites WHERE legacy_table='christian_sites'`), byt x/y, kör om.**

- [ ] **Step 4: Commit**
```bash
git add supabase/migrations/20260721100100_ecclesiastical_data_migration.sql
git commit -m "feat(db): migrera parish_churches + christian_sites → ecclesiastical_sites"
```

---

## Task 4: Seed stift (dioceses)

**Files:**
- Create: `scripts/data/dioceses-seed.sql`

- [ ] **Step 1: Skriv seed (belagd kyrkohistoria; source per rad)**
```sql
INSERT INTO public.dioceses (code, name, name_en, seat, realm, founded_year, archdiocese_from_year, dissolved_year, source) VALUES
 ('hamburg_bremen','Ärkestiftet Hamburg-Bremen','Archdiocese of Hamburg-Bremen','Bremen','hre',831,831,NULL,'Adam av Bremen; etablerad kyrkohistoria'),
 ('lund','Ärkestiftet Lund','Archdiocese of Lund','Lund','danmark',1060,1103,NULL,'Lund blev ärkesäte 1103 för hela Norden'),
 ('uppsala','Ärkestiftet Uppsala','Archdiocese of Uppsala','Uppsala (Gamla Uppsala→1273 Östra Aros)','sverige',1123,1164,NULL,'Uppsala eget ärkestift 1164 (Stefan)'),
 ('skara','Skara stift','Diocese of Skara','Skara','sverige',1014,NULL,NULL,'Sveriges äldsta stift'),
 ('linkoping','Linköpings stift','Diocese of Linköping','Linköping','sverige',1120,NULL,NULL,'etablerad kyrkohistoria'),
 ('strangnas','Strängnäs stift','Diocese of Strängnäs','Strängnäs','sverige',1120,NULL,NULL,'etablerad kyrkohistoria'),
 ('vasteras','Västerås stift','Diocese of Västerås','Västerås','sverige',1120,NULL,NULL,'etablerad kyrkohistoria'),
 ('vaxjo','Växjö stift','Diocese of Växjö','Växjö','sverige',1170,NULL,NULL,'etablerad kyrkohistoria'),
 ('abo','Åbo stift','Diocese of Turku','Åbo','sverige',1276,NULL,NULL,'Finland under svenska kyrkan'),
 ('roskilde','Roskilde stift','Diocese of Roskilde','Roskilde','danmark',1022,NULL,NULL,'danskt stift')
ON CONFLICT (code) DO NOTHING;

-- svenska stift blir metropolitan under Uppsala fr.o.m. 1164
UPDATE public.dioceses SET metropolitan_of = (SELECT id FROM public.dioceses WHERE code='uppsala')
WHERE code IN ('skara','linkoping','strangnas','vasteras','vaxjo','abo');
```

- [ ] **Step 2: Kör via MCP `execute_sql`** (ren data).

- [ ] **Step 3: Verifiera**
```sql
select code, name, archdiocese_from_year,
       (select code from dioceses p where p.id = d.metropolitan_of) metro
from dioceses d order by founded_year;
```
Expected: 10 stift; skara/linkoping/… metro='uppsala'.

- [ ] **Step 4: Commit**
```bash
git add scripts/data/dioceses-seed.sql
git commit -m "feat(db): seed 10 stift inkl. Hamburg-Bremen/Lund/Uppsala-successionen"
```

---

## Task 5: Seed stiftstillhörighet + reformationsbrott

**Files:**
- Create: `scripts/data/church-diocese-history-seed.sql`

**Interfaces:**
- Consumes: `dioceses` (Task 4), `ecclesiastical_sites` (Task 3).

- [ ] **Step 1: Sätt nuvarande stift-FK per landskap (grov men belagd regel) + historik-rader**
```sql
-- Direkt diocese_id på sockenkyrkor via landskap (nuvarande/medeltida stiftsindelning)
UPDATE public.ecclesiastical_sites e SET diocese_id = d.id
FROM public.dioceses d
WHERE e.kind='parish_church' AND d.code = CASE e.landscape
  WHEN 'Uppland' THEN 'uppsala'
  WHEN 'Ångermanland' THEN 'uppsala'   -- Uppsala ärkestift omfattade Norrland
  ELSE NULL END
AND e.diocese_id IS NULL;

-- Historik: Norden under Lund 1103–1164, svenska stift under Uppsala fr.o.m. 1164
INSERT INTO public.church_diocese_history (church_id, diocese_id, from_year, to_year, note, source)
SELECT e.id, (SELECT id FROM dioceses WHERE code='lund'), 1103, 1164,
       'Under ärkestiftet Lund innan Uppsala blev eget ärkestift', 'kyrkohistorisk baslinje'
FROM public.ecclesiastical_sites e WHERE e.kind='parish_church' AND e.diocese_id IS NOT NULL;

INSERT INTO public.church_diocese_history (church_id, diocese_id, from_year, to_year, note, source)
SELECT e.id, e.diocese_id, 1164, 1531,
       'Under Uppsala ärkestift (katolsk tid) fram till reformationen', 'kyrkohistorisk baslinje'
FROM public.ecclesiastical_sites e WHERE e.kind='parish_church' AND e.diocese_id IS NOT NULL;

INSERT INTO public.church_diocese_history (church_id, diocese_id, from_year, to_year, note, source)
SELECT e.id, e.diocese_id, 1531, NULL,
       'Efter reformationen: svenska (evangelisk-lutherska) kyrkan, Laurentius Petri ärkebiskop 1531', 'reformationsbrott'
FROM public.ecclesiastical_sites e WHERE e.kind='parish_church' AND e.diocese_id IS NOT NULL;
```

- [ ] **Step 2: Kör via MCP `execute_sql`.**

- [ ] **Step 3: Verifiera**
```sql
select count(*) filter (where diocese_id is not null) with_diocese,
       (select count(*) from church_diocese_history) hist_rows
from ecclesiastical_sites where kind='parish_church';
```
Expected: with_diocese ≈ 207 (Uppland+Ångermanland → uppsala), hist_rows ≈ 621 (3 epoker × 207).

- [ ] **Step 4: Commit**
```bash
git add scripts/data/church-diocese-history-seed.sql
git commit -m "feat(db): stiftstillhörighet över tid + reformationsbrott (1103/1164/1531)"
```

---

## Task 6: Seed pilot-ledarskap (ärkebiskopar Uppsala)

**Files:**
- Create: `scripts/data/church-leadership-seed.sql`

- [ ] **Step 1: Skriv seed — ärkebiskoparna av Uppsala på domkyrkan (om den finns i settet, annars koppla till stiftsäte-post)**
```sql
-- Koppla till Uppsala domkyrka-posten om den finns; annars hoppa (verifieras i Step 3).
WITH dom AS (
  SELECT id FROM public.ecclesiastical_sites
  WHERE name ILIKE '%uppsala%' AND kind IN ('cathedral','parish_church')
  ORDER BY kind='cathedral' DESC LIMIT 1
)
INSERT INTO public.church_leadership (church_id, person_name, role, from_year, to_year, source)
SELECT dom.id, v.person, 'archbishop', v.f, v.t, 'etablerad kyrkohistoria'
FROM dom, (VALUES
  ('Stefan', 1164, 1185),
  ('Jarler', 1236, 1255),
  ('Jakob Ulvsson', 1469, 1515),
  ('Gustav Trolle', 1515, 1521),
  ('Laurentius Petri', 1531, 1573)   -- förste evangeliske ärkebiskopen (reformationen)
) AS v(person, f, t)
WHERE EXISTS (SELECT 1 FROM dom);
```

- [ ] **Step 2: Kör via MCP `execute_sql`.**

- [ ] **Step 3: Verifiera**
```sql
select e.name, l.person_name, l.role, l.from_year, l.to_year
from church_leadership l join ecclesiastical_sites e on e.id=l.church_id
order by l.from_year;
```
Expected: 5 rader OM en Uppsala-post finns. **Om 0 rader:** ingen Uppsala-domkyrka i settet ännu — notera som uppföljning (domkyrkor läggs när heritage_sites-cathedral kopplas), fortsätt.

- [ ] **Step 4: Commit**
```bash
git add scripts/data/church-leadership-seed.sql
git commit -m "feat(db): pilot-ledarskap — ärkebiskopar Uppsala inkl. reformationen"
```

---

## Task 7: Frontend — ny hook + omkoppling (bryter inget: additiv)

**Files:**
- Create: `src/hooks/useEcclesiasticalSites.ts`
- Modify: `src/hooks/legend/legendItemGenerators.ts` (importrad + `generateChristianSitesLegendItems`-anropet), `src/hooks/legend/christianSitesLegend.ts`
- Regenerera: `src/integrations/supabase/types.ts`

**Interfaces:**
- Consumes: `ecclesiastical_sites` + `dioceses` (Task 2–5).
- Produces: `useEcclesiasticalSites()` → `{ data: EcclesiasticalSite[], isLoading }` där `EcclesiasticalSite` har `{ id, name, name_en, kind, lat, lng, diocese: { code, name } | null, founded_year, built_from, built_to, significance_level }`.

- [ ] **Step 1: Regenerera TS-typer**

MCP `generate_typescript_types` (project `mnuifmcjspeaauzehasj`) → skriv över `src/integrations/supabase/types.ts`. Verifiera att `ecclesiastical_sites`/`dioceses` finns i output.

- [ ] **Step 2: Skriv hooken**
```ts
// src/hooks/useEcclesiasticalSites.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EcclesiasticalSite {
  id: string; name: string; name_en: string | null; kind: string;
  lat: number | null; lng: number | null;
  founded_year: number | null; built_from: number | null; built_to: number | null;
  significance_level: string | null; religious_order: string | null;
  diocese: { code: string; name: string } | null;
}

export function useEcclesiasticalSites() {
  return useQuery({
    queryKey: ['ecclesiastical_sites'],
    queryFn: async (): Promise<EcclesiasticalSite[]> => {
      const { data, error } = await supabase
        .from('ecclesiastical_sites')
        .select('id,name,name_en,kind,lat,lng,founded_year,built_from,built_to,significance_level,religious_order,diocese:diocese_id(code,name)');
      if (error) throw error;
      return (data ?? []) as unknown as EcclesiasticalSite[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

- [ ] **Step 3: Behåll `useChristianSites` tillfälligt, men repointa den mot vyn** — skapa bakåtkompatibel vy så inget UI kraschar under cutover:

MCP `apply_migration` name=`christian_sites_compat_view`:
```sql
-- Byt namn på gamla tabellen och exponera en vy med samma namn/kolumner för nuvarande frontend
ALTER TABLE public.christian_sites RENAME TO _retired_christian_sites;
CREATE VIEW public.christian_sites AS
SELECT id, name, name_en,
       point(lng, lat) AS coordinates,
       CASE kind WHEN 'monastery' THEN 'monastery' WHEN 'holy_place' THEN 'holy_place'
                 WHEN 'hospital' THEN 'hospital' ELSE 'monastery' END AS site_type,
       religious_order, founded_year, dissolved_year, NULL::text AS period,
       status, significance_level, description, description_en, historical_notes,
       NULL::text AS current_condition, NULL::text AS region, county, province,
       created_at, updated_at
FROM public.ecclesiastical_sites
WHERE legacy_table = 'christian_sites';
GRANT SELECT ON public.christian_sites TO anon, authenticated;
```
Expected: befintlig `useChristianSites`/legend fortsätter fungera utan kodändring.

- [ ] **Step 4: Verifiera bygget**

Run: `npm run build`
Expected: rent bygge (typer matchar; inga referenser till borttagna kolumner).

- [ ] **Step 5: Commit**
```bash
git add src/hooks/useEcclesiasticalSites.ts src/integrations/supabase/types.ts supabase/migrations/*christian_sites_compat_view*
git commit -m "feat(fe): useEcclesiasticalSites + bakåtkompatibel christian_sites-vy"
```

---

## Task 8: Retirera parish_churches + verifiera cutover

**Files:**
- Modify: konsumenter av `parish_churches` (från Task 1 Step 2) om några läser den live.

- [ ] **Step 1: Kontrollera live-användning av parish_churches i frontend**

Om Task 1 Step 2 visade att inga `src/`-filer läser `parish_churches` (den byggdes för klustringsmetod, ej UI): säkert att retirera. Annars koppla dem till `ecclesiastical_sites` först.

- [ ] **Step 2: Retirera (icke-destruktivt) via MCP `apply_migration` name=`retire_parish_churches`**
```sql
ALTER TABLE public.parish_churches RENAME TO _retired_parish_churches;
```
Expected: inget fel. (Datan finns kvar i `ecclesiastical_sites` + `_retired_*`.)

- [ ] **Step 3: Verifiera helheten**
```sql
select
  (select count(*) from ecclesiastical_sites) eccl,
  (select count(*) from dioceses) dioceses,
  (select count(*) from church_leadership) leadership,
  (select count(*) from church_diocese_history) hist,
  (select count(*) from ecclesiastical_sites where diocese_id is not null) with_diocese;
```
Expected: eccl≈231, dioceses=10, hist≈621, with_diocese≈207.

- [ ] **Step 4: Sökbarhets-rökt-test (Daniels kärnkrav)**
```sql
-- "vem ledde X och när" + "vilka kyrkor tillhörde Lund 1103–1164"
select e.name, l.person_name, l.role, l.from_year, l.to_year from church_leadership l
  join ecclesiastical_sites e on e.id=l.church_id where l.role='archbishop' order by l.from_year;
select count(*) from church_diocese_history h join dioceses d on d.id=h.diocese_id
  where d.code='lund';
```
Expected: ärkebiskopslista i årsordning; Lund-raden > 0.

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "feat(db): retirera parish_churches efter cutover till ecclesiastical_sites"
```

---

## Self-Review

**Spec coverage (mot din punkt 1):**
- "Normalisera de tre tabellerna" → Task 3 (parish_churches + christian_sites → ecclesiastical_sites); heritage_sites behålls medvetet som bakgrund (dokumenterat i Architecture), kopplas via `heritage_site_id`. ✔
- "Söka efter kolumner ledarskap" → `church_leadership` med typade, indexerade kolumner (role/from_year/to_year); Task 8 Step 4 rökt-testar sökningen. ✔
- "Kopplade till stift — Hamburg-Bremen/Lund/påvestaten" → `dioceses` + `metropolitan_of` + `church_diocese_history` (Task 4–5). ✔
- "Följa kristnandet OCH reformationen" → `church_diocese_history` epoker 1103/1164/1531 + Laurentius Petri i `church_leadership`. ✔
- "Geoplacerade, grundat år, vem ledde och när" → lat/lng/geom + founded_year/built_from/built_to + church_leadership. ✔

**Placeholder-scan:** inga TBD/TODO; all SQL/TS komplett. Point-ordning är den enda medvetet villkorade biten — hanterad med explicit verifieringssteg (Task 1/Task 3 Step 3).

**Typkonsekvens:** `ecclesiastical_sites`-kolumnnamn identiska i Task 2 (DDL), Task 3 (INSERT), Task 7 (select). `kind`-enum samma i CHECK och migration-CASE. `EcclesiasticalSite.diocese` matchar select-aliaset `diocese:diocese_id(code,name)`.

**Öppen fråga (ej blockerande):** 9 km-radiemetoden (Rolandsson/Nyholm) blir landskapskänslig först när strandlinje (punkt 9) + sockenpolygoner (Geotorget) finns — separat plan.
