# Kulturmiljö-navigator — Fas 1 (Leaflet-stacken)

**Datum:** 2026-08-04
**Status:** Design godkänd, redo för implementationsplan
**Fas:** 1 av 3 (se Fasning nedan)

## Vision

En hybrid mellan turn-by-turn-navigering och en levande fornlämningskarta: när man kör
visas vad som finns längs vägen (gravfält, fornborgar, kyrkor, grottor, centralorter) i en
navigations-välbekant skal — men innehållslagret, inte navigationsskalet, är det som skiljer.

Tre visningslägen (användarens indelning):
1. **3D/förarperspektiv** (lutande vy, kurs-upp, turn-by-turn) — **Fas 2** (kräver motorbyte).
2. **Översikt** — finns redan (billäget på `/explore`).
3. **HUD** (vindrute-reflektion) — **Fas 3** (realistiskt = speglat högkontrastläge, ej AR).

**Denna spec = Fas 1:** maxa navigator-känslan på **nuvarande Leaflet-stack utan motorbyte.**

## Bärande princip: lagren ÄR källan

Navigatorn uppfinner **ingen egen datamodell och ingen parallell innehållslista.** Den är en
**lins över de befintliga kartlagren** (legenden). Det man kan visa längs vägen = de lager
som finns/är påslagna — precis som `nearby_along_route` redan tar `p_types` = påslagna
lagertyper. Vill man se en ny sorts sak längs vägen är svaret "lägg till/tänd ett lager",
inte "bygg en ny navigator-datakälla". Zon, säsong, hastighet och signifikans är bara
**filter/rendering ovanpå lagren.**

## Bärande princip: säkerhet

