# Databas-TODO — Viking Age

Arbetslista för databas-/dataarbetet. Skapad 2026-07-18. Metod genomgående: **crosswalk ur `rundata.sql`** (Evighetsrunor, i repo-roten, gitignorerad) matchat på `signum`, kört som SQL i editorn + `migration repair`. Bakgrund: `docs/superpowers/specs/2026-07-18-db-review.md`.

## ✅ Klart (baslinje)
- [x] **Koordinat-konsolidering** — migration `20260718120000` (coord_source/coord_confidence, DEMO-rad bort). Repad.
- [x] **Koordinat-crosswalk** ur rundata.sql → `runic_inscriptions.coordinates`. **98 % täckning (3 014/3 067)**, 2 402 auktoritativa RAÄ. Syns i appen via vyn `runic_with_coordinates` (`original_coordinates`). Kördes om med utf8-fix.
- [x] **Socken/härad-crosswalk** — migration `20260718130000` (`socken`+`harad` på runic_inscriptions). **2 923/3 067 (95 %)**, 618 distinkta socknar.

## 🔜 Kör imorgon (prioriterad)

### 1. Kolla migration repair (30 s)
- [ ] Verifiera att `supabase migration repair --status applied 20260718130000` (socken) är körd. Om inte: kör den.

### 2. ✅ Legend-räknarna 999/1001 (LÖST 2026-07-18, commit 2329591)
- [x] **Root cause: PostgREST `db-max-rows=1000`** kapar varje svar oavsett `.limit(50000)`. Huvudfrågan gav 1000/3067, standalone-koordinaterna 1000 → "Places found: 2000" och legenden räknade en kapad+virtuell blandning (999/1001).
- [x] Fix (`enhancedDataLoader.ts`): `fetchAllPages()` pagineras med `.range()` → alla 3067 laddas; dedup av standalone vars signum redan finns i huvuddatan (1393 st, gav dubbelmarkörer); klassa virtuellas country via signum-prefix (`getCountryFromSignum`) → Sö/U/Öl = svenska, DR/N/IS = utländska.
- [x] Resultat: **3747 svenska / 365 utländska** (foreign nu ärlig, ~350 i DB + virtuella). Väntar på build+FTP (bundla med item 3).

**Datafynd under utredningen (→ påverkar item 5 + städning):**
- Huvudtabellen `runic_inscriptions` är kraftigt ofullständig för vissa landskap: **Sö 13 av ~400**, U 923 av ~1300, Öl 22 av ~60. `additional_coordinates` (standalone, inscription_id null) fyller luckan delvis (384 Sö saknas i huvud men finns som koord). → Riktig fix = importera saknade inskrifter (item 5); då kan standalone-virtual-hacket pensioneras.
- **544 "B 1"–"B 544"** i additional_coordinates: source `manual_admin`, notes "Manually added by admin for B N", koords läcker till Nordtyskland (lat 51.5). Ser ut som skräp/testdata — visas nu som "svenska runstenar" (prefix okänt → default Sverige). **Rekommendation: granska + radera.** Inspektera: `select signum,latitude,longitude,notes,source from additional_coordinates where inscription_id is null and signum ~ '^B \d' order by signum;`
- Kosmetiskt: "Places found 4112 > Total in database 3067" — de virtuella ligger inte i `runic_inscriptions`-count. Ofarligt men ser inkonsekvent ut.

### 3. Kod-polish: deterministisk karta (kräver deploy)
- [ ] `useExplorerState.handleResultClick` — **ta bort klick-tids-Nominatim-geokodning**; använd bara den kanoniska koordinaten (nu ifylld). Om ingen coord → toast, ingen gissning.
- [ ] **Tona osäkra markörer** annorlunda via `coord_confidence` (~53 saknar, + ev. kvarvarande 'low'). Verifierat/approximativt-visualisering.
- [ ] Bygg om dist + FTP (obs: flera kod-ändringar sedan förra uploaden — rivers-focus m.m. väntar också på deploy).

### 4. Socken/härad-feature #1 (data klar → bygg UI)
- [ ] **Sök socken/härad → visa fynd** + koppling. Datan finns nu (`socken`/`harad` på inskrifter). Ingen extern data krävs för sök/koppling.
- [ ] **Polygon-gränser på kartan** kräver **Lantmäteriet "Socken och stad" Nedladdning, vektor** (GeoPackage, CC0, Geotorget). Historiska socknar (~2 350). Import: GeoPackage → omprojicera SWEREF99→WGS84 → GeoJSON → polygonlager. Härad = union av medlems-socknars polygoner.

### 5. Fler trasiga rundata-tabeller (samma crosswalk-metod)
Import kraftigt ofullständig (rundata.sql → DB). Prioritet efter synligt värde:
- [ ] **translations** 24 → 8 508 (inskrifts-översättningar; syns i detaljvyn) — hög synlig vinst.
- [ ] **readings** 0 → 7 043 (+ `reading_source` 0 → 9 767).
- [ ] **interpretations** 0 → 10 117 (+ `interpretation_source`) — tabell saknas i DB, skapa + importera.
- [ ] **parishes**-tabellen 927 → 1 696 (komplett sockenlista; för polygon-featuren).
- [ ] **locations** 124 → 4 071, **her_SE** 18 → 4 090, **object_source** 0 → 5 814, **reference_uri** 0 → 2 336.
- [ ] **objects** 142 → 7 189 — navet; men appen använder det inte. Beslut: importera för fullständighet eller skippa.

### 6. Ortnamnslager (Lantmäteriet — separat Geotorget-produkt)
- [ ] `place_names` är tomt. Hämta **"Ortnamn Nedladdning, vektor"** från Geotorget (CC BY 4.0) + kör `scripts/import-place-names.ts`. (Beställ tillsammans med "Socken och stad" i steg 4 i en Geotorget-session.)

### 7. DB-städning (från review — försiktigt, kod-kollat per tabell)
- [ ] Slå ihop `artefacts` (339) + `rundata_artefacts` (339) — båda läses i kod, kräver kodändring.
- [ ] `staging_inscriptions` (1 112) — importstaging kvar i prod; arkivera/ta bort (används av importverktyg — kolla först).
- [ ] Droppa genuint oanvända: `aliases_canonical`, `alts_canonical`, `folk_group_cities` (0 rader, ingen `.from()`).

## Verktyg (finns redan)
- `scripts/crosswalk-rundata-coordinates.mjs` → genererar `scripts/data/rundata-coordinate-crosswalk.sql`
- `scripts/crosswalk-rundata-parish.mjs` → genererar `supabase/migrations/20260718130000_parish_harad_crosswalk.sql`
- Mönster att återanvända för translations/readings/interpretations: parse rundata.sql (utf8!) per tabell, matcha på signum eller inscriptionid, generera ETT UPDATE/INSERT med inline VALUES (INTE temptabell — editorn droppar den).

## Två Geotorget-nedladdningar att beställa (Lantmäteriet, en session)
1. **Ortnamn Nedladdning, vektor** (→ place_names)
2. **Socken och stad Nedladdning, vektor** (→ sockenpolygoner + komplett lista)
