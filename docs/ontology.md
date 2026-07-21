# Viking Age — Domänontologi & datakvalitetsstandard

Syfte: en enda referens för vad datan BETYDER och hur den ska se ut. Används för
validering, städning och framtida importer. Grundad i det faktiska schemat
(`runic_inscriptions` + satelliter) och i Runor/SNRD-modellen som datan härstammar ur.

> **Princip:** återuppfinn inte — återanvänd. Vår modell speglar Runor/SNRD; entiteterna
> mappas mot **CIDOC-CRM/CRMtex** (kulturarvsstandard) för framtida interoperabilitet,
> men appen förblir relationell. Målet här är **datakvalitet**, inte RDF-export.

Senast uppdaterad: 2026-07-18 (efter full rundata-import: 3067 → **6435** inskrifter).

---

## 1. Kärnentiteter

| Entitet | Tabell | Definition | CIDOC-CRM/CRMtex |
|---|---|---|---|
| **Inskrift** | `runic_inscriptions` | En runinskrift, identifierad av **signum**. Navet. | TX1 Written Text / E33 Linguistic Object |
| **Bärare/objekt** | (`object_type`-fält) | Fysiskt föremål som bär inskriften (runsten, spänne, bleck…). | E22 Human-Made Object |
| **Signum** | `signum` (+`alternative_signum[]`, `primary_signum`) | Kanonisk identifierare (t.ex. `U 337`). Ett modernt landskapssignum + alias (Bautil `B`, Liljegren `L`, äldre kataloger `KJ`/`NIÆR`…). **1 inskrift → N signum.** | E42 Identifier |
| **Läsning** | `readings` (tabell) + skalär `transliteration` | Translitteration av runraden (t.ex. `laþu`). **1 inskrift → N läsningar** (versioner `P`/`Q`/`R`… av olika utgivare/över tid). | TX2 Transcription |
| **Tolkning/normalisering** | `interpretations` (tabell) + skalär `normalization` | Fornnordisk standardform ("Þorgerðr lét reisa stein…"). **1 → N.** | (interpretation act) |
| **Översättning** | `translations` (tabell) + skalär `translation_sv`/`_en` | Modern översättning. **1 → N** (per språk OCH per version). | E33 Linguistic Object |
| **Datering** | `dating` (tabell) + skalär `dating_text`, `period_start/end` | När inskriften tillkom. **1 → N** (konkurrerande). | E52 Time-Span |
| **Koordinat** | `additional_coordinates` + skalär `coordinates` | Plats. **1 → N** (nuvarande, ursprunglig, alt.). | E53 Place |
| **Plats** | `socken`, `harad`, `landscape`, `country`, `municipality`, `county`, `parish`, `location`, `coordinates` | Var inskriften finns/fanns. Se §3. | E53 Place / CRMgeo |
| **Ristare** | `carvers` (+ `carver_inscription`) | Runmästare. | E21 Person |
| **Källa** | `historical_sources` | Historisk källa som nämner en kung/inskrift, med tillförlitlighet + bias. | E31 Document |

### 1b. Representationer & kardinalitet (VIKTIGT)

En inskrift är **ett** objekt men har **många** vetenskapliga representationer — läsningar,
tolkningar, översättningar, dateringar, signum, koordinater. Modellen är **tvådelad**:

- **Kanonisk skalär (primär)** — `transliteration`, `normalization`, `translation_sv/_en`,
  `dating_text`, `signum`, `coordinates`. Är "den föredragna versionen" (rundata-enum `P`).
  Används för **sök, lista och snabbvy**. En per inskrift.
- **Fullständig satellit (alla versioner)** — tabellerna `readings`, `interpretations`,
  `translations`, `dating`, `additional_coordinates`, `alternative_signum[]`. Håller
  **alla** representationer (version `P`/`Q`/`R`…, per språk, konkurrerande dateringar).
  Visas i **detaljvyn** (`InscriptionModal` läser `extendedData.translations`/`datings`).

