# Viking Age — Kunskapsgraf & datamodell: arkitekturplan

Syfte: hur vi gör om domänontologin till en **fungerande, enhetlig kunskapsgraf** med
**en sanningskälla**, **snabb rankad sök** och ett **AI-agent-datalager** — över lands-
gränser (SE/DK/NO/IS + diaspora).

Detta dokument definierar **HUR** (arkitektur + faser). [[ontology.md]] definierar **VAD**
(entiteter, CIDOC-CRM-mappning, kontrollerade vokabulärer, datakvalitetsinvarianter).
Läs dem tillsammans. Se även `docs/DB-TODO.md` för dataimport-poster.

> **Grundprincip (oförändrad från ontology.md):** appen förblir relationell (Postgres/
> Supabase). Vi bygger ett *property-graph-lager ovanpå* det relationella — ingen ny
> infrastruktur, ingen RDF-motor. Mappningen mot CIDOC-CRM är begreppslig, för
> interoperabilitet och export, inte en runtime-motor.

Version 2 — 2026-07-19. Nuläget verifierat mot live-DB samma dag. **Granskad av
oberoende arkitekturgranskning (Fable 5) i två pass; granskningens krav (K1–K3, V1–V6)
är inarbetade nedan.** Granskningens helhetsomdöme: grundstrukturen sund; grafdatabas
korrekt bortvald; RRF-hybridsök rätt teknikval.

---

## 1. Nuläge (verifierat mot produktions-DB + rundata.sql)

### 1a. Korpus är redan pan-nordiskt
6 434 inskrifter. Signum-prefix: U 1538, DR (Danmark) 1037, Bergen+N (Norge) 726,
Ög 495, Sö 460, G (Gotland) 432, D 337, Vg 322, Sm 199, Öl 190, GR (Grönland) 88,
Or (Orkney) 57, IS (Island) 49, IM (Man) 35 + diaspora (Sc, IR, RU, By, FR, DE...).
**Råmaterialet stödjer redan kravet på gränsöverskridande.** Nyckeln som binder ihop
det är signum (`primary_signum`), som redan är den nordiska standarden.

### 1b. KÄLLDUMPEN: rundata.sql är till stor del olyft ⚠ NYCKELFYND
Plattformen är byggd på RAÄ:s **Evighetsrunor**
(github.com/riksantikvarieambetet/Evighetsrunor); dumpen ligger i repot som
`rundata.sql` (27 MB, MySQL). Inventering 2026-07-19 — rader i dump → i Supabase:

| Dump-tabell | Dump | Supabase | Vad det är |
|---|---|---|---|
| `object_artefact` | 14 298 | 0 | **Artefakt↔inskrift-kanten — finns, olyft!** |
| `signum_inscription` + `signa` | 13 970 + 13 874 | 0 | Full signum-crosswalk |
| `interpretations` (+`_source`) | 10 117 (+13 404) | saknas | Tolknings-satelliten (ontology §1b) |
| `readings` (+`_source`) | 7 043 (+9 767) | 0 | Läsnings-satelliten |
| `translations` | 8 508 | 1 657 | Bara ~20 % lyft |
| `object_material` + `materials` m.fl. | 10 505 + 441 | 0 | Material-hierarki (types/subtypes) |
| `termini` | 7 155 | saknas | Dateringstermini |
| `cross_crossform` + `crosses` | 6 603 + 1 185 | 0 | Korstypologi (kristnande) |
| `her_SE` + `object_her_SE` | 4 090 + 4 980 | 0 | **Fornsök/KMR-länkar** (idag 46 `raa_number`!) |
| `object_uri` | 4 179 | 0 | **Äkta inskrift→URI-kedjan** (löser IK-katalog-felet, ontology §1d) |
| `object_style` + `styles` | 2 151 + 9 | 0 | **Gräslund-stilar MED TPQ/TAQ-datering per stil** |
| `parishes` | 1 696 | 927 | +769 socknar för gazetteern |
| `carver_inscription` | 1 276 | 631 | Hälften av ristar-kanterna olyfta |
| `imagelinks`, `inscription_runetype`, `runetypes`(+descs), `municipalities`, `findnumbers`, `fragments`, `originallocations` | 1 098, 732, 31+336, 581, 215, 72, 52 | 0 | |

