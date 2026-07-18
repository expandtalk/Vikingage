# Databas-TODO — Viking Age

Arbetslista för databas-/dataarbetet. Skapad 2026-07-18. Metod genomgående: **crosswalk ur `rundata.sql`** (Evighetsrunor, i repo-roten, gitignorerad) matchat på `signum`, kört som SQL i editorn + `migration repair`. Bakgrund: `docs/superpowers/specs/2026-07-18-db-review.md`.

---

## 🎯 PRIORITERAT NU (2026-07-18, uppdaterad efter dagens diskussion)

### A. ✅ DEPLOYAT + LIVE-QA:AT (2026-07-18)
Live-QA kört mot www.vikingage.se (browse, textkontroll):
- [x] Legend: **ingen "1002/1001/999"** kvar (den gamla synvillan borta). Exakt nytt tal (3201/365) ej skrapbart ur hopfälld legend — **ögonkolla själv** vid tillfälle.
- [x] `focus=gods`: gudkorten visar "kultplats"-antal, **INGA "omnämnanden"-tal**. (Klick-beteendet "Oden → bara Odens kultplatser" ej klicktestat — bekräfta manuellt.)
- [x] `focus=folkGroups`: folkgrupper + DNA/arkeologi syns, ingen "1002".
- [x] Carvers: ingen "Importerad från MySQL data", karta syns.
- [x] Fortresses: "Centres/Centra" syns, "Städer" borta. ⚠️ **Hittade residual "Cities"** i kartlagrets toggle (`FortressesCitiesMap`) → **fixat i kod (commit 7c05b86), kräver ny build+FTP.**
- [ ] Ej klicktestat (browse-klick opålitligt) — bekräfta manuellt: geneticist utan runstenar; inscriptions sv+utl; rivers/trade = farleder; tidslinjen filtrerar; Prices→"Roman Price Converter"; Källa på norra Öland; i18n EN-läge.
- **Cache:** `Cache-Control: no-cache` på `index.html`.

### A2. 🔁 Väntar NÄSTA build+FTP (committat efter deployen)
- [ ] `FortressesCitiesMap`: "Cities/Städer" → "Centres/Centra" (commit 7c05b86).
- [ ] Källa gamla kyrka: konsoliderad + berikad sourced historik, dubbletten "Källa Ödekyrka" borttagen (commit eaf75d3, efter deploy).

### B. SQL / Python att köra? → **NEJ, inget nytt kvar.**
Allt dagens arbete är frontend + docs. DB-åtgärderna är **redan körda** av dig:
- [x] Carvers-städning: `UPDATE carvers SET description = NULL WHERE description ILIKE 'importerad från%'`.
- [x] `20260718140000_drop_superseded_standalone_coords.sql` — körd + repad (`[20260718140000] => applied`). Raderar 1939 superseder-koordinater = dubbel/felplacerade B-markörer i Östersjön.
- [ ] (Valfri städning) `landscape`/`province` fel för ~546 Bautil-via-alt-stenar (item 4).

