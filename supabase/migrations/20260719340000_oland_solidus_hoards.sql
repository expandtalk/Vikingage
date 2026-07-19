-- Öländska solidusskatter (2026-07-19)
-- Tre folkvandringstida guldskatter (solidi) från Öland, ur Svante Fischers
-- peer-reviewade forskning (LEO-projektet / Stockholm Studies in Late Roman and
-- Early Byzantine Solidus Coinage). category='hoard'.
--
-- APPLICERA INTE automatiskt — ska granskas först. Idempotent (WHERE NOT EXISTS på name).
-- Kör i SQL-editorn efter granskning, sedan ev.:
--   supabase migration repair --status applied 20260719340000
--
-- ────────────────────────────────────────────────────────────────────────────
-- KÄLLKRITIK
-- En AI-genererad bloggartikel (presidentofgalaxy.com) har INTE använts som källa.
-- Samtliga siffror nedan är verifierade mot Fischers egna publikationer och är
-- märkta per skatt (VERIFIERAT / OVERIFIERAT).
--
-- KÄLLOR:
--  [F2011] Fischer, S., López Sánchez, F. & Victor, H. 2011. "The 5th Century
--          Hoard of Theodosian Solidi from Stora Brunneby, Öland, Sweden.
--          A Result from the LEO Project." Fornvännen 106, s. 189–204.
--  [FLeo]  Fischer, S. "The Accession of Leo Perpetuus in February 457.
--          A Newly Reported Addition to the Åby Solidus Hoard from Sandby Parish,
--          Öland." Stockholm Studies in Late Roman and Early Byzantine Solidus
--          Coinage, Occasional papers 3.
--  [FSmål] Fischer, S. 2023. "The Late Roman and Early Byzantine Solidi of
--          Småland." Stockholm Studies in Late Roman and Early Byzantine Solidus
--          Coinage, Occasional papers 1. (behandlar även Ölands die-länkar)
--  [FUdov] Fischer, S. 2008. "The Udovice Solidus Pendants – Late 5th Century
--          Evidence of South Scandinavian Mercenaries in the Balkans."
--          Fornvännen 103.
--
-- VERIFIERAT PER SKATT:
--  • Stora Brunneby [F2011]: 17 solidi; tpq 451; Theodosianska dynastin, från
--    Theodosius I (Milano 394–95) till Marcianus (451); medelvikt 4,452 g, högre
--    än det skandinaviska snittet 4,403 g ("ovanligt tunga"); Stenåsa socken.
--  • Åby [FLeo]: 80 solidi (SHM 23664 — tidigare 79, +1 nyrapporterad); tpq 477;
--    spann från Arcadius (Ravenna ca 402–408) till Romulus Augustus (Milano 476);
--    22 konstantinopolitanska (östromerska) präglingar för Leo I 462–466, plus
--    1 från 468–473; Sandby socken.
--  • Björnhovda [FSmål]: 36 solidi; tpq 476; Torslunda socken (västra Öland);
--    die-länkarnas apex under Libius Severus (461–465); typ RIC X 2718 för Libius
--    Severus är die-identisk och förekommer endast i Italien, Skandinavien och
--    Vedrin-skatten (Belgien); första vågen solidi når västra Öland ca AD 465.
--  • Öland totalt: minst 365 kända solidi (Fischer, per 2016 och 2023).
--
-- OVERIFIERAT / OSÄKERT (medtas EJ som fakta):
--  • Bloggens "~350–365 totalt": endast siffran 365 (minimum) kunde beläggas;
--    den nedre gränsen 350 saknar källa och utelämnas.
--  • Bloggens "~79 mynt" för Åby: aktuellt antal är 80 [FLeo]; 79 var det tidigare
--    antalet före den nyrapporterade tillägget. Beskrivs som 80 (tidigare 79).
--  • Bloggens koppling av Åby till "ostrogotiska tributer": de östromerska Leo I-
--    solidi 462–466 är verifierade, men den SPECIFIKA attributionen till
--    ostrogotisk tribut kunde inte beläggas ur en publicerad Fischer-källa och
--    påstås därför INTE som fakta nedan (formuleras som östromerska betalningar).
--  • foederati-/hemvändande veteran-tolkningen är Fischers, men OMDISKUTERAD —
--    märkt så i significance.
--
-- KOORDINATER: ungefärliga (socken-/bynivå), point(lng, lat) enligt tabellens
-- konvention. Fyndplatserna anges medvetet oprecist i litteraturen; punkterna
-- är approximativa och ska inte tolkas som exakta nedläggningspunkter.
-- ────────────────────────────────────────────────────────────────────────────

