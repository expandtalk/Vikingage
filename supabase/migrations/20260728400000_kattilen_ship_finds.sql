-- Kättilens/Slottsfjärdens fartygsfynd (utgrävning 1932–34, Harald Åkerlund, "Fartygsfynden i den
-- forna hamnen i Kalmar" 1951 — standardverk). ~20 medeltida fartyg. Kopplas till Kättilen (hamnen).
-- Två fartygslämningar med VERIFIERAD RAÄ-koordinat (K-samsök L1955:3155/3088, exakt) + en aggregatpost
-- för korpusen inkl. Kalmarbåten (Båt I, mitten 1200-tal, byrding-typ, bäst bevarad, KLM). Aggregatets
-- koord = Slottsfjärdens mitt (approx). Inga påhittade enskilda vraklägen.
begin;
insert into public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri, register_system, register_id)
select v.typ, v.namn, 'Småland', 'Kalmar', 'Kalmar', v.lat, v.lng, v.period, v.descr, v.uri, v.regsys, v.regid
from (values
  ('fartygslämning','Fartygslämning i Kättilen (RAÄ L1955:3155)', 56.660030, 16.356885, 'medeltid',
     'Fartygslämning i det forna Kättilen (Slottsfjärden), framgrävd vid torrläggningen 1932–34. Del av det ~20 fartyg stora fyndmaterialet som Harald Åkerlund publicerade i "Fartygsfynden i den forna hamnen i Kalmar" (1951). Exakt RAÄ-koordinat.',
     'https://app.raa.se/open/fornsok/lamning/3dafba41-d4de-4908-8d13-4978edc83641','RAÄ','L1955:3155'),
  ('fartygslämning','Fartygslämning i Kättilen (RAÄ L1955:3088)', 56.661365, 16.357172, 'medeltid',
     'Fartygslämning i det forna Kättilen (Slottsfjärden), framgrävd 1932–34. Del av Åkerlunds fartygsfynd-korpus (1951). Exakt RAÄ-koordinat.',
     'https://app.raa.se/open/fornsok/lamning/b74b5530-66d0-4538-b74d-4082ab0791c2','RAÄ','L1955:3088'),
  ('fartygslämning','Kättilens fartygsfynd — Kalmarbåten m.fl. (~20 fartyg, 1932–34)', 56.660700, 16.357000, 'medeltid',
     'Vid torrläggning och utgrävning av Slottsfjärden (forna hamnen Kättilen) 1932–34 påträffades ett ~20 fartyg stort material, medeltida och yngre. Harald Åkerlund ledde arbetet och publicerade "Fartygsfynden i den forna hamnen i Kalmar" (1951), ett standardverk inom svensk marinarkeologi. Främst är KALMARBÅTEN (Båt I) — äldst och bäst bevarad, daterad till mitten av 1200-talet, sannolikt en liten kustfarare av byrding-typ (Kalmar läns museum). AGGREGERAD punkt vid Slottsfjärdens mitt — de enskilda vraklägen är ej separat koordinatsatta här (två har exakt RAÄ-koord, se L1955:3155/3088).',
     'https://sv.wikipedia.org/wiki/Kalmarbåten', null, null)
) as v(typ, namn, lat, lng, period, descr, uri, regsys, regid)
where not exists (select 1 from public.heritage_sites h where h.name = v.namn);
commit;
