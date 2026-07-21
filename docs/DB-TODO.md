# Databas-TODO — Viking Age

Arbetslista för databas-/dataarbetet. Skapad 2026-07-18. Metod genomgående: **crosswalk ur `rundata.sql`** (Evighetsrunor, i repo-roten, gitignorerad) matchat på `signum`, kört som SQL i editorn + `migration repair`. Bakgrund: `docs/superpowers/specs/2026-07-18-db-review.md`.

---

## 🧹 AVHÅRDKODNING — flytta hårdkodad data till DB (Daniel 2026-07-21)

**Princip (Daniel):** undvik hårdkodad data i TS-filer. Data ska bo i DB (RLS: publik läs, admin-skriv) och läsas via hook, så den är redigerbar i admin, sökbar och inte spretar mellan kod och databas.

**Metod per dataset:** skapa tabell (om saknas) → migrera TS-datat in via seed-SQL → ny/ändrad hook läser `supabase.from(...)` → ta bort TS-arrayen → `npm run build` + live-QA. Mönster = `paleo_shorelines`/`heritage_sites` (RLS, GENERATED geom, viewport där relevant).

**Inventering (verifierad mot `supabase.from(...)`-anrop + import-grep 2026-07-21):**

| Dataset | Hårdkodad fil | DB-mål | Status / åtgärd |
|---|---|---|---|
| Ledungsområden | `utils/ledungSystem/ledungAreas.ts` (14 rektanglar, fejk-shipQuota) | ny tabell + `hundreds` | **Ingen tabell.** Bygg om på härad/hundare (punkt 2). BLOCKERAD av Geotorget-sockenpolygoner. |
| Heliga källor | `utils/religiousLocations/offeringSprings.ts` | ny `sacred_sites` el. `heritage_sites` (raa_type=offerkälla/helgonkälla) | **Ingen riktig tabell** (`christian_sites` har 2 holy_place). Migrera (punkt 4 — godkänd). |
| Hedniska kultplatser | `utils/religiousLocations/religiousPlacesData.ts` (`getDeityPlaces`/`getChristianCenters`) | ny `cult_sites` kopplad till `gods` (16 finns) | **Ingen tabell** för platserna; `gods` har bara gudarna. Migrera + koppla plats→gud. |
| Valdemars segelled | `utils/valdemarsRoute.ts` + `utils/routes/*` | `viking_roads`/`road_waypoints` (linjelager) | **Helt hårdkodad.** Route-koordinaterna in i DB-vägmodellen. |
| Vikingaregioner | `utils/vikingRegions/vikingRegionData.ts`, `utils/vikingEraRegions.ts` | ny `viking_regions` | **Ingen tabell.** |
| Arkeologiska fynd | `utils/archaeologicalFinds.ts` (~15, rikast) | `finds` (3) / `archaeological_sites` (4) | **Dubbellagring** — DB-tabellerna nästan tomma, TS är källan. Migrera TS→`finds`, repointa `useArchaeologicalFindMarkers`. |
| Utflykter | `data/excursions.ts` | `excursions` (76 rader FINNS) | **Dubbellagring / migration ofullständig.** `Excursions.tsx` läser TS, inte tabellen. VERIFIERA vilken som är sanning → repointa till DB. |
| Germansk tidslinje | `utils/germanicTimeline/*` (grupper/perioder) | `folk_groups` (81), `historical_periods` (5) | **Dubbellagring.** `useFolkGroupMarkers` läser DB, men tidslinjegrupperna är hårdkodade. Konsolidera. |
| Floder (ev.) | `utils/riverSystems/nordicRivers.ts`, `easternRoutes.ts` | `river_systems` (43), `river_coordinates` (207) | **VERIFIERA:** `useMapRiverSystems` läser DB — är TS-filerna legacy/orphan el. används de för europeiska floder? Ta bort el. migrera. |
| Kända inskrifter (seed) | `data/famousInscriptions.ts`, `data/jarlabankeStonesInscriptions.ts`, `data/romanIronAgeInscriptions.ts` | `runic_inscriptions` (6 434) | Kontrollera att de finns i DB via signum; annars importera + ta bort TS. |
| Legend-räknare/lager | `hooks/legend/legendItemGenerators.ts` (hårdkodade tal 49/95/12/65…) | `dbStats` / count-frågor | Härled counts från DB istället för magiska tal. |

**Ordning:** de som saknar tabell + ingår i godkänd 7-punktsplan tas där (källor=punkt 4, ledung=punkt 2). Rena dubbellagringar (utflykter, fynd, floder, tidslinje) är egna små avhårdkodnings-tasks — låg risk, additiv seed + repoint + ta bort TS-array. Se [[nyholm-rolandsson-datamodell]] och `docs/superpowers/plans/2026-07-21-kyrkor-stift-ledarskap.md`.

---

## 🎯 PRIORITERAT NU (2026-07-18, uppdaterad efter dagens diskussion)