### B2. 🐛 Ny buggbatch (Daniel 2026-07-18) — triage
- [x] **3. Karta "map data not available" + zooma till min plats** — FIXAT (commit 3717201, kräver deploy). Root: terrain-basemap var Esri World_Physical_Map (tiles bara till z~8). Bytt till World_Topo_Map + `maxNativeZoom` per basemap (Leaflet skalar upp istället för felruta). Geolocation-knapp ("Visa min plats") tillagd i `useMapInitialization`.
- [ ] **4. Carvers: klick på ristare visar inte stenarna på kartan; "Okänd period" på alla** — `CarversMap` ritar bara ristaren på region-centroid, inte de enskilda stenarna. Behöver: plotta ristarens inskrifter (finns via `get_carver_inscriptions`, har koord) + härleda aktiv period ur inskrifternas datering (`carvers.period_active_*` är null). Datafråga: koppla ristare→inskrift→datering/artefakt.
- [ ] **5. Se vilka artefakter ristarna rör** — koppla ristarens inskrifter till `artefacts` (unikt nr). Visa artefakt-ID i detaljpanelen.
- [~] **6. Namn/kungalängder + gruppering** — (b/c) **KLART** (commit 3717201): `RegionFindsView` grupperar under landsrubrik vid landssortering (härad + socken). (a) **KVAR — databerikning:** `viking_names` har exakt 113 rader (ej cap); fler namn kräver extraktion ur inskrifter (rundata personnamn) + kunganamn (crosswalk-task).
- [ ] **7. Folkgrupper på karta** (`focus=folkGroups`) — vissa `folk_groups` bör ritas (polygon/punkt) på kartan, inte bara listas.
- [x] **9. Topnav: Explore → Home** — KLART (commit följer). `Navigation.tsx`: första länken är nu Hem/Home → `/`.
- [ ] **10. Welcome-kort: "Heliga källor & äldre kultplatser" + Utflykter** — Daniel vill ha kort för heliga källor/kultplatser + utflykter på förstasidan → totalt **16 kort** (snyggt rutnät). Utflykter = Birka, Långhundraleden, Broborg, Ölands fornborgar, Rösaring (se D.4).
- [ ] **11. Roman Price Converter i18n** — prislistan visas på svenska även i EN-läge. Översätt kategorierna + varorna (spannmål/vin/kött/fisk/löner/boskap/slavar/vilda djur/kläder/silke/metaller/mynt) till engelska. Daniel har skickat hela sv-listan.
- [ ] **8. Tidsperiod ändrar inte kartan / "låser sig" (focus=gods)** + **profilbyte ändrar inget** — KRÄVER LIVE-REPRO. Kod-mekanismen ser korrekt ut: profilbyte→`setActiveExploreRole`→reaktiv store→legend-reset; period→`filterInscriptionsByPeriod` + religiösa `getPlacesForTimePeriod`. Trolig orsak att "profiler ser lika ut": runstenslagret dominerar (flest profiler har runic_inscriptions på), sekundärlager syns svagt. Behöver klicktestas live för att bekräfta ev. äkta bugg.

### C. Undersök / beställ PARALLELLT (blockerar inte deploy)
- [ ] **Beställ de två Geotorget-nedladdningarna** (Lantmäteriet, en session) — se längst ned. Enda riktiga blockeraren för flera features:
  - **Ortnamn, vektor** → fyller tomma `place_names` → gör att **teoforta ortnamn (Odensala/Torslunda…) kan plottas** = gudarnas "omnämnanden på karta" på riktigt (idag saknar `places` koordinater).
  - **Socken och stad, vektor** → sockenpolygoner (härad/socken-gränser på kartan).

### D. Nästa tasks (prioritetsordning)
1. [x] **Gods-fokus: klick → gudens kultplatser** — KLART + deployat. `focusDeity` i `useLegendManager`.
2. [x] **folkGroups → folkgrupper + DNA** — KLART + deployat.
3. **🏛️ Royal Chronicles-revision (STOR — pågår)** — underlag i `scripts/data/royal-chronicles/` (regents_missing.csv, relations_edges.csv, README, **SCHEMA-MAPPING.md**). Godkänt av Daniel: alla schemabeslut ja.
   - [x] (a) Schemakartläggning — `SCHEMA-MAPPING.md` (128 kungar, 12 ätter, king_status-enum matchar, inga role/attestation/relations-kolumner).
   - [x] (b) **Migration `20260718200000_royal_chronicles_schema.sql`** — role/de_facto_ruler/external_attestation/sources/node_control på historical_kings + ny `royal_relations`-tabell + RLS. **KÖR i editorn + `migration repair --status applied 20260718200000`.**
   - [x] (c–f) **`01-corrections.sql`** GENERERAD — region-städning, dynasti-renames (Stenkilsätten→Stenkilska, Eriksätten→Erikska, Sverkerätren→Sverkerska) + 18 nya dynastier, 11 rättelser, dedup. **Fynd:** Håkan Magnusson ×2 är EJ dubbletter (olika personer 1093 vs 1362) → lämnas. Toke Gormsson/Sibbe är runstensbelagda → behålls, bara Björn Jarl/Sibir Fultarsson flaggas spekulativa. Olof III + "Ragnhild"-artefakten = DELETE utkommenterad (verifiera först).
   - [x] (g) **`02-import.sql`** GENERERAD (via `scripts/gen-royal-chronicles-import.mjs`) — 89 regenter + 42 relationer, idempotent.
   - [ ] **KÖR i editorn (i ordning): `01-corrections.sql` sedan `02-import.sql`** (ren data-SQL, ingen migration repair).
   - [ ] (h) UI-följd: använd `role` i filterByRulerType; visa attestering/relationer; region-filter Västerleden/England.
