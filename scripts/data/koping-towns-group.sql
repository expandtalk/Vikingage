-- Köping-gruppen: komplettera viking_cities med de saknade -köping-orterna och
-- tagga dem category='koping' så gruppen blir sökbar/grupperbar i legenden.
-- Mönster (Wildte/centralortsteori): -köping = marknads-/handelsplats vid en
-- vattennod där landväg möter segelbart vatten (åmynning/sjöände), ofta även
-- ting- och (senare) stiftsort. coordinates = native point(lng,lat).

insert into viking_cities (name, coordinates, category, country, region, period_start, period_end, description, historical_significance)
select v.name, point(v.lng, v.lat), 'koping', 'Sweden', v.region, v.ps, v.pe, v.descr, v.sig
from (values
  ('Norrköping', 16.1924, 58.5877, 'Östergötland', 1000, 1350,
   'Marknadsort vid Motala ströms utlopp i Bråviken. Forsarna gav vattenkraft (kvarnar, senare industri) — men var för strida att ro; segelleden mot havet gick i stället söderut via sjökedjan till Söderköping.',
   'Vattenkraftnod och köpstad vid Bråviken.'),
  ('Nyköping', 17.0086, 58.7528, 'Södermanland', 1000, 1350,
   'Köpstad vid Nyköpingsåns mynning; kunglig borg (Nyköpingshus). Marknads- och maktnod vid Östersjökusten.',
   'Kunglig köpstad och borgläge.'),
  ('Jönköping', 14.1618, 57.7826, 'Småland', 1000, 1350,
   'Marknadsort vid Vätterns sydspets (Junebäcken) där sjö- och landvägar möttes; tidig kunglig köpstad (privilegiebrev 1284).',
   'Köpstad vid Vätterns sydände.'),
  ('Lidköping', 13.1577, 58.5052, 'Västergötland', 1000, 1350,
   'Köpstad vid Lidans mynning i Vänern; hamn för Skaraslätten.',
   'Vänerhamn och marknadsort.'),
  ('Enköping', 17.0776, 59.6358, 'Uppland', 1000, 1350,
   'Köpstad vid Enköpingsån nära Mälaren; knutpunkt mellan Mälaren och uppländsk-västmanländsk bygd.',
   'Mälarnära köpstad.'),
  ('Köping', 16.0009, 59.5129, 'Västmanland', 1000, 1350,
   'Köpstad vid Köpingsån mot Mälaren; utskeppningshamn för Bergslagens järn.',
   'Bergslagens järnhamn vid Mälaren.'),
  ('Falköping', 13.5510, 58.1744, 'Västergötland', 1000, 1350,
   'Undantaget: inlandsköping vid Falbygdens vägknut, inte vid segelbart vatten — visar att marknads-/tingfunktionen kunde bära orten även utan hamn.',
   'Inlands-köping vid vägknut (Falbygden).')
) as v(name, lng, lat, region, ps, pe, descr, sig)
where not exists (select 1 from viking_cities vc where vc.name = v.name);

-- Söderköping: berika (Slätbaken-leden, Stegeborg, samt Brask tryckeri 1500-tal)
update viking_cities
   set description = 'Köpstad innerst i Slätbaken vid den vikingatida inre vattenleden (Göta kanals föregångare); inloppet vaktades av Stegeborg. En av rikets viktigaste medeltida handelsstäder; biskop Hans Brask lät inrätta ett av landets första tryckerier här på 1520-talet.',
       category = coalesce(category, 'koping')
 where name = 'Söderköping' and region = 'Östergötland';