### 🟢 SLUTSTATUS 2026-07-18 (efter stor rundata-session)
**KLART (körda i DB via editor/MCP):**
- ✅ **Rundata-import komplett:** 3 067 → **6 435 inskrifter** (5 972 med koordinater). Alla svenska landskap + DR/D/DE m.fl. Sö/Sm/Öl/G/Vg/Ög fullt inne med koord/text/datering/noter/bilder. (N/Norge kvar om önskas: `import-N.sql`.)
- ✅ **Notes/dating/bilder-crosswalk** körd (scholarly_notes, dating_text, inscription_media).
- ✅ **Bautil-dedup** körd (2 omgångar, **864 dubbletter borta**), gamla katalognamn bevarade som **sökbara alias** (B 894 → Ög 212). 571 kvar = mest Bergen (norska), moderna ej importerade.
- ✅ **Coins + dirhamer** i DB. **Placeholder-transliteration** (1 552) nollad.
- 🔑 **Lärdom:** Supabase-editorn av-dubblar `''`→`'` vid inklistring → använd **dollar-citering** (`$$...$$`) i genererad SQL.

**BYGGT, VÄNTAR FTP av `dist/` (allt frontend committat):**
- Utflykter: **48 kort**, regiongruppering, Gotland Visby/Norra/Södra, dösar, Ales stenar, Björketorp, Anundshög, Noaks Ark. Carvers namngivna-först + attributionssektion. Megameny. Mynt/dirhamer. Valdemarsleden. Welcome-räknaren dynamisk. `.htaccess` no-cache.

**KVAR (kort lista):** socken/härad på nya rader · references/uris/sources-import · koordverifiering (`// VERIFIERA`) · live-QA (zoom-kluster, i18n, period/profil) · Geotorget (ortnamn + socken-polygoner) · Wikidata/foton · DB-städning.

---

### A. ✅ DEPLOYAT + LIVE-QA:AT (2026-07-18)
Live-QA kört mot www.vikingage.se (browse, textkontroll):
- [x] Legend: **ingen "1002/1001/999"** kvar (den gamla synvillan borta). Exakt nytt tal (3201/365) ej skrapbart ur hopfälld legend — **ögonkolla själv** vid tillfälle.
- [x] `focus=gods`: gudkorten visar "kultplats"-antal, **INGA "omnämnanden"-tal**. (Klick-beteendet "Oden → bara Odens kultplatser" ej klicktestat — bekräfta manuellt.)
- [x] `focus=folkGroups`: folkgrupper + DNA/arkeologi syns, ingen "1002".
- [x] Carvers: ingen "Importerad från MySQL data", karta syns.
- [x] Fortresses: "Centres/Centra" syns, "Städer" borta. ⚠️ **Hittade residual "Cities"** i kartlagrets toggle (`FortressesCitiesMap`) → **fixat i kod (commit 7c05b86), kräver ny build+FTP.**
- [ ] Ej klicktestat (browse-klick opålitligt) — bekräfta manuellt: geneticist utan runstenar; inscriptions sv+utl; rivers/trade = farleder; tidslinjen filtrerar; Prices→"Roman Price Converter"; Källa på norra Öland; i18n EN-läge.
- **Cache:** `Cache-Control: no-cache` på `index.html`.

### A2. 🔁 DEPLOY-BATCH (build klar 2026-07-18 17:06, FTP körs av Daniel)
`npm run build` kört rent (2427 moduler, `dist/` klar). **`.htaccess` uppdaterad** (`public/.htaccess` + `dist/.htaccess`): hashade assets `max-age=31536000, immutable`, `index.html` `no-cache, no-store` → stänger chunk-mismatch-synvillan (1002/497). Ladda upp hela `dist/` rent. Commits i denna batch:
- [ ] `FortressesCitiesMap`: "Cities/Städer" → "Centres/Centra" (commit 7c05b86).
- [ ] Källa gamla kyrka: konsoliderad + berikad sourced historik, dubbletten "Källa Ödekyrka" borttagen (commit eaf75d3).
- [ ] Karta "map data not available"-fix + geolocation-knapp + region-gruppering (commit 3717201).
- [ ] Carvers RPC-fix frontend (commit aaee0ef) — **kräver även migration `20260718210000`**.
- [ ] Historiska museet-fynd (commit 34e3e07).
- [ ] Roman Price Converter i18n (commit ec97fd5).
- [ ] Utflykter-sida + welcome-kort 16-grid (commit 7fc543a).
- [ ] Coins-tabell + /coins-sida (commits af58338/014d823) — **kräver migration `20260718220000` + `coins-seed.sql`**.
- **SQL i editorn (parallellt):** `20260718210000_fix_get_carver_inscriptions.sql`, `20260718220000_coins.sql` + `scripts/data/coins-seed.sql`, `scripts/data/folk-groups-coordinates.sql` (+ `migration repair` på de två migrationerna).