4. **🧭 Utflykter/excursions (ny sida/sektion)** — Birka, Långhundraleden, Broborg, Ölands fornborgar, Rösaringsåsen (processionsvägen). Daniel har lämnat rikt Rösaring-innehåll. Egen route/komponent + kort per utflykt (karta, beskrivning, källor).
5. **Tidslinje/zoom** — verifiera tidslinjefiltret live; zoom-kluster döljer andra lager.
6. **i18n live-jakt** — kvarvarande svenska i EN-läge.
7. **Wikidata-ID:n + foton** (`wikidata_id` via SPARQL → Commons-bilder).
8. **Rundata-satellittabeller** (parishes/locations/objects — item 5).

---

## ✅ Klart (baslinje)
- [x] **Koordinat-konsolidering** — migration `20260718120000` (coord_source/coord_confidence, DEMO-rad bort). Repad.
- [x] **Koordinat-crosswalk** ur rundata.sql → `runic_inscriptions.coordinates`. **98 % täckning (3 014/3 067)**, 2 402 auktoritativa RAÄ. Syns i appen via vyn `runic_with_coordinates` (`original_coordinates`). Kördes om med utf8-fix.
- [x] **Socken/härad-crosswalk** — migration `20260718130000` (`socken`+`harad` på runic_inscriptions). **2 923/3 067 (95 %)**, 618 distinkta socknar.

## 📚 Historik / detaljer (mestadels klart — se PRIORITERAT NU för aktuell status)

### 1. Kolla migration repair (30 s)
- [ ] Verifiera att `supabase migration repair --status applied 20260718130000` (socken) är körd. Om inte: kör den.

### 2. ✅ Legend-räknarna 999/1001 (LÖST 2026-07-18, commit 2329591)
- [x] **Root cause: PostgREST `db-max-rows=1000`** kapar varje svar oavsett `.limit(50000)`. Huvudfrågan gav 1000/3067, standalone-koordinaterna 1000 → "Places found: 2000" och legenden räknade en kapad+virtuell blandning (999/1001).
- [x] Fix (`enhancedDataLoader.ts`): `fetchAllPages()` pagineras med `.range()` → alla 3067 laddas; dedup av standalone vars signum redan finns i huvuddatan (1393 st, gav dubbelmarkörer); klassa virtuellas country via signum-prefix (`getCountryFromSignum`) → Sö/U/Öl = svenska, DR/N/IS = utländska.
- [x] Resultat: **3747 svenska / 365 utländska** (foreign nu ärlig, ~350 i DB + virtuella). ✅ Deployat 2026-07-18.

**Datafynd under utredningen (→ påverkar item 5 + städning):**
- Huvudtabellen `runic_inscriptions` är kraftigt ofullständig för vissa landskap: **Sö 13 av ~400**, U 923 av ~1300, Öl 22 av ~60. `additional_coordinates` (standalone, inscription_id null) fyller luckan delvis (384 Sö saknas i huvud men finns som koord). → Riktig fix = importera saknade inskrifter (item 5); då kan standalone-virtual-hacket pensioneras.
- **544 "B 1"–"B 544"** i additional_coordinates: source `manual_admin`, notes "Manually added by admin for B N", koords läcker till Nordtyskland (lat 51.5). Ser ut som skräp/testdata — visas nu som "svenska runstenar" (prefix okänt → default Sverige). **Rekommendation: granska + radera.** Inspektera: `select signum,latitude,longitude,notes,source from additional_coordinates where inscription_id is null and signum ~ '^B \d' order by signum;`
- Kosmetiskt: "Places found 4112 > Total in database 3067" — de virtuella ligger inte i `runic_inscriptions`-count. Ofarligt men ser inkonsekvent ut.

