# Överföringsmekanismer & morgongåva — schemautbyggnad (design)

**Datum:** 2026-07-23
**Status:** Design för granskning
**Ägare:** Daniel Larsson
**Bygger på:** [[maktgeografi]], `estate_holdings`/`estates`-modellen, KG ([[kg-navigator-project]])

---

## 1. Problem & mål

Maktgeografin behöver kunna registrera **hur jord bytte händer** — inte bara vem som innehade en gård, utan *via vilken mekanism*, *från vem* och *när*. Morgongåvan är det utlösande fallet: makens gåva till hustrun morgonen efter bröllopet, hennes personliga egendom, som vid hennes död kunde gå till hennes släkt snarare än makens dynasti. Det är en av flera överföringsmekanismer, och en förutsättning för att studera dynastisk markkontroll (Diplomatarium, Bo Jonssons arv, medeltidslagarna).

**Mål:** utöka `estate_holdings` så att en holding kan bära *(förvärvsmekanism, givare, period)* på ett kontrollerat, sökbart sätt, utan att special-casa morgongåvan — samma modell ska uttrycka alla mekanismer.

## 2. Nuläge (verifierat 2026-07-23)

- `estate_holdings(id, estate_id→estates, king_id→historical_kings, dynasty_id→royal_dynasties, holder_kind, holder_name, role, acquired_via, from_holder, period_start, period_end, fiscal_system, confidence, source, note, ...)`. 27 rader.
- `acquired_via`: fri text — idag bara `förläning` (5) + null (22). Ingen CHECK.
- `holder_kind`: fri text — `king` (21), `dynasty` (5), `bryte` (1). Ingen CHECK.
- `from_holder`: fri text, **oanvänd (0 rader)**.
- `historical_kings` innehåller **21 kvinnor** (`gender='female'`) → en hustru kan vara `king_id`-innehavare direkt.
- `vocabulary(scheme, code, label_sv, label_en, parent_code, category, description, wikidata_id, ...)` — projektets generella kontrollerade-vokabulär-tabell (537 rader). Hemvist för nya värdemängder.
- KG: `has_estate`-kanter bär redan `acquired_via`/`role`/`period`/`fiscal_system` i `qualifiers` (materialiserat i KG-Plan-1).

## 3. Design

Princip: **jordinnehav = en tidsserie av holdings**, var och en med *(innehavare, från vem, mekanism, period, fiskalt system, källa)*. Morgongåva är då bara `acquired_via='morgongava'` med en kvinnlig innehavare och maken som givare. Ingen separat händelsetabell (se icke-mål).

### 3.1 Förvärvsmekanismer som vokabulär (scheme `acquisition_mode`)

Registrera i `vocabulary` (scheme = `acquisition_mode`), med sv/en-etiketter:

| code | label_sv | label_en |
|---|---|---|
| `morgongava` | morgongåva | morning gift |
| `hemfoljd` | hemföljd | dowry |
| `arv` | arv | inheritance |
| `forlaning` | förläning | enfeoffment/fief |
| `donation` | donation | donation/gift |
| `kop` | köp | purchase |
| `pant` | pant | mortgage/pledge |
| `byte` | byte | exchange |
| `konfiskation` | konfiskation | confiscation |

Befintligt `förläning` migreras till koden `forlaning` (ASCII-kod, sv-etikett med å).

### 3.2 Givaren (transferor) — spegla innehavar-polymorfin

`from_holder` (fritext) räcker inte; givaren måste kunna vara en nod för dynastisk spårning. Lägg till, speglande innehavar-sidan:

- `from_holder_kind text` — `person` | `dynasty` | `institution`
- `from_king_id uuid REFERENCES historical_kings(id) ON DELETE SET NULL` — givaren som person (make, arvlåtare, säljare)
- `from_dynasty_id uuid REFERENCES royal_dynasties(id) ON DELETE SET NULL` — givande dynasti
- behåll `from_holder text` — för institutioner utan egen nod (kronan, kyrkan) tills de nodifieras

För morgongåva: `from_holder_kind='person'`, `from_king_id=<maken>`.

### 3.3 Innehavar-typ (scheme `holder_kind`)

