-- Kalmarkustens brons-/järnålders- och folkvandringstida fynd. Källa: Kalmar stads historia del 1.
-- KOORDINATDISCIPLIN: röset har exakt Fornsök-koord (K-samsök L1956:2711); metallfyndens koordinat
-- = fyndplatsens ortcentroid ur place_names, MARKERAD APPROXIMATIV (1800-tals-accessioner saknar
-- exakt fyndspots-koord). Ingen fabricerad precision. point(lng,lat).
begin;

-- Bronsåldersröse vid Revsudden (Ryssby sn) — i Kalmar stads historia kallat "Skägges grav".
insert into public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri, register_system, register_id)
select 'röse', 'Röse vid Revsudden ("Skägges grav")', 'Småland', 'Kalmar', 'Ryssby', 56.772499, 16.476562,
  'bronsålder',
  'Bronsåldersröse på Revsudden (Skäggenäs). I Kalmar stads historia del 1 benämnt "Skägges grav". Läge = RAÄ-lämning L1956:2711 (exakt Fornsök-koordinat).',
  'https://app.raa.se/open/fornsok/lamning/b8eb84c0-c1aa-4cd2-9fd4-b184623cf0e3', 'RAÄ', 'L1956:2711'
where not exists (select 1 from public.heritage_sites where name = 'Röse vid Revsudden ("Skägges grav")');

-- Metallfynd → coins (plattformens fynd-/ädelmetalltabell). Koord approximativ (ortcentroid).
insert into public.coins (name, category, metal, denomination, period_start, period_end, find_place, coordinates, significance, description, sources)
select v.name, v.cat, v.metal, v.denom, v.ps, v.pe, v.fp, point(v.lng, v.lat), v.sig, v.descr,
  'Kalmar stads historia del 1'
from (values
  ('Guldarmringar, Harby (Ljungby sn)', 'guldfynd', 'guld', null, null::int, null::int,
     'Harby, Ljungby sn (approx, ortcentroid)', 16.1421, 56.6853,
     'Guldarmringar', 'Guldarmringar från Harby i Ljungå (Ljungby sn). Koordinat = ortcentroid, approximativ fyndplats.'),
  ('Ihålig guldarmring m. volutupprullade ändar, Fredrikslund (Voxtorp sn)', 'guldfynd', 'guld', null, null, null,
     'Fredrikslund, Voxtorp sn (approx)', 16.1560, 56.5197,
     'Ihålig guldarmring med volutupprullade ändar', 'Ihålig guldarmring med volutupprullade ändar, Fredrikslund i Voxtorp. Koordinat approximativ (ortcentroid).'),
  ('Guldhalsring, Hjärpestadsdepån (SHM 9260)', 'depåfynd', 'guld', null, null, null,
     'Hjärpestad (approx); SHM 9260', 16.7983, 56.9022,
     'Halsring av guld, depåfynd', 'Guldhalsring ur Hjärpestadsdepån, SHM 9260. Koordinat approximativ (ortcentroid).'),
  ('Guldring, Fredrikslund (SHM 11168, Oldeberg 1815)', 'guldfynd', 'guld', null, -900, -700,
     'Fredrikslund, Voxtorp sn (approx); SHM 11168', 16.1560, 56.5197,
     'Guldring, bronsålder period V', 'Guldring från Fredrikslund, SHM 11168, Oldeberg nr 1815. Daterad bronsålder period V (~900–700 f.Kr). Koordinat approximativ.'),
  ('Ormhuvudring av guld, Grisbäck (Söderåkra)', 'guldfynd', 'guld', null, 200, 300,
     'Grisbäck vid Torsåns mynning, Söderåkra sn (approx)', 16.0612, 56.3371,
     'Ormhuvudring av guld, romersk järnålder', 'Ormhuvudring av guld från Grisbäck vid Torsåns mynning, 200–300-tal e.Kr. Koordinat approximativ (ortcentroid).'),
  ('Nordisk guldmedaljong (brakteat), Äspelund/Skäggenäs (SHM 4327)', 'brakteat', 'guld', null, 400, 550,
     'Äspelund, Skäggenäs, Ryssby sn (approx); SHM 4327', 16.4556, 56.7869,
     'Nordisk guldmedaljong/brakteat, folkvandringstid', 'Nordisk guldmedaljong (brakteat) funnen vid Äspelund på Skäggenäs, SHM 4327. Folkvandringstid. Koordinat approximativ (ortcentroid).'),
  ('Romerska silverdenarer, Varvsholmen i Kalmar (1918)', 'romerskt mynt', 'silver', 'denar', 100, 250,
     'Varvsholmen, Kalmar (approx)', 16.38, 56.67,
     'Romerska silverdenarer', 'Romerska silvermynt (denarer) funna på Varvsholmen i Kalmar 1918. Koordinat approximativ (öcentroid).'),
  ('Eldslagningsstenar, Kalmar-området (~50 lösfynd)', 'redskap', 'kvartsit', null, null, null,
     'Kalmar-området — ~50 lösfynd, aggregerad punkt (ej enskilt lägesbestämda)', 16.36, 56.66,
     'Spetsovala kvartsit-eldslagningsstenar', 'Spetsovala kvartsitstenar för eldslagning, avsedda att bäras i bältet med remskåran synlig. Ett 50-tal kända som lösfynd från Kalmar. Dokumenterade i rika kammargravar, t.ex. Tibble i Litslena (Uppland) och Sætrang (Norge). AGGREGERAD punkt vid Kalmar — de enskilda fynden är ej lägesbestämda.')
) as v(name, cat, metal, denom, ps, pe, fp, lng, lat, sig, descr)
where not exists (select 1 from public.coins co where co.name = v.name);

commit;
