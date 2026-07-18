# Viking Age — Domänontologi & datakvalitetsstandard

Syfte: en enda referens för vad datan BETYDER och hur den ska se ut. Används för
validering, städning och framtida importer. Grundad i det faktiska schemat
(`runic_inscriptions` + satelliter) och i Runor/SNRD-modellen som datan härstammar ur.

> **Princip:** återuppfinn inte — återanvänd. Vår modell speglar Runor/SNRD; entiteterna
> mappas mot **CIDOC-CRM/CRMtex** (kulturarvsstandard) för framtida interoperabilitet,
> men appen förblir relationell. Målet här är **datakvalitet**, inte RDF-export.

Senast uppdaterad: 2026-07-18.

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

Satellitdomäner (egna ontologifragment, ej fullt dokumenterade här): kungar/dynastier
(`historical_kings`, `royal_dynasties`, `king_inscription_links`), genetik
(`genetic_individuals`, `archaeological_sites`, `admixture_analysis`), geografi/nätverk
(`viking_cities`, `viking_fortresses`, `swedish_hillforts`, `viking_roads`, `trade_*`),
kristna platser (`christian_sites`).

---

## 2. Auktoritativa identifierare (LOD-krokar)

Signum är primärnyckel för matchning (det enda pålitliga, 3067/3067). Externa ID:n
för verifiering och länkning mot auktoritativa källor:

| Fält | Auktoritet | Täckning nu | Not |
|---|---|---|---|
| `signum` (+ `alternative_signum`) | Samnordisk runtextdatabas | 3067 / 684 alt | Kanonisk nyckel |
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
| `socken` | Historisk socken | Från rundata-crosswalk. 2923/3067. |
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
- [ ] Lägg till `runor_uuid` + `wikidata_id` (utlänkning/verifiering).
- [ ] Fullständig import av saknade inskrifter (Sö 13→~400 m.fl.) — se DB-TODO item 5.

**Kanonisk `object_category` (13):** `runestone` | `rock_carving` | `grave_slab` | `fragment` | `portable_object` | `building_inscription` | `plaster_inscription` | `wood` | `bracteate` | `cross` | `liturgical_object` | `other` | `unknown`.

---

## 7. Externa standarder att referera (ej implementera fullt)

- **CIDOC-CRM (ISO 21127)** + **CRMtex** — kulturarv/epigrafik-ontologi (mappning i §1).
- **EpiDoc (TEI)** — inskriftskodning; rundatas `teitext` är redan TEI-liknande.
- **Runor/SNRD** — källmodellen; edition 2020 via runor.raa.se-API.
- **K-samsök/SOCH, Fornsök/KMR** — RAÄ:s auktoritativa register.
- **Wikidata, Getty TGN/ULAN** — utlänkning.