**Regel:** de skalära fälten FÅR aldrig vara enda källan — de är en projektion (primär) av
satelliten. Crosswalken plockade bara `P` till skalärerna; den fulla mångfalden ligger i
rundatas satellittabeller. **Datakvalitetskonsekvens:** satellittabellerna är idag nästan
tomma (`readings` 0, `interpretations` saknas, `translations` 24) → bara primärversionen
finns. Att importera dem fullt (DB-TODO item 5) är det som gör "syns på flera sätt" verkligt.

Aldrig platta en 1→N-relation till en enda kolumn utan att bevara resten i satelliten.

**Nyckelinsikt (importarkitektur):** nyimporterade inskrifter fick `runic_inscriptions.id =
rundata objectid`. Det är limmet som gör att satellit-/spegeltabellerna hittar rätt inskrift:
`useInscriptionExtendedData` slår `object_source.objectid = inscription.id`. Utan denna
identitet (äldre 3067 rader hade slump-UUID:n) tänds varken källor, dateringar eller bilder.
Alla framtida importer MÅSTE bevara objectid som `id`.

Satellitdomäner (egna ontologifragment, ej fullt dokumenterade här): kungar/dynastier
(`historical_kings`, `royal_dynasties`, `king_inscription_links`), genetik
(`genetic_individuals`, `archaeological_sites`, `admixture_analysis`), geografi/nätverk
(`viking_cities`, `viking_fortresses`, `swedish_hillforts`, `viking_roads`, `trade_*`),
kristna platser (`christian_sites`), gudom/kult (se §1c), **mynt/numismatik**
(`coins` — nordiskt kungamynt, solidi, runmynt, islamiska dirhamer; se `/coins`),
**källhänvisning & bildarkiv** (se §1d), onomastik/personnamn (se §1e).

### 1d. Källhänvisning & bildarkiv (rundata-kedjan)

Skild från `historical_sources` (som handlar om kungakällor). Detta är inskriftens
**bibliografiska** apparat + arkivbilder, importerad ur Evighetsrunor. Kedja:

`object_source(objectid → sourceid)` → `sources` → `reference_uri(reference_id=sourceid → uri_id)` → `uris`

| Entitet | Tabell | Definition | CIDOC-CRM |
|---|---|---|---|
| **Källkoppling** | `object_source` | Länkar inskrift (objectid=`id`) till en källa (sourceid, bytea). | (E31 ref) |
| **Bibliografisk källa** | `sources` | Litteraturreferens (SRD/Runor-bibliografi). | E31 Document |
| **URI-koppling** | `reference_uri` | Länkar källa (reference_id=sourceid) till URI. | — |
| **URI** | `uris` | Extern länk (Runor, RAÄ, DiVA…). | E42 Identifier |
| **Forskningsnotis** | skalär `scholarly_notes`, `paleographic_notes`, `historical_context` | Vetenskaplig text per inskrift (fylld via notes-crosswalk). | inom E33 |
| **Arkivbild** | `inscription_media` | Foto/teckning (arkivlänk), matchad på signum. | E36 Visual Item |

**Status/modell:** ✅ ifyllt — `object_source` (guardat mot runic_inscriptions.id + sources) och
`reference_uri`. **Viktig modellavvikelse:** appens hook (`useInscriptionExtendedData`) antar
`reference_uri.reference_id = sourceid`, men rundatas riktiga kedja är inskrifts-nivå
(`inscription ← references ← reference_uri → uris`). Vi bygger därför `reference_uri` som
`(sourceid, uriid)`-par härledda via `inscription→references→reference_uri`, korsat med
`object_source` (`scripts/crosswalk-rundata-inscription-uris.mjs`). **Känd förfining:** en
källa som delas av många inskrifter (t.ex. IK-katalogen över brakteater) samlar då *alla* deras
URI:er → sådana inskrifter visar för många länkar. Rätt lösning på sikt: en äkta inskrift→uri-
tabell + ändrad hook (frontend). Vanliga runstenar opåverkade.

