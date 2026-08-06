-- Koordinat-backfill för medieval_castles från Wikidata P625 (auto-hämtat). coord_status='wikidata'
-- (skild från Fornsök-'verified'). "Skaraborg" EXKLUDERAD — label-krock gav fel entitet (Dalarna
-- i st.f. Västergötland); lämnas pending. 8 utan Wikidata-labelmatch förblir pending.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
UPDATE public.medieval_castles m
SET lat = v.lat, lng = v.lng, coord_status = 'wikidata'
FROM (VALUES
  ('Kexholm',61.03928,30.12907),('Åbo slott',60.4352823,22.2276388),('Landskrona citadell',55.873055555,12.8225),
  ('Olofsborg',61.8637134,28.9012379),('Älvsborg',57.69,11.90694444),('Kronobergs slott',56.9417293,14.7947217),
  ('Kalmar slott',56.65805556,16.35527778),('Gävle slott',60.67222222,17.14416667),('Gripsholms slott',59.256111,17.219167),
  ('Näs slott',57.998055555,14.291111111),('Alsnö hus',59.36055556,17.535),('Dalaborg',58.60333333,12.60555556),
  ('Varbergs fästning',57.1043,12.241566666),('Tavastehus slott',61.0035132,24.4598186),('Raseborgs slott',59.991666666,23.651111111),
  ('Sveaborg',60.143611111,24.984444444),('Bohus fästning',57.861944444,11.999444444),('Uppsala slott',59.85359,17.63543),
  ('Borgholms slott',56.870555555,16.643333333),('Kastelholms slott',60.2329039,20.0806612),('Vadstena slott',58.44597222,14.88361111),
  ('Qvidja',60.296666666,22.4),('Nyköpingshus',58.74847222,17.01166667),('Johannisborg',58.600055,16.195573),
  ('Västerås slott',59.60638889,16.54444444),('Viborgs slott',60.715833333,28.728888888),('Kajaneborg',64.229143,27.732859),
  ('Örebro slott',59.273888888,15.215277777),('Sölvesborgs slott',56.0558,14.5939),('Braheslott',61.49704672,27.27196457),
  ('Kustö biskopsborg',60.40777778,22.47472222),('Sibbesborg',60.292279,25.319489),('Korsholms slott',63.06944444,21.72111111),
  ('Uleåborgs slott',65.01722222,25.46722222),('Haga borg',60.877677,24.587389),('Linköpings slott',58.41055556,15.61583333),
  ('Borganäs',60.49689,15.45062),('Gälakvist',58.382356,13.441594),('Junkarsborg',60.153344,23.786004)
) AS v(name,lat,lng)
WHERE m.name = v.name AND m.lat IS NULL;
