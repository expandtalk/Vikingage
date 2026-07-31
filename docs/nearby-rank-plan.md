# Nearby-rank — plan

**Status:** aktiv. Fas 1 byggd (`nearby_features_ranked`), Fas 2 påbörjad (signal-infrastruktur).
**Mål:** bästa lokalhistoriska upptäckt — "historien nära mig", inte en POI-lista sorterad på avstånd.

## Princip
Avstånd är EN vikt, inte hela ordningen. Rankningen väger objektiv auktoritet + sevärdhet +
personlig relevans, och är **läsbar** (`rank_reason`) — samma evidens-öppenhet som resten av plattformen.

## Arkitektur (viktig)
- **Server (RPC) = objektiv, delbar auktoritet.** Distans, signifikans, graf-auktoritet, evidens,
  sevärdhet-signaler. Samma för alla. Tunbar via `signal_weights`.
- **Klient = personlig omviktning.** Intresse-vikt, **släkt-boost (GEDCOM, privat)**, tids-boost mot
  datum, socialt. Lämnar aldrig enheten för de privata bitarna.

Det löser (a) patent-oron (ingen central personaliserad auktoritetsmotor — PageRank-patentet löpte
dessutom ut 2019, och vi använder grad i VÅR graf, ej random-surfer), (b) integritet (släkt klientsidigt).

## Faktorkatalog
| Faktor | Var | Status | Källa |
|---|---|---|---|
| Avståndsavklingning `exp(-d/8)` | server | ✅ Fas 1 | koordinat |
| Bas-signifikans per typ (runsten 0.6, kyrka 0.35…) | server | ✅ | typ |
| **Graf-auktoritet** (grad i `relationship`) | server | ✅ | KG (vår "PageRank") |
| Evidensklass (belagd>tradition) | server | ✅ | heritage_sites |
| Namngiven vs namnlös | server | ✅ | källdata |
| Typ-mättnad (cap N per typ) | server | ✅ | window-funktion |
| **Sevärdhet** (wikidata-sitelinks, kulturminnesstatus, museum) | server | 🔜 Fas 2 | `place_signals` |
| **Populäritet** (populäraste sökord/sidor från externa sajter) | server | 🔜 | Daniel matar in → `place_signals` |
| Event/tid (årsdagar, säsong) | klient | 🔜 Fas 3 | historical_events |
| Intresse-vikt (profil) | klient | 🔜 Fas 3 | enabledLayers/preferens |
| **Släkt-boost** (anfäders socknar) | klient | 🔜 Fas 3 | GEDCOM (privat) |
| Socialt (vänners intressen) | klient | ❌ senare | (saknar social graf) |
| KG-story-kort ("mer av samma ristare") | klient | 🔜 Fas 4 | relationship |

## Extensibilitet — signal-tabellen
Nya faktorer läggs till UTAN schemaändring:
- `place_signals(entity_type, entity_id, signal, value, source)` — en rad per (objekt, signal).
- `signal_weights(signal, weight)` — vikt per signal, tunbar i DB utan deploy.
- RPC:n summerar `Σ value·weight` per objekt → signifikans-boost (capad).

Så Daniels populäritetsdata (sökord, sidbesök) = bara `INSERT INTO place_signals (…, 'popularity', …)`
+ ev. en vikt-rad. Samma för wikidata-sitelinks, museibesök, pageviews.

## Datakällor (att mata in över tid)
- Wikidata: sitelinks (extern länk-auktoritet) + P1435 (kulturminnesstatus).
- **Daniel:** populäraste sökord + populäraste sidor från externa sajter → `popularity`-signal.
- SHM: antal objekt per fyndplats → museum-attention.
- Egna pageviews/sök (när loggat) → intern populäritet.
- Turistbyrå/lokala listor → kurerad `sight`.

## Faser
1. ✅ **Objektiv rank-RPC** — distans + signifikans + graf-auktoritet + typ-mättnad + rank_reason.
2. 🔜 **Sevärdhet-lager** — `place_signals`/`signal_weights` + seed (cult_sites + kurerade flaggskepp);
   sedan wikidata-sitelinks + Daniels populäritetsdata.
3. 🔜 **Personligt lager (klient)** — intresse-vikt + släkt-boost (GEDCOM) + tids-boost; personliga rank_reason.
4. 🔜 **KG-story-kort** — grafen som lots ("mer av samma ristare", "kungen den nämner").

## Källkritik / principer
- Ranking ska vara läsbar (`rank_reason`), aldrig en svart låda.
- Kurerade sevärdheter märks med källa; ingen fabricerad populäritet.
- Personlig data (släkt, intresse) stannar klientsidigt.