begin;

insert into public.coins (name, name_en, category, issuer, issuer_king_id, mint, metal, denomination, period_start, period_end, obverse, reverse, find_place, coordinates, significance, description, description_en, sources)
select
  v.name, v.name_en, v.category, v.issuer, v.issuer_king_id, v.mint, v.metal, v.denomination,
  v.period_start, v.period_end, v.obverse, v.reverse, v.find_place, v.coordinates, v.significance,
  v.description    || ' — Obs: texten är inte faktagranskad mot fulltext utan utgår från Svante Fischers publikationer (se Källa).',
  v.description_en || ' — Note: this text has not been fact-checked against the full text; it is based on Svante Fischer''s publications (see Sources).',
  v.sources
from (values
  (
    'Stora Brunneby-skatten (solidusskatt, Öland)',
    'The Stora Brunneby hoard (solidus hoard, Öland)',
    'hoard',
    'Theodosianska dynastin (Theodosius I–Marcianus)',
    NULL::uuid,
    'Milano, Ravenna, Konstantinopel m.fl.',
    'gold',
    'solidus',
    394, 451,
    NULL, NULL,
    'Stora Brunneby, Stenåsa socken, Öland',
    point(16.60, 56.53),
    'Ölands tidigaste större solidusskatt; tolkas som en tidig direktutbetalning till hemvändande veteraner (foederati-tolkning — OMDISKUTERAD).',
    '17 solidi med terminus post quem 451. Alla präglade för kejsare i den theodosianska dynastin, från Theodosius I (Milano 394–95) till Marcianus (451). Medelvikten 4,452 g är högre än det skandinaviska snittet 4,403 g — ovanligt tunga mynt. En av Ölands tidigaste större solidusskatter, publicerad inom LEO-projektet. [Antal, tpq, dynasti och vikt: Fischer, López Sánchez & Victor 2011, Fornvännen 106.]',
    '17 solidi with a terminus post quem of 451. All struck for emperors of the Theodosian dynasty, from Theodosius I (Milan 394–95) to Marcian (451). The average weight of 4.452 g exceeds the Scandinavian average of 4.403 g — unusually heavy coins. One of Öland''s earliest larger solidus hoards, published within the LEO Project. [Count, tpq, dynasty and weight: Fischer, López Sánchez & Victor 2011, Fornvännen 106.]',
    'Fischer, López Sánchez & Victor 2011, "The 5th Century Hoard of Theodosian Solidi from Stora Brunneby, Öland, Sweden. A Result from the LEO Project", Fornvännen 106, s. 189–204.'
  ),
  (
    'Åbyskatten (solidusskatt, Sandby, Öland)',
    'The Åby hoard (solidus hoard, Sandby, Öland)',
    'hoard',
    'Flera kejsare (Arcadius–Romulus Augustus); apex Leo I',
    NULL::uuid,
    'Konstantinopel, Ravenna, Milano m.fl.',
    'gold',
    'solidus',
    402, 476,
    NULL, NULL,
    'Åby, Sandby socken, Öland',
    point(16.63, 56.62),
    'Ölands största solidusskatt och Nordens tätaste solidusmiljö (ca 4,5 km från Sandby borg). Östromersk tyngdpunkt tolkas inom foederati-/veteranperspektivet (OMDISKUTERAD).',
    '80 solidi (SHM 23664), funna på 1940-talet i Sandby socken, Öland; terminus post quem 477. Spänner från en tidig Ravenna-prägling för Arcadius (ca 402–408) till en Milano-prägling för Romulus Augustus (476). Så många som 22 är östromerska (konstantinopolitanska) präglingar för Leo I 462–466 (RIC X 605), plus en från 468–473. Navet i stampkedjor Öland–Gotland–Bornholm–Italien. Importen upphör abrupt ~480, samtidigt med Sandby borg-massakern. Den östromerska tyngdpunkten kopplas till östromerska betalningar (specifik ostrogotisk tribut är ej belagd i publicerad källa och hävdas ej här). [Antal, tpq, spann och Leo I-andel: Fischer, LEO-projektet / "The Accession of Leo Perpetuus in February 457"; Fagerlie 1967.]',
    '80 solidi (SHM 23664), found in the 1940s in Sandby parish, Öland; terminus post quem 477. Ranges from an early Ravenna issue for Arcadius (c. 402–408) to a Milan issue for Romulus Augustus (476). As many as 22 are Eastern Roman (Constantinopolitan) issues for Leo I, 462–466 (RIC X 605), plus one from 468–473. The hub of die-chains linking Öland–Gotland–Bornholm–Italy. Import ceases abruptly c. 480, coinciding with the Sandby ringfort massacre. The eastern emphasis is linked to Eastern Roman payments (a specific attribution to Ostrogothic tribute is not attested in a published source and is not asserted here). [Count, tpq, range and Leo I share: Fischer, LEO Project / "The Accession of Leo Perpetuus in February 457"; Fagerlie 1967.]',
    'Fischer, "The Accession of Leo Perpetuus in February 457. A Newly Reported Addition to the Åby Solidus Hoard from Sandby Parish, Öland", Stockholm Studies in Late Roman and Early Byzantine Solidus Coinage, Occ. papers 3; Fischer/LEO-projektet; Fagerlie 1967; SHM 23664.'
  ),
  (
    'Björnhovdaskatten (solidusskatt, Torslunda, Öland)',
    'The Björnhovda hoard (solidus hoard, Torslunda, Öland)',
    'hoard',
    'Flera kejsare; die-länkarnas apex under Libius Severus (461–465)',
    NULL::uuid,
    'Italien (Ravenna, Milano, Rom) m.fl.',
    'gold',
    'solidus',
    421, 476,
    NULL, NULL,
    'Björnhovda, Torslunda socken, Öland',
    point(16.48, 56.51),
    'Kärnan i Ölands die-länkade solidusmaterial (koppling västerut mot Italien); tolkas inom foederati-/veteranperspektivet (OMDISKUTERAD).',
    '36 solidi med terminus post quem 476, från västra Öland. Die-länkarnas apex infaller under Libius Severus (461–465): typen RIC X 2718 för Libius Severus är die-identisk och förekommer endast i Italien, Skandinavien och Vedrin-skatten (Belgien), vilket knyter fynden till Italien. Enligt Fischer når den första vågen solidi västra Öland kring Björnhovda ca AD 465. [Antal, tpq, socken och die-länkar: Fischer 2023, "The Late Roman and Early Byzantine Solidi of Småland".]',
    '36 solidi with a terminus post quem of 476, from western Öland. The apex of die-links falls during Libius Severus (461–465): the type RIC X 2718 for Libius Severus is die-identical and occurs only in Italy, Scandinavia and the Vedrin hoard (Belgium), tying the finds to Italy. According to Fischer, the first wave of solidi reaches western Öland around Björnhovda c. AD 465. [Count, tpq, parish and die-links: Fischer 2023, "The Late Roman and Early Byzantine Solidi of Småland".]',
    'Fischer 2023, "The Late Roman and Early Byzantine Solidi of Småland", Stockholm Studies in Late Roman and Early Byzantine Solidus Coinage, Occasional papers 1; jfr Fischer 2008, "The Udovice Solidus Pendants", Fornvännen 103.'
  )
) as v(name, name_en, category, issuer, issuer_king_id, mint, metal, denomination, period_start, period_end, obverse, reverse, find_place, coordinates, significance, description, description_en, sources)
where not exists (select 1 from public.coins c where c.name = v.name);

-- Dedup: en tidigare seed (2026-07-18) skapade en Åby-post under annat namn
-- ('Åby-skatten (solidusskatt)'). Dess unika uppgifter (Sandby borg-massakern,
-- "Nordens tätaste solidusmiljö", Fagerlie 1967) är infogade i posten ovan, så
-- den äldre dubbletten tas bort. Den enskilda "Leo Perpetuus"-solidusen (en
-- enstaka mynt-post, category='roman_solidus') är INTE en dubblett och behålls.
delete from public.coins
where name = 'Åby-skatten (solidusskatt)'
  and category = 'hoard';

commit;
