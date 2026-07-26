-- Skeppsgravslager (thread A): kurerade, VERIFIERADE skeppsgravar/båtgravfält i Norden.
-- Koordinater från Wikidata (uppslagna via entitetssök, ej gissade) utom Gokstad (etablerat
-- läge, redan i archaeological_sites via Gokstadmannen). Gjellestad + Vendel UTELÄMNADE —
-- saknar koordinat i Wikidata, läggs ej till förrän verifierad källa finns (ingen mock).
-- heritage_sites saknar country-kolumn → modern region i municipality (med land) för lokalisering.
-- raa_type='skeppsgrav'. geom är GENERERAD (sätt ej).
INSERT INTO public.heritage_sites (raa_type, name, landscape, municipality, lat, lng, period, description)
SELECT * FROM (VALUES
  ('skeppsgrav','Gokstadhögen','Vestfold','Sandefjord (Norge)',59.0885,10.2246,'vikingatid (ca 900)',
   'Monumental skeppsgrav. Gokstadskeppet (dendro ~890), en kraftig man i gravkammaren (se Gokstadmannen). En av tre norska vikingaskeppsgravar.'),
  ('skeppsgrav','Oseberghögen','Vestfold','Tønsberg (Norge)',59.3097,10.4530,'vikingatid (834)',
   'Monumental skeppsgrav, Osebergsskeppet. Två kvinnor, rikast bevarade gravgåvorna från nordisk vikingatid. Dendro 834.'),
  ('skeppsgrav','Tunehögen (Haugen, Rolvsøy)','Østfold','Fredrikstad (Norge)',59.2792,11.0028,'vikingatid (ca 900)',
   'Tuneskeppet — den tredje av de norska vikingaskeppsgravarna (grävd 1867). Rolvsøy.'),
  ('skeppsgrav','Ladbyskeppet','Fyn','Kerteminde (Danmark)',55.4454,10.6152,'vikingatid (ca 925)',
   'Danmarks enda bevarade skeppsgrav — 22 m skepp med hövding, hästar och hundar. In situ i Vikingemuseet Ladby.'),
  ('skeppsgrav','Borrehögarna','Vestfold','Horten (Norge)',59.3823,10.4711,'vendel–vikingatid',
   'Nordens största samling monumentala gravhögar; minst en skeppsgrav. Kopplas till en tidig kungaätt (Ynglingaätten enl. tradition).'),
  ('skeppsgrav','Valsgärde båtgravfält','Uppland','Uppsala (Sverige)',59.9261,17.6264,'vendel–vikingatid',
   'Båtgravfält med ~15 obrända båtgravar (vendeltid–vikingatid), jämte Vendel. Aristokratiska vapengravar.')
) AS v(raa_type,name,landscape,municipality,lat,lng,period,description)
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name=v.name AND h.raa_type='skeppsgrav');