### 1e. Onomastik / personnamn (`viking_names`)

Kurerad **namnlexikon** (namn, kön, betydelse, etymologi, frekvens, regioner) — INTE råa
belägg. Belägg i inskrift markeras med `"`-prefix i `normalization` (Evighetsrunor-konvention,
t.ex. `"Tóla`, `"Bugga`); ~9200 namntoken, ~4000 distinkta (böjda/trunkerade) former. Lexikonet
fylls **hand-kurerat** i moderniserad form (Ingvar, Tore, Ketil…), religiösa termer (Guð, Kristr,
Maria) och böjningsvarianter uteslutna. **Platta aldrig råa böjda former rakt in i lexikonet.**

### 1c. Gudom & kult (gods-fokus)

Fornnordiska gudar och deras kult är en egen domän (Explore `focus=gods`). En **gud**
attesteras geografiskt på tre olika sätt — tre olika evidenstyper som inte får blandas ihop:

| Entitet | Källa | Koordinater? | Definition | CIDOC-CRM |
|---|---|---|---|---|
| **Gudom** | hårdkodad `VIKING_GODS` (`GodNamesView`/`GodCardsGrid`) | — | Mytologisk gestalt (Oden, Tor, Frej…), asar/vaner. Ingen DB-tabell, inga auktoritativa ID:n. | E28 Conceptual Object |
| **Kultplats** | `RELIGIOUS_PLACES` (`religiousLocations/religiousPlacesData.ts`), `deity`-fält | ✅ ja | Offerkälla/lund/vi med gudsattribution. **Mappbar.** Legend "Pagan cult sites" (`t('paganCultSites')`), räknas per gud via `getDeityPlaces(deity, period)`. | E53 Place + E7 Activity (kult) |
| **Teofort ortnamn** | `places` (3621 rader) via `godNameUtils.searchPlacesForGodNames` | ❌ **nej** | Ortnamn med gudselement (Odensala, Torslunda, Frösö, Ullevi). Toponymiskt kultbevis. | E44 Place Appellation |
| **Omnämnande i inskrift** | `runic_inscriptions` (text) | ✅ (via inskriften) | Gud namngiven i runtexten (t.ex. Tor-vigningsformler "þur uiki"). Få; Oden nära nog aldrig på runsten. | inom E33/TX1 |

**Datakvalitetsflaggor (❌ åtgärda):**
- `VIKING_GODS[].mentions` (Oden 145, Tor 287 …) är **påhittade siffror** — motsvarar varken
  kultplatser, teoforta ortnamn eller textomnämnanden. Ska ersättas med en RIKTIG räkning
  (t.ex. `getDeityPlaces(deity).length`) eller tas bort. Påhittad statistik hör inte hemma
  på en forskningsplattform (jfr borttagna fejk-"forskningsnoteringar" för carvers).
- `places` saknar koordinater → teoforta ortnamn kan inte plottas förrän ortnamnsregistret
  (`place_names`, tomt) importeras (Lantmäteriet Ortnamn, DB-TODO item 6). Tills dess är
  **kultplatserna** (`RELIGIOUS_PLACES`, har koord) den enda kartbara evidensen för "var guden dyrkades".
- Klick på en gud kör idag den förlustiga kedjan gud→teofort ortnamn→runsten vars *platstext*
  matchar → visar nästan inget. Bör istället filtrera **kultplatslagret** till vald gud
  (`religious_<deity>`), så man ser gudens kultplatser ifyllda på kartan.
- Gudar har inga auktoritativa ID:n; kandidat: Wikidata QID per gud för utlänkning (jfr §2).

---

## 2. Auktoritativa identifierare (LOD-krokar)

