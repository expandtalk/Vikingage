-- Kurerad utökning av viking_names. Väl belagda vikingatida personnamn som
-- saknades (belägg = "-markerade namntoken i runinskrifternas normalisering,
-- Evighetsrunor). Formerna är moderniserade (samma stil som befintliga rader),
-- INTE råa böjda/trunkerade former. Religiösa termer (Guð, Kristr, Maria) och
-- artefakter uteslutna. Idempotent: hoppar över namn som redan finns (case-insensitivt).
insert into public.viking_names (name, gender, meaning, etymology, historical_info, frequency, regions)
select v.name, v.gender, v.meaning, v.etymology, v.historical_info, v.frequency, v.regions
from (values
  ('Ingvar','male','Ings krigare','Yngvi (guden Ing) + arr = krigare','Ingvar den vittfarne — Ingvarstågets ledare österut ca 1041; ~26 runstenar',26,array['Uppland','Södermanland']),
  ('Tore','male','helgad åt Tor','Þórir: Þórr (Tor) + arr/vér = krigare',null,30,array['Uppland','Södermanland']),
  ('Ketil','male','offerkittel, bildligt hjälm','Ketill = kittel',null,14,array['Uppland','Danmark']),
  ('Gudmund','male','gudomligt skydd','guð = gud + mundr = skydd/hand',null,15,array['Uppland']),
  ('Inga','female','vigd åt guden Ing','kortform av Ing-namn (Yngvi/Frö)',null,20,array['Uppland']),
  ('Gudlög','female','vigd åt gud','guð = gud + laug = vigd/löfte',null,18,array['Uppland']),
  ('Holmfast','male','fast som en holme','holmr = holme + fastr = fast',null,14,array['Uppland','Södermanland']),
  ('Holmger','male','holmens spjut','holmr = holme + geirr = spjut',null,14,array['Uppland']),
  ('Sigvid','male','segerkämpe','sigr = seger + viðr = kämpe/träd',null,16,array['Uppland']),
  ('Gisle','male','telning, pil','gísl = telning/gisslan',null,16,array['Uppland','Norge']),
  ('Sibbe','male','frände','kortform till sifjar = släkt',null,16,array['Uppland']),
  ('Balle','male','den djärve','ballr = djärv/farlig',null,25,array['Södermanland']),
  ('Fulluge','male','full av mod','fullr = full + hugr = mod/sinne',null,15,array['Uppland']),
  ('Torgils','male','Tors pil','Þórr = Tor + gísl = pil/gisslan',null,14,array['Uppland','Gotland']),
  ('Torgöt','male','Tor-göten','Þórr = Tor + gautr = göte/man',null,13,array['Östergötland','Västergötland']),
  ('Frösten','male','Frejs sten','Freyr = Frej + steinn = sten',null,12,array['Uppland']),
  ('Ingefast','male','fast vigd åt Ing','Yngvi/Ing + fastr = fast',null,13,array['Uppland']),
  ('Vibjörn','male','helgedomens björn','vé = helig plats + bjǫrn = björn',null,9,array['Uppland']),
  ('Sigfast','male','fast i seger','sigr = seger + fastr = fast',null,10,array['Uppland']),
  ('Vigmund','male','stridsskydd','víg = strid + mundr = skydd',null,9,array['Uppland']),
  ('Gunnvid','male','stridskämpe','gunnr = strid + viðr = kämpe',null,8,array['Uppland']),
  ('Fastulv','male','fast som ulven','fastr = fast + ulfr = ulv',null,8,array['Uppland']),
  ('Sigfus','male','ivrig efter seger','sigr = seger + fúss = ivrig',null,8,array['Uppland','Island']),
  ('Torfast','male','fast åt Tor','Þórr = Tor + fastr = fast',null,9,array['Uppland']),
  ('Ragnfrid','female','gudamakternas skönhet','regin = gudamakter + fríðr = skön/älskad',null,8,array['Uppland']),
  ('Odd','male','spjutspets','oddr = udd/spets',null,8,array['Norge','Uppland'])
) as v(name, gender, meaning, etymology, historical_info, frequency, regions)
where not exists (
  select 1 from public.viking_names vn where lower(vn.name) = lower(v.name)
);
