# DB / plattforms-backlog

> **Återupprättad 2026-08-05.** Den tidigare `docs/DB-TODO.md` (som var sanningskälla enligt
> minnet, "VERIFIERAD REVISION 2026-07-24") finns **inte längre i repot** — den är borttagen
> eller aldrig committad. Den här filen startar om backloggen med de öppna spåren jag känner
> till just nu. Bredare/äldre spår ligger i agent-minnet (`MEMORY.md`-indexet) och kan vävas in
> på begäran.

## 2026-08-15 — Admin-gränser, delad kartmotor (Fas 1), Lantmäteri/Wikidata-data

### Klart (på main, EJ deployat om ej annat sägs)
- [x] Kommungräns-lager (`admin_boundaries`, © Lantmäteriet) på **/sv/oland + /sv/kalmar + /sv/angermanland** — RPC `get_admin_boundary_geojson`, hook `useAdminBoundary`, alla kommuner default på.
- [x] **Socken & stad (CC0)** ingestade: **2341 socken + 132 stad** i `admin_boundaries` (`ingest-sockenstad.mjs`).
- [x] **Landskap 25/25 KLART.** 21 via Wikidata Q193556→OSM/polygons.osm.fr (`ingest-landskap-wikidata.mjs`); **de 4 sista (Dalarna/Halland/Härjedalen/Lappland) härledda ur Lantmäteri-socknar** via geoklassificering + union per län (`complete-landskap-from-socken.sql`). Areor matchar facit.
- [x] Zoom-progressiv admin-RPC `get_admin_boundaries_in_bbox` (bbox-skalad, alla nivåer).
- [x] **Kartmotor Fas 1 KOMPLETT & slutgranskad (APPROVE):** `PlaceMap` generaliserad (`layers` + `onEnabledChange`), **/sv/oland migrerad med full paritet**. Spec+plan i `docs/superpowers/`.
- [x] **Kartmotor Fas 2 (kärna):** `useProgressiveAdmin` — zoom-progressivt admin-lager (landskap→kommun→socken/stad), `PlaceMap` prop `progressiveAdmin`, demo /sv/goteborg.
- [x] Toppnav: **Podcast → Utforska-megamenyn, Spel → verktygskatalogen**.

### Öppet — nästa steg (rekommenderad ordning)
- [x] **1. Eriksgatan-sida** `/sv/eriksgatan` på PlaceMap — KLAR. Rutt + landmärken ur `viking_roads`/`road_overview`, tvåspråkig, zoom-progressivt landskaps-lager som kärna, nav-länk uppdaterad. (Explore-fokus `?focus=eriksgatan` finns kvar som utforskande vy.)
- [ ] **2. Socken/landskap-polygoner in i Explore-vyerna** (`/explore?focus=parishes` + `?focus=hundreds`) — ersätt punkt-lagren med de nya `admin_boundaries`-polygonerna (MapCore-inkoppling).
- [x] **3. Härad / ledungsdistrikt geoklassificering — KLART (kärna).** `district_boundaries` (230 polygoner: härad 172, Gotlands ting 20, skeppslag 6, tingslag 20, fylke 5, herred 7) via socken-union. Gotland via ting. TÄCKNING PARTIELL ~39% (`coverage='partiell'`, `n_socken`). KVAR: **socken↔härad-rekonciliering** (namn-normalisering + kollisioner) för full täckning; frontend-lager; länka snack_sites↔ting.
- [ ] **Ledung-paragrafer ur lagtexterna (filolog-agent pågår):** PD Schlyter-original + egen övers. (aldrig Holmbäck-Wessén) → `source_texts`. Gutalagen(7 snäckor)+Upplandslagen först, sen Söderm/Östgöta/Skåne.
- [ ] **Ontologi + vetenskapsmetodik-uppdatering:** registrera de nya admin-entiteterna (landskap/kommun/län/rike/socken/stad, + härad/ledung när klart) i `/ontology`; dokumentera **proveniens/härledning** (landskap 21 via OSM, 4 härledda via socken-union — märkt "härledd") på `/sv/vetenskapsmetodik`. Transparens = kärnvärde (ingen gissning).
- [ ] **Fas 2 forts.:** GIS-verktygsrad (linjal/räckvidds-sond/export som app-rad) + fullskärm. WCAG 2.1 AA.
- [ ] **Temporal landskap (Daniels modell):** `admin_boundaries.year` → gränser per tidpunkt (Brömsebro 1645, Roskilde 1658, 1766, 1952/1971).
- [ ] **Fas 1-uppföljning (Minor):** gate `place_features_near`-RPC på `activeLayers.length>0` (Öland fyrar den i onödan).
- [ ] **Ortofoto historiska WMS** (eata0001): kräver server-side proxy (auth ej i klienten).

## Öppet — genealogi / platskontext (`/en/genealogy`, `src/pages/Genealogy.tsx`)

- [ ] **Fornsök existence-backfill — KÖR PER LÄN.** `scripts/data/backfill-fmis-existence.mjs`
      byggd + verifierad. Kalmar (täcker Öland) kördes med `--apply` 2026-08-05. Kvar:
      `node scripts/data/backfill-fmis-existence.mjs --county=Stockholm --apply` samt övriga län
      där vi har `heritage_sites`-rader. Konservativ: bara Fornlämning→extant / Borttagen→destroyed;
      tvetydiga lämnas `unassessed` (redovisas öppet i UI:t).
- [ ] **#3 — Verifiera krönike-epidemierna mot primärkälla FÖRE ingest.** Ur Daniels pest-text:
      "9 000 döda i Stockholm 1451", samt 1413 (Östergötland), 1424, 1442, 1464. Sekundära krönikor
      (Hallenberg/Messenius m.fl.), osäkra tal → in i `historical_events (event_type='epidemic')`
      ENDAST med belagd primärkälla + rätt konfidens. Folktro (blodröd måne, 46 °C, cajeput-olja,
      "Guds vrede") får bara visas SOM samtida föreställning, aldrig som fakta.
- [ ] **DEPLOY-GAP (FTP dist/).** Genealogisidans frontend ligger på `main` men ej live:
      no-GEDCOM platsinmatning, tvåbands-räckvidd (fot + dagsled), häst-toggle + periodmedvetna
      färdsätt (cykel≥1890/tåg≥1860), existence-badgar (🟢/⚪ + "ej bedömd"), år→farsoter.
      DB-ändringar (features_near, +4 epidemi-rader, existence-backfill) är redan live.

## Klart 2026-08-05 (för spårbarhet)

- [x] Epidemi-lagret utökat källkritiskt: +pest 1710–11, kolera 1834, ryska snuvan 1889–90,
      spanska sjukan 1918 (nationell skala, belagda källor). Fanns sedan tidigare: Justinianska,
      Digerdöden, neolitisk pest (aDNA-källor).
- [x] `features_near` returnerar `existence`; dossiern redovisar RAÄ-status öppet.
- [x] SDHK: `sdhk_pipeline.py load` (direkt Postgres, ej PostgREST) + kostnads-/modellbeslut.

## Öppet — UI/data-fynd 2026-08-05 (Explore/Öland/Artefakter/Sök)

- [ ] **Öland t50 mäter FEL sak (källkritik).** `church_consolidation_by_region` ger t50 = median
      byggår för BEVARADE kyrkor → Skåne ~1871 osv. (1800-talets ombyggnadsvåg), inte medeltida
      konsolidering. Kortet visar nu detta ärligt + dynamisk axel (ingen overflow), men äkta
      konsolideringskurva kräver **filtrera RPC:n på medeltida byggår (≤~1350)**. Frontend fixad,
      RPC-fix kvar.
- [ ] **Artefakt-distributionskarta per föremålstyp.** Fibula = 35 inskrifter, **31 med koordinat,
      7 länder** (DK/FI/FR/DE/IS/NO/SE) — en Europakarta är byggbar NU (ej bara SHM). Bilder: **0
      rader i inscription_media** för fibula → vi har INGA bilder; och de är mest danska/utländska
      fynd ur Samnordisk runtextdatabas, INTE SHM (Daniels "från SHM" stämmer ej för dessa). Bygg
      kartan; bilder kräver per-objekt-licens (Nationalmuseet DK m.fl.) — fabricera aldrig.