Signum är primärnyckel för matchning (det enda pålitliga, 6435/6435). Externa ID:n
för verifiering och länkning mot auktoritativa källor:

| Fält | Auktoritet | Täckning nu | Not |
|---|---|---|---|
| `signum` (+ `alternative_signum`) | Samnordisk runtextdatabas | 6435; alias bevarar gamla katalogsignum (Bautil B/Liljegren L…) vid dedup | Kanonisk nyckel; sökbar via `search_inscriptions_flexible` |
| `k_samsok_uri` | K-samsök/SOCH (RAÄ) | 710 | Länkad öppen kulturdata |
| `raa_number` | Fornsök/KMR (RAÄ) | 46 | Fornlämningsnummer |
| `lamningsnumber` | Fornsök/KMR (RAÄ) | 33 | Lämningsnummer |
| **`runor_uuid`** *(föreslås)* | Runor (runor.raa.se) | — | UUID finns i SNRD-uppslag; bör lagras |
| **`wikidata_id`** *(föreslås)* | Wikidata | — | Många stenar har poster; enkel utlänkning |

**Rekommendation (datakvalitet):** lägg till `runor_uuid` + `wikidata_id`. De gör att
vilket fält som helst kan korsverifieras mot en auktoritativ källa (som Bautil-körningen).

---

## 3. Geografisk modell (rättad 2026-07-18)

Hierarki: **koordinat → socken → härad → landskap → land**. Auktoritativ källa är
rundata (object→place→parish→hundred→province).

| Fält | Betydelse | Regel |
|---|---|---|
| `coordinates` | Punkt `(lng,lat)` | WGS84. Se konfidens nedan. |
| `socken` | Historisk socken | Från rundata-crosswalk (13874 signum-par). De ursprungliga 3067 ifyllda; de ~4200 nyimporterade fylls av `20260718130000_parish_harad_crosswalk.sql`. |
| `harad` | Härad (norska: fylke, danska: herred, finska: kihlakunta) | Suffixet avslöjar land. |
| `landscape` | Landskap (Uppland, Småland…) | **Måste vara ett av 25 svenska landskap** (§4) för svenska stenar. Rättat via rundata. |
| `country` | Land | **Normaliseras** — se §4 (Sverige=Sweden). |
| `county` | Län (Stockholms län…) | Modern administrativ enhet ≠ landskap. |

Känt: `landscape`/`province` var fel för ~546 Bautil-stenar (B 100 = U 285 stod
"Småland" fast Uppland) — rättat via `rundata-landscape-crosswalk`.

---

## 4. Kontrollerade vokabulärer

Fält som SKA ha ett fast värdeförråd. Kolumnen "Nuläge" flaggar var datan är smutsig.

### `coord_confidence` ✅ REN (förebild)
`high` | `medium` | `low` | `unknown`
- **high** = auktoritativ exakt (rundata/RAÄ, manuellt/user-exakt)
- **medium** = geokodad till plats
- **low** = grov/ungefärlig (socken-centroid)
- **unknown** = okänd proveniens (original_field)

### `coord_source` ⚠ HALVKONTROLLERAD
Kanoniska: `rundata_evighetsrunor` | `nominatim` | `manual` | `user_provided_exact` |
`original_field` | `regional_center`.
**Nuläge:** ~15 ad-hoc "X kyrka location lookup"-strängar bör mappas till `manual`.

### `country` ⚠ EJ NORMALISERAD
Kanoniskt (välj EN form): `Sweden` | `Denmark` | `Norway` | `Iceland` | `Greenland` |
`United Kingdom` | `Ireland` | `Germany` | `Netherlands` | `Poland` | `Ukraine` | `Russia` |
`France` | `Greece` | `Turkey` | `Latvia`.
**Nuläge:** dubbletter `Sverige`/`Sweden`, `Danmark`/`Denmark`. Härleds pålitligast ur
signum-prefix (N→Norway, DR/DK→Denmark…) eller härad-suffix, inte kolumnen.