**Konsekvens:** planen v1 antog att kanter och satelliter måste *skapas* — de flesta
finns redan och ska *lyftas*. Dagens läge (translations 20 %, carver_inscription 50 %)
är resultatet av selektiva ad-hoc-lyft. Därav fas **P0** nedan.

### 1c. Geografin: rik men i två oförsonade världar
Fritext-geografin på `runic_inscriptions` är välfylld (av 6 434):

| Fält | Ifyllt | % |
|---|---|---|
| `country` | 6434 | 100 |
| `socken` | 6291 | 98 |
| `harad` | 6291 | 98 |
| `coordinates` | 5971 | 93 |
| `landscape` | 4228 | 66 |
| `parish` | 2166 | 34 |

Samtidigt finns en **populerad gazetteer** som *inte är kopplad till inskrifterna*:
`places` 3621, `parishes` 927 (dump: 1 696), `danish_parishes` 852,
`swedish_localities` 678, `hundreds` 468, `place_parish_links` 3744, `countries` 21.

**Problemet:** gazetteern hänger på `objects` (142 rader) och på sig själv, **inte** på de
6 434 inskrifterna. Endast **589 / 1372 (43 %)** distinkta socken-strängar matchar
`parishes` på namn — men granskningen påpekar att **täckningen** (927 av ~2 500
historiska svenska socknar) är huvudproblemet, inte matchningsalgoritmen; trigram kan
inte matcha mot rader som saknas, och felmatchar gärna när rätt rad saknas.
Tomt idag: `place_names` (Lantmäteriet), `norwegian_localities`, `readings`.
**Obesvarat (utred i P1):** vad ligger i `socken`-fältet för de 726 norska
inskrifterna? Norge har prestegjeld/fylke, inte socken/härad.

### 1d. Grafkanterna är fragmenterade (5+ former, 2 i bytea)

| Kant | Tabell | Rader | Form |
|---|---|---|---|
| inskrift ↔ ristare | `carver_inscription` | 631 (dump: 1 276) | **bytea**-brygga |
| inskrift ↔ bibliografi/URI | `object_source`→`reference_uri`→`uris` | 3787/1584/4553 | **bytea**; `reference_uri` är en **härledd workaround med känt fel** (IK-katalog, ontology §1d) — ersätts av dumpens `object_uri` |
| kung ↔ inskrift | `king_inscription_links` | 13 | uuid |
| källa ↔ inskrift | `source_inscription_links` | 8 | uuid |
| tema ↔ entitet | `theme_links` | 52 | uuid, polymorf |
| kung ↔ kung | `royal_relations` | 44 | uuid |
| artefakt ↔ inskrift | — (dump: `object_artefact` 14 298) | 0 | olyft |
| **gud** som entitet | — | — | hårdkodad i komponent (DB `gods` finns, 16) |

Ingen enhetlig nod/kant-abstraktion. "Allt kopplat till U 887" kräver idag N olika
frågor mot N olika former. Bytea-hex-nycklarna är arv från rundata-dumpimporten.

### 1e. Sök: fältsök utan tvärgruppsrankning, halva infran vilande
- **Federerat** (`GlobalSearch`, Ctrl/⌘K): inskrifter via RPC `search_inscriptions_flexible`
  (rankad internt, klipps till 8); alla andra entiteter per-tabell `.ilike`-OR (6/grupp).
  Grupperna slås ihop i **fast ordning — ingen relevansrankning mellan grupper.**
- **Tema-lagret läser hårdkodade `src/config/themes.ts`** (10 teman, keyword-ILIKE) — inte
  DB:ns `themes`/`theme_links`. Sanningskälla-krock (billig att lösa, se P4).
- **FTS (tsvector)** finns bara på `source_texts`; RPC `search_source_texts` anropas **inte**
  i `src/`. Byggt, inte inkopplat.
- **Semantisk sök** finns (`search_inscriptions_by_similarity`, pgvector) men
  **0 / 6434** inskrifter har `embedding` → dött.
- **`pg_trgm` saknas** → "fuzzy" är rå `ILIKE %...%`.