### B. SQL / Python att köra? → **NEJ, inget nytt kvar.**
Allt dagens arbete är frontend + docs. DB-åtgärderna är **redan körda** av dig:
- [x] Carvers-städning: `UPDATE carvers SET description = NULL WHERE description ILIKE 'importerad från%'`.
- [x] `20260718140000_drop_superseded_standalone_coords.sql` — körd + repad (`[20260718140000] => applied`). Raderar 1939 superseder-koordinater = dubbel/felplacerade B-markörer i Östersjön.
- [ ] (Valfri städning) `landscape`/`province` fel för ~546 Bautil-via-alt-stenar (item 4).

### B2. 🐛 Ny buggbatch (Daniel 2026-07-18) — triage
- [x] **3. Karta "map data not available" + zooma till min plats** — FIXAT (commit 3717201, kräver deploy). Root: terrain-basemap var Esri World_Physical_Map (tiles bara till z~8). Bytt till World_Topo_Map + `maxNativeZoom` per basemap (Leaflet skalar upp istället för felruta). Geolocation-knapp ("Visa min plats") tillagd i `useMapInitialization`.
- [x] **4. Carvers: klick visar inte stenarna; "Okänd period"** — FIXAT (commit aaee0ef, kräver migration + deploy). **Rotorsak: `get_carver_inscriptions()`-RPC:n KRASCHADE** (PostGIS `ST_Y/ST_X` på en `point`-kolumn) → ristarnas inskrifter laddades aldrig. **KÖR `20260718210000_fix_get_carver_inscriptions.sql` + `migration repair`.** Frontend: `CarverStonesMap` plottar ristarens faktiska stenar i detaljpanelen; aktiv period härleds ur inskrifternas datering.

### B3. 🏛️ Historiska museet-material (Daniel 2026-07-18) — commit 34e3e07 (kräver deploy)
Tillagt som poster i `archaeological_finds`-lagret (`src/utils/archaeologicalFinds.ts`, CC BY 4.0, approx koord). **OBS modulupplösning:** `archaeologicalFinds.ts` (filen) vinner över `archaeologicalFinds/`-mappen → den STORA `data.ts`+`NEW_SWEDISH_FINDS` är orphan/renderas ej. Bör städas (egen task).
- [~] **1. Gudar** — DELVIS: gudafigurerna tillagda som finds (Oden/Lindby, Frej/Rällinge, Freja/Aska). KVAR: mytologisk text (asar/vaner, Midgård/Asgård, völvor/nornor/diser) — saknar hemvist (ingen gudaartikel-vy); kräver ny komponent.
- [x] **2. Bronsålderssmycken** — Stockhult-halskragen tillagd. (Torslunda-halskragen/tutulus kan läggas till senare.)
- [x] **3. Hågahögen** — tillagd (royal_burial, bronsålder).
- [x] **4. Hästutrustning** — Eskelhem tillagd (ritual, bronsålder, Nerthus).
- [x] **5. Romerska legosoldater** — Fulleröringen tillagd (burial, romersk järnålder).
- [x] **6. Stenålder/rödockragravar** — Manjärv tillagd (burial, mesolitikum). (Västra Ansvar/Ligga kan läggas till.)
- [ ] **Städa dubbel finds-modul** — slå ihop `archaeologicalFinds.ts` (live, 15 finds) med orphan `archaeologicalFinds/data.ts` (stor kurerad uppsättning som ej renderas).

### B6. 📥 rundata.sql — full import-roadmap (analys Daniel 2026-07-18)
Genomgång av `rundata.sql` (27 MB, Evighetsrunor, repo-roten). **Vi har idag en bråkdel av datan.** Faktiska radantal i dumpen vs vår DB:

| rundata-tabell | rader i dump | i vår DB | vad det ger |
|---|---|---|---|
| `inscriptions`/`objects` | **7 189** | 3 067 | **~4 122 saknade inskrifter** |
| `notes` | **2 187** | ~0 | **Forskarnoter / historisk kontext / paleografi** (fritext + `lang`, ej typad) |
| `imagelinks` | **1 098** | 0 | **Arkivbilder** (URL:er till kulturarvsdata.se — RAÄ/SHM) |
| `dating` | 2 609 | delvis | daterings-text per objekt |
| `interpretations` | 10 117 | crosswalkad | fornnordisk normalform |
| `readings` | 7 043 | crosswalkad | translitteration |
| `translations` | 8 508 | crosswalkad | översättningar |
| `references`/`reference_uri`/`uris`/`object_uri` | 4 141 / 2 336 / 4 699 / 4 179 | ~0 | käll- och utlänkningar (SNRD, Wikidata m.m.) |
| `sources`/`object_source` | 620 / 5 814 | ~0 | källhänvisningar per objekt |
| `parishes` | 1 696 | 927 | ~769 saknade socknar |
| `hundreds` | 467 | 468 | ~komplett |