### `object_type` ❌ OKONTROLLERAD (~100 varianter)
Kanoniska huvudkategorier (förslag): `runestone` | `rock_carving` (runhäll) |
`grave_slab` (gravhäll) | `fragment` | `portable_object` (spänne/bleck/kam…) |
`building_inscription` | `plaster_inscription` (putsinskrift) | `wood` | `bracteate` |
`cross` | `unknown`.
**Nuläge:** "runsten"/"Runsten"/"runestone"/"runic inscription"/"Runristning" är samma sak;
tom sträng förekommer. **Kräver en mappningstabell → kanonisk kategori.**

### `rune_type` ❌ OKONTROLLERAD
Kanoniska: `elder_futhark` (urnordiska/äldre futhark) | `younger_futhark` (yngre) |
`medieval_runes` (medeltida) | `anglo_frisian` | `unknown`.
**Nuläge:** "yngre futhark"/"Yngre futhark"/"yngre_runor" = samma; "okänd"/"Okänd"; tom.

### `uncertainty_level` → DELAT (migration `20260718190000`)
Blandade ihop konfidens, skick och daterings-fritext + bulk-default 'medium'. Delat i
två kanoniska kolumner (original bevarat för bakåtkompatibilitet):
- **`interpretation_confidence`**: `certain` (confirmed/high) | `uncertain` (low/uncertain/Osäker tolkning) | `unknown` (medium + fritext)
- **`condition`**: `intact` | `fragmentary` (ur "Fragmentarisk" + `object_category='fragment'`) | `lost` | `unknown`

### `complexity_level` ❌ BLANDAT SV/EN
Kanoniska: `simple` | `medium` | `complex` | `unknown`.
**Nuläge:** "komplex", "mycket komplex" → mappa till `complex`.

### Källor (`historical_sources`) ✅ REDAN KONTROLLERAD
- `reliability`: `primary` | `secondary` | `tertiary` | `legendary`
- `bias_types[]`: `christian_anti_pagan` | `nationalist_danish` | `nationalist_swedish` |
  `temporal_distance` | `political_legitimacy` | `none`

---

## 5. Datakvalitetsregler (invarianter)

1. **Varje inskrift har exakt ett kanoniskt `signum`**; alias i `alternative_signum[]`.
2. **`landscape` ∈ de 25 svenska landskapen** för svenska stenar; annars null eller landskod-fritt.
3. **`country` är normaliserat** (engelsk kanonisk form); härledd ur signum-prefix vid konflikt.
4. **Koordinat inom rimlig bbox:** svenska stenar ~55–69°N, 10–24°E; avvikelse = flagga
   (så fångas geokodningsfel typ "B 1034 i Hälsingland").
5. **`coord_confidence` sätts alltid** när `coordinates` finns; `coord_source` anger varifrån.
6. **Texttrappan är konsekvent:** om `normalization`/`translation_*` finns bör `transliteration` finnas.
7. **Inga dubblettmarkörer:** en fysisk sten = en post (dedup mot `additional_coordinates`
   på signum + alternative_signum — jfr migration `20260718140000`).
8. **object_type/rune_type/complexity_level hör till kanoniskt värdeförråd** (§4).

---

## 6. Öppna datakvalitetsposter (→ [[improvement-roadmap]], docs/DB-TODO.md)