- [ ] **Sök på storstäder (Göteborg/Malmö) ger inget.** Rätt: Göteborg=1621, utanför vikinga-/
      medeltidsskopet → ingen entitet, och vi ska INTE ingesta Wikipedia/göteborg.com (©/CC-BY-SA)
      eller hitta på en stadsartikel. Men vi HAR grannarna: Lödöse/Kungahälla (heritage+viking_cities),
      Uppåkra. FÖRSLAG: sök-resolver mappar modern storstad → närmaste i-skop-innehåll ("Göteborg →
      medeltida föregångare Lödöse/Nya Lödöse/Kungahälla; hällristningar"). Kräver GlobalSearch-arbete.

## Klart 2026-08-05 (b)

- [x] **Eriksgatan-linjen borta** — rotorsak: DUBBEL `eriksgata_nearby`-overload (radius_m vs
      radius_m+church_radius_m båda default) → PostgREST 300 tvetydighet → await kastade → draw()
      kördes aldrig. Fix: DROP enarg-versionen (heritage_sites); behåll tvåarg (ecclesiastical_sites).
      Hooken härdad (linje ritas även om RPC fallerar). **DB-fix live direkt** — linjen tillbaka utan deploy.
- [x] Home-knappen borttagen ur navet (loggan länkar hem). Öland: interaktiv karta högst upp.

## PAUSAT 2026-08-05 (c) — genealogi fält-navigering + Near me + content_pages

**KLART (på `main`, kräver deploy om ej annat sägs):**
- [x] **content_pages KG-spatial** (tabell + seed + `pages_near`, **LIVE**) + Near me-sektion "✨ Upplevelser & sidor nära dig". Site-radie tätare (Sandby borg = Öland, ej Kalmar). Se [[content-pages-kg-spatial]].
- [x] **Landhöjning på /explore** — återanvänd `useShorelineOverlay` + `ShorelinePeriodControl`, inline ovanför kartan (ej ny overlay). `MapCore`.
- [x] **Genealogi:** gravar/rösen **grupperade** i listan (⚰️ N, expanderbar) + lämningar **plottade på kartan** (kyrkor/runstenar framträdande, gravar dämpade prickar).
- [x] **Genealogi hem→mål:** "🧭 Gå hit" på kyrkan → bäring + avstånd (fågelväg) + korridor "på vägen dit" (`features_along_route` RPC, **LIVE**) + linje ritad på kartan.
- [x] **Explore fokus-fix:** merge bevarar `false` + christian i baslinjen + eriksgatan uttömmande släck-lista → löser "för mycket ifyllt" / landobjekt på rivers / eriksgatan-leden drunknar. `useExplorerData` + `exploreProfiles`. (OBS: `focusPresets.ts` = DÖD kod, anropas ej.)

**PAUSAT — genealogi/fält nästa steg:**
- [ ] **Orter-lager** (orter med storlek) → "Gå till närmaste ORT" (nu bara kyrka) + **närmaste större ort i 4 väderstreck** (avslöjar namnkrock, orientering). Löser båda ur samma data.
- [ ] Koppla **live-GPS-riktningskägla** (`FieldNavControl`) till hem→mål för på-plats-navigering (mobil, kräver webbläsartest).
- [ ] **Riktig gångrutt** (routing-motor OSRM/Valhalla) i st.f. fågelväg om turn-by-turn önskas.
- [ ] content_pages: **fler poster** (Kalmar slott/domkyrka/spökpromenad, Sankt Olof, teman) — kräver verifierad koord + målsida per post; spegla i `entity_registry`.

**ÖPPNA BUGGAR (Explore — kräver webbläsar-inspektion):**
- [ ] **Klick öppnar inte objekt** på /explore — trolig z-index/overlay; misstänkt `index.css:203–205` (z-index 9000–9600 !important på medaljonger). DevTools-koll: vilket element fångar klicket.
- [ ] **Teckenförklaringen ligger över rubriken** (legend-overlap) — positionering/z-index.
- [ ] Kluster-drill-in (1015/686) — verifiera efter klick-fixen.

**Öppet — övrigt:**
- [ ] **/sv/kyrkor union:** kloster(46)/hospital(11)/holy(2) ur `christian_sites` saknas där (sidan läser `ecclesiastical_sites`) — union-vy el. sammanslagning.
- [ ] Rune-verktyg: långkvist/kortkvist som eget SKRIV-val (läsaren tolkar redan kortkvist-varianter).

## Öland-kyrkolitteratur (Sveriges kyrkor) → KLART 2026-08-05

BYGGT: ny tabell `ecclesiastical_source` (site_id uuid → ecclesiastical_sites, sourceid bytea → sources;
speglar object_source). 4 forskare (Boström fanns, +Olsson/Näslund/Hammarström), 21 `sources`-band,
**25 länkar, 22 kyrkor** har nu litteratur. /forskare visar dem (läser research_scholars+sources).

KVAR: (1) **frontend** — kyrksida/kyrkmodal renderar inte `ecclesiastical_source` än (som object_source
för runstenar). (2) ~~2 SvK-band olänkade~~ KLART: skapade **Kalmar slottskyrka** (koord ur heritage_sites
Kalmar slott, 56.65806/16.35556) → band 117, och **S:t Nikolai kyrka/Bykyrkan** (church_remains, sprängd
1678, Erik av Pommerns unionskröning 1397; koord Gamla kyrkogården 56.6604/16.3517, Wikipedia-verifierad)
→ band 162. (3) Kalmar stads historia I–III
(Hammarström red., 1982) = stadshistoria, medvetet ej kyrkolänkad (på /forskare). (4) forskarnas
levnadsår lämnade NULL (ej fabricerade — backfill källverifierat). Kalmar storkyrka = domkyrkan (länkad dit).

## Nästa möjliga spår (ej påbörjade)

- [ ] År→regent i dossiern (235 `historical_kings`, →1973) — "vem styrde när anfadern levde".
- [ ] Vägbunden räckvidd (isokron längs väg till kyrkan) i st.f. cirkel — kräver historiskt
      vägnät: **Lantmäteriet historiska kartor** (häradsekonomiska kartan ~1900, storskifte/laga skifte).
- [ ] Tidigmodernt sockenliv (1600–1900): Tabellverket/SCB, DDB Umeå, Herdaminnen, SGU jordart.
      Data-anskaffning, ej kod. ALDRIG fabricera — forskningsplattform.

## Socken-dossier (backlog — spec: `docs/socken-dossier-spec.md`)

Kronologisk "allt om min socken" ur egen data för släktforskare (Rötter). MYCKET finns redan i
`Genealogy.tsx` (features_near-dossier + klientsidig GEDCOM). Faser:
- [ ] **Fas 1 (hävstången):** RPC `socken_dossier` (features + `period_start/end/label`) + kronologisk
      epok-rendering i befintliga dossiern.
- [ ] **Fas 2:** dedikerad `/sv/socken/:slug`-route (SEO, deep-link) som återanvänder dossiern + sitemap.
- [ ] **Fas 3:** GEDCOM→socken-sida-länkar + "Dina anors bygder"-index.
- [ ] **Fas 4 (senare):** sockenpolygoner (äkta scope) + user-generated plats-fakta (egen spec).
      ALDRIG ingesta Förbundets produkter (Sveriges dödbok/befolkning/Rotemannen…) — katalogskydd.

## Öland-karta korrigeringar 2026-08-05

- [x] **Hossmo** flyttad till fastlandet vid Ljungbyån (Hossmo kyrka 56.6372/16.2251) — låg fel på
      Öland-sidan (16.437). `CONN_NODES` + Hossmo–Karlevi-linjen (Oland.tsx).
- [x] **Björnhovda-skatten (solidi, 36 st)** rättad → 56.6535/16.5028 (NÖ Färjestaden, verifierat i
      `solidi`+`place_names`). Var 56.60/16.52. **DB live** (coins-raden).
- [x] **Kalmar–Färjestaden-linjen** omdragen: Kalmar→Färjestaden→Gråborg→Långrälla→Bröttorp→N Möckleby
      (verifierade ankare, schematisk). Låg fel inåt landet mot Mörbylånga.
- [ ] **DUBLETT att lösa (Daniels ok):** `coins` har en andra Björnhovda-post ("Björnhovdaskatten
      (solidusskatt, Torslunda)", id `5eb4c283…`, @56.51/16.48) — trolig dublett av 36-st-skatten. Radera/merge.
- [ ] **Vägdetaljer ej ritade** (saknar verifierad geometri): väg 136/H951/H957, Borgmossen/Nötmossen,
      Borgsby, samt **Långrälla borg** (finns EJ i `swedish_hillforts`). Schematisk ankarlinje tills vägnät finns.
- [ ] Frontend-korrigeringarna (Oland.tsx) kräver deploy (FTP dist/); Björnhovda-coord (DB) är live.

## Fornvägnät + lämningsgeometrier 2026-08-08

KLART:
- [x] Fornvägnät: `färdväg` tillagd i `ingest-fmis-lamningar.mjs`; **51 Öland-färdvägar** (punkter) → heritage_sites.
      Löser delvis "Vägdetaljer ej ritade" (ovan) — färdvägslämningar finns nu.
- [x] `lamning_geometry` **decouplad** (`register_id`, ej bara heritage_sites-uuid) → geometri kan hänga på
      L-nummer även när lämningen ligger i annan tabell (t.ex. Ismantorp i swedish_hillforts). Migr 20260808… .
- [x] **13 nedladdade Fornsök-GeoJSON** (EPSG:3006→4326) → **46 geometrier** (polygoner=ringmurar/borgar,
      linjer=färdvägar). Skript `ingest-lamning-geometries.mjs`, källa `src_fornsok_kmr`.

ÖPPET — steg 3+4 (FÅR INTE MISSAS, tas efter 1+2):
- [x] **Steg 3 — nationell färdvägstäckning.** KLART 2026-08-08: **2 515 färdvägar** i heritage_sites
      (Öland 53), inga source_uri-dubletter.
      ⚠️ **Keying-varning för steg 4:** FMIS-pipelinen fyller `source_uri` (lämnings-uuid), INTE `register_id`
      — bara 2/2515 har L-nummer. Geometri-filerna nycklas på L-nummer. Steg 4 måste därför bära en
      **uuid↔L-nummer-korsreferens** (finns i lämningsposten) för att koppla linjer till punkterna.
- [ ] **Steg 4 — ALLA lämningsgeometrier (linjer/polygoner) nationellt.** WFS/geodata-pass mot RAÄ:s öppna
      geodata (Kulturmiljöregistret WFS/GeoPackage) → lamning_geometry. Skalbara firehosen (per-lämning-
      nedladdning skalar ej). OBS: Fornsöks eget sök-API = odokumenterad SPA-backend, EJ värt att crawla.
- [ ] **Frontend:** rita lamning_geometry (linjer/polygoner) på kartorna — färdvägnätet som LINJER, inte
      punkter. Kräver deploy.

- [ ] **Smedby / homonym-sök:** DB-söket FUNGERAR (search_v1/v2 + entity_answer_context ger träffar) →
      "ingen träff" = DEPLOY-GAP. MEN äkta brist: `entity_answer_context` klumpar ihop ALLA Smedby-socknar
      (Öland+Uppland+…) till ett medelvärdes-center i st.f. att disambiguera "vilken Smedby?".
      Relaterar [[entity-senses-disambiguation]] + storstads-resolvern ovan.
- [ ] **Claim-liggare frontend:** bygg `/sv/plats/:slug` med panel **"Källäge"** (place_claim: status-badges,
      källtier A–D, konflikter sida vid sida). Ismantorp = `/sv/plats/ismantorps-borg`. Se [[claim-ledger-architecture]].

## Helskärms-QA desktop (2026-08-08 d) — container-bredd

- [x] **Inskriftssidan** (`InscriptionPage`): `max-w-5xl`→`7xl`; hero omgjord → porträttbilden kapas
      (`460px`-kolumn, blåses ej upp) och **kartan blir bred** (1fr) + högre (360px). Bättre desktop-yta.
- [x] **20 kart-/data-/regionsidor vidgade** `max-w-4xl/5xl`→`max-w-7xl`: Oland, Kalmar, SandbyBorg,
      Helgon, Angermanland, CentralPlaces, GotaLandsvag, Staket, Maktsfarer, ExecutionSites, LegendStones,
      Stenalder, DanskaRunstenar, Birka, SiteIndex, SourceLibrary, Genealogy, ThemePage. Runes/Podcast → `6xl`.
- [ ] **PROSASIDOR medvetet SMALA** (läsbarhet ~65–80ch): Privacy, EconomicHistory, Vetenskapsmetodik,
      SanktOlof, SourceDetail. Heraldry ej rörd (osäker typ — kolla).
- [ ] **QA-VARNING:** container-vidgning är steg 1. Sidor med enkolumns-innehåll får nu BREDA kort/rader
      → visuell QA på deploy; vissa behöver *intern* omstrukturering (flerkolumn/prosa-cap) för att
      bredden ska användas väl, inte bara bli bredare kort.

- [x] **Spår 1 — multi-domän-svar.** `entity_answer_context` returnerar nu även `churches`/`wrecks`/`events`
      nära platsens center (nya CTE:er + `ctr`-center-CTE; bara spatiala grenar). Kalmar → 63 runstenar +
      12 kyrkor + 12 vrak + 5 händelser. AnswerContext renderar dem som togglbara kartlager (violett/rosa/
      grön) m. räknare. DB live; frontend deploy-gated.
- [x] **Spår 2 — tidsreglage på kartan.** RPC ger nu `from/to` (period) på inskrifter. AnswerContext har
      en tidslinje-scrub ("≤ år N") som filtrerar alla daterade lager (runstenar/kyrkor/vrak/händelser);
      odaterade syns alltid; `fitKeyRef` hindrar omzoomning vid scrub. DB live; frontend deploy-gated.
- [x] **Spår 3 — KG-navigering.** RPC ger `related` (dubbelriktade relationship-kanter för entiteten,
      t.ex. Erik Segersäll → Sigtuna/gods + Munsöätten/dynasti). AnswerContext renderar dem som klickbara
      chips ("Gå vidare i kunskapsgrafen") som söker vidare via `onQuery`. DB live; frontend deploy-gated.
- [ ] **Kalmar-homonym (rapporterad live):** DB är KORREKT — search_v1/v2 + entity_answer_context rankar
      alla Kalmar STAD (Småland, prominence 2.05) överst; Uppland-Kalmar ej i topp 6; svarets center =
      stadens koord. "Landar på Håbo" live = **deploy-gap** (stale frontend). Ev. `pick`-CTE i RPC:n bör
      ändå härdas att konsultera `place_authority` (för homonymer UTAN content_page). Vänta på Daniels
      uppgift om vilken vy/klick som landar fel.

## Sök-fynd 2026-08-08 (b) — media-discovery, homonym, Ög-bilder

- [x] **Sök-kaskad byggd (media + externt + bidra + gap-loggning).** AnswerContext no-entity-gren
      renderar nu `SearchFallback`: (1) `TopicMedia` (poddar/video, Hitler→37 osv.), (2) externt
      "sök vidare"-block (Wikipedia/Wikidata/Scholar/DiVA, ny flik, "ej granskat av oss"), (3) bidra-CTA,
      (4) loggar sökordet i **search_gaps** (RPC `log_search_gap`) → innehållsplanering: `select term,hits
      from search_gaps order by hits desc`. Frontend, deploy-gated. DB (search_gaps+RPC) live.
- [x] **Homonym (Smedby) — utrett, ej en bugg.** entity_answer_context fick `pick`/`alt`-CTE +
      `alternatives`-fält (harmlöst), MEN runsten-Smedby finns bara på Öland → ingen homonym på
      runstensnivå. De "10 Smedby" bor i place_names men **province=null** (OSM-tunt) → går ej att
      disambiguera geografiskt ännu.
- [ ] **Ortnamns-lagret i kaskaden (deferred).** Lager 3 (place_names-kort + "finns även i…") kräver
      först **provins-backfill** av place_names (Lantmäteriet/Isof) — annars tunt/vilseledande. Se
      [[god-ortnamnssed-provenance]]. `alternatives`-fältet i RPC:n bör då nyckla på place_names+provins.
- [x] **Ög-stenar runt Rök utan bild (Ög 134/135/137–142).** Utrett: alla 8 har Wikidata-item men
      **varken P18-bild eller Commons-kategori (P373)**, och RAÄ saknar licens-rena foton → genuint gap
      i öppen bild. Ej bugg. "Bild saknas · bidra" korrekt. Fylls bara via fältfoto eller ny licenskälla.

## Forskarkonton — Fas 1 KLAR 2026-08-08 (frontend deploy-gated)

- [x] **researcher_profiles utökad** (fanns redan från tidigare, tom): +`handle` (unik, /forskare/:handle),
      `avatar_url`, `social_links jsonb`. Publik SELECT-policy fanns kvar (USING true) → publika fält OK.
      INSERT-policyn HÄRDAD (saknade WITH CHECK → godtycklig user_id möjlig) → `rp_insert_own` (auth.uid()=user_id).
- [x] **researcher_private** (NY tabell): `user_id` PK → auth.users, `address`, `updated_at`. RLS owner-only
      (rpriv_owner) + admin (rpriv_admin). INGEN publik policy → adress läcker aldrig. Adress medvetet i EGEN
      tabell (defense-in-depth: bastabellens publika SELECT-policy kan inte råka exponera PII).
- [x] **Profile.tsx** (EXISTERANDE /profile-sida utökad — INGEN dubblettsida): +handle m. publik-URL-länk,
      +LinkedIn/X/Academia (→ social_links), +privat adress (→ researcher_private). handle normaliseras till slug.
- [x] **ResearcherProfile.tsx** (NY) → route `/forskare/:handle`: publik profil, läser bara publika fält (aldrig adress).
- [x] **InscriptionDiscussion** gatead bakom login (`useAuth().user`) — utloggad ser godkända inlägg + login-CTA.
- [x] **Privacy.tsx**: ny sektion Konto/forskarprofil/bidrag (SV+EN), adress privat, bidrag modereras, radera konto.
- [ ] **types.ts ej regenererad** — nya kolumner/tabell nås via `(supabase as any)`. Regen via `--linked` vid tillfälle.
- [ ] **Fas 2 (deferred):** foto-upp (auto-komprimering Canvas + licensintyg → modererad → inscription_media) +
      dokument-upp (PDF + författare/medförfattare + licens → source). Kräver PRIVAT storage-bucket (nuvarande är publika).
- [ ] **Fas 3 (deferred):** GPS-position + gå-och-mät → observation; "mina bidrag nära mig" på plats.
- [ ] **Avatar** (Fas 2): uppladdning + komprimering. I Fas 1 finns bara `avatar_url`-kolumnen (ej exponerad i UI).

## Svarskarta: befästningspolygoner + heritage-site-center 2026-08-08 (frontend deploy-gated)

- [x] **RPC `fortifications_near(lat,lng,radius=3000)`** → GeoJSON av `fort_element` (publicerade, 3006→4326)
      + `lamning_geometry` linjer/polygoner (aktuella). Varje feature bär evidence_class + datering.
- [x] **AnswerContext ritar polygoner/linjer** (nytt fort-lager): bevarat_ovan_mark = heldraget, interpolerad/
      hypotetisk/RAÄ-utan-bedömning = streckat; polygoner fyllda 0.12; punkter (portar) = små markörer.
      Legend-toggle "Befästningar · N". Källkritik: inget ser säkrare ut än evidensklassen.
- [x] **entity_answer_context: `hsite`-gren** — exakt namnträff mot heritage_sites (ej socken/parish/landskap)
      ger center när inget content_page/tema/runinskrift matchar. Fix för "Kalmar slott" (gav center=null →
      ingen karta). "Kalmar" (staden, count 63) opåverkad (exakt namn hindrar kapning). Nu: Kalmar slott →
      center=slottspunkt, 1 site, 28 runstenar, 16 fort-features (stadsmur+bastion+polygoner L1958:9072/L2021:1620).
- [ ] **Slottets EGEN vallpolygon (Kalmar 53) saknas** i DB — bara punkt. Ladda ner lämningsgeometrin från
      Fornsök (Kalmar slott, lämning "Kalmar 53") som GeoJSON → kör `ingest-lamning-geometries.mjs --apply`.
      Hittade INTE på en vall; bastion+polygoner finns redan och ritas.
- [x] **WindRose minimerbar + mindre** (w-176px, minus-knapp → vind-chip). `defaultOpen`-prop.
- [x] **Mobil: footern dold på /explore** (`!isMobile`) → frigör kartyta. "Vad finns här"-knappen lättare
      mörk bakgrund på mobil (bg-slate-900/45). Följ (emerald)/Near me (sky) FAB:ar = varumärkesfärg, ej dark —
      lämnade; kan finjusteras med enhetsfeedback.
- [ ] **/sv/oland "bredare"** = redan max-w-7xl i byggd kod → **deploy-gap** (live släpar). Deploya.

## Vikinganamn — datakvalitet + attesterad frekvens (diskuterat 2026-08-08)

- [x] **Intresseprofilen flyttad SIST på /explore?focus=names** (Daniel). ExplorerLayout: `desktopHeader`
      extraherad; top-render skippas för names, renderas i `mt-6`-block efter LayoutContent.
- [ ] **viking_names (351 rader) är källkritiskt OSTÄLLD** — topp-"vikinganamn" är Hans/Jakob (medeltida
      kristna), regioner som {Tyskland}. Ser ut som generisk obelagd lista. frequency/regions-proveniens okänd.
- [ ] **Bygg om som ATTESTERAD inventering:** (1) seed namnbeståndet ur Lena Peterson, *Nordiskt
      runnamnslexikon* (Isof, fri PDF) — ~1500+ namn attesterade i nordiska runinskrifter + etymologi;
      (2) beräkna `frequency` + `regions` ur VÅR korpus (`normalization` × `landscape`) — POC: Þorsteinn
      38 Uppland/14 Söd/8 Ög; (3) länka namn→attesterande inskrifter (evidensväg, klick → stenarna).
- [ ] **Epistemik (måste ramas in):** runstensfrekvens ≠ befolkningspopularitet (bara den namnbärande elit
      som reste stenar). Etikett: "belägg i runkorpusen i region X", ej "vanligaste vikinganamnet".
      Inflektion/homografer → naiv delstädsmatchning överskattar; kräver lexikon + lemmatisering.

## Explore-layout: linjal→breadcrumb + fotband 2026-08-08 (frontend deploy-gated)

- [x] **Legend "Äventyr & upplevelser":** spökvandrings-länkraden fick samma rad-design som övriga
      (vänster ikon-kolumn + label + extern-länk-affordans). Bröt förut mot designen (saknade ikon+switch).
- [x] **Linjalen → breadcrumb-raden (chrome).** Ny `RulerBar` (inline, chrome-typografi via tokens) i
      Explore på samma rad som breadcrumben (`Breadcrumbs bare`-prop). Tog bort flytande `RulerControl`
      ur `FloatingPanels`. Mätningen sker fortfarande på kartan (useMapRuler, global state). RulerControl.tsx
      nu oanvänd (kvar i repo).
- [x] **Fotband:** intresseprofilen + explore-kontrollerna (LayoutHeader/PanelLayoutSelector) flyttade SIST
      på sidan (under kartan/innehållet) i ExplorerLayout — alla vyer utom cultSites (egen överst). Kartan först.
- [ ] **Obs UX:** primär-söket bor i profilkortet → nu längst ner på desktop-explore. Förstoringsglaset i
      sidhuvudet finns kvar som sök-ingång. Säg till om söket ska ligga kvar överst.

## Desktop-legend/kontroller 2026-08-08 (frontend deploy-gated)

- [x] **Färdläge (Gå/Cykla/Kör) + "Spara egen vy" gate:at till MOBIL** i MapLegend (`isMobile`). Desktop
      behöver det inte (fält/billäge-koncept). Mobil-drawern visar det, desktop-DraggableLegend döljer.
- [x] **Desktop-legenden högerflushad:** LayoutContent legendPosition default nu adaptiv
      `min(innerWidth,1280)-32-340-8` → hugger kartans (max-w-7xl) högerkant i st.f. fast x=880 (stort gap
      på laptops). Fortfarande dragbar.
- [x] **Near me: sparande kräver konto, discovery + rutt öppet** (Daniel valde). NearMeControl "Mina platser"
      (namnge/spara/lista/ta bort egna punkter) gate:at bakom `useAuth().user` → utloggad ser "Logga in för att
      spara". Geolokalisering, near-me-resultat och ruttplanering orörda (öppet för alla). Gäller alla enheter.

## Vikinganamn attesterat ur korpusen — BYGGT 2026-08-08 (frontend deploy-gated)

- [x] **runic_name_attestations** (1648 fornnordiska namnformer / 1527 fold-grupper / 7518 belägg) +
      RPC `attested_runic_names(p_limit,p_region)`. Härledd ur `normalization` (versal-token-extraktion +
      stopplista pronomen/liturgi/gudanamn; fold_key grupperar stavningsvarianter). Per landskap + sample-signum.
- [x] **VikingNamesView:** ny sektion "Namn attesterade i runinskrifterna" (topp 60 lemman, regionbrytning,
      klickbara stenar). Källkritiskt märkt: belägg i korpusen ≠ befolkningsstatistik; approx; ON-former.
- [ ] **Nästa (namn):** lemmatisera mot Peterson *Nordiskt runnamnslexikon* (kön + betydelse + bättre variant-
      sammanslagning io/jǫ, ei/æi); mappa attesterade former → curated viking_names.

## Backlog att ta samlat (rapporterat 2026-08-08, EJ gjort)

- [ ] **Bild-gap-flod (Commons-ingest-batch):** MÅNGA stenar rapporterade utan bild över flera meddelanden —
      Sl 3/4/5/13/118/119/120, Sö 375, Öl 30/34/35/50/54 + Öl ATA322-4215-2004/ATA4700-43/ATA4976-70, Bo NIYR 1/2/3,
      Bo Hoga/Kalleby, DK Bl 4, DR 336/295/209/230, DK Sk 8, Ög 64/67/70/169/8/81/136, Vr 2/4/5/NOR1994;27,
      D-blybleck, N 68/348/157/568–572, J 1/2, FR 2, Hagia Sophia (Tu FV), UK Br-stenar, poesi-stenar m.fl.
      → kör `ingest-commons-images.mjs` (Wikidata P1261) batch; berömda fyller auto, rapportera genuina gap.
- [ ] **`/explore?searchQuery=` visar EJ fort-lagret/rik svar** — fort-polygonerna bor i global-sökens
      AnswerContext, inte på Explore-sidan (läser bara `focus`). Wire fort-lagret (ev. hela svaret) på Explore
      för `searchQuery`, ELLER låt hits öppna svarspanelen. "Kalmar utan stadsmur" = detta gap.
- [ ] **Kalmar maritim (källkritiskt, egna bilder i docs/kalmar/):** Stensö/**Dragviksudd** dragvi-hypotes
      (kortaste båtdrag över näset, låg tröskel → använt i st.f. Stensö kanal); Hossmo/Björnö-bilder; Olsan idag;
      Skäggenäs N om staden. → location_hypotheses/claim-ledger + bild-proveniens. Kräver noggrann källhantering.

## Mobil-declutter + Dragvik-hypotes 2026-08-08

- [x] **Mobil: Near me:s stora första-gångs-CTA borttagen.** Den hade en stor knapp + TVÅ bg-slate-900/80-
      textrutor (kom-ihåg + integritet) = ~1/4 av mobilytan, "två mörkblå bakgrunder" (Daniel). Nu EN kompakt
      sky-pill (bottom-3 right-4) på både mobil och desktop; kom-ihåg default true, integritetsnotis via /privacy.
- [x] **Dragvik båtdrags-hypotes** → crossing_points (kind='portage', 56.64776/16.31513, ur SWEREF99TM
      N6278950 E580642 via ST_Transform). Källkritiskt: ortnamnsledet drag- stödjer; EJ belagt, elevation ej
      uppmätt, kräver DEM/fältverif. Sjökort/flygbild REFERERAS (© Sjöfartsverket/Lantmäteriet), hostas ej.

## Sök: "relaterat/se även" för utanför-skopet-städer 2026-08-08 (frontend deploy-gated)

- [x] **search_related** (kurerad tabell) + RPC `get_search_related(term)` + AnswerContext-block ("Relaterat ·
      se även") i BÅDE huvudsvar och fallback. Seedat **Göteborg**: faktanotis i VÅR formulering (grundat 1621
      Gustav II Adolf; föregångare Lödöse/Nya Lödöse ~1473/Gamlestaden; Kungahälla; Karl IX Färjenäs 1603→bränt
      1611) + 5 chips (Nya Lödöse, Lödöse, Kungahälla, Älvsborgs lösen, Nya Älvsborgs fästning) som söker vidare
      in-skope. goteborg.com/Wikipedia-prosa ingestas ALDRIG (©/CC-BY-SA) — bara fria fakta + länkar till det vi har.
      Chips landar på riktiga entiteter (Nylödöse gråbrödrakonvent, Lödöse dominikankonvent, Kungahälla heritage).
- [ ] **Fler städer:** seeda Malmö, Stockholm, Helsingborg m.fl. i search_related samma mönster (fakta + föregångare).

## Exkursionssidan Fas 1 (typad legend) + borg-dubblett 2026-08-08

- [x] **ExcursionDetail Fas 1:** typad symbologi (NEAR_CATS: fornborg/runsten/kyrka/kult/hällristning/vägnät/
      gravfält/stensättning/röse+stenmonument/övrigt — färg+ikon+storlek per typ) ersätter cyan-pricksoppan.
      Togglebar teckenförklaring + POI-listan flyttad till HÖGERKOLUMNEN bredvid kartan. Kyrka fångar nu BÅDE
      kind='church' och heritage raa_type kyrka/kapell. Vägtyperna sammanslagna. Runstenar + kultplatser
      (RELIGIOUS_PLACES: Torslunda/Skedemosse) plottas nu på kartan. Bjälkrör/Katrör = namngivna röse/stensättning.
- [ ] **Fas 2 (kvar):** porta Öland-lagren (borgterritorier/solidi/vindros/vindskyddad farled/Revsudden→Stora Rör).
- [ ] **Fas 3 (kvar):** Fornborgsanalys-sektion (Olausson-fingerprint) + Ismantorps radiella borgvägar (verifiera).
- [ ] **BORG-DUBBLETT (verifierad):** samma fort i `viking_fortresses` ("Ismantorp") OCH `swedish_hillforts`
      ("Ismantorps borg"), ~6 m isär → dubbel träff i sök (entity_type fortress + hillfort). Voronoi-territoriet
      i sig är EJ dubblerat (en swedish_hillforts-rad, RPC ger den en gång, Oland-lagret rensas före omritning).
      FIX-förslag: dedup i search_document (kollapsa fort som finns i båda tabellerna vid ~samma koord → föredra
      EN entity_type), ELLER external_ids-crosswalk. Kräver kanon-beslut (troligen swedish_hillforts=Voronoi/RAÄ,
      viking_fortresses=kurerad detalj). Gör INTE unilateralt.

## Vägnät som linjer + borg-dedup 2026-08-08

- [x] **Vägnät ritas som LINJER** (ExcursionDetail): ny RPC `roads_near(lat,lng,radius)` → färdväg-LINESTRINGs
      ur lamning_geometry. Ismantorp: 3 segment av **"Borgvägen" (RAÄ L1958:9929)** mot borgen — RIKTIG geometri,
      inga påhittade riktningsstreck. Ritas i 'road'-kategorin (brun linje), togglas med vägnät-legenden.
- [x] **Borg-dedup i sök (LIVE):** tog bort 26 `fortress`-dubbletter ur search_document (viking_fortresses
      som ligger <250 m från en swedish_hillforts). Behöll `hillfort` — dess `/fortresses/:id` LÄSER
      swedish_hillforts (fungerande länk); `fortress`-träffens länk var bruten (fel tabell). Ismantorp = en träff nu.
- [x] **Durabilitet (härdat via TRIGGER):** `trg_sd_skip_dup_fortress` (BEFORE INSERT på search_document)
      hoppar över 'fortress'-rader som dubblerar en hillfort (<250 m) — överlever rebuild_search_document UTAN
      att röra den funktionen. Testat: återinsert av Ismantorp-fortress → 0 rader. Rör ej signal-logiken.
- [x] **23 unika fortress-länkar FIXADE:** FortressDetail (`/fortresses/:id`) faller nu tillbaka till
      `viking_fortresses` när id saknas i swedish_hillforts (mappar region→landscape, construction_period→period,
      historical_significance→cultural_significance). Både hillfort- och fortress-träffar har nu fungerande sida.

## Stegeborg + Öland-borgarna likvärdiga med Ismantorp 2026-08-08

- [x] **Stegeborg = medeltidsborg.** Fanns bara som ortnamn. Lade in i heritage_sites (period='medeltid',
      raa_type='Slott/herresäte' → v_fortifications_all fort_class='medeltidsborg') med verifierad Wikidata-koord
      (Q661338, 58.44139/16.59889), socken Skällvik, RAÄ Skällvik 222:1. Wikipedia-prosan (© CC-BY-SA) INGESTAD EJ
      — egen faktabeskrivning. Söket uppdaterat. "Fler medieval": bara 2 heritage_sites borg/slott utan period —
      flaggade för källgranskning (gissar ej).
- [x] **Fas 1 porterad till FortressDetail** (gäller ALLA fornborgar — Gråborg/Eketorp/Sandby…): typad symbologi
      + roads_near-linjer + togglebar legend + POI-lista, centrerat på borgens koord, reglerbar radie. Delad util
      `src/utils/nearFeatureCategories.ts` (NEAR_CATS/classifyNear) — ExcursionDetail använder samma nu.
- [x] **Fas 2 (Öland-gated) på FortressDetail:** teoretiska borgterritorier (oland_fort_territories, Voronoi) +
      förhärskande vind (WindRose Kalmarsund, minimerbar) visas för forten med landscape='Öland'. Togglas i legenden.
- [ ] **Fas 2 kvar (om önskas):** crossing_points (Kalmarsund-överfart/grund) + solidi-lager + vindskyddad farled
      på FortressDetail för Öland — de tyngre Öland-lagren. Vindros + territorium är de signaturlager som lagts nu.

## Källor som referenser (Wikipedia-modell) + fort-länkar 2026-08-08 (frontend deploy-gated)

- [x] **Delad `<ReferenceList>`** (src/components/references/) — numrerad källförteckning sist på dokumentet,
      ankare id="ref-N" + id="references", externa länkar (ny flik, "ej granskade"), döljer VERIFY-platshållare.
- [x] **FortressDetail: claim-liggaren VISAS** ("Uppgifter & källkritik") — varje place_claim med status-etikett
      (belagt/omtvistat/förkastat) + **inline-fotnot [n]** → #ref-n i referenslistan. Ismantorp = 25 claims synliga.
- [x] **ExcursionDetail:** gamla Källor-sektionen ersatt med samma delade ReferenceList sist på sidan.
- [x] **SourceDetail redirect:** bara-referens (utan egen source_texts-fulltext) som citeras av en place_claim
      → redirectar till entiteten (/fortresses/:id#references). Primärtexter (Eddan m.fl. med source_texts)
      behåller egen sida. → inga dead-end källsidor.
- [x] **/fortresses-listan:** viking_fortresses-korten fick "Läs mer om borgen → /fortresses/:id" (funkar via
      FortressDetail-fallbacken). Hillfort-listan var redan klickbar.
- [ ] **Nästa:** svamparna (Fas 2 väder-ingest / mellansteg). Ev. generalisera claim-liggare+ReferenceList till
      fler entitetstyper (place, inscription) + object_source-baserad redirect för inskriftskällor.

## AI-agentflotta + migrationsdomän — roadmap (2026-08-09)

Se [[ai-agent-fleet]], [[folk-group-phases-domain]], [[coordinate-gap-status]].

- [ ] **Höstens testfall per specialistagent** (propose-only, validera mot KÄNT material med facit):
      runolog (känd daterad inskrift → återge dateringsspann), osteolog (publicerat gravmaterial → köns-/
      åldersskattning), historiker (känt privilegiebrev → bekräftelse≠grundande), **arkeogenetiker**
      (folk_groups.dna_profile: källbelägg eller flagga de osäkra haplogrupps-%), marinarkeolog, kulturgeograf,
      forntidsforensiker (Sandby borg), arkeolog (kulturmiljöutredning för valt område).
- [ ] **Frontend: migrationsbanan på tidsreglaget.** Rendera `folk_group_phases` som tidsviktad bana
      (aoristisk vikt → opacitet/storlek) kopplat till tidsreglaget. RPC `folk_group_migration_weight` klar; 39 faser seedade.
- [ ] **NOTIS/metod — watershed↔hundare (KAN EJ byggas ännu; kreditera i st.f. att härleda).** Korrigering:
      tidigare "direkt byggbar" var fel. **`hundreds` (468) OCH `parishes` (1726) saknar geometri** (namn-register,
      external_id-länkade) → inga hundare/härad-polygoner. Inga avrinningsområden i DB. Watershed↔hundare-
      motsvarigheten är ett ETABLERAT publicerat resultat (Löwenborg 2010, urn:nbn:se:uu:diva-111393; i
      Ambrosiani/Hyenstrand-traditionen) → **notera + citera det**, härled det inte på fabricerad geometri.
      Skilj från det vi HAR: Voronoi-borgterritorier (`oland_fort_territories`) = annan modell. FÖR att reproducera
      krävs: (1) avrinningsområden ur **SMHI SVAR/Vattenwebb (öppen data, Löwenborgs egen källa)** eller DEM+hydrologi
      (GRASS/whitebox, ej PostGIS-SQL); (2) hundare/härad-polygoner (DMS/Lantmäteriet historiska kartor / Westin).
- [x] **4 stads-koord P625** (Toledo Q5836/Ravenna Q13364/Worms Q3852/Bardowick Q508028) verifierade + inlagda 2026-08-09. Alla 16 stadsfaser nu P625-belagda; regioner/legender = markerat approx.
- [x] **Magyar-nod-merge** 2026-08-09: Ungrarerna (dublett, 0 faser) borttagen → Ungerska stammar kanonisk (behöll finno-ugriska språkfamiljen + 3 faser). *Ungerskt kungadöme* (1000–1526) och *Turkisk-ungersk befolkning* (1541–1699) = separata epok-entiteter, medvetet orörda.
- [ ] **Hunniska stammar 85°E-beslut** (urhem vs europeiskt välde). 85°E nu bevarad som fas-attribut i dna_profile.origin_phases; huvudnoden flyttad till Karpaterbäckenet (20/47.2).
- [ ] **Judiskt Kalmar (KLART grund):** begravningsplats + 2 synagogor (Södra Långgatan 48 / Storgatan 70) +
      6-stegs församlingstidslinje inlagt (verifierade OSM-koord, källa Rist/Judiska museet). Ev. fler poster + foton (licens).
- [ ] **Romsk historia:** dokumentera som kulturarv NÄR källa finns (ej migrationsmodell). Ingen Kalmar-källa given ännu.
- [ ] **Swedigarch — utvärdera som uppströms grävgeodata-källa.** Nationell forskningsinfrastruktur (Uppsala,
      VR/RFI-finansierad; konsortium med RAÄ + SHM + SciLifeLab). Rå fältgeodata (undersökningsytor, anläggningar,
      exakta koordinater) som aldrig varit tillgänglig — komplementär KÄLLA, ej konkurrent. Ligger i linje med vår
      longue-durée/migrations-/KG-ansats. **FÖRE ev. ingest: verifiera åtkomstmodell + licens** (forskningsinfra ≠
      nödvändigtvis öppen/CC0; gissa ej villkoren). Tekniskt kompatibelt: SWEREF 99 TM (EPSG:3006, vi reprojekterar
      redan), join via RAÄ-URI/lämnings-ID (external_ids, 57398 URI:er). Skulle lösa de 10 olokaliserade
      archaeological_investigations + ge grävytor som polygoner. Kontakt: Daniel Löwenborg (GIS-delen), Uppsala.
      Se [[interoperability-linked-data]], [[archaeological-investigations]], [[ksamsok-fmis-pipeline]].
- [ ] **DEPLOY-GAP (FTP dist/):** bugg Fix A (highlight-pin i useMapNavigation/ExplorerMain) + Fix C (kurerade
      raa_typer i useMapHeritageSites) + /ai-agenter-sidan + Öland-lager (fornväg/källor/fornborg-etiketter/östra
      landsväg/snäck) + Kalmar stadsmur. Alla DB-ändringar redan live.
- [x] **GIS säkra fixar** (2026-08-09): 21 funktionella geography-index; coord_kind rättat (event/ore_source/
      investigation→latlng+geom); 3 trasiga "\n"-rader nollade. Se [[region-node-overview-mechanism]] (GIS-audit).
- [ ] **GIS medel-risk (ej gjort):** manuell geom→GENERATED (estates/thing_sites/central_places/field_observations);
      SRID-typmod-constraints på 6 kolumner; över-precision-kvantisering. Kräver försiktighet.

## Sök-audit + kyrk-nod + svamp Fas 2-läge 2026-08-08

- [x] **Sök-audit (tomma/tunna objekt):** shipwreck hade 5/2902 i söket, viking_name 139/351 → rebuild_search_document
      ('shipwreck'/'viking_name') körd (safe: inga signaler att förlora) → nu 2902 resp. 351 sökbara (LIVE).
      christian(96/96) + museum(1241) ok. runic_name_attestations (1648) = eget beräknat lager, ej sök-entiteter.
- [x] **Kyrk-/heritage-nod i söksvaret (generellt):** ny RPC `entity_node(name)` (ecclesiastical_sites →
      christian_sites → heritage_sites, rikaste beskrivning) + nod-header i AnswerContext (kind · datering + titel
      + beskrivning). Kläckeberga kyrka visar nu "Medeltida sockenkyrka ~1300…" i st.f. bara karta+närområde.
- [~] **Svamp Fas 2:** pg_net + http PÅSLAGNA. MEN: berakna_score = hex_habitat × least(vatten,temp,fenologi)
      → kräver habitat (hex9/hex_habitat = TOMT, Fas 3 lokal DEM). uppdatera_tillstand (väder) är habitat-oberoende
      men kräver ändå hex6-grid (h3-js) + Open-Meteo-ingest + frontend. → habitat-lite = eget mini-projekt
      (Overpass skog → h3-js res-9 → hex9/hex_habitat + väder-ingest + kartlager). EJ blind-byggt. pg_cron kvar.

## Kö efter Vickleby/Revsudden-spåret 2026-08-12 (Daniels prioordning ej satt)

- [ ] **(a) Hålväg-ingest Steg 4 — Kalmar-fastlandet.** FMIS-ingesten körde aldrig nationella
      lämningsgeometrier (WFS mot RAÄ Kulturmiljöregistret). Revsudden/Drag-hålvägarna finns i RAÄ
      (Daniels Lantmäteri-bilder: docs/kalmar/revsudden-kalmar.jpg, skäggenäs.jpg) men ej hos oss.
      Kör linjegeometri-hämtning för Kalmar-fastlandet → lamning_geometry. Jfr [[halvag-fardvag-ingest]].
- [ ] **(b) place_names som center-källa i entity_answer_context.** Revsudden/Drag (osm_village/udde)
      får tomt center → ingen karta. RPC centrerar bara via content_page/runsten-socken/heritage-namn.
      Lägg place_names-fallback (+ Närhets-motorn). Löser "sök på ort utan runstenar ger inget".
- [ ] **(c) Nästa Västgötalags-balk.** Rättlösabalken LIVE ([[vastgotalagen-pilot]]); filologen tar
      nästa balk (Kyrkobalken?) samma mönster: grundtext PD + AI-översättning märkt + kollationerad.

## Mobilt kör-/gångläge — FÄLTPROV-BUGGAR 2026-08-12 (Daniel körde bil 50 min)

Körläge (DriveView/DriveView3D):
- [ ] **KRITISK: GPS-position uppdateras INTE under färd.** Kvar på startgatan (Stockholmsvägen 33)
      hela 50 min; sväng-anvisningar (vä/hö) uppdaterades ej (aldrig "ut på E4:an"/"av mot Lidingö").
      → watchPosition/turn-by-turn-avancering trasig. Rotorsak i kod.
- [ ] **Footern växer sig större och större** i botten (layout-bugg, ackumuleras).
- [ ] **3D-vyn fungerade inte.**
- [ ] **Saknar ETA:** ingen tid/mil kvar till målet visades.
- [ ] **Ljudknappen syns inte** (bör synas för röst-anvisningar).
- [ ] **Ingen parkering** vid framkomst till målet.
- [ ] BRA: blå destinationslinje + pil på linjen syntes.

Gångläge (walk mode):
- [ ] **Zoom fel från start:** liten prick, svårt lokalisera sig. Ska vara **inzoomat från början**
      (se sin position), sen kunna zooma ut. Jfr [[heading-up-car-mode]], [[maplibre-drive-view-fas2]].

## Äventyr & motion — kategorier + ingest 2026-08-12

- [x] **Äventyrslager i söksvaret** (AnswerContext): badplatser (nearby_experiences) + grottor
      (heritage_sites, 143). Grön legend-toggle "Äventyr & motion". Live i DB; frontend deploy-gated.
- [x] **bath_kind-klassificering** (experiences): naturbad 2631 / hundbad 18 / barnbad 12 / klippbad 3
      / nakenbad 2 — härledd ur namn, granskningsbar. Daniel förbättrar manuellt. Inomhus/simhall = 0 (gap).
- [ ] **Nya äventyr-kategorier att INGESTA (källkritiskt — fakta fritt, listor ©):**
      - **Fiskeställen** m. säsong: Daniels egen geokodade GeoJSON/CSV (WGS84+SWEREF99TM, coord_source
        Google/Approx) i Downloads → experiences category='fiske', season som datumintervall.
      - **Golfbanor:** primärkälla = **GIT** (Golfförbundet) / öppet register, EJ Golfguiden/allabanor-listorna rakt av.
      - **Simhallar/inomhusbad:** kommunernas anläggningar (simma.nu är crowdsourcad referens, ej ren källa).
      - **Vattenland/äventyrsbad, nakenbad, hundbad:** komplettera bath_kind/experiences ur primärkällor
        (Tripadvisor/Aftonbladet/Momondo = redaktionella ©, bara som referens — ingesta fakta+koord, ej text).
      - Alla: geokoda (WGS84 + SWEREF99TM), säsong där relevant, coord_source + rights.
- [ ] Exponera bath_kind + kategori i äventyrslagret (färg/toggle per typ) — nearby_experiences returnerar
      ej bath_kind ännu; byt till direkt experiences-fråga el. utöka RPC:n.

## Göteborg / stad-svar 2026-08-13

- [x] Grundningshändelser 1603/1611/1619 (Färjenäs verifierad, Wikipedia).
- [x] content_page 'goteborg' → svaret ankrar på Gustaf Adolfs torg (var Hisingen) + /sv/plats-listning.
- [x] RAÄ Fornsök-länk på generiska notable sites (external_ids). Göteborg 9/10.
- [x] Skansen Kronan + Lejonet i fort_element (verifierade koord).
- [ ] **Nya + Gamla Älvsborg** — verifiera koord (fanns ej i sök) → fort_element.
- [ ] **Museer**: bara 15 geokodade i DB → berika (Göteborgs stadsmuseum, Sjöfartsmuseet …) + rita museum-lager i frontend (RPC returnerar det).
- [ ] **Fler skansar/befästningar** riksomfattande (efter-vikingatida) → fort_element.
- [ ] Kust-städer: "öar att besöka"-dimension (Vrångö/Hönö/Vinga finns som äventyr/vrak).

## Färdvägar & leder — backlog 2026-08-13

- [x] Generisk vägrenderare: road_overview(slug) + RoadPage /led/:slug + roads-sektion på /place.
- [x] Attundalandsvägen (Ambrosiani) — waypoints ur Rundata (ursprungslägen, ej flyttade).
- [x] Långhundraleden — GROV schematisk korridor (Skepptuna/U357+Broborg+Gamla Uppsala, verifierade).
- [ ] **Långhundraleden full sträckning** — kräver källa (Lantmäteriets vandringstavla-linje ELLER
      forskares ledstenslista). Ersätt de 3 grova ankarna. Kör runsten-QA (nära leden + uteslut flyttade).
- [ ] **Pilgrimsleder** (Sankt Olavsleden, Romboleden, Munkastigen) — kräver waymarkad geometri per led
      (GPX/källa) innan ingest. Superviktiga (Daniel).
- [ ] **Eriksgatan Östergötland** som egen väg (Cnattingius) för Bollaert-jämförelsen.
- [ ] **Kulturell gräns vid Dalälven** (Limes Norrlandicus — norra gränsen för runsten/borg/Svealandskultur)
      som eget gränslager på kartan.
- [ ] Uppbåga bro-koord (Eriksgata-landmark) saknas fortfarande.
- [ ] Rendera vägar även på huvudkartan (explore) generiskt, ej bara Eriksgata-hooken.

## Sök/karta-buggar kvar efter 2026-08-13-passet

- [x] **Kalmarsund-blödning** — LÖST med Öland-bbox (migration 20260813130000): samma-landmassa-villkor
      i sites+churches. Vickleby drar bara Öland, Kalmar drar ej Öland. + domkyrkor åter notable.
      OBS: bbox täcker bara ÖLAND. Andra sund/öar (Gotland, Tjörn…) behöver egna polygoner om samma
      problem dyker upp → generalisera ev. till en `landmass(lat,lng)`-tabell/funktion senare.

## Eriksgatan-sidan + Bollaert-grupperingar 2026-08-13

- [ ] **Eriksgatan-sida** (/explore?focus=eriksgatan): lägg viktiga platser som kartpunkter — Mora stenar
      (finns i location_hypotheses), Östanbro/Östens bro (VERIFIERAD koord 59.6194/16.867, Västmannalagen),
      Svintuna (finns /sv/plats/svintuna), Hålaveden/Holaved (KRÄVER koord-verifiering), Ramundeboda kloster
      (VERIFIERAD 58.9708/14.5431, antonitkloster, Laxå 8), Uppbåga bro (KRÄVER koord). + gamla hålvägarna
      på Eriksgata-kartan (halvag/färdväg-lagret RAÄ). Copyright: text från Wikipedia (CC BY-SA) + länsstyrelsen
      = FAKTA fritt, ej verbatim; kreditera. Några borde bli egna /plats-sidor (Östanbro, Ramundeboda, Hålaveden).
- [ ] **Inskrifts-formel/utformnings-grupperingar SAKNAS strukturerat** (audit 2026-08-13): runic_inscriptions
      har INGA kolumner för böneformel/ristarformel/nekrolog/poetiska element/kors/stil/flerstensmonument/
      trollformel. Bollaert 2016 (Uppsala, "Runstenar längs vägen") visar värdet: kristlighet (kors+böneformel),
      skriftlighet (nekrolog, dubbelläsning, skiljetecken), status (flerstensmonument, längd, ristarsignatur),
      poetik (Hübler-grupper A/B/C). Förslag: `inscription_features`-tabell (belagt/hypotes per element) +
      koppla till väg (viking_roads). KREDITERA Johan Bollaert. Attundalandsvägen saknas som väg i viking_roads.
- [ ] **Felplacerad händelse**: "Kalmars judiska begravningsplats tas i bruk" (1873) har koord
      56.6578/16.3527, location_status='documented', note "Skansgatan 3". Daniel: ritas på klostret.
      Verifiera Skansgatan 3:s riktiga koord innan ändring (ändra ej documented utan källa).
- [ ] **Felplacerat fiske**: Gårdby/Norra Kvinneby (experiences, 56.6/16.65) ligger inne på Öland,
      ska vara vid östkusten. Approx-koord — Daniel justerar el. verifiera mot Norra Kvinneby-koord.
- [ ] **Namnlösa "Gravfält"-etiketter** i notable sites: RAÄ-namnet är bara typen. Lägg
      distinktion (socken/avstånd) i sites-RPC:n så de går att skilja åt.
- [ ] **Stockholm tom karta**: reproducerade EJ på desktop (810×430, 12 tiles). Kolla mobil-viewport.
- [x] **"Sm ATA... (Sm ATA...)" ×2** i InscriptionModal — fixat (visa namn(signum) bara när namn≠signum).
- [x] **Notable sites domineras av kyrkor / Vasakyrkan notable** — fixat (#3/#4, migration 20260813120000).

## /texter städat + primärkälle-önskelista 2026-08-12

- [x] **catalog_role på historical_sources** (migration `20260812123000`): work/scholarship/provenance.
      `source_catalog` visar bara 'work' → /texter 174→97 rader (bort: RAÄ/Fornsök, Google Places API,
      VERIFY-stubbar, webb, modern forskning). SourceDetail: översättning-bara texter full bredd (ej halv
      kolumn). Se [[source-tables-texter-researchers]]. Reversibelt via flaggan.
- [~] **Drag 2 — rekonciliera 43 scholarship → forskarlagret** (`sources`+`research_scholars`). Länka:
      Ingemar Olsson, Lars-Olof Larsson, Mårten Stenberger (DUBBLETT — slå ihop), Göran Tegnér. Skapa ~30 nya.
      FLAGG (ej forskarverk): "Anglo-Saxon Chronicle (ed. Swanton)" = primärkälla → provenance.
- [ ] **PRIMÄRKÄLLE-ÖNSKELISTA — skaffa fulltext** (62 work-rader utan `source_texts`; värdesorterat):
      - **Landskapslagarna** (PD, Schlyter): Skånelagen, Äldre Västgötalagen, Östgötalagen, Dalalagen,
        Hälsingelagen, Västmannalagen, Södermannalagen, Bjärköarätten, Smålandslagen, Magnus Erikssons landslag.
      - **Kontinentala/utomnordiska:** Prokopios *Bellum Gothicum*, Frankiska riksannalerna, Einhard *Vita
        Karoli*, Rimbert *Vita Ansgarii*, Annales Bertiniani, Ibn Fadlan *Risala*, *De Administrando Imperio*.
      - **Nordiska:** Nestorkrönikan, Íslendingabók, Gesta Danorum, Heimskringla, Ynglingasagan/-tal,
        Hervararsagan, Historia Norvegiæ, Kung Valdemars jordebok.
      - **Eddadikter utan fulltext (PD):** Solsången, Rigstula, Grottesången, Hyndlas/Hlöds/Odens korpsång,
        Svipdags sång, Balders drömmar, Valans spådom den korta, Angantyrs uppvaknande.
- [x] **DUBBLETTER hopslagna 2026-08-12:** Vita Ansgarii→"Ansgars levnad", Gesta Danorum→"Danernas
      bedrifter", Gesta Hammaburgensis→"Hamburgkyrkans historia", Nestor→"Nestorskrönikan (Berättelsen
      om gångna år)". Kanonisk = rikast beskrivning/svensk titel; 12 king_source_mentions ompekade
      (unique king_id+source_id → krockande avdubblade); inga andra FK-referenser (allt utom
      king_source_mentions var 0).

## 2026-08-16 (låg prio)
- [ ] **/3D-drive svart skärm** — DriveView3D (MapLibre) renderar svart karta live efter deploy (bara "Demo mode"-banner syns), inga JS-fel. Trolig orsak: osparad WIP i DriveView3D.tsx som committades i e6707d2. Headless browse saknar WebGL → kan ej repro visuellt. TODO: rulla tillbaka DriveView3D till förra fungerande el. felsök map-init (container-höjd / on('load')-throw). Låg prio (Daniel: vänta).
- [ ] **Fornvännen-sök-hubb** — söker man "fornvännen" i svarspanelen (AnswerContext/Lotsen) → "no match" + externt, för det finns ingen enskild Fornvännen-*entitet* (bara 3604 artiklar). search_v1/v2 returnerar artiklarna korrekt. Fix: registrera en Fornvännen-samlingsentitet/hubb (facett per category) som söket landar på. Ger även browsing-UI.