**Geografisk hierarki (svar på Daniels fråga — JA, parishes/hundreds har fler kopplingar):**
`objects.placeid` → `places` (3 622) → `place_parish` (3 747) → `parishes` (1 696) → `her_SE_parishes` (927) → `her_SE`/härad (4 090, med `her_SE_notes` 1 330) → `provinces`/`counties`/`municipalities`. Plus `object_her_SE` (4 980) länkar objekt direkt till härad. Idag använder vi bara en platt `socken`/`harad`-text på `runic_inscriptions`.

**🔑 ROOT CAUSE (upptäckt 2026-07-18, steg 1): rundata-tabellerna är importerade men med FEL nyckel.**
`imagelinks` (1099), `dating` (2549), `notes` (2182), `sources` (621), `uris` (4553) finns redan i Supabase — men med rundatas **egna `objectid`**, som INTE matchar `runic_inscriptions.id`. Appens `useInscriptionExtendedData` letar med `objectid = bytea(inscription.id)` → **0 av 1099 matchar** → inget visas. Plumbingen finns, nyckeln är fel. (`objects` har bara 142 rader, `object_source`/`reference_uri` är TOMMA → källor/URI:er fungerar ej alls.)

**Steg 1 LÖST via signum (kringgår nyckel-buggen):** `scripts/crosswalk-rundata-notes.mjs` → `scripts/data/rundata-notes-crosswalk.sql`. Matchar rundata `objectid → inscriptionid → signum_inscription → signa → signum` mot `runic_inscriptions.signum`, och skriver till fält UI:t **redan renderar** (InscriptionDetail + `inscription_media`):
- `scholarly_notes` ← notes (2 113 signum) — Forskningsnoter-fliken.
- `dating_text` ← dating (2 609 signum).
- `inscription_media` ← imagelinks (1 098 bilder / 587 signum, kulturarvsdata.se) — Bilder-fliken.
- [ ] **KÖR `scripts/data/rundata-notes-crosswalk.sql` i Supabase-editorn** (ren data, idempotent, verifierad via probe). **Ingen deploy behövs** — allt renderas redan. Join på signum begränsar naturligt till våra 3 067 inskrifter.
- Not: notes är otypade i källan → allt hamnar i `scholarly_notes` (ej uppdelat på historical_context/paleographic_notes; kan AI-klassas senare).
- **Alternativ helfix (senare):** re-nyckla imagelinks/dating/notes/translations `objectid` → `runic_inscriptions.id` via signum, så ALL befintlig plumbing (inkl. detaljerad datering, översättningar) tänds. Kräver objectid→signum-map ur rundata.sql (`inscriptions`/`signa`/`signum_inscription` saknas i Supabase).

**✅ STEG 3 PILOT KÖRD (Daniel 2026-07-18):** `scripts/crosswalk-rundata-import-inscriptions.mjs` → `rundata-import-inscriptions.sql`. Importerade **1 105 saknade inskrifter** (Sö 13→460, G 127→432, Sm 11→199, Öl 25→190) med `id = objectid`. Resultat: `imagelinks_matched 0→208`, `dating_matched 0→265`, `translations_matched 0→1633` — spegeltabellerna tänds nu automatiskt via `useInscriptionExtendedData`. Totalt runic_inscriptions 3 067→4 172. Ingen deploy behövdes.
- [ ] **Rulla ut till RESTEN av landskapen** (U ~350 saknas, Vg, Ög, Gs, Hs, Nä, Vs, Vr, Dr, Bo, Ha… + utländska DR/N/IS/GB med rätt `country`). Utöka `TARGET` + prefix→landskap/land-map i generatorn.
- [ ] **socken/harad för de nya raderna** — kördes ej i importen (nullable). Kör om socken/härad-crosswalken (`20260718130000`-mönstret) eller härled via places-hierarkin (roadmap-steg 4).