- [x] Normalisera `country`, `rune_type`, `complexity_level`, `coord_source` → **SQL redo:** `scripts/data/normalize-vocabularies.sql` (rena normaliseringar, kör i editorn). 25 tvetydiga rune_type lämnas för granskning.
- [x] Kanonisk `object_category` (~100 `object_type`-varianter → 13 kategorier via nyckelord) → **migration redo:** `20260718180000_object_category.sql` (icke-destruktiv, ny kolumn).
- [x] Dela `uncertainty_level` i `condition` + `interpretation_confidence` → **migration redo:** `20260718190000_split_uncertainty_level.sql` (icke-destruktiv, original bevarat).
- [x] Fullständig import av saknade inskrifter → **klart:** 3067 → 6435 (id=objectid, se §1b).
- [x] Socken/härad för de ~4200 nya → **klart:** 6291 inskrifter har socken (`20260718130000_parish_harad_crosswalk.sql`).
- [x] Källor/URI:er (§1d) → **klart:** `object_source` + `reference_uri` ifyllda; hela kedjan tänder detaljvyns käll-/URI-flik.
- [x] Utöka `viking_names` (§1e) → **klart:** 113 → 139 kurerade namn (`viking-names-expansion.sql`).
- [ ] Lägg till `runor_uuid` + `wikidata_id` (utlänkning/verifiering).
- [ ] **Grafkanter** (§8): `king_inscription_links` tom (0), gudar saknar tabell, artefakt↔inskrift saknas → blockerar traversering.

**Kanonisk `object_category` (13):** `runestone` | `rock_carving` | `grave_slab` | `fragment` | `portable_object` | `building_inscription` | `plaster_inscription` | `wood` | `bracteate` | `cross` | `liturgical_object` | `other` | `unknown`.

---

## 7. Externa standarder att referera (ej implementera fullt)

- **CIDOC-CRM (ISO 21127)** + **CRMtex** — kulturarv/epigrafik-ontologi (mappning i §1).
- **EpiDoc (TEI)** — inskriftskodning; rundatas `teitext` är redan TEI-liknande.
- **Runor/SNRD** — källmodellen; edition 2020 via runor.raa.se-API.
- **K-samsök/SOCH, Fornsök/KMR** — RAÄ:s auktoritativa register.
- **Wikidata, Getty TGN/ULAN** — utlänkning.

---

## 8. Sök & kunskapsgraf

Söket utvecklas från **fältsök** (en entitet) mot **kunskapsgraf** (entiteter + kanter + teman).

### 8a. Federerat sök (`GlobalSearch`, toppnav, Ctrl/Cmd+K)
Söker parallellt (client-side) över flera entiteter och grupperar resultaten:

| Grupp | Tabell | Rutt |
|---|---|---|
| Runinskrifter | `runic_inscriptions` (RPC `search_inscriptions_flexible`) | `/explore?searchQuery=` |
| Ristare | `carvers` | `/carvers?carver=<id>` (deep-link) |
| Ortnamn | `places` | `/explore?searchQuery=` |
| Heliga platser | `christian_sites` | `/explore?searchQuery=` |
| Försvar / Städer | `viking_fortresses`, `viking_cities` | `/fortresses` |
| Kungar / Släkter | `historical_kings`, `royal_dynasties` | `/royal-chronicles` |
| Mynt | `coins` | `/coins` |
| Namn | `viking_names` | `/explore?focus=names` |

Källorna styrs av `SOURCES` i `GlobalSearch.tsx`. RPC:n matchar nya + gamla signum
(`alternative_signum`), ort/socken/härad/landskap, namn, translitteration, normalisering,
båda översättningar, `historical_context`, `scholarly_notes`, `paleographic_notes`.

### 8b. Begreppslager / tematisk graf (`src/config/themes.ts`)
10 teman (tro, kult, död, resa, vapen, skydd, kärlek, handel, skepp, häst) med nyckelord
(sv/en/fornnordiska) mappade till relevanta entiteter. Klick på ett tema kör tematiskt sök
tvärs över inskriftstext + tabeller. **Nyckelordsbaserat**, inte semantiskt (se 8d).

