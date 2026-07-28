-- Berika Sm 144 (Gursten/Gamleby, Gode-Skägge) + Sm 147 (Västra Ed, Jarger) ur Länsstyrelsen
-- Kalmar läns informationstexter + inskrifterna själva. Ref: Veronica Palm, "Runstenar i Tjust",
-- i Västerviks historia: förhistoria och arkeologi (2015). Ingen påhittad text; ristare/runtyp
-- kommer ur inskriften resp. Länsstyrelsens beskrivning. Koordinater rörs EJ (rundata high).

update public.runic_inscriptions set
  period_start = 850,
  period_end = 900,
  rune_variant = 'kortkvistrunor',
  carver = 'Guðaskeggi (Gode-Skägge)',
  carver_attribution = 'signerad: "kuþaskaki faþi" (Gode-Skägge ristade)',
  current_location = 'Gamleby folkhögskola, trädgården (flyttad flera gånger; ursprungligen Gursten säteri, Lofta sn)',
  historical_context = 'Arvs-/rättsprotokoll där smidda föremål byter ägare — ovanligt innehåll på runstenar. En av Sveriges tidigaste runstenar (kortkvistrunor, sent 800-tal). Kring Dynestadsviken (Gamleby–Gursten) fanns en livaktig vikingatida bygd med minst en hamn i viken; vid Stäket en pålspärr (kontroll av vattenleden, även bro över sundet).',
  scholarly_notes = 'Flera läsordningar ger olika tolkningar. Senaste (Länsstyrelsen Kalmar): "Sunr naut smiða Kåta, Véfríðar sunar. Guða-Skeggi fáði." — Sonen fick (nytta av) Kåtes smiden; hustrun förunnade senare. Ref: Veronica Palm, "Runstenar i Tjust" (Västerviks historia 2015).'
 where signum = 'Sm 144';

update public.runic_inscriptions set
  dating_text = '1000–1050 e.Kr.',
  period_start = 1000,
  period_end = 1050,
  dating_tpq = 1000,
  dating_taq = 1050,
  current_location = 'Västra Eds kyrkoruin',
  historical_context = 'Står vid Västra Eds kyrkoruin. Sägs ha använts som tröskel i kyrkans vapenhus — del av runslingan är skadad/borta. Ursprunglig plats oklar; möjligen längs den gamla vägen Västra Ed–Hälleberg–Vråka (flera gravfält och runstensplatser).',
  scholarly_notes = 'Datering via kantslingans avslutande ormhuvud i fågelperspektiv → 1000–1050 e.Kr. (Länsstyrelsen Kalmar). Ordet uniþikr (oniding) = generös/frikostig/duktig; förekommer på flera runstenar i Småland och Östergötland, både som beskrivning och som namn. Ref: Palm 2015.'
 where signum = 'Sm 147';