**🧹 Städning (Daniel 2026-07-18):**
- [x] **Platshållar-transliteration nollad** — 1 552 rader hade texten "Translitteration saknas (endast signum från databas)" lagrad SOM transliteration (+ tomma dating_text=''). Nollställda via MCP → UI visar korrekt "saknas"-läge. `2 436` äkta translitterationer kvar.
- [ ] **DUBBLETT-VARNING: gamla katalogsignum vs moderna.** B-stenar (Bautil), Bergen, BN, L m.fl. är ALIAS för moderna stenar (B 1054 = Öl 37, Bergen 163 = N B163). **1 553 gamla-katalog-rader (1 408 tomma):** Bergen 636, B 499, BN 160, KJ/Bh 67, DK 38… Pilotimporten skapade dubbletter (importerade Öl 37 fast B 1054 redan fanns). Dedup-verktyg klart: `scripts/crosswalk-rundata-bautil-dedup.mjs` → `rundata-bautil-dedup.sql` (5 725 alias→modern-par). Tar bort gammal tom rad ENDAST om modern finns (flyttar koord först); Bergen utan modern rad överlever. **Kör dry-run först** (`rundata-bautil-dedup-dryrun.sql`). Destruktivt → Daniels OK.
- [x] **DEDUP KÖRD via MCP (Daniel 2026-07-18):** 480 tomma katalogdubbletter borttagna (4 172→3 692). Gamla namn bevarade som sökbara `alternative_signum` (STEG 1) → sök "B 1054"→Öl 37, "B 100"→U 285, "BN 74"→Öl 41 ✓. `search_inscriptions_flexible` söker redan i alternative_signum. **179 B/BN kvar** (deras moderna signum ej importerat än — försvinner när full rollout körs; kör dedupen igen efteråt).
- [x] **Carvers-uppdelning (Daniel 2026-07-18, kräver deploy):** `useCarverData.ts` klassificerar namn vs stilattribuering (`isAttributionName`); `Carvers.tsx` visar **199 namngivna först**, de **132 attributionerna** ("Samma som gjort X") i egen hopfälld sektion med förklaring att de hör hemma på stenarna. Fliksiffran visar namngivna-antalet. Typecheckar + bygger.
- [ ] **Full rollout — kör i editorn** (Daniel 2026-07-18). Kombinerad `rundata-import-inscriptions.sql` (~1,9 MB) ELLER **per-landskap** i `scripts/data/import-batches/import-<prefix>.sql` (U 602KB, N 417KB, DR 314KB, Ög 160KB, Vg/D ~125KB, resten <25KB). Alias-medvetenhet behövs INTE — sekvensen rollout→dedup är självläkande. **Efter rollout: kör dedupen igen via MCP** → de 179 kvarvarande B/BN + nya dubbletter städas.
- [x] **Utflykter kraftigt utökade (Daniel 2026-07-18, `excursions.ts`+`Excursions.tsx`, kräver deploy):** `group`-fält + sidan grupperad per region. Gotland uppdelat i **Visby / Norra / Södra** (Fornsalen, Lilla Bjärs, Gamlahamn Fårö, Lilla Ihre, Trullhalsar, Torsburgen, Fjäle, Änge-bildstenar, Smiss/Rikvide, Hablingbo, Gannarve, Gålrums, Paviken-Västergarn). Nya: **Ales stenar** (Skåne), **Björketorpsstenen** (Blekinge), **Anundshög**, **Noaks Ark** (Öland), + **megalitgravar/dösar**-kategori (Havängsdösen, Hagadösen, Skegriedösen). Många Gotland-koord är approx (`// VERIFIERA`). KVAR: fler dösar (Ansarve, Trollasten, Disas ting m.fl.) + koordverifiering.

**Rekommenderad ordning för RESTEN (crosswalk på signum, samma metod som koordinaterna):**
1. **notes + imagelinks + dating** → nya kolumner/tabeller på inskrifter (`research_notes`, `image_urls`, `dating_text`). Ger direkt Daniels önskemål: forskarnoter, historisk kontext, paleografi, arkivbilder. *Störst synligt värde, lägst risk.*
2. **references/uris/sources** → utlänkar + källor i detaljvyn (vetenskaplig trovärdighet).
3. **Saknade ~4 122 inskrifter** → importera resten (fyller Sö/Öl-luckorna; pensionerar standalone-virtual-hacket).
4. **Geografisk hierarki** (places/place_parish/her_SE-kopplingar) → riktiga socken/härad-relationer istället för platt text; underlag för polygon-featuren.
5. **Namn** → `viking_names` (113 idag) berikas via personnamn ur `readings`/`interpretations` + kunganamn.

Fokusplatser Daniel vill ha rikare data om (Stockholm, Årsta, Kalmar, Hossmo, Ljungbyån, Öland) faller ut automatiskt av steg 1–2 (deras objekt får notes/bilder/källor). **Kräver schemabeslut (nya kolumner/tabeller + migration) → egen godkänd session.**

