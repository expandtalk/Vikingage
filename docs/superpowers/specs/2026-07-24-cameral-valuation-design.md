# Kameral värdering & jordnatur — schemautbyggnad (design)

**Datum:** 2026-07-24
**Status:** Design för granskning
**Ägare:** Daniel Larsson
**Bygger på:** [[transfer-mechanisms-model]], [[maktgeografi]]

---

## 1. Problem & mål

`estate_holdings.fiscal_system` blandar idag **två begreppsligt skilda dimensioner**, vilket ger den överlappning Daniel vill städa bort:

- **jordnatur** — jordens ägo-/skattekategori: skatte, frälse, krono, kyrko
- **fiskal/render-organisation** — hur jorden gav/organiserades: ledung, rusttjänst, mynt, uppsala öd

Dessutom saknas helt en **kameral värderingsmodell** (jordetal i markland:öresland:örtugland:penningland, kamerala enheter) trots att 1500-talsmaterialet (Upplands handlingar 1538–1569, Frälse- och rusttjänstlängden 1562) bygger på just det. Verifierat 2026-07-24: ingen tabell/kolumn för jordetal/jordnatur/markland finns.

**Mål:** (1) skilja **jordnatur** från **fiscal_system** (städa överlappningen), (2) införa en **jordetal-/kameral värderingsmodell** som tidsvariant post per jordeboksår.

## 2. Nuläge & bekräftade tolkningar (Daniel 2026-07-24)

- `estate_holdings.fiscal_system` (fri text, vokabulär-validerad av `trg_estate_holding_vocab`). Data i bruk: `ledung` (12), `land_skatt` (10), `mynt` (5).
- Bekräftat: **`land_skatt` = årlig jordskatt = jordnatur `skatte`**; **`mynt` = räntan erlades i mynt/pengar = fiscal_system**; **`ledung` = ledungsorganisationen = fiscal_system**.
- `vocabulary` scheme `fiscal_system` (9 koder) innehåller idag felaktigt både jordnatur- och render-koder.
- `estates` saknar värderingsfält. `estate_holdings` saknar `jordnatur`.

## 3. Design

### 3.1 Ny dimension: jordnatur

- Vokabulär-scheme **`jordnatur`** (4): `skatte` (skattejord), `fralse` (frälsejord), `krono` (kronojord), `kyrko` (kyrkojord). ASCII-koder; å/ä i label_sv.
- Ny kolumn **`estate_holdings.jordnatur text`** (på holdings enligt beslut — kan skifta över tid).
- Utöka triggern `check_estate_holding_vocab()` att validera `jordnatur` mot scheme `jordnatur`.

### 3.2 Städa fiscal_system (ta bort överlappningen)

- **Ta bort** ur `vocabulary` (scheme `fiscal_system`): `skatte`, `fralse`, `krono`, `kyrka`, `land_skatt` (5 koder). Ingen data refererar dem efter migreringen nedan (skatte/fralse/krono/kyrka la jag in i förra specen men inga rader använder dem).
- **Behåll:** `ledung`, `rusttjanst`, `mynt`, `uppsala_od` (4).
- **Datamigrering:** `UPDATE estate_holdings SET jordnatur='skatte', fiscal_system=NULL WHERE fiscal_system='land_skatt'` (10 rader). `ledung`/`mynt`-raderna orörda.

### 3.3 Ny tabell: estate_valuations (jordetal per år)

Jordetal är tidsvariant per jordeboksår och oberoende av ägar-holdings → egen tabell, inte fält på holdings/estates:

```
estate_valuations(
  id uuid pk default gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  year int NOT NULL,                      -- jordeboksår (t.ex. 1540)
  jordetal_penningland int,               -- KANONISKT värde (se 3.4)
  jordetal_notation text,                 -- originalnotation, t.ex. '0:3:0:4'
  cameral_units text,                     -- t.ex. '1 sk', '½ sk'
  source text,                            -- t.ex. 'UH 1540', 'FoR 1562'
  confidence text DEFAULT 'probable',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```
Index `(estate_id, year)`. RLS: publik läsning + admin-skriv (samma mönster som estates/estate_holdings).