### 1f. AI: en inskrift, tre handinmatade fält, ingen kontext, ingen RAG
`analyze-runic` får bara `transliteration` + `location` + `objectType` (fritext-formulär),
**inga relaterade entiteter**, **ingen retrieval**. Modell `anthropic/claude-sonnet-4-5`
via OpenRouter.

### 1g. Detta är AVSIKTLIGT — rör inte (per ontology.md)
- `sources` (621, rundata-bibliografi) vs `historical_sources` (75, kungakällor) = **olika
  domäner** (§1d), inte dubbletter.
- `translations`-satellit vs skalär `translation_sv/_en` = den **avsiktliga skalär/satellit-
  modellen** (§1b): skalären är primärprojektionen, satelliten alla versioner. Platta inte ihop.
- Invarianten **`runic_inscriptions.id = rundata objectid`** (ontology §1b) är limmet i
  hela satellitkedjan — får inte rubbas av någon migrering.

---

## 2. Målbild: tre lager + en frågeyta

```
                ┌─────────────────────────────────────────────┐
   AI-agenter → │  Frågeyta (api-schema, versionerad):         │ ← app/sök
                │  search_v1() · get_entity_v1() ·             │
                │  neighbors_v1() · similar_v1()               │
                └───────────────┬─────────────────────────────┘
        ┌───────────────────────┼───────────────────────┐
   [Identitet]              [Graf]                   [Vokabulär]
   signum + externa ID      EN kant-tabell           kontrollerade termer
   (wikidata/k-samsok/      (relationship, vaktad)   (vocabulary + FK),
    runor_uuid/her_SE)     + gazetteer som            flerspråkiga labels
                            platslager (FK)           (sv/en)
```

1. **Identitetslager.** Signum = kanonisk publik nyckel. Externa ID:n: `k_samsok_uri`
   (710 finns), `raa_number` — fylls från dumpens `her_SE`-kedja (~5 000 länkar),
   `runor_uuid`, `wikidata_id` (börja där vinsten är tydlig: inskrifter, gudar, platser).
2. **Graflager.** *En* vaktad kant-relation för äkta N:M-evidensrelationer (se P2 —
   plats och datering är INTE kanter). Gazetteern blir platslagret via FK.
3. **Vokabulärlager.** ontology §4 + dumpens färdiga scheman (styles, materials,
   runetypes) som `vocabulary`-tabell med FK och sv/en-labels.
4. **Frågeyta.** Litet, stabilt, **versionerat** RPC-API i eget exponerat schema
   (`api.search_v1` ...) som både appen och AI-agenter använder. Provenance på varje kant.

---

## 3. Faser (icke-störande, var och en självständigt shippbar)

### P0 — Komplett rundata-lyft till staging + akuta fixar ✅ KLAR 2026-07-19
*Granskningens tillägg: "lyft allt rått en gång, integrera selektivt per fas".*

**Utfall:** `rundata_raw` laddat och verifierat — **92 tabeller, 211 787 rader, 92/92
exakta radantal mot dumpen** (`scripts/verify-rundata-raw.mjs`). Teckenkodning intakt
(þ/ð/ǫ verifierade i interpretations/readings). uuid-bryggan bekräftad: 4 232 objekt
matchar `runic_inscriptions.id` direkt (= de nyimporterade; äldre 3 067 mappas via
signum i integrationsfaserna). 0 grants till anon/authenticated. Pipeline:
`scripts/rundata-to-postgres.mjs` → `scripts/data/rundata-raw/` (genererad, gitignorerad)
→ `scripts/load-rundata-raw.sh` (psql via session-pooler, lösenord ur `.env`).
Snabbfixar: pg_trgm ✅, ANALYZE ✅, `staleTime` 0→5 min ✅.
- **Staging-schema `rundata_raw`** (ej PostgREST-exponerat, ej publikt RLS): lyft ALLA
  dumpens tabeller mekaniskt via EN konverteringspipeline. Timeboxa hårt — ingen
  datamodellering i P0, den sker i faserna.
- **Hex→uuid konverteras vid importgränsen**, en gång, aldrig mer. Bytea-hex får inte
  passera in i staging. Bevara original-hex som textkolumn för proveniens/omkörning.
  (Detta gör P2:s brygg-sanering till en ren nyckelmappning.)