Under körning är appen **ljudprimär** ("om 300 m passerar du Ismantorps fornborg till
höger"). Den visuella rikedomen är för **passagerare eller stillastående** läge. Detta
avdramatiserar 3D-frågan och gör produkten till en naturlig guidad-tur-upplevelse.

## Vad som redan finns (återanvänds)

| Byggsten | Var |
|---|---|
| Billäge + kurs-upp + chrome-strippning | `useDrivingMode` (`driving`, `courseUp`) |
| Bilrutt + geokodning (OSRM + Nominatim) | `services/routing.ts`, `useRoadtrip` |
| **Korridor längs rutt** (avstånd till linje, buffert, intressefilter, signifikansrank, `frac_along`) | `useNearbyAlongRoute` → RPC `nearby_along_route` |
| **Landmärkeshierarki** (signifikans + graf-auktoritet + typ-mättnad) | `nearby_features_ranked`, `place_signals`, `signal_weights` |
| **Säsongsviktning** | `seasonal_relevance` (+ `p_season` i RPC:n) |
| Centralorter m. koordinat | `central_place_profiles` (7 noder, inkl. Birka) |
| Grottor | `heritage_sites` (~142, legend-lager `heritage_grotta`) |
| Rik läsvy per objekt | `InscriptionModal`, `ChurchHistoryModal`, hub-sidor (Kalmar/Öland) |

OSRM returnerar dessutom **turn-by-turn-steg** om vi begär `steps=true` — idag används bara
geometrin.

## Den arkitektoniska väggen (varför 3D är Fas 2)

Kartan är **Leaflet + raster-tiles**. Leaflet kan rotera (kurs-upp) men **kan inte
tilta/pitcha** → det lutande 3D-förarperspektivet kräver en vektor-GL-motor
(**MapLibre GL JS**). Det, och en trovärdig HUD, ligger därför i Fas 2/3.

## Fas 1 — scope

Ett fullskärms-navigatorläge (bygger vidare på billäget; kräver ett mål → rutt → korridor):

### UI-skal (navigations-välbekant)
- **Överst:** aktuell väg + nästa manöver.
- **Kartan** i mitten, kurs-upp, färdriktningspil.
- Egen rutt **blå**; avfarter **grå** med namn + vägtyp ("Grustagsvägen, enskild väg").
  Vägtyp/-namn är i sig historiskt innehåll (Tingsvägen, Offerkällevägen).
- **Nederst:** vägnamn/nummer · klocka · ETA · kvarvarande km.

### Innehållslager — allt är lins över legendens lager
Innehållet = de påslagna lagren (`enabledLegendItems` → `p_types`), samma källa som
`/explore` och Near me. Zon/hastighet/säsong/tier är filter ovanpå — inte nya datakällor.

1. **Tre korridor-zoner** (generaliserar `nearby_along_route` från en buffert; objekten kommer
   från de påslagna lagren):
   - **Närzon 0–100 m** — det man passerar nu (gravfält vid vägkant, milstenar, hålvägar).
   - **Synfältszon 100 m–2 km** — landmärken man ser (kyrktorn, fornborgar på krön, broar),
     med **synlighetsviktning** (se datagap — ny signal i `signal_weights`).
   - **Riktningszon (obegränsad)** — centralorter som kant-indikator.
2. **Tier = renderingsregel över lagren, inte ny taxonomi.** Hur mycket som visas styrs av
   lagrens *befintliga* signifikansrank (`nearby_features_ranked`): riksobjekt (Visby
   ringmur, domkyrkor, slott, Ölandsbron, Birka) alltid; regionala (fornborgar, större
   kyrkor, gravfält); lokala (runstenar, grottor, källor) bara i närzon. Ingen ny tabell —
   samma lager, olika synlighetströsklar.
3. **Hastighetsgrindning** — hög fart = bara högsta signifikans-tiers (hinner inte uppfatta
   mer, och säkrare); låg fart = allt påslaget. Hastigheten blir en filterparameter.
4. **Off-screen riktningsindikator** — "Birka 34 km ↗" i kartkanten (bäring + avstånd ur
   `central_place_profiles`). Den mest originella biten: navigera mot forntida noder.
   Namngivna landmärken (Gråborg, Kalmar slott, Hossmo kyrka) lyfts till rätt tier via den
   rankade unionen (ingen ny tabell).
5. **Grottor** som intressetyp i korridoren/hierarkin (`heritage_grotta`).
6. **Turn-by-turn** ur OSRM-steg (`steps=true`).
7. **Ljudprompter** vid närzons-passage (säkerhetsprincipen ovan).
8. **Säsongsfilter auto-på** — väljer nuvarande säsong, använder `seasonal_relevance` som den
   är (rit/kult-vikterna finns; bad/svamp = datagap).
9. **"Stanna & läs"-läge** — stillastående: tryck på ett landmärke → läspanel som återanvänder
   `InscriptionModal`/`ChurchHistoryModal`/hub-länkar. Läsa om orter (Mönsterås, Pataholm),
   fornborgar, centralorter.
10. **Kluster → drill-in för täta lager.** Runstenar (~2 998) och hällristningar (7 940) får
    inte dumpas som råpunkter — de **klustras på översiktsnivå och spjälkas upp när man
    närmar sig** (samma princip som översiktssidorna). Rendering-regel i navigatorn, styrd av
    zon/zoom, inte ny data.
11. **Milsten-lins (1700-talets vägnät).** Milstolpar (**5 820**) + väghållningsstenar (3 934)
    + vägmärken (6 133) bildar tillsammans det historiska vägnätet — de flesta milstenar visar
    *vägen till Stockholm*, en lins ur 1700-talets gästgiveri-/vägförordning. Egen tänd/släck-lins.
    **Källkritik (avgörande):** en del milstenar har flyttats eller står på museum. För att
    rekonstruera *vägsträckningen* måste vi använda stenarnas **ursprungliga läge**, inte det
    nuvarande. Där bara nuvarande/registrerat RAÄ-läge finns visas stenen som punkt med förbehåll,
    men den räknas **inte** in i den rekonstruerade väglinjen förrän ursprungsläget är belagt.

### Standardtända lager (släckbara)
Landmärken som redan finns i systemet — **fornborgar och kyrkor** — är tända per default (de är
navigations-landmärken), men **släckbara** i legenden. Allt annat följer användarens lagerval.
Default-uppsättningen är legend-seedning (samma mekanism som `/explore`), inte hårdkodning.

### Föreslagna komponenter/hooks
| Enhet | Ansvar |
|---|---|
| `NavigatorMode` (utökar billäget) | Fullskärms-skal: mål → rutt → korridor → overlays |
| `NavigatorTopBar` | Aktuell väg + nästa manöver |
| `NavigatorBottomBar` | Riktningspil, vägnamn/nr, klocka, ETA, km |
| `CorridorLayer` | Renderar de tre zonernas landmärken (bucketing per avstånd/tier) |
| `OffScreenIndicators` | Kant-chips mot centralorter (bäring) |
| `useNavigatorVoice` | Ljudprompter (Web Speech API) |
| `StopAndReadPanel` | Stillastående läspanel (återanvänder befintliga modaler) |
| RPC-tillägg | `nearby_along_route` returnerar avstånd/tier per objekt (för zon-bucketing) + `steps` från OSRM |

## Datagap = lager-täckning (markerade deluppgifter — blockerar INTE koden)

Eftersom lagren är källan blir "datagap" = **saknat/otäckt lager**. Koden byggs lager-agnostiskt;
följande är separata lager-/data-uppgifter:

- **Bad — FINNS redan** som `experiences`-kategori `badplats` (**57 st**, via `useMapExperiences`).
  Alltså inget datagap — bara att slå på lagret. *Notera:* du nämnde 100+; jag hittar 57 — resten
  är i så fall oimporterade eller ligger annorstädes (verifieras).
- **Svamp — FINNS** som eget `svamp`-schema (`svamp.stalle`, `svamp.fynd`, `svamp.art`,
  `svamp.score_dag`…). Uppgiften är att **exponera `svamp.stalle` som ett kartlager** (litet, "bara
  att lägga in"), inte att skapa data.
- **Säsong bad/svamp:** `seasonal_relevance` saknar bad→sommar / svamp→höst-rader → seeda ett par
  rader (mekanismen finns).
- **Milsten-ursprungsläge:** för väglins-rekonstruktionen behövs ursprunglig plats där stenen
  flyttats/står på museum (jfr `inscription_locations` original vs nuvarande). RAÄ ger registrerat
  läge; ursprungsläge är en källuppgift.
- **Gammalt vägnät mot centralorter:** bara 10 rader i `viking_roads`. Riktningspilen fungerar;
  ett faktiskt gammalt vägnät (t.ex. lederna mot Birka) är insamling. (Milsten-linsen ovan ger dock
  redan ett 1700-tals vägnät.)
- **Synlighetsviktning:** ny faktor i `signal_weights` (höjd över omgivning × objekttyp) —
  arkitekturen tillåter det **utan deploy**, men värdena måste härledas (DEM/relief).
- **Läsinnehåll för mindre orter:** Kalmar/Birka har hubbar; Mönsterås/Pataholm är sannolikt
  tunt — verifieras, ev. kort kurerad text.

## Felhantering
- Ingen rutt/mål → falla tillbaka till dagens billäge (kurs-upp utan korridor).
- OSRM/Nominatim nere → visa fel, behåll kartan.
- Tom korridor → "inga registrerade lämningar längs sträckan i valt intresse".
- Ljud avstängbart; kräver användargest (Web Speech/autoplay-policy).

## Testning
- Enhetstest: zon-bucketing (avstånd→närzon/synfält), hastighetsgrindning (fart→tier-tak),
  bäringsberäkning för off-screen-indikatorn.
- Manuell QA: simulerad rutt (Kalmar→Mönsterås), kurs-upp, blå rutt/grå avfarter, ETA,
  ljudprompt vid närzon, stanna & läs öppnar rätt modal.

## Fasning (för sammanhang)
- **Fas 1 (denna):** navigator-känsla på Leaflet — korridor-zoner, hierarki, riktning, TBT, ljud, säsong, stanna & läs.
- **Fas 2:** MapLibre GL → äkta 3D-förarperspektiv + trovärdig HUD.
- **Fas 3:** historieoptimerad rutt ("förbi Gråborg, +8 min").

## Produktfråga (besvarad)
Datan/logiken stannar i Vikingage-stacken (bor redan där). Navigations-**skalet** byggs som
läge inuti Vikingage och kan **extraheras** till fristående turism-/konsumentapp senare — mot
samma backend. Bygg motorn en gång.

## Öppna frågor
- Egen route (t.ex. `/navigator`) eller utökning av billäget på `/explore`? (Rek: eget läge
  som återanvänder samma karta/hooks.)
- Off-screen-indikatorn: bara centralorter, eller även närmaste riksobjekt utanför skärmen?