### B4. 🪙 Mynt/coins som kategori (Daniel 2026-07-18) — commit af58338
Ny DB-kategori för mynt (fanns ej tidigare). **KÖR i ordning:**
- [ ] **`supabase/migrations/20260718220000_coins.sql`** + `migration repair --status applied 20260718220000` — `coins`-tabell (kopplad till `historical_kings` via `issuer_king_id`, med mint/metall/valör/åtsida/frånsida/koordinater) + RLS.
- [ ] **`scripts/data/coins-seed.sql`** (ren data) — 18 mynt: Olof Skötkonungs första Sigtuna-penningar (+ ETHELRED-kopia, fyrkantiga), Anund Jakob, Birka-imitationer, dansk/norsk myntning, Knut Eriksson-brakteat, örtug, Gustav Vasa riksdaler, Kristian II klipping, **Åby-solidusskatten + Leo Perpetuus 457** (Fischer/LEO), och **runmynt** (Sven Estridsson, gotländska "+Botulfi", anglosaxiska Beonna/Epa/Pada).
- [x] **Frontend** — KLART (commit 014d823, kräver deploy): `/coins`-sida (`useCoins` + `Coins.tsx`) med karta (myntorter/fyndplatser färgade per kategori) + kort grupperade per kategori (nordisk kunglig, runmynt, solidi, skatter, imitationer). Nav-post + myntikon tillagd. KVAR (valfritt): visa `coins.issuer_king_id` i kungadetaljvyn; welcome-kort.
- [x] **Islamiska dirhamer tillagda (Daniel 2026-07-18)** — ny kategori `islamic` (Coins.tsx + seed + DB, kräver deploy): halvdrachm Tabaristan (Skälby, omgjord till hänge), klippt dirham al-Muhammadiyya (Skälby), abbasidisk dirham (Bagdad, ~500 000 dirhamer i Norden enl. Hammad/Sorbonne), Spillingsskatten (hoard, Gotland). Coins nu 22 rader.
- [ ] **Koppla runiska myntinskrifter:** DR BR 75, IK 17, Nä 10 (brakteater med runinskrift) finns i `runic_inscriptions` (object_type brakteat) men är ej kopplade till mynt-konceptet. Kan länkas.
- Kontext: `/artefacts` har redan en `currency-trade`-klassificering (objectCategories.ts) som bucketar mynt-objekttyper — coins-tabellen kompletterar den.

### B5. 🚢 Valdemars segelled — omskriven rutt (Daniel 2026-07-18) — IMPLEMENTERAD, kräver build+deploy
Data i kod: `src/utils/routes/{southernRoute,centralRoute}.ts` (aggregeras i `valdemarsRoute.ts`, ritas i array-ordning via `useMapValdemarsRoute.ts`). **Rutten gick längs kusten — ALDRIG över land utom vid draget Drag, norr om Kalmar.** Typecheckar rent. **Mellankoordinater är kustnära approximationer — Daniel verifierar per punkt.**

**Åtgärdat i kod:**
- [x] **Södra sträckan omskriven** (`southernRoute.ts`): tog bort "direkt över vatten mot Kalmar" (open_water_1..3). Ny kustföljande rutt: Utlängan → **Torhamns udde** (passeras på utsidan) → **Kristianopel** → **Bröms** → **Bergkvara** → **Ljungbyåns mynning/Vassmolösa** (sötvatten) → Kalmar.
- [x] **Västervik korrigerad**: `57.0574` → **57.7580** (låg 0,7° för långt söderut).
- [x] **Loftahammar korrigerad**: `57.3106/16.9492` → **57.9000/16.8700** (ut utanför orten).
- [x] **"arkösund" var egentligen Oxelösund**: den gamla punkten `58.6794/17.1056` omdöpt till **Oxelösund**; äkta **Arkösund** tillagd på **58.4830/16.9600** vid Slätbakens mynning.
- [x] **Slätbaken-slingan modellerad**: Arkösund → in i viken till **Söderköping** (föregångaren i viken) → ut via **Stegeborg** → runt Vikbolandet → Oxelösund. Ingen genväg över land.
- [x] **Drag tillagt** (portage, `isMajorWaypoint`) norr om Kalmar — enda överlandsstället.
- [x] **Köpingsvik tillagt** (Öland) som vikingatida center i Kalmarsund.
- [x] **Runda 2-fixar (Daniel 2026-07-18, kräver deploy):** (a) **Drag** flyttad till Skäggenäskanalen vid **Revsudden** (56.83/16.46) — låg fel, såg ut att gå inne på Öland. (b) Kalmarsund följer kusten och rundar **Ölands norra udde** (57.366/17.093) istället för genväg tvärs Öland. (c) **Slätbaken-slingan omordnad så linjerna inte korsar varandra:** Sankt Anna → in via Stegeborg → Söderköping (innerst) → ut → norrut mot Arkösund → Vikbolandet ost → Oxelösund. (d) Efter Dalarö följer leden kusten inåt mot Stockholm (dokumenterat i punktbeskrivning). (e) Västervik fick "(Stegeholm)".
- [x] **Stockholms skärgård omskriven efter jordeboken** (Daniel gav latinsk källtext ur Kung Valdemars Sejrs jordebok, ca 1250). Ersatte den gissade svansen (Utö/Ornö/Nämdö/Runmarö/Sandhamn/Möja) med den dokumenterade "Landsort–Stockholm"-leden i `centralRoute.ts`: Landsort(Öja) → Ekholmen(ekiholm) → Yxlösundet(oslæsund) → Ekorrsund(ikernsund) → Gålö(gardø) → Dalarö(dalernsund) → Baggensstäket(harustik) → Sveriges holme(litle swethiuthæ) → Stockholm(stokholm). Fortsättningen Stockholm→Arholma i `sections/stockholmToRoslagen.ts`: Tenösund(wiræsund) → Stäksund(malægstagh) → Nenningesund(krampe sund, 3 veckosjöar) → Vätösund(weddesund) → Arholma(arnholm). Avstånd i källan anges i veckosjöar (~4 sjömil ≈ 7 420 m).