Registrera i `vocabulary` (scheme = `holder_kind`): `king`, `consort`, `dynasty`, `bryte`, `institution`. Nytt: **`consort`** (gemål/hustru som innehavare — morgongåvans mottagare) och `institution` (kloster/krona). Kön hämtas ur `historical_kings.gender`, inte ur `holder_kind`.

### 3.3b Fiskalt system (scheme `fiscal_system`)

`estate_holdings.fiscal_system` finns redan (fri text). Registrera dess värden i `vocabulary` (scheme = `fiscal_system`), samma valideringsmönster:

| code | label_sv | label_en |
|---|---|---|
| `skatte` | skatte (skattejord) | tax land |
| `frälse` (kod `fralse`) | frälse | frälse/noble exempt |
| `rusttjanst` | rusttjänst | cavalry service (frälse) |
| `krono` | krono | crown land |
| `kyrka` | kyrkojord | church land |
| `ledung` | ledung/roden | naval levy |
| `uppsala_od` | uppsala öd | royal domain |

**Not (tema, ej etymologi):** `rusttjanst` (av *rusta*=beväpna) och `ledung`/roden (av *roþer*=rodd) har **olika ordrötter** men är funktionellt samma institution — militär tjänsteplikt knuten till jord mot skattelättnad, över tid. Modelleras som ett KG-**tema** (militär tjänsteplikt→jord), INTE som språkligt släktskap. Källa till 1500-talsvärdena: Frälse- och rusttjänstlängden (FoR) 1562, Upplands handlingar (UH) 1538–1569.

### 3.4 Tidsskivat innehav (spåra gården genom tiden)

Ingen ny tabell — `period_start`/`period_end` finns. Lägg index `estate_holdings(estate_id, period_start)`. En gårds innehavskedja = holdings ordnade på `period_start`. Det kvinnliga arvet modelleras som en **följd**:
1. holding: hustru, `acquired_via='morgongava'`, `from_king_id=make`, `period_start=giftermålsår`
2. holding: hustruns arvinge, `acquired_via='arv'`, `from_king_id=hustru`, `period_start=hennes dödsår`

Så syns att gården gick till hennes släkt, inte makens dynasti.

### 3.5 Validering (trigger mot vokabulären)

Lägg en `BEFORE INSERT/UPDATE`-trigger på `estate_holdings` som avvisar `acquired_via`/`holder_kind`/`from_holder_kind` som saknas i respektive `vocabulary`-scheme (mönstret från `check_relationship_types()`). NULL tillåts (okänt). Håller datan ren utan hårdkodad CHECK.

### 3.6 KG-integration (not — egen materialiseringsuppgift)

- `has_estate`-kantens `qualifiers` bär redan `acquired_via` + period; lägg `from` = `from_king_id` när det finns.
- Införa marriage-kant: `kin_of` make↔hustru med qualifier `{relation:'spouse'}` (predikatet `kin_of` finns i `rel_predicates`).
- Detta är en separat KG-materialiseringsuppgift (ej denna spec), men schemat ovan är förutsättningen.

## 4. Arbetsexempel — SDHK 5485 (verklig källa)

Brev där **kung Magnus Eriksson ger sin hustru Gunhild Arvidsdotter två nybyggen i morgongåva** (Svenskt Diplomatariums huvudkartotek, SDHK 5485). Modellerat:

- **Givaren** Magnus Eriksson finns i `historical_kings` → `from_king_id`.
- **Mottagaren** Gunhild Arvidsdotter finns INTE i `historical_kings` → måste läggas in som person (`gender='female'`, källa SDHK 5485) och blir `king_id`. *(Se receiver-noten nedan.)*
- **De två nybyggena** = två `estates` (`estate_type='nybygge'`) → **två holdings**, grupperade via delad `source='SDHK 5485'` (inget grupperings-fält behövs).

```
-- två holdings, en per nybygge:
estate_holdings:
  estate_id        = <nybygge 1 / 2>
  king_id          = <Gunhild Arvidsdotter>   (person, gender=female)
  holder_kind      = 'consort'
  acquired_via     = 'morgongava'
  from_holder_kind = 'person'
  from_king_id     = <Magnus Eriksson>
  period_start     = <urkundens år>
  source           = 'SDHK 5485'
  confidence       = 'probable'
```