**Bautil-verifiering (Daniel, extern SNRD-körning 2026-07-18):** "B"-signum bekräftade som äkta Bautil-referenser (Göransson 1750). Alla 30 testade hittades i Runor/SNRD med modernt signum + exakta koord + översättning. Sockenfelet för B 1/B 100–103 var UPPSTRÖMS (låga B-nr = Uppland, ej Småland). runic_inscriptions har redan rätt data (rundata); felet satt kvar i `additional_coordinates` (gammal 2025-geokod). Skala: av 2438 standalone matchar **1393 huvudtabellen direkt, 546 via alternative_signum** (dolda dubbletter, ritades på fel plats), 499 genuint saknade.
- [ ] **Kör `20260718140000_drop_superseded_standalone_coords.sql`** — raderar de 1939 superseder-posterna, verkar direkt i redan byggd app (ingen ombyggnad). Sedan `migration repair --status applied 20260718140000`.
- [ ] De 499 kvarvarande: importera ordentligt (item 5) + verifiera mot Runor/SNRD (Daniels `bautil_lookup.py` / `enriched.json` som mall). Notera Bautil-dubbletter (B 1021/1022=Sm 103, B 1027/1030=Sm 121) och försvunna stenar (extant=false: Sm 20, U 314, U 315).

### 3. ✅ Kod-polish: deterministisk karta (klar + deployat 2026-07-18)
- [x] `useExplorerState.handleResultClick` — klick-tids-Nominatim-geokodning **borttagen**. Bara kanonisk koord; saknas → toast.
- [x] **Tona osäkra markörer** via `coord_confidence`: approximativa (virtuell socken-centroid / låg-medium-okänd konfidens / geokodad källa) ritas ihåligt+streckat+halv opacitet; verifierade (rundata/RAÄ, manuellt, user-exakt) solida. Säker fallback innan vy-migration.
- [x] **Vy-migration `20260718150000`** körd + repad (exponerar coord_confidence/coord_source). Fält bärs genom `coordinateProcessor.ts` (commit a8cd79f — den återskapade objekt och tappade fälten först).
- [x] Toning verifierad i dev + prod-build (2262 solida / 938 tonade av renderade; totalt ~2596/970). Build klar (commit a8cd79f), #root renderar rent.
- [x] **FTP: ladda upp hela dist/ rent** — ✅ deployat 2026-07-18. Cache: sätt `Cache-Control: no-cache` på index.html (hashade assets kan cachas hårt) för att undvika chunk-mismatch (gav 1002/497-synvillan). `.htaccess`-snutt kan tas fram.

### 4. ✅ Socken/härad-feature #1 (klar utom polygoner, commits 0042fe1+4245aa0)
- [x] **Sök socken/härad** — migration `20260718160000` (körd+repad): vyn exponerar socken/harad, RPC `search_inscriptions_flexible` matchar dem. "Adelsö"/"Vallentuna härad" hittar stenarna.
- [x] **Härader-/socknar-sidorna (focus=hundreds/parishes) har karta med fynd** — `RegionFindsView`: sökbar lista (209 härader / 618 socknar, antal + landskap via majoritetsröstning) + Leaflet-karta som zoomar till valt område. ✅ Deployat 2026-07-18.
- [ ] **Polygon-gränser** (avvaktar — ingen GeoPackage): kräver **Lantmäteriet "Socken och stad" Nedladdning, vektor** (GeoPackage, CC0, Geotorget). Import: GeoPackage → SWEREF99→WGS84 → GeoJSON → polygonlager. Härad = union av socken-polygoner.
- [ ] **Sidofix (data):** `landscape`/`province`-kolumnerna är fel för ~546 Bautil-via-alt-stenar (t.ex. B 100 = U 285 står "Småland/Kalmar län" fast Uppland). socken/harad är rätt. Kan härledas ur härad→landskap eller modernt signum. Låg prio (UI kringgår via majoritetsröstning).

