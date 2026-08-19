-- art_habitatpref — källbaserade HABITAT-preferenser per matsvamp (var arten KAN växa; INTE fyndplatser).
-- Källa: Ryman & Holmåsen "Svampar" + Artdatabanken/Artfakta (mykorrhizavärd / substrat / marktyp).
-- variabel='tradslag_dom' (trädslag: gran/tall/bjork/ek/bok/hassel) | 'mark' (mossig/fuktig/kalkrik/
-- sandig/oppen/bryn/aldre_tall). vikt = relativ styrka 0–1. Detta är kunskapslagret som svamp.hex_habitat
-- beräknas mot när hex9 fyllts med NMD-marktäcke + DEM (kommande dataspår). Applicerad via
-- scripts/data (idempotent). Se [[svamp-images-and-map-buildout]] och habitat-digesten.
insert into svamp.art_habitatpref (art_id, variabel, varde, vikt) values
 ('kantarell','tradslag_dom','gran',0.9),('kantarell','tradslag_dom','tall',0.8),('kantarell','tradslag_dom','bjork',0.7),('kantarell','tradslag_dom','ek',0.6),('kantarell','mark','mossig',0.6),
 ('karljohan','tradslag_dom','gran',0.9),('karljohan','tradslag_dom','tall',0.85),('karljohan','tradslag_dom','bjork',0.7),('karljohan','tradslag_dom','ek',0.6),
 ('trattkantarell','tradslag_dom','gran',0.9),('trattkantarell','tradslag_dom','tall',0.6),('trattkantarell','mark','fuktig',0.7),('trattkantarell','mark','mossig',0.6),
 ('svart_trumpetsvamp','tradslag_dom','ek',0.9),('svart_trumpetsvamp','tradslag_dom','bok',0.85),('svart_trumpetsvamp','tradslag_dom','hassel',0.6),('svart_trumpetsvamp','mark','kalkrik',0.8),
 ('rodgul_trumpetsvamp','tradslag_dom','tall',0.8),('rodgul_trumpetsvamp','tradslag_dom','gran',0.6),('rodgul_trumpetsvamp','mark','fuktig',0.7),
 ('blek_taggsvamp','tradslag_dom','gran',0.7),('blek_taggsvamp','tradslag_dom','tall',0.7),('blek_taggsvamp','tradslag_dom','ek',0.6),('blek_taggsvamp','tradslag_dom','bjork',0.6),
 ('farticka','tradslag_dom','gran',0.9),('farticka','tradslag_dom','tall',0.6),
 ('blomkalssvamp','tradslag_dom','tall',0.95),('blomkalssvamp','mark','aldre_tall',0.7),
 ('granblodriska','tradslag_dom','gran',0.95),
 ('sandsopp','tradslag_dom','tall',0.9),('sandsopp','mark','sandig',0.7),
 ('stolt_fjallskivling','mark','oppen',0.85),('stolt_fjallskivling','mark','bryn',0.7)
on conflict (art_id, variabel, varde) do update set vikt = excluded.vikt;
-- brunsopp har uuid-id → seedas via script (ingår i art_habitatpref, ej hårdkodat uuid här).