- **Lyft = merge, inte overwrite.** Supabase har hand-kurerade tillägg (carvers 207 inkl.
  Källström-berikning vs dump 331). Upsert på rundata-id med skydd för kurerade kolumner.
  Verifiera `id = objectid`-invarianten för alla 6 434 FÖRE någon skrivning.
- **MySQL→Postgres-fällor:** verifiera teckenkodning (þ, ð, runologiska tecken),
  zero-dates, tinyint-booleaner. Riktig konverteringsväg, inte handredigering.
- **Versionsproveniens:** stämpla varje lyft rad med `source_version` (dumpdatum) —
  Evighetsrunor-dumpen är en frusen edition; Runor-API:t kan ha nyare data.
- **Akuta fixar (timmar, inte fas):** kör `ANALYZE` (planner-statistiken visade 0 rader
  på fulla tabeller); fixa `useRunicData` `staleTime: 0` (laddar om ~3 000 rader per
  filterändring); installera `pg_trgm` (behövs i P1).

### P1 — Försona geografin (sanningskälla för PLATS) · *högst hävstång* ✅ KÄRNAN KLAR 2026-07-19

**Utfall** (migration `20260719530000_p1_parish_reconciliation.sql`):
- `public.parishes` = enad gazetteer, 927 → **1 726** rader. Befintliga KMR-rader fick
  rundata-identitet via **empirisk samförekomst-brygga** (897 kopplade — objekt länkade
  till både rundata-socken och KMR-lämning, ingen namnmatchning behövdes); 799 nya
  (DK sogn, IS sókn, NO sogn, städer, PL/DE/UK m.fl.). Nya kolumner:
  `rundata_parishid, rundata_name, hundred_external_id, parish_type, country`.
- `runic_inscriptions.parish_id` (FK) + `parish_match_method` + `parish_match_score`:
  **6 356 / 6 434 (98,8 %) EXAKT lösta** — `rundata_objectid` 4 232,
  `rundata_signum` 1 473, `rundata_signum_alias` 651. **Ingen fuzzy behövdes för
  bulken** — trigram-fallbacken blev överflödig när kedjan+signum-crosswalken användes.
- 78 olösta (view `v_parish_unresolved`) — samtliga UTAN socken-fritext (KJ-nummer,
  Hagia Sofia, handinlagda platser); manuell granskning, textmatchning kan inte hjälpa.
- **Gränsöverskridande verifierat via FK-kedjan:** SE 4 446, NO 757, DK 738, GR 101,
  Skottland 86, IS 49, Man 36, England 29 + FR/IT/GR/TR/UA/RU/PL/NL/LV/FI/FO/DE.
  Stickprov: U 337 → Orkesta ✓, DR 42 → Jelling ✓.
- Norge-frågan löst i praktiken: N/Bergen-inskrifterna fick sogn via kedjan.

**Kvar i P1 (följdposter, externa källor):** `place_names` (Lantmäteriet, teofora
ortnamn), `norwegian_localities`, täckningsanalys mot fullständigt sockenregister
(~2 500) för socknar utan runstenar.

- **Täckning före matchning:** lyft dumpens resterande `parishes` (927→1 696) +
  `municipalities`/`provinces`/`counties` från staging. Gör täckningsanalys mot ~2 500
  historiska socknar; komplettera vid behov (Riksarkivets/SCB:s sockenregister).
- **ETL med blocknyckel:** matcha `runic_inscriptions.(socken, harad, country)` →
  gazetteer **blockat på (namn + härad/landskap + land)** — aldrig namn ensamt
  (Ekeby/Berg/Husby finns i många landskap). Ordning: suffixnormalisering ("sn",
  "socken", "sogn", parenteser) → exakt → `pg_trgm` → manuell granskningslista.
- **Beslut (fattat):** platskoppling är **FK-kolumn `parish_id`** på inskrift — inte kant.
  1:1, hög kardinalitet, behövs för facetter/joins/spatialt.
- **Match-proveniens:** lagra `match_method` (exact/trgm/manual) + score per koppling —
  krävs för omkörningar och forskarnas tillit.