**Receiver-not (viktig):** `estate_holdings.king_id → historical_kings` är ett missvisande namn — tabellen bär redan gemåler (t.ex. Blanka av Namur). Icke-regerande mottagare (hustrur, adelskvinnor) läggs därför in i `historical_kings` som personer. Att döpa om till en `persons`-modell är ett större, separat spår — utanför denna spec.

**Testning:** i schematestet infogas SDHK 5485-fixturen i en transaktion som **rullas tillbaka** (bevisar att modellen bär fallet) — verklig, permanent inmatning är källkritiskt innehållsarbete, inte del av denna schemaspec.

## 5. Migrationer (additiva, icke-destruktiva)

1. `..._transfer_vocab.sql` — `INSERT` i `vocabulary` för scheman `acquisition_mode` (9 koder) + `holder_kind` (5 koder) + `fiscal_system` (7 koder), `ON CONFLICT DO NOTHING`. Migrera `förläning`→`forlaning` i befintliga `estate_holdings` (UPDATE på 5 rader).
2. `..._estate_holdings_transferor.sql` — `ALTER TABLE estate_holdings ADD COLUMN from_holder_kind text, ADD COLUMN from_king_id uuid REFERENCES historical_kings(id) ON DELETE SET NULL, ADD COLUMN from_dynasty_id uuid REFERENCES royal_dynasties(id) ON DELETE SET NULL`. Index `(estate_id, period_start)`.
3. `..._estate_holdings_validate.sql` — trigger `check_estate_holding_vocab()` + `CREATE TRIGGER`.
4. Regenerera `src/integrations/supabase/types.ts` (nya kolumner).

Appliceras via psql mot session-poolern (samma som KG-Plan-1; `supabase db push` är osäkert p.g.a. drivad migrations-historik).

## 6. Icke-mål (YAGNI)

- **Ingen separat `property_transaction`/event-tabell.** En holding *är* tidsskivan; givare + mekanism + period räcker för att uttrycka överföringen. Reifiera först om en överföring behöver egna attribut som inte hör till holdingen.
- **Ingen datainmatning/backfill** av verkliga morgongåvor här — det är innehållsarbete (Diplomatarium) som följer efter schemat.
- **Ingen KG-materialisering** i denna spec (egen uppgift, 3.6).
- Ingen ändring av `estates` (gården som plats är oförändrad).
- **Ingen kameral värderingsmodell** (jordetal i markland:öresland:örtugland:penningland, jordnatur, antal kamerala enheter/hemman) — det 1500-talskamerala materialet (UH/FoR) är ett **eget kommande spec** (jordvärdering), skilt från överföringsmekanismerna. `estates` saknar idag jordetal/jordnatur-fält; de tillkommer där, inte här.

## 7. Risker & öppna frågor

- **`förläning`→`forlaning`-migreringen** rör 5 befintliga rader (UPDATE) — enda icke-additiva steget. Verifiera antal före/efter.
- **Institution som givare/innehavare** (kronan, kyrkan) saknar noder idag → `from_holder`/`holder_name` (text) tills de nodifieras. Räcker för v1.
- **Öppen fråga:** ska `acquired_via`-koderna vara ASCII (`morgongava`, `forlaning`) med å/ä bara i `label_sv`? Rekommendation: **ja** (undviker teckenkodnings­strul som redan setts i `source`-fält).
- **Öppen fråga:** behövs `to`-riktning också (t.ex. återlämnad morgongåva)? Rekommendation: nej — modelleras som en ny holding med annan `acquired_via`, inte ett fält.

## 8. Test

- Vokabulär: `acquisition_mode` har 9 koder, `holder_kind` 5 — verifiera via count.
- Migrering: 0 rader kvar med `acquired_via='förläning'` (alla → `forlaning`).
- Kolumner: `from_king_id`/`from_dynasty_id`/`from_holder_kind` finns; FK:er verifierade.
- Trigger: INSERT med `acquired_via='morgongava'` + `holder_kind='consort'` lyckas; INSERT med `acquired_via='hittepå'` avvisas.
- Tidsskiva: två holdings för samma estate (morgongåva → arv) går att hämta ordnade på `period_start`.
