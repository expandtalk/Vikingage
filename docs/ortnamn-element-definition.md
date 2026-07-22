# Ortnamns-element — reviderad definition för granskning

**Status:** utkast för Agneta Nyholms sign-off, rad för rad. Inget av detta är ännu
inkodat i den skarpa matchern utöver det konservativa kärn-/kontrollskiktet
(`src/utils/placeNameElements.ts`). Agnetas utvidgade ordlista nedan är HYPOTES och
ska stanna i ett tydligt märkt, attribuerat skikt tills den granskats.

Datum: 2026-07-21. Bakgrund: metodgranskning (ChatGPT-review via Agneta) + Agnetas
text "I modern, valan och den heliga hästens spår" (Sofiainstitutet), s. 148–151.

---

## Princip: tre skikt, aldrig sammanblandade

1. **Erkänd kärna (core)** — teofora/kultiska led som onomastiken redan accepterar.
   Detta är signalen ett test ska kunna hitta. Hög sakral-konfidens.
2. **Utvidgad hypotes (extended)** — Agnetas ordlista + omtvistade topografiled.
   Attribueras Agneta. Contested = true. Låg/ingen sakral prior tills granskad.
3. **Kontroll / baslinje (control)** — vanliga bebyggelse-/djurord. INTE signal.
   Bakgrunden man mäter mot. `is_control = true`.

Kärntestet (som granskaren efterlyste): **samvarierar Agnetas utvidgade set med den
erkända kärnan, mer än kontrollskiktet gör, givet -inge/-hem-korpusen som bakgrund?**
Det går bara att svara på om skikten hålls isär.

Kolumner: `pattern` · `boundary` (prefix/suffix/independent/substring) ·
`sacral_conf` (none/low/med/high) · `is_control` · `noise_risk` · kommentar.

---

## Skikt 1 — Erkänd kärna (redan inkodad)

| Led | pattern | boundary | sacral_conf | kommentar |
|---|---|---|---|---|
| vi (-vi/vé) | vi, ve | suffix | high | Odensvi, Ullevi, Frösvi. Den starkaste kultmarkören. |
| Tor | tor, tors, thor | prefix | high | exkl. torp/torg/torn/torsk. |
| Oden | oden, odin | prefix | high | |
| Frö/Frey | fro, fros, frey | prefix | high | exkl. frost/from. Frösö, Fröslunda, Frövi. |
| Ull | ull, ulle | prefix | high | Ullevi, Ulleråker. |
| Njärd/Njord | njard, nard | prefix | high | |
| Härn | harn | prefix | high | exkl. harnosand. Härnevi. |
| harg/hörg | harg, horg | independent | high | Offeraltare (SAOB). |
| hov | hov | independent | med | Kulthall *hof* — men även "gård". |
| lund | lund, lunda | suffix | low* | *sakralt BARA med teofor bestämning (Fröslunda). Annars profant (Erikslund). |

---

## Skikt 2 — Agnetas utvidgade hypotes (attribueras Agneta N.; contested)

Agnetas egen ordlista (s. 150–151). Jag har lagt till en ärlig noise-bedömning: många
av orden är korta och vanliga och kommer att ge stora mängder falska träffar utan
strikta boundary-regler och exkluderingar. `sacral_conf` här = Agnetas *påstådda* prior,
INTE en accepterad; behåll `contested = true` genomgående.

| Led (Agnetas tolkning) | pattern | boundary | Agnetas sacral_conf | noise_risk | min kommentar |
|---|---|---|---|---|---|
| Val/vala "hon som beskyddar" | vala, val | independent | (hypotes) med | **hög** | Kärnan i Agnetas tes. MÅSTE hållas isär från vall (vǫllr, profant) och vi. Se Vala-fallet nedan. |
| Stav/Staf "valans stav" | stav, staf | prefix | låg | med | Redan i extended. |
| Horn "heliga hornet" | horn | independent | låg | med | Topografiskt horn/udde dominerar. |
| Gala/Ropa/Hula | gala | prefix | låg | **hög** | "gala" träffar Galar/Galtabäck m.m. Kräver hård exkl. |
| Vang/Wång "heliga vagnen" | vang, vong | substring | låg | med | Onomastiskt = inhägnad äng. "Vagn"-tolkning obelagd. |
| Löt/Kärra/Eker | lot, kärra, eker | independent | låg | **hög** | Eker/Löt vanliga; svag koppling. |
| Rå "hon som råder" | ra | prefix | ingen | **mkt hög** | "ra" träffar allt (Ramlösa, Rasbo…). Avråder utan lexikon. |
| Hammar "ting/område" | hammar | substring | ingen | med | Bergklack — redan kontroll-nära. |
| Hov | hov | independent | med | med | Se kärna. |
| Lund/Tuna/Ahl | lund, tuna, al | suffix | low* | med | Tuna = omdebatterad centralplats; jag har den som kontroll. |
| Harg/Horg | harg | independent | high | låg | Se kärna. |
| Ed "eder svurits" | ed | independent | ingen | med | Onomastiskt = näs/drag. Ed-som-edsplats obelagt. |
| Häst/Ross/Jor "heliga hästen" | hors, ross, jor | prefix | låg | med | Agnetas "heliga häst"-tema. |
| Sal/Sala "sadeln/tronen" | sal, sala | independent | med | med | Onomastiskt hall/sal. "Sadel"-tolkning obelagd. |
| Stall "altarbeläte" | stall | independent | ingen | med | Onomastiskt djurstall. Svag. |
| Katt "Frejas djur" | katt | prefix | låg | **mkt hög** | Kattegatt, Kattarp… Nästan bara djur/person. |
| Lussi/Lusse | luss, lusse | prefix | låg | **hög** | Sen folktradition; anakronistisk för vikingatid. |
| Mor/mora | mor, mora | prefix | ingen | **mkt hög** | Mora, Moralund, Morby… överallt. |
| Hunn "hon" | hunn | prefix | ingen | **hög** | Hunneberg m.m. Svag. |
| Fager | fager | prefix | ingen | med | Beskrivande. |
| Van "vanerna" | van | prefix | låg | **mkt hög** | Vansbro, Vänersborg… överallt. |
| Sunna "solen" | sunn | prefix | låg | **hög** | Sunne, Sunnersta… "söder" dominerar. |
| Falk | falk | prefix | ingen | med | Beskrivande/person. |
| Galt "heligt djur" | galt | prefix | låg | med | Ofta galtformat skär (topografi). Redan i extended. |
| Trehörn/Tri/Tre | tre, tri | prefix | ingen | **mkt hög** | "tre" träffar allt. Avråder. |
| Oden | oden | prefix | high | låg | Se kärna. |
| Skade | skade, ska | prefix | låg | **hög** | Skara, Skövde… |
| Ull | ull | prefix | high | låg | Se kärna. |
| Frös (med s) | fros | prefix | high | låg | Se kärna (Frö). |
| Var "gudinna för eder" | var | prefix | låg | **mkt hög** | Varberg, Vara… överallt. |
| Hel "döden" | hel | prefix | låg | **hög** | Helsingborg, Hela… |
| God "gudar" | god, gud | prefix | låg | **hög** | Godby, Gudhem (Gudhem faktiskt sakralt), Godegård. Blandat. |
| Ram "björnram/bärsärk" | ram | prefix | ingen | **mkt hög** | Ramlösa, Rambodarna… |
| Ras "hövding" | ras | prefix | ingen | **mkt hög** | Rasbo, Rasta… |