- **Referensindelning:** välj och dokumentera EN sockenindelning (rundata följer i
  praktiken den historiska) så "täthet per härad" är väldefinierat. Full temporal
  gazetteer = överarbete, görs inte.
- **Norge:** utred vad `socken`-fältet innehåller för N/Bergen-inskrifterna innan ETL;
  fyll `norwegian_localities`. Följd-item: `place_names` (Lantmäteriet) → teofora
  ortnamn kartbara (ontology §1c).
- **PostGIS-beslut:** spatialt = join-baserat per socken/härad tills behov av
  radie/polygon-frågor visats; då aktiveras PostGIS + GiST. (Beslut, inte glömska.)

### P2 — Enhetlig graf: vaktad kant-tabell + frågeyta ✅ KÄRNAN KLAR 2026-07-19

**Utfall** (migrationer `20260719540000`–`560000`):
- **Grafgrund:** `entity_registry` (7 486 noder, trigger-synkad från 10 nodtabeller,
  äkta FK), `rel_predicates` (9 predikat med typkontrakt + qualifier-schema),
  `relationship` med typvalideringstrigger, unique-kant, RLS.
- **Identitetsbryggan persisterad:** `runic_inscriptions.rundata_objectid` (6 356) —
  återanvänds av ALLA kommande integrationer (readings, translations, styles...).
- **Kanter: 14 386** — `carved_by` 1 318 (staging 1 290 + kurerade 28; upp från 631!),
  `has_artefact` 12 995, `has_theme` 52, `mentions_person` 13, `mentions_inscription` 8.
  Full proveniens (source_ref) + konfidens (signed→certain, attributed→probable,
  similar→possible; Ousbäck-hypotesen korrekt `contested`).
- **Ristare:** +138 rundata-ristare (207→345), `rundata_carverid` på alla.
- **K1-kompat:** `theme_links`/`king_inscription_links`/`source_inscription_links`/
  `carver_inscription` är nu VYER över relationship (original → `_retired_*` för
  rollback). bytea+enum-formen bevarad → `get_carver_inscriptions()` läser 1 318 rader
  oförändrad. INSTEAD OF-triggers: insert/delete via vyerna skriver till relationship.
- **Äkta URI-kedjan:** `inscription_uri` (4 243) ur rundata `object_uri` — ersätter
  reference_uri-workaroundens IK-katalog-fel. *(Frontend-hooken byts i P6.)*
- **Frågeyta v1:** `get_entity_v1(p_id|p_signum)` (nod + kanter båda riktningar, labels,
  proveniens), `neighbors_v1(p_id, p_predicate?)`. Test: Rök i EN fråga → Varin,
  Brage Boddason, Kung Björn (contested), Gudruns eggelse, Hamdesmål, tema, artefakttyp.

**Kvar i P2:** gud-kanter (kult/omnämnanden — kureringsspår), same_hand_as-kurering,
`api`-schema med versionerad exponering (P5).

- `relationship(subject_id, subject_type, predicate, object_id, object_type,
  qualifiers jsonb, source_ref, confidence, created_by, created_at)`.
- **Skyddsräcken (granskningens villkor K3 — bindande):**
  1. `predicate` = **FK mot predikattabell**, aldrig fri text.
  2. **Integritetsvakt:** `entity_registry(id, entity_type)` trigger-synkad från
     nodtabellerna, med äkta FK från `relationship`. (Alternativ trigger-validering +
     orphan-svep avvisat: registry ger FK-integritet utan nattjobb.)
  3. **Typade vyer per predikat** (`v_carved_by`, `v_mentions_person`...) — join-
     ergonomi + kontrollerad PostgREST-exponering. Rå `relationship` exponeras ALDRIG
     för klienten.
  4. **Qualifier-schema dokumenteras per predikat** (jsonb utan kontrakt = soptipp).
- **Predikat (trimmad lista):** `carved_by · mentions_person · commissioned_by ·
  cites_source · same_hand_as · has_theme · belongs_to_group`. **Struket efter
  granskning:** `found_at` (= FK, P1), `dated_to` (= befintlig dating-satellit; en kant
  vore en tredje representation), `relates_to` ("övrigt"-predikat är där semantik dör).