**Kvar:**
- [ ] **Daniel verifierar koordinater per punkt** — särskilt approximationerna (markerade `// VERIFIERA` i koden): Drag (56.82/16.33, Skäggenäs-näset?), Stegeborg-utloppet, Vikbolandet-ost, Kalmarsund nord, Sankt Anna, samt hela Stockholms-kedjan Ekholmen/Yxlösund/Ekorrsund/Baggensstäket/Sveriges holme/Tenösund/Stäksund/Nenningesund/Vätösund. Justera efter din SNRD/kart-koll.
- [ ] **Ej inlagda alternativa etapper ur jordeboken** (enkel-polylinje kan bara följa EN väg — dessa är grenar/alternativ; kan bli separata linjelager senare):
  - **Torö–Vindö:** Torö → Herrhamra → Mällsten → Älvsnabben → Gålö → Vindö → Runmarö.
  - **Landsort–Runmarö (ytterled):** Öja → Mellsten → Nåttarö → Ålö → Ornö → Nämdö → Runmarö.
  - **Stavsnäs–Arholma (Husaröleden):** Berghamn → Stora Jällö → Sandö → Träskö-Storö → Särsö → Husarö → Lagnö → Linken → Sikmarö → Blidö → Yxlö → Oxhalsö → Riddersholm → Räfsnäs → Arholma.
  - **Runmarö–Möja (avstickare):** Eknö → Harö → Lökaö/Bockö → Möja.
  - Full latinsk källtext finns i denna konversation (Daniel 2026-07-18) om leden ska byggas ut till flera lager.