### 5. Fler trasiga rundata-tabeller (samma crosswalk-metod)
Import kraftigt ofullständig (rundata.sql → DB). Prioritet efter synligt värde:
- [x] **translations** — crosswalk klar (`scripts/data/rundata-translations-crosswalk.sql`, commit b1c1178). Rundata-tabellen har 8508 rader (1802 sv / 6683 en) → 6826 signum mappade (1773 sv, 6492 en). Fyller `runic_inscriptions.translation_sv/en` där tomma. **KÖR SQL:en i editorn** (ren data-UPDATE, ingen repair). OBS: rundata 2021 har mest ENGELSKA översättningar; svenska (nu 249→~1773) kan berikas mer via SNRD-API (som Bautil-skriptet).
- [x] **readings → transliteration** — crosswalk klar (`scripts/data/rundata-readings-crosswalk.sql`, commit 9415e3c). 6839 signum (primär läsning 'P') → fyller `runic_inscriptions.transliteration` där tom (nu 1819/3067). **KÖR SQL:en i editorn** (ren data-UPDATE). Syns i detaljvyn.
- [x] **interpretations → normalization** — crosswalk klar (`scripts/data/rundata-interpretations-crosswalk.sql`, commit ce65db9). interpretations.text = fornnordisk normalform → `runic_inscriptions.normalization` (visas redan i InscriptionDetail:395, ingen UI/tabell behövs). 6515 signum, primär 'P'. **KÖR SQL:en i editorn**.
- [ ] **parishes**-tabellen 927 → 1 696 (komplett sockenlista; för polygon-featuren).
- [ ] **locations** 124 → 4 071, **her_SE** 18 → 4 090, **object_source** 0 → 5 814, **reference_uri** 0 → 2 336.
- [ ] **objects** 142 → 7 189 — navet; men appen använder det inte. Beslut: importera för fullständighet eller skippa.

### 6. Ortnamnslager (Lantmäteriet — separat Geotorget-produkt)
- [ ] `place_names` är tomt. Hämta **"Ortnamn Nedladdning, vektor"** från Geotorget (CC BY 4.0) + kör `scripts/import-place-names.ts`. (Beställ tillsammans med "Socken och stad" i steg 4 i en Geotorget-session.)

### 7. DB-städning (från review — försiktigt, kod-kollat per tabell)
- [ ] Slå ihop `artefacts` (339) + `rundata_artefacts` (339) — båda läses i kod, kräver kodändring.
- [ ] `staging_inscriptions` (1 112) — importstaging kvar i prod; arkivera/ta bort (används av importverktyg — kolla först).
- [ ] Droppa genuint oanvända: `aliases_canonical`, `alts_canonical`, `folk_group_cities` (0 rader, ingen `.from()`).

## Explore/UI-TODO (Daniels feedback 2026-07-18)
- [x] **Profil-fixar** (commit 5198e59): geneticist utan runstenar (+folkgrupper), inscriptions-focus visar sv+utl, trade +viking_roads. `fix-explore-profiles.sql` körd. ✅ Deployat 2026-07-18.
- [x] **Tidslinjen filtrerar kartan** — `filterInscriptionsByPeriod` + borttagen no-op-TimelineModule. Runstenar visas ej i förhistoriska perioder. ✅ Deployat — **verifiera live** (D.3).
- [ ] **Zoom-kluster döljer annat** — vid översiktszoom syns bara runstenar, intressantare lager göms. Justera markörprioritet/z-index per zoom.
- [ ] **i18n live-jakt** — kvarvarande svenska i EN-läge (teckenförklaring, "X platser", "X länder") — hitta via live-browsing.
- [ ] **Wikidata-ID:n** — `wikidata_id` via Wikidata SPARQL (Rundata-signum-property) för utlänkning + foton via Commons.
- [ ] **Foton på runinskrifter** — visa bilder (befintliga imagelinks/inscription_media + ev. Wikimedia Commons via Wikidata).
- [x] **Carvers-sidan** (`/carvers`) — FIXAT + ✅ deployat 2026-07-18:
  - "Importerad från MySQL data" försvann: matchningen i `useCarverData.ts` var skiftlägeskänslig (`=== 'importerad...'`) och missade DB:s versal-I. Nu case-/whitespace-tolerant filter (`cleanCarverDescription`). **Slutade hitta på fejkade forskningsnoteringar** (`generateResearchNote`) — påhittad vetenskap på en forskningsplattform; import-artefakt → ingen not visas alls.
  - Klick på ristarkort "gjorde inget": detaljpanelen öppnas högst upp på sidan men scrollades aldrig dit. Ny `useEffect` scrollar till panelen (`detailPanelRef`).
  - Kartan (`CarversMap`) importerades men renderades aldrig → nu inbäddad i carvers-fliken (region-centroider, klick öppnar detalj). i18n:ad (var hårdkodad svenska).
  - Snabbare laddning: `isLoading` blockerar inte längre hela sidan på inskrifts-RPC:n (laddas i bakgrunden, behövs först i detaljpanelen).
  - Avlusade korten: tog bort dubbel statistik (signed/attributed-grid + certainty-rad) — badges visar redan stones/signed/uncertain.
  - **Kvar (data):** `carvers.description` i DB innehåller fortfarande "Importerad från MySQL data" — kosmetiskt nu (UI filtrerar), men för datakvalitet: `UPDATE carvers SET description = NULL WHERE description ILIKE 'importerad från%' OR description ILIKE '%mysql%';`