### 8c. Kanter (edges) — det som gör grafen traverserbar
| Kant | Tabell | Status |
|---|---|---|
| inskrift ↔ ristare | `carver_inscription` | ✅ 657 |
| inskrift ↔ källa/URI | `object_source`/`reference_uri` | ✅ (§1d) |
| plats → socken → härad | `place_parish`→`parishes`→`hundreds` | ✅ |
| **kung ↔ inskrift** | `king_inscription_links` | ❌ **0 (tom)** |
| **gud** som entitet | — | ❌ hårdkodad, ingen tabell |
| **artefakt ↔ inskrift** | `artefacts` | ❌ ingen kopplingskolumn |

Utan dessa kanter går inte "kung X:s runstenar", "gudens kultplatser som entitet" eller
"artefakter på denna inskrift". **Nästa bygge (b): fyll kanterna.**

### 8d. Semantiskt sök — ej aktivt
`search_inscriptions_by_similarity` finns men **0 / 6435** inskrifter har `embedding`.
Kräver en embedding-genereringspass (edge function, API-kostnad) innan det kan användas.
Egen fas efter kanterna.

Se [[search-knowledge-graph]].

---

## 9. Kyrklig organisation (stift, kyrkor, ledarskap) — tillagd 2026-07-21

Mappas mot CIDOC-CRM som övrig kulturarvsdata (§1, §7).

| Entitet | Tabell | Definition | CIDOC-CRM |
|---|---|---|---|
| **Kyrka/kloster/kapell/ruin** | `ecclesiastical_sites` | Kyrklig plats (`kind` = parish_church/chapel/cathedral/monastery/nunnery/hospital/holy_place; `status='ruin'`). Koord alltid verifierad (RAÄ/Wikidata). | E22 Human-Made Object + E53 Place |
| **Stift** | `dioceses` | Kyrklig regional administration (13 nuvarande + 8 historiska), grundår/ärkestift/upphörande, `stift_code` 01–13. | E74 Group + E7 Activity (jurisdiktion) |
| **Stiftstillhörighet över tid** | `church_diocese_history` | Vilket stift en kyrka låg under `[from_year,to_year]` — t.ex. Öland: Linköping→Kalmar 1603→Växjö 1915. | E7 Activity + E52 Time-Span |
| **Ledarskap** | `ecclesiastical_leadership` | Ärkebiskop/biskop/kyrkoherde/abbot på **stift ELLER kyrka** `[from,to]`. | E21 Person + E7 Activity + E52 Time-Span |
| **Socken/härad** | `ecclesiastical_sites.parish_id`/`hundred_id` | kyrka→socken→härad (namn-länkat; spatialt när sockenpolygoner finns). | E53 Place (part-of) |
| **Bild** | `ecclesiastical_sites.image_url` | Wikimedia Commons (Wikidata P18), licensierad. | E36 Visual Item |

### 9a. Upper ontology & målgrupper
CIDOC-CRM är redan plattformens upper-ontologi och är **händelse-centrerad** (E5 Event, E7 Activity,
E53 Place, E21 Person, E52 Time-Span) — vilket är just det som låter olika målgrupper fråga *samma*
data på sitt sätt, utan separata system:
- **Kulturgeograf** → E53 Place / **CRMgeo** (socken/härad, strandlinje, klustring).
- **Arkeolog** → E22 Object / **CRMarchaeo** (lämningar, ruiner, RAÄ Fornsök).
- **Historiker / kyrkohistoriker** → E7 Activity + E52 Time-Span (stiftshistorik, ledarskap över tid, reformationen).
- **Krigshistoriker / logistiker** → E5 Event / **E9 Move** + E53 Place (ledung, vägar, farleder, vårdkasar) — ingen CIDOC-standardförlängning, men mappas mot händelse/förflyttning.

**Rekommendation:** fortsätt aligna nya lager mot CIDOC-CRM + relevanta CRM-familjer (CRMgeo/CRMarchaeo)
och spegla i `entity_registry`/`relationship`-grafen. Ger interoperabilitet + flera ingångar utan att
bygga skilda system per målgrupp.
