# Ortnamnssemantik — spec (flerlagermodell)

**Status:** utkast, 2026-07-31. Grund: diskussion Daniel ↔ Claude.
**Utgår från:** god ortnamnssed-arbetet ([`god-ortnamnssed`-minne], commits d4aff01/b76f1bb/58e771f) + befintlig onomastisk modell.

## Premiss

Ett ortnamn är inte en etikett utan har **fyra semantiska lager**:

1. **Sträng** — själva namnformen.
2. **Referent** — vad namnet pekar på (stad? socken? land? gata?).
3. **Appellativ/element** — namnets byggstenar och deras betydelse (`smed-`, `husa-`, `kungs-`, helgon), som **återkommer** över många orter → utbredningen är data.
4. **Tid** — namn är tid- och platsbundna; byten är riktade och kan gälla en del.

God ortnamnsseds enda "gällande form" täcker lager 1–2 (delvis). Forskningen behöver alla fyra.

## Nuläge (verifierat 2026-07-31)

| Byggsten | Finns | Kommentar |
|---|---|---|
| `place_names` (~42 984) | ✅ | 99 % OSM; `name_authority`/`normed_name` införda; feature_type = OSM-bebyggelse (ej socken) |
| `place_name_forms` | ✅ | diakron: valid_from/to, extent, relation_kind, related_form_id, form_kind |
| `ortnamn_element_config` (25) | ✅ | **nästan enbart hedniskt-sakralt + makt** (frö, tor, oden, val; tuna, sal, hammar, ed) |
| `ortnamn_element_hits` / `enrichment_results` / `sol_comparison` | ✅ | distributions- + källkritik-maskineri finns |
| socknar | egen tabell `parishes` | homonymi ort↔socken är **korstabell** |
| salience/prominens | ❌ | ingen signal för "vilken referent menar sökaren" |

**Datahygien:** `element_category` har dubbletterna `sakralt` (1115) + `sacral` (32) → slå ihop, och dela i pagan/christian (se lager 4/§4).

## De fyra begreppen (ur Daniels exempel)

### 1. Namnet som återkommande appellativ-typ (Smedby, Husby)
Utbredningen ÄR datan. 10 Smedby = smedbyar (högstatushantverk); 38 Husby/Husa = kungliga husabyar. Känd **service-/rinkeby-modell**: Husby, Rinkeby, Smedby, Karleby, Tegneby, Svenneby = specialiserade tjänstebyar kring central-/kungsmakt.
- **Saknar:** en domän för **yrke/social funktion** (katalogen är teonymer).
- **Bygg:** element `social_service` (smed, karl, rink, svenn, tegn, husby …). Då blir utbredningen en **karta över maktens organiserade tjänstebygd** → matar maktgeografin.

### 2. Homonymi + referent-salience (Kalmar ort/socken; Danmark land/by)
Samma sträng → flera referenter som skiljer i **typ** (ort/socken) och **skala** (nation/by). Sökaren menar staden Kalmar, landet Danmark.
- **Saknar:** salience/primär-referent + namnupplösning över tabeller (place_names ↔ parishes ↔ nationer).
- **Bygg:** `prominence int` + `is_primary_referent bool`; söklogik rankar nation > stad > socken > by.
- **Genväg:** Wikidata-crosswalken (pågår) ger `P31` (instans av: stad/socken/land) + invånarantal/sitelinks = färdig typ- + salience-signal. **Skörda P31 = steg 1.**

### 3. Diakroni kodad i namnet (Gamla-, Husgatan→Kungsgatan, Husby→Kungsgård)
Namnet är ett kronologi-tecken. "Gamla X" förutsätter tidigare X (+ ofta "Nya X"). "Kungs-" som ersätter "husa-" = kungsgodssystemets omdöpning.
- **Har:** diakrona modellen (valid_from/to, predecessor/successor, related_form_id).
- **Saknar:** (a) härledningsregel — "Gamla-"/"Nya-" + Kungs-över-Husby genererar *hypotetiska* predecessor-länkar (flaggade inferred). (b) **period_stratum på element-nivå** (husby = äldre kungsgodsterm, kungsgård = yngre) → varje husby-namn ärver "kungligt gods, äldre skikt".

### 4. Element som period- OCH influens-proxy (helgon)
(i) Helgonnamn = **katolsk period** (för-reformatorisk). (ii) *Vilket* helgon vid en ort = **kult-influensvektor**: S:t Olof = norsk/handel, Birgitta = birgittinsk (efter 1370), S:t Nikolaus = köpmanna/Hansa. Kvinnliga helgon (Birgitta, Katarina, Maria) har egen institutionell signatur.
- **Saknar helt:** kristen hagiografisk domän. "sakralt" är enbart hedniskt — helgon där vore kategorifel (motsatt periodmarkör).
- **Bygg:** separera `sacral_pagan` vs `sacral_christian`; katalogisera helgonelement med `period_stratum='katolsk medeltid (ca 1100–1527)'`. Produkter: helgondedikations-**karta = kristnandeförlopp**; specifik-helgon-**klustring = kultdiffusion**.

## Schemaändringar (samlat)

- `ortnamn_element_config`: lägg till `period_stratum text`, `semantic_domain text` (om ej redan); nya kategorier `social_service`, `sacral_christian`; migrera `sacral`→`sacral_pagan`, slå ihop `sakralt`.
- `place_names`: `prominence int`, `is_primary_referent boolean`, `wikidata_p31 text` (instans-av, ur crosswalken).
- `place_name_forms`: (klart) valid_from/to, extent, relation_kind, related_form_id.
- Ny vy/RPC för homonymi-upplösning över place_names + parishes + nationer, rankad på prominence.

## Byggordning

1. **P31/salience ur Wikidata-crosswalken** — löser Kalmar/Danmark nästan gratis. *Startar när backfillen `bs2wahp9y` landat (skriver på place_names).*
2. **`social_service`-elementdomän** — Smedby/Husby-fördelning, högt forskningsvärde, kopplar maktgeografin.
3. **Kristen hagiografisk domän + period_stratum** — helgonkarta + kultdiffusion; städa pagan/christian.
4. **Gamla-/Kungs-härledningsregler** — hypotetiska diakrona länkar.

## Källkritik / principer

- Härledda länkar (Gamla-/Kungs-) flaggas `inferred`, aldrig som belägg.
- Normering ändrar aldrig hävdvunna former — OSM-/äldre former bevaras som varianter.
- Element-tolkningar bär `ortnamn_element_interpretations` (flera läsningar + proponent + status), jämförs mot SOL (`ortnamn_sol_comparison`).
- Flerspråkighet (samiska/finska/meänkieli) = separat spår (place_name_forms.language_layer).