- **Kanter från staging:** `object_artefact` (14 298), `carver_inscription` full
  (1 276), signum-crosswalk. **Käll/URI-kedjan byggs om från dumpens äkta `object_uri`**
  — dagens härledda `reference_uri`-workaround (IK-katalog-felet) migreras INTE in;
  den pensioneras. Bytet ger annat resultat än idag → medvetet skifte + frontend-hook
  uppdateras (ontology §1d:s "känd förfining" löses här).
- **Kompat-strategi (K1):** gamla länktabeller blir **vyer över `relationship`** tills
  app-konsolideringen (P6) är klar — läsvägen migreras SIST. Hela migreringen repeteras
  på Supabase-branch med radantalsverifiering före/efter; rollback = behåll gamla
  tabeller omdöpta (`_retired_`) en release innan drop.
- **Gud som entitet:** befordra hårdkodad `VIKING_GODS` → DB `gods` (16 finns);
  kult/tema-kanter.
- **Kureringsspår (V3):** de vetenskapliga kanterna (kung 13, källa 8, tema 52) växer
  inte av sig själva. Stående arbetspost: AI-assisterad kandidatgenerering
  (`confidence`-flaggad) + mänsklig granskning — provenance-fälten finns för exakt detta.
- Frågeyta v1: `get_entity(id)` (nod + kanter + labels), `neighbors(id, predicate?)`.

### P3 — Kontrollerade vokabulärer som tabell
- `vocabulary(scheme, code, label_sv, label_en, parent_code, wikidata_id)` + FK.
  (`label_non` struket efter granskning — kan läggas till när behovet finns.)
- **Import före design:** dumpens `styles` (Gräslund m. TPQ/TAQ — även en härledd
  DATERINGSKÄLLA: stil→intervall), `materials`-hierarkin (441), `runetypes` (31+336
  beskrivningar) är färdiga scheman. Övriga ur ontology §4: `object_category` (13),
  `country`, `meter`, `dating_period`, `coord_confidence/source`.
- **Fasettera först där det är billigt:** `country` och `object_category` är redan
  normaliserade in-place — börja där; migrera övriga kolumner till FK stegvis, inte
  alla åtta scheman dag ett.

### P4 — Sök: rankad hybrid + väck vilande infra
- **Förutsättning:** satelliterna (`readings` 7k, `interpretations` 10k, `translations`
  8.5k) integrerade från staging FÖRE FTS-indexeringen — annars indexerar söket bara
  P-projektionen och missar läsningsvarianter (löftet till språkvetarna).
- **Två sökvägar (K2 — vektorbenet kräver externt embedding-anrop, kan inte köras i
  Postgres-RPC):**
  - *Type-ahead* (Ctrl/⌘K, per tangent): snabb RPC = exakt signum + trgm + FTS.
  - *Full hybrid* (submit + agenter): edge function genererar query-embedding → anropar
    `api.search_v1(q, q_embedding)` → alla fyra ben + RRF. Vektor aldrig på type-ahead.
- **FTS-design (V4):** translitteration/normalisering indexeras med `simple`-config
  (svensk stemmer maler sönder `laþu`/`Þorgerðr`) + preprocessing som strippar
  editionstecken; `translation_sv`→`swedish`, `translation_en`→`english`; frågesidan
  söker med båda configs (union/max). Indexera rå + unaccent-fälld form.
  Signum-normalisering ("U 337"/"U337"/"u337", semikolonsignum) + GIN på
  `alternative_signum`.
- **Fusion:** viktad Reciprocal Rank Fusion (`score = Σ w_i/(k+rank_i)`), tier-boost för
  exakt signum. **Tuning mot gold-set** (20–50 frågor: signum, felstavade ortnamn,
  begreppsfrågor sv+en) — utan eval-set är vikterna vibbar.
- **Embedding-passet:** engångskostnad trivial (~6 400 korta texter). Embedda
  **översättning + normalisering + kontextnoter** (inte translitterationen — meningslös
  för semantik). Lagra `embedding_model` + version per rad (modellbyte = full
  omgenerering, ojämförbara vektorer). Trigger/kö för omgenerering vid textändring;
  tsvector som generated column.
