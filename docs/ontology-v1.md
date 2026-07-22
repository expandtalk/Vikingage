# Viking Age — Ontologi v1

**Syfte:** göra "vad kan mätas mot datalagret" maskinläsbart, så forskare *och agenter*
kan komponera hypoteser utan att läsa hela schemat. Utvecklar den befintliga grafen
(`entity_registry` / `relationship` / `rel_predicates`, v0 = runinskrifts-centrerad) till
ett domänbrett kontrakt.

## Grundprinciper (icke förhandlingsbara)

1. **Typade tabeller är sanningen.** Ontologin är ett *tunt lager ovanpå* de källförda
   tabellerna — inte en ersättning. Primärdata flyttas aldrig ner i lösa jsonb-tripplar.
   Grafen (`relationship`) är ett kant-/traverserings-lager; länktabellerna
   (`king_fortress_links`, `king_site_links`) är typade kanter.
2. **Provenance + osäkerhet är obligatoriska.** Varje kant i `relationship` bär `source_ref`
   och `confidence`. Varje entitetstyp pekar ut sina proveniens-kolumner
   (`ontology_entity_types.provenance_columns`). Ingen nod/kant utan källa.
3. **Konfidens propagerar.** En hypoteskedja är aldrig starkare än sin svagaste länk.
   Vokabulär: `belagd` > `trolig` > `tradition` > `hypotes`. En agent som kedjar en
   tradition (Emund vid Valla) med ett hårt datum (dendro 980) måste rapportera kedjan
   som `tradition`.
4. **Datering ≠ objektiv mätpunkt.** Där en datering är fyndplatsens/en hypotes
   (t.ex. `name_datings`) märks det; `uncertainty='hög'` bevaras.

## Katalogtabeller (det agenter läser)

- `ontology_entity_types` — varje entitetstyp → fysisk tabell, koordinat-typ,
  proveniens-kolumner, `status` (active|planned).
- `ontology_measures` — mätoperationer → RPC, indata, enhet, `applies_to`, `status`.
- `rel_predicates` — relationsvokabulären (subjekt/objekt-typ, beskrivning).
- `relationship` — kanterna (subject_id, predicate, object_id, qualifiers, **source_ref,
  confidence**).

## Entitetstyper (v1: 22 aktiva, 4 planerade)

Aktiva: inscription, carver, artefact, king, source, coin, dynasty, theme, god, road,
landscape, fortress, **place_name, name_dating, church, heritage_site, parish, hundred,
diocese, species_introduction**, samt genetik-lagret **adna_site, genetic_individual**.
Planerade (deklarerade, data saknas): **hydronym, script_system, motif, taxation_unit**.

### Genetik / aDNA (v1.1)
DNA är en förstaklass-del av ontologin. `adna_site` (→ archaeological_sites) och
`genetic_individual` (→ genetic_individuals; koordinat via site_id). Individens attribut —
genetiskt kön, Y-/mt-haplogrupp, härkomst (ancestry), 14C — ligger kvar i den typade
tabellen (princip 1), inte som lösa noder. Mänsklig aDNA (Margaryan 2020, Krzewińska 2018,
Rodríguez-Varela 2023) + djur-aDNA (species_introductions, proxy=adna) samlas under temat
**genetik-adna**. Se [[picture-stone-spolia]]-mönstret för graf-materialisering.

## Relationstyper (urval av de nya i v1)

Rumsliga: `near` (qualifier distance_m), `within_shape`.
Temporala: `dated_to`, `introduced_at`, `precedes` (innovationsordning).
Styre/skatt: `belongs_to_parish`, `part_of_hundred`, `taxed_under`.
Bygge/grav: `built_by`, `buried_at`.
Genetik: `sampled_at` (genetic_individual→adna_site), `kin_of` (individ↔individ, t.ex.
Salme-bröderna), `has_ancestry` (härkomstkomponent; primärdata i genetic_individuals.ancestry).
Belägg/representation: `attested_by`, `depicts`, `written_in`.
(v0-predikaten kvar: carved_by, commissioned_by, mentions_person, same_hand_as, has_theme,
located_in, cites_source, has_artefact, mentions_inscription, belongs_to_group.)

## Mätoperationer

Aktiva: `distance_baseline` (RPC distance_stats_baseline), `features_in_shape`
(punkt-i-polygon, cirkel/fyrkant/hexagon), `day_reach` (dagsresa-räckvidd per
transportteknik). Planerade: `nearest_neighbour`, `proxy_lag`, `distance_stats_free`
(steg 2b).

### Formerna = tre optimeringsprinciper
- **Cirkel** = isotrop räckvidd från en punkt.
- **Fyrkant** = rutnät/väg-spacing (romerska castra en dagsmarsch isär).
- **Hexagon** = central-place-tessellering (Christaller — optimal territoriepackning).
Storleken = en dagsresa, styrd av transporttekniken (tekniksprång: hjul→vagn,
sadel/stigbygel→häst, segel→båt). Riktvärden, redigerbara.

## Nya forskningsdimensioner (v1 lägger grunden, data fylls sourcat)

- **Art-/innovationsintroduktioner** (`species_introduction`): katt/hund/häst/oxe/segel/
  skriftspråk/bildspråk/öring, per proxy (zooark / aDNA / ikonografi / onomastik / text).
  Glappet mellan proxies är signalen. Kattens hypotes: kom med sjöfarten → borde klustra
  vid handelsnoder/kust (testbart med features_in_shape). SVERAK/populärhistoria =
  kulturkontext, INTE arkeologiska datum. Agneta Nyholm nämner *Katt* (hypotesled) och
  *Hund* (skändningsord) i ortnamn — hör i hypotes-skiktet, `contested`, källa Agneta.
- **Beskattning/organisation** (`taxation_unit`): hundare/härad/fylke/skeppslag, romersk→
  vikingatid. Tidigare metoder kan ha funnits.
- **Skrift & bild** (`script_system`, `motif`): bildspråk (hällristningar) föregår
  skriftspråk (runraderna) — `precedes`. Hällristningar: mycket vagn/oxe, sällan segel.
- **Hydronymer**: sjö-/ånamn = äldsta ortnamnsskiktet (ofta för-germanska). Knyter till
  Tesse-studien (medveten utsättning av öring ~5000 f.Kr. — ekosystemförvaltning före
  jordbruket).

## Versionering

v1 = detta dokument + katalogtabellernas innehåll (2026-07-22). Proveniens:
`supabase/migrations/20260722200000_ontology_v1.sql`. Nästa: fyll species_introductions
sourcat, bygg `nearest_neighbour` + `distance_stats_free` (steg 2b), exponera katalogen
via MCP så agenter kan introspektera.