### Folkgrupper — Daniels feedback (2026-07-18), ej åtgärdat
- [x] **Suioner (Tacitus) vs Svear** — SAMMANSLAGET (Daniels beslut, kört i DB): Suioner borttagen, Svear bär nu Tacitus-attesteringen (period −200–1200).
- [ ] **Fler dubblettkandidater i folk_groups** (stackade generiska koordinater) — MEN de flesta är OLIKA folk (Gepider ≠ hunner ≠ ungrare), ej äkta dubbletter. Äkta synonym-dubbletter att ev. slå ihop: "Tidiga gotiska stammar"/"Götar"; "Ungrarerna"/"Ungerska stammar"/"Ungerskt kungadöme"; vaga "Förgermanska folk"/"Paleogermanska stammar"/"Fornordiska talare". Kräver Daniels granskning per par (risk att radera distinkta folk). Även: sprid ut de stackade koordinaterna.
- [ ] **focus=folkGroups layout** — kartan bör ligga överst; runstenar bör inte visas förrän man zoomat in (hör ihop med #8 zoom-kluster). Kräver live-repro.
- [ ] **5. Se vilka artefakter ristarna rör** — koppla ristarens inskrifter till `artefacts` (unikt nr). Visa artefakt-ID i detaljpanelen.
- [~] **6. Namn/kungalängder + gruppering** — (b/c) **KLART** (commit 3717201): `RegionFindsView` grupperar under landsrubrik vid landssortering (härad + socken). (a) **KVAR — databerikning:** `viking_names` har exakt 113 rader (ej cap); fler namn kräver extraktion ur inskrifter (rundata personnamn) + kunganamn (crosswalk-task).
- [x] **7. Folkgrupper på karta** — utrett: markörlagret fungerar redan (73/82 ritades). De 9 osynliga saknade bara koordinat. **KÖR `scripts/data/folk-groups-coordinates.sql`** (ren data-UPDATE, ingen deploy behövs — markörkoden finns). Boii/Brigantes/Dacians/Danes/Helvetii/Illyrians/Normans/Thracians/Värend får hemvist-koord.
- [x] **9. Topnav: Explore → Home** — KLART (commit följer). `Navigation.tsx`: första länken är nu Hem/Home → `/`.
- [ ] **10. Welcome-kort: "Heliga källor & äldre kultplatser" + Utflykter** — Daniel vill ha kort för heliga källor/kultplatser + utflykter på förstasidan → totalt **16 kort** (snyggt rutnät). Utflykter = Birka, Långhundraleden, Broborg, Ölands fornborgar, Rösaring (se D.4).
- [x] **11. Roman Price Converter i18n** — KLART (commit ec97fd5, kräver deploy). ~110 varor + 15 kategorier översatta via `ITEM_EN`/`CATEGORY_EN`-uppslag i `DiocletianConverter.tsx`; renderas efter språk.
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
   - [x] **KÖRT av Daniel** — 212 kungar, 30 dynastier, 42 relationer (36 kungkopplade), 0 unknown gender. "Ser rätt ut."
   - [~] (h) UI-följd (commit följer, kräver deploy): **Dynasti-kort expanderbart → medlemslista** (`DynastyCard`+useDynastyMembers). **Kort-klick → `KingDetailPanel`** (full beskrivning, external_attestation-badges, sources, **relationer** via ny `useKingRelations`, källomnämnanden). **Gender "unknown" borttaget** (filter + badge). KVAR: `role` i filterByRulerType (ersätt textgissning), runstenslänkar (`king_inscription_links` tomt → koppla), region-filter Västerleden/England.
4. **🧭 Utflykter/excursions (ny sida/sektion)** — Birka, Långhundraleden, Broborg, Ölands fornborgar, Rösaringsåsen (processionsvägen). Daniel har lämnat rikt Rösaring-innehåll. Egen route/komponent + kort per utflykt (karta, beskrivning, källor).
   - [x] **Welcome-kortet "Utflykter" räknade fel** (Daniel 2026-07-18): `EXCURSION_COUNT = 5` var hårdkodat i `HeroStatsGrid.tsx` trots 11 utflykter. Fixat: utflyktsdatan flyttad till delad `src/data/excursions.ts`, både sidan och kortet räknar `EXCURSIONS.length`. Kräver deploy.
   - [x] **Utflyktskarta + relaterad närdata (Daniel 2026-07-18, kräver deploy):** `ExcursionsMap.tsx` (imperativ Leaflet, samma mönster som CarversMap) visar alla utflyktsmål (orange) ovanpå kontextlager av kultplatser/kyrkor (blå) + arkeologiska fynd (bärnsten). Klick på markör scrollar till kortet. Varje kort listar nu **kultplatser/kyrkor** och **arkeologiska fynd inom 40 km** (haversine, `src/utils/geoDistance.ts`) + länk "Utforska i kartan" (`/explore?lat=&lng=`) och OSM. **Begränsning:** relaterade **runstenar/härader/artefakter** görs INTE ännu — runic_inscriptions har `point`-koordinater (går ej bounding-box:a via PostgREST), `runic_with_coordinates.coordinates_latitude` är ~tom, artefacts saknar koord. Kräver en `nearby_features(lat,lng,radius)`-RPC (egen task). Explore-centrering på `?lat=&lng=` är ej implementerad än (länken öppnar /explore).
   - [x] **Megameny i toppnavigeringen (Daniel 2026-07-18, `Navigation.tsx`, kräver deploy):** desktop-nav ombyggd till grupperad megameny (shadcn NavigationMenu): **Runinskrifter / Platser & kartor / Historia / Vetenskap**, varje kolumn med ikon + kort beskrivning. Lade även in tidigare saknade **Utforska, Utflykter, Priser** i navet. Mobilmenyn (Sheet) grupperad med kategorirubriker.
   - [x] **6 fler utflyktskort tillagda (Daniel 2026-07-18, `Excursions.tsx`, kräver deploy):** Ingvarståget (ankrat på Gripsholmsstenen Sö 179, Mariefred), Tanums hällristningar (Bohuslän, bronsålder, världsarv), Sigurdsristningen/Ramsundsberget (Sö 101, draksläparen), Himmelstalunds hällristningar (Norrköping), Rökstenen (Rök, ca 800), **Hågahögen** (Håga v. Uppsala, Skandinaviens främsta bronsåldersplats, ~1000 f.Kr., 1/3 av Sveriges bronsåldersguld, offer/rituell kannibalism, föregångare till Gamla Uppsala; fornborgen Predikstolen intill). Håga-källa: Kaliff & Østigård, *Bronze Age Håga and the Viking King Björn* (DiVA diva2:1221652). (Valfritt senare: fler Ingvarsstenar som egna punkter; Predikstolens fornborg som eget kort.)
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

---

## 🔴 RLS: spatial_ref_sys — RISK ACCEPTERAD (Daniel 2026-07-21, väg B)

Security Advisor flaggar `public.spatial_ref_sys`: RLS av **och** `anon`/`authenticated` har `INSERT/UPDATE/DELETE/TRUNCATE`. **Går inte att åtgärda själv** — tabellen ägs av `supabase_admin`; både MCP, direkt `postgres`-anslutning OCH Dashboardens SQL-editor ger `42501: must be owner` (bekräftat 2026-07-21). `postgres` är ej medlem i `supabase_admin` → kan ej `SET ROLE`.

**Beslut: acceptera risken (väg B).** Motiv: `spatial_ref_sys` är PostGIS EPSG-referensdata (ingen känslig info). Värsta fall: någon med den publika anon-nyckeln tömmer tabellen → koordinattransformer slutar tills den återfylls (återställbart). Känd Supabase-advisor som användare inte kan lösa.

**Om det ändå ska stängas:** endast via Supabase supportärende (de kör som `supabase_admin`):
```sql
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.spatial_ref_sys FROM anon, authenticated;
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read spatial_ref_sys" ON public.spatial_ref_sys FOR SELECT USING (true);
```
