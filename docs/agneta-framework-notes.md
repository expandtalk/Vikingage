# Agneta Nyholms tolkningsramverk — sammanfattning för dataarbetet

Källa: Agneta Nyholm, *I modern, valan och den heliga hästens spår* (Sofiainstitutet,
2025-10-03), s. 148–167. Detta är en **trogen, attribuerad** sammanfattning av hennes
hypoteser — INTE etablerad onomastik. Allt här ska in i `extended`/hypotes-skiktet,
`contested: true`, och hållas isär från den erkända kärnan och kontrollen. Se
[[ortnamn-metodrevision]] och `docs/ortnamn-element-definition.md`.

## Hennes tes i korthet

- **Stavnings-/försköningsreformation:** kring 1251 + 10–15 år (hon åberopar Dick
  Harrison för reformvågen) och åter kring 1400-talet när Å/Ä införs, ska hedniska
  ortnamn medvetet ha skrivits om för att dölja dem. Ex: Vala → Våla, Valaberg → Wadberg
  → Wallberga.
- **Valan:** en beskyddande völva-/gudinnefigur hon menar var central och systematiskt
  utraderad. (Tolkning, ej belagt — se källkritik i [[nyholm-dokument-kallkritik]].)

## Ordlistan (s.150) — hennes hypotes-vokabulär

Val/vala, Frö/Fröa/Frea/Ludh, Stav/Staf, Horn, Gala (Ropa/Hula/Skall/Gäll), Vang/Wång,
Löt/Kärra/Eker, Rå, Hammar/Hamra, Hov, Lund/Tuna/Ahl, Harg/Horg, Ed, Häst/mär/Jor/Ross/
Horsa, Sal/Sala, Stall, Katt, Lussi/Lusse, Mor/mora, Hunn, Fager, Van, Sunna, Falk, Galt,
Trehörn/Tri/Tre, Oden, Skade, Ull, Frös, Var, Hel, God, Ram, Ras. (Var och en med "?" —
hennes egen brasklapp.)

## Ytterligare koncept (s.152–167) — utöver ordlistan

- **Vad = "säkra/kristna en plats"** (hon läser vad via SAOB 'vadslag/säkerhet'). Ex:
  Helvetsvad, Björnavad, Kärringvad, Trollvad — "det man säkrat sig emot". Isof: Vad-
  som förled ~1628 belägg, -vad efterled ~1200. **Detta är hennes mest expansiva och
  mest omtvistade led** — standardtolkning är vad = 'vadställe' (grund passage). Mkt hög
  brusrisk.
- **Svart = dolt hedniskt, Vit = kristnat.** Svarta jorden (Birka), Sorte Muld (Bornholm);
  Vite Krist, Vitlyckehällen. Isof-räkningar hon anger: Svartkällan ~28, Svartån ~140.
- **Skändningsord** (kyrkans nedsättande omdöp): Troll, Kärring, Skam, Synna, Uggel, Hynda,
  Skata, Fan, Svart, Helvete, Ulv, Sugga/Snugga, Hund, Svin, Udd. Ex: Ugglarp (~9–11 st),
  Svinevad → Svennevad.
- **-säter/-sätra = "säte för X"** (hon avvisar ortnamnsmyndighetens 'utmarksäng'):
  Torsäter, Ullsätter, Frösätter, Stavsäter, Visäter osv.
- **Ros/Ross = ära/kristnat, ev. avkraftad "helig häst" (Ross→Ros).** Roslagen-spekulation.
- **Ram = björnram/bärsärk** (Ramsta, Rambo). **Oden vs valan:** hon menar Oden lyfts fram
  på valans bekostnad; Odensvala läser hon som "Odens vala", ej "Odens svala".

## Det som FAKTISKT är testbart (daterade beläggkedjor hon ger)

Dessa är guld — konkreta, dateradade, källförda kedjor som kan matas in i
`attested_form` + `earliest_attestation_year` och pröva val→vål/vad-omskrivningen:

| Plats | Kedja (år: form) | Källa |
|---|---|---|
| Östervåla / Våla hd (Uppland) | 1296 Vala/Valir · 1344 Valbohundære · 1346 Valum · 1446 Vuala · 1488 Wala · 1600-tal Östervåla | Agneta s.149 (Riksarkivet Landskapshandl.) |
| Vallberga (Laholm) | 1462 Vallberga · 1487 Walabaergh · 1505 Wadbergh · 1603 Vatbieria · 1704 Walbierre | Agneta s.161 |
| Gesvad/Getvad (Uppsala) | 1435 "Geetwadz land" | Agneta s.158 |
| Vadstena slott | 1375 Hofdastadhum ("Hov-sta-rum") | Agneta s.159 |
| Odensvala | belagt medeltid (hon läser "Odens vala") | Agneta s.167 |

## Min bedömning (för dataarbetet)

1. **Beläggkedjorna ovan är den starkaste, testbara delen.** De kan ingestas som en
   **sourcead pilot** (attestation_source = Agneta/Riksarkivet) → gör val→vål/vad-testet
   körbart på dokumenterade fall. Ingen fabrikation: vi citerar hennes källa.
2. **Ordlistan + Vad/Svart/Vit/säter/Ros** är ett internt sammanhängande men
   **icke-mainstream** tolkningssystem. Många led (Vad, Rå, Mor, Var, Van, Ram, Ras, Katt)
   är så vanliga att de kräver ledlexikon eller manuell verifiering — annars brus, inte
   fynd. Hör hemma i hypotes-skiktet, contested, låg prior.
3. **Isof-belägg hämtas per namn** ur ortnamnsregistrets arkivkort (så gör Agneta). Ingen
   bekräftad öppen bulk-API ännu → antingen (a) pilot på kedjorna ovan, (b) utred Isof:s
   öppna data/API, eller (c) Agneta/Daniel exporterar sökningar vi importerar.