**Rekommendation för skikt 2:** kör INTE de rödmarkerade (noise_risk mkt hög: Rå, Mor,
Van, Var, Trehörn, Ram, Ras, Katt) mot hela korpusen utan ett ledlexikon eller
manuell verifiering per träff — de kommer att producera hundratals falska träffar och
göra ett statistiskt test meningslöst. De defensibla i skikt 2 är Val/vala (om isär
från vall), Sal, Stav, Häst, Galt, God (med Gudhem-verifiering).

---

## Skikt 3 — Kontroll / baslinje (inkodad)

| Led | pattern | boundary | is_control | kommentar |
|---|---|---|---|---|
| -inge | inge, inga | suffix | ja | Äldsta bebyggelsenamn. Bakgrundskorpus. |
| -hem/-um | hem | suffix | ja | |
| -tuna | tuna | suffix | ja | Omdebatterad centralplats → baslinje som kompromiss. |
| -by | by | suffix | ja | |
| -sta/-stad | sta, stad | suffix | ja | |
| -torp | torp | suffix | ja | Oftast medeltida. |
| get | get | prefix | ja | Djurhållning. Mkt låg sakral prior. |
| gås | gas | prefix | ja | Beskrivande. |

---

## Vala-fallet (Agnetas kärnexempel) — vad som är testbart

Agneta hävdar att *Vala* (en beskyddande völva-/gudinnefigur) systematiskt skrevs om
till *Våla* efter att Å/Ä införs (~1400-tal), som en del av en avkristnande/förskönande
stavningsreform (Harrison: reformpaket efter 1251).

**Det som är hederligt att säga:**
- Beläggkedjan hon ger för Östervåla/Våla härad ÄR dokumenterad och testbar:
  Vala/Valir 1296 → Valbohundære 1344 → Valum 1346 → Vuala 1446 → Wala 1488 →
  Östervåla 1600-tal. Att `val`-formen föregår `vål`-formen är en konkret,
  falsifierbar kronologi — och vi HAR fält för det (`earliest_attestation_year`,
  `attested_form`).
- **Testbar delhypotes:** om vi samlar `attested_form` över tid för alla val/vål-namn,
  visar de ett skifte val→vål efter ~1400? Det kan vi mäta utan att ta ställning till
  vad Vala *betydde*.

**Det som INTE är belagt (och inte får kodas som fakta):**
- Att Vala var en gudinna/völva med samhällsmakt.
- Att stavningsändringen var en medveten avkristnande handling.
- Standardonomastiken läser val/vål som vǫllr 'slätt/rishög' — Agneta avfärdar det som
  ologiskt ("döpa ett härad efter en rishög"), vilket är ett retoriskt, inte
  källkritiskt, argument. Frånvaron i SAOB tolkar hon som censur; enklare förklaring är
  att ledet helt enkelt tolkats som vǫllr.

**Rätt hantering:** lägg `vala` som eget extended-led (contested, attribuerat Agneta),
skilt från `vall` och `vi`. Kör den val→vål-kronologiska analysen som ett separat,
konkret test. Låt utfallet tala.

---

## Nästa steg

1. Agneta kommenterar tabellen rad för rad (särskilt vilka skikt-2-led som ska med).
2. Omtaggning av `place_names.element_keys` med den godkända matchern (visa före/efter:
   hur många -lund tappar sakral-status, kontrollgruppens storlek).
3. val→vål-kronologin som eget test på `attested_form`.
4. Först därefter ev. kluster-/samvariationsanalys kärna vs extended vs kontroll.