- [x] **Fortresses-sidan** (`/fortresses`) — "Cities/Städer" döpt om till "Centres/Centra" (samlingen är handelsplatser, religiösa/kungliga centra + enstaka protostäder, inte riktiga städer). Titel, underrubrik, flik, översikt + SEO-meta uppdaterade. Alt: "Central Places/Centralplatser" (arkeologisk term) om Daniel föredrar.
- [x] **Gudkort — påhittad statistik BORT** (`GodCardsGrid`, `GodNamesView`): "Oden 145 / Tor 287 omnämnanden" var **påhittade tal** (matchade ingen datakälla), likaså `importance` 1–10. Ersatta med VERKLIGT antal katalogförda, koordinatsatta kultplatser (`getDeityPlaces`): Oden 16, Tor 10, Frej 11, Frigg/Njord/Ull 2. Gudar utan kultplatsdata visar "Inga katalogförda kultplatser" (ingen siffra). Vetenskaplig integritet (jfr carvers fejk-noteringar).
- [x] **Ontologi: gudar/kult tillagt** (`docs/ontology.md §1c`) — deity/kultplats/teofort ortnamn/textomnämnande som fyra evidenstyper + CIDOC-mappning + datakvalitetsflaggor (påhittade tal, `places` utan koordinater).
- [x] **Källa ödekyrka rättad** — låg i Östersjön (56.7833/16.9667 + en dubblett 57.2167/17.0333). Rättad till Wikipedias 57°6′41″N 16°59′11″Ö = 57.1114/16.9864 i `religiousPlacesData.ts` (2 poster) + `offeringSprings.ts`. **OBS dubblett:** samma plats finns som både "Källa Ödekyrka" och "Källa gamla kyrka offerkälla" — bör konsolideras till en (avvaktar besked).
- [x] **Gods-fokus klick → kultplatser** — KLART + ✅ deployat 2026-07-18. `focusDeity` (`useLegendManager`) filtrerar kartan till `religious_<deity>`; trådat till `GodCardsGrid`. Ersätter den förlustiga plats→inskrift-sökningen. Klick igen/"Visa alla gudar" återställer.
- [x] **folkGroups → folkgrupper + DNA** — KLART + ✅ deployat. `applyFocusOverrides` case `folkGroups` = `folk_groups` + `archaeological_sites`, inga runstenar.
- [x] **Källa ödekyrka** — rättad + ✅ deployat (57.1114/16.9864). Kvar: konsolidera dubbletten (2 poster samma plats).

## Verktyg (finns redan)
- `scripts/crosswalk-rundata-coordinates.mjs` → genererar `scripts/data/rundata-coordinate-crosswalk.sql`
- `scripts/crosswalk-rundata-parish.mjs` → genererar `supabase/migrations/20260718130000_parish_harad_crosswalk.sql`
- Mönster att återanvända för translations/readings/interpretations: parse rundata.sql (utf8!) per tabell, matcha på signum eller inscriptionid, generera ETT UPDATE/INSERT med inline VALUES (INTE temptabell — editorn droppar den).

## Två Geotorget-nedladdningar att beställa (Lantmäteriet, en session)
1. **Ortnamn Nedladdning, vektor** (→ place_names)
2. **Socken och stad Nedladdning, vektor** (→ sockenpolygoner + komplett lista)