- **Enhetlig projektion:** överväg `search_document`-tabell/MV (`entity_type, id, label,
  signum, tsv, trgm-fält, embedding`) som alla entiteter projiceras in i — en plats för
  alla index, trivial federering.
- **Tidigarelagt (kan göras när som helst):** byt tema-lagret till DB
  `themes`/`theme_links` (kill `src/config/themes.ts`-hårdkodningen); wire
  `search_source_texts` (Edda-FTS) in i appen.

### P5 — AI-agent-datalager
- **Eget exponerat schema med versionerade namn:** `api.search_v1()`, `get_entity_v1()`,
  `neighbors_v1()`, `similar_inscriptions_v1()` — stabilt kontrakt för agenter, skarp
  gräns mot appens ad-hoc-anrop, undviker PostgRESTs sköra funktionsöverlagring.
- Provenance (källa + confidence) på varje kant i svaren så AI:n kan citera och hedga.
- Berika `analyze-runic`: relaterade entiteter + grannar + liknande inskrifter (RAG via
  embedding) i stället för tre handinmatade fält.

### P6 — Hygien & konsolidering
- Konsolidera datahämtningen mot frågeytan (~90 ad-hoc `.from()`-anrop, blandad
  React-Query/useEffect-cache) — **först härefter** droppas P2:s kompat-vyer.
- **Audit-spår (V6):** `created_by/updated_by` + enkel trigger-historiktabell på
  `relationship` och nyckeltabeller. Provenance = varifrån påståendet kommer;
  audit = vem som ändrade vad när. Forskare som citerar behöver båda.
- Besluta per kvarvarande tom tabell: fyll medvetet, eller avveckla.

---

## 4. Sök-arkitektur (detalj)

Fyra signaler, en fusion:

| Signal | Teknik | Fångar | Väg |
|---|---|---|---|
| Exakt identitet | normaliserat `=` på signum/alias | "U 337", katalog-alias | RPC (type-ahead + full) |
| Namn/ort fuzzy | `pg_trgm` GIN | stavfel, namnvarianter | RPC (type-ahead + full) |
| Fulltext | `tsvector` (simple för fornnordiska; sv/en per fält) | läsningar, översättningar, noter, källtext | RPC (type-ahead + full) |
| Semantisk | `pgvector` cosine | begrepp ("stenar om resor österut") | edge function → full |

Fusion = viktad RRF, tier-boost exakt signum, tunad mot gold-set. En resultat-form:
`{entity_type, id, signum, label, snippet, score}`. Server-side, rankad globalt.
Samma yta är agenternas retrieval-verktyg.

---

## 5. Gränsöverskridande (SE/DK/NO/IS) — konkret

- **Nyckel:** signum-prefixet bär landet (N→Norge, DR/DK→Danmark, IS→Island, G→Gotland).
  Härled `country` ur prefix vid konflikt (ontology §4/§5).
- **Platshierarki är landsspecifik:** SE socken/härad/landskap, DK sogn/herred/syssel,
  NO prestegjeld/fylke. Gazetteerns `place_type` = supersett med per-land-mappning
  (`parishes` + `danish_parishes` finns; `norwegian_localities` fylls i P1 — efter
  utredning av vad N-inskrifternas `socken`-fält faktiskt innehåller).
- **Utlänkning:** `wikidata_id` ger språkoberoende korsreferens; `her_*`-kedjorna ur
  dumpen ger nationella kulturmiljöregister (SE: KMR/Fornsök; DK, NO, GB-SCT finns i dump).

---

## 6. Ordning & hävstång

**P0 sänker risk och höjer värde i alla senare faser** (granskningens slutsats) — allt
källdata på plats, en konverteringspipeline, hex→uuid löst vid gränsen. P1 (geografi)
ger sedan störst omedelbart forskningsvärde. P2 (graf) är förutsättningen för rankad
sök och AI-traversering — och har nu vatten i rören från dag ett (14k artefakt-kanter,
dubbla ristar-kanter). P3–P5 bygger ovanpå. P6 stänger. Varje fas lämnar appen
fungerande; ingen fas rubbar `id = objectid`-invarianten eller skalär/satellit-modellen.