### 3.4 Jordetal-representation

Kanoniskt heltal i **penningland** (jämförbart/summerbart), original som notation. Omräkning:

`1 markland = 8 öresland = 24 örtugland = 192 penningland` ; `1 öresland = 3 örtugland = 24 penningland` ; `1 örtugland = 8 penningland`.

Hjälpfunktion (immutable):
```sql
CREATE OR REPLACE FUNCTION jordetal_to_penningland(markland int, oresland int, ortugland int, penningland int)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(markland,0)*192 + coalesce(oresland,0)*24 + coalesce(ortugland,0)*8 + coalesce(penningland,0)
$$;
```
Ex: 3 öresland + 4 penningland = `jordetal_to_penningland(0,3,0,4)` = 76; notation `0:3:0:4`. Not (spec-not): markland är INTE arealmått (skattevärde), till skillnad från 1600-talets geometriska mått.

### 3.5 Validering

- Triggern på `estate_holdings` utökas: `jordnatur` mot scheme `jordnatur`.
- `estate_valuations`: CHECK `jordetal_penningland >= 0`; `year` rimlighetsintervall (t.ex. 800–1700) som CHECK.

## 4. Arbetsexempel (schematiskt — rollback i test)

UH-jordebok, gård G, år 1540: jordnatur skatte, ett skattehemman, jordetal tre öresland fyra penningland:
```
estate_holdings: ... jordnatur='skatte' ...
estate_valuations: estate_id=G, year=1540, jordetal_penningland=76,
                   jordetal_notation='0:3:0:4', cameral_units='1 sk', source='UH 1540'
```

## 5. Migrationer (additiva; en datamigrering)

1. `..._jordnatur_vocab_and_cleanup.sql` — INSERT jordnatur-scheme (4); datamigrering `land_skatt`→jordnatur skatte + fiscal_system NULL (10 rader); DELETE 5 fiscal_system-koder ur vocabulary.
2. `..._estate_holdings_jordnatur.sql` — `ADD COLUMN jordnatur text`; utöka valideringstriggern.
3. `..._estate_valuations.sql` — CREATE TABLE + index + RLS + `jordetal_to_penningland()`.
4. Regenerera `types.ts` (`supabase gen types --linked`, ej Docker).

Appliceras via psql/pooler (se [[psql-prod-migration-reference]]): `db push` osäkert; `PGCLIENTENCODING=UTF8`; bytea-match vid behov.

## 6. Icke-mål (YAGNI)

- Ingen inmatning av verklig UH/FoR-data (källkritiskt innehållsarbete — separat).
- Ingen 1600-tals geometrisk arealmodell.
- Ingen koppling estate_valuations→specifik holding (år räcker; holdingen som var aktiv det året nås via period).
- Ingen KG-materialisering av jordetal (senare, om behov).

## 7. Risker & öppna frågor

- **Datamigrering `land_skatt`** (10 rader) — enda icke-additiva; verifiera före/efter (10 → jordnatur='skatte', 0 kvar med fiscal_system='land_skatt'). Kör FÖRE DELETE av koden.
- **DELETE av vocabulary-koder** — säkerställ 0 rader refererar dem först (annars blockerar triggern framtida uppdateringar). Verifiera.
- **Öppen:** ska `estate_valuations` även bära `jordnatur` (jordeboken anger det per år)? Rekommendation: nej i v1 — jordnatur på holdings räcker; lägg till på valuations bara om årsvis skiftning visar sig behövas.

## 8. Test

- jordnatur-vokabulär = 4; fiscal_system-vokabulär = 4 (efter DELETE).
- Migrering: 0 rader `fiscal_system='land_skatt'`; 10 rader `jordnatur='skatte'`.
- Trigger: `jordnatur='skatte'` OK; `jordnatur='hittepa'` avvisas; alla befintliga rader validerar (touch-all rollback).
- `jordetal_to_penningland(0,3,0,4)` = 76; `(1,0,0,0)` = 192.
- `estate_valuations`: INSERT giltig rad (rollback) OK; negativt jordetal avvisas av CHECK.
