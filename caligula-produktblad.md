# Caligula — epistemisk granskningsmotor

*Produktblad · Viking Age forskningsplattform · 2026-08-22*

## Vad Caligula är

Caligula är en agent som **bedömer trovärdigheten** i ett dokument, en webbsajt eller ett enskilt
påstående — mot plattformens vetenskapsmetodik (vikingage.se/sv/vetenskapsmetodik). Den ger en
poäng 0–100, men poängen är aldrig en naken siffra: den är en **spårbar evidensliggare** som visar
vilken källa som bär vilket påstående, hur starkt stödet är, och — det avgörande — om olika
beviskedjor verkligen är *oberoende* eller bara upprepar samma ursprungsantagande.

Caligula är inte en sökmotor som producerar snygga svar. Den angriper problemet med den
"syntetiska världen": ett AI-svar kan vara fullständigt sammanhängande och ändå fel, eftersom
sammanhanget är fel. Caligula tvingar fram redovisningen bakom påståendet.

## Problemet den löser

En vanlig granskning räknar hur många källor som säger samma sak. Det är fel mått.

> **Högom-exemplet.** Äldre arkeologi skrev "man" för att graven innehöll vapen. Populärvetenskap
> upprepade "man". Museet skrev "Högommannen". Det är inte tre belägg för kön — det är *ett*
> antagande reproducerat tre gånger. Riktig triangulering vore osteologi + DNA + gravinventarium:
> tre *oberoende* bevislinjer.

Caligula skiljer dessa två fall åt maskinellt. Det är dess viktigaste egenskap.

## Så fungerar den

**Pipeline:** `källa → observation → tolkning → konkurrerande förklaring → oberoende test →
konvergens → trovärdighetsgrad`

1. **Bryt ner till påståenden.** Dokumentet delas i atomära, prövbara påståenden. Varje påstående
   märks som *observation*, *tolkning*, *tradition* eller *hypotes* — så en tolkning inte kan
   maskera sig som en observation.
2. **Knyt evidens till källa.** Varje stöd- eller motbevis kopplas till sin källa, med en bevislinje
   (osteologi, aDNA, typologi, ortnamn, topografi, filologi, skriftlig källa …) och en styrka.
3. **Sök aktivt motbevis (falsifiering först).** Caligulas uppgift är att försöka *motbevisa*
   påståendet — leta platser där mönstret inte håller, konkurrerande etymologier, statistiska
   alternativ — inte att bekräfta det. Överlever påståendet blir det starkare.
4. **Bygg oberoende-grafen.** För varje bevislinje registreras om den *citerar / reproducerar /
   ärver ett antagande från / omanalyserar* en annan — eller är *oberoende*. Oberoendegraden räknas
   som antalet **distinkta rötter**, inte antalet källor. (Högom → 1 rot; triangulering → 3 rötter.)
5. **Väg och redovisa.** Negativ evidens (frånvaro av fynd ≠ bevis för frånvaro) vägs ned.
   Trovärdighetsgraden beräknas ur styrka × oberoende, minus typade bias-avdrag — och presenteras
   som en dekomponerad rapport.

## Poängrubriken (0–100)

| Dimension | Spann | Mäter |
|---|---:|---|
| Attribution / källhänvisning | 0–10 | Andel påståenden med källa; primär- vs sekundärkälla |
| Beläggbara tolkningar | 0–10 | Tolkningar som faktiskt stöds av evidens, ej frihandspåståenden |
| **Bias (avdrag)** | 0–**40** | Typad katalog — se nedan; här bor cirkulär konvergens |
| Destruktiv vs icke-destruktiv metod | 0–10 | Metodredovisning; icke-destruktivt premieras |
| Proveniens | 0–10 | Källors och föremåls härkomst dokumenterad |
| Legal (AI-act, upphovsrätt) | 0–10 | Licens angiven; AI-användning redovisad; PD/CC efterlevs |
| Öppenhet / reproducerbarhet | 0–10 | Rådata, kod eller protokoll bifogat; granskningshistorik publik |

**Bias-katalog (avdrag):** bekräftelsebias · könsprojektion (Högom) · cirkulär konvergens (delad rot)
· källberoende · nationalistisk/ideologisk · presentism · överlevnadsbias · övertolkad negativ evidens
· *etablerad-som-facit* (en ordbokstolkning behandlad som sanning).

**Två medvetna gränser:**
- **AI-genererat ger inte automatiskt noll.** AI-detektorer är opålitliga och lätt lurade → auto-noll
  skulle producera falska anklagelser. AI-användning är i stället ett **öppenhetskrav** (poäng för
  redovisning) och en varningsflagga för manuell granskning. Endast *bekräftad* plagiatmatchning mot
  textkorpus drar av.
- **Etablerad forskning är inte facit.** En ny hypotes avvisas aldrig för att den etablerade
  tolkningen redan står i en ordbok. Båda prövas mot materialet; oberoende extern evidens kan lyfta
  den nya över den etablerade.

## Validering: blindtest

Metodens styrka mäts med blindtest — någon annan väljer platserna/fallen. Hittar Caligula strukturer
som sedan kan kontrolleras mot arkeologi och originalurkunder är resultatet mycket starkare än
ytterligare exempel som forskaren själv valt ut.

## Styrning (viktigt)

Caligula **skriver aldrig kanon**. Den poängsätter, flaggar och föreslår mot en spårbar liggare;
en verifierar-agent prövar; **människan beslutar**. Allt agenten producerar landar som *staging* tills
det granskats. Detta är samma människa-i-loopen-princip som hela agentflottan.

## Status (2026-08-22)

- **Byggt:** det epistemiska schemat i produktion — `epistemic_claim`, `epistemic_evidence`,
  `evidence_dependency` + funktionen `epistemic_independence()`. Oberoende-logiken är verifierad:
  Högom-fallet ger oberoendegrad 1, äkta triangulering ger 3.
- **Nästa steg:** agentlogiken (påstående-extraktion, aktiv motbevis-sökning, bias-detektering,
  rubrik-beräkning) och gränssnittet för dokument-/sajtingång.

## Var Caligula passar in

Samma motor tjänar två ingångar: att bedöma **externa dokument/sajter**, och att kvalitetssäkra
**plattformens egna påståenden**. För institutioner (kommun, region, museum, universitet) är värdet
riskreducering — ett spårbart, källkritiskt omdöme i stället för ett oöverblickbart AI-svar.
