-- Isväg-lager: skyddad skärgård (Mälaren) = reguljär säsongsled; öppet hav (Gotland/Åland) = UNDANTAG
-- endast stränga isvintrar. Korridorer mellan BELAGDA strandpunkter (ingen fysisk lämning; rekonstruerad
-- säsongsled). Säsong/tröskelvärden i beskrivningen. Applicerad i prod via MCP; repo-spegel. 2026-08-13.
insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'ice_corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(17.5444,59.3347), 1, 'Björkö/Adelsö (södra änden)'),
  (point(17.7234,59.6191), 2, 'Norra Mälaren (Sigtunatrakten)')
) as p(coord, ord, nm)
where r.slug = 'malaren-isvag';

insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'ice_corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(18.2948,57.6348), 1, 'Gotland (västkusten)'),
  (point(16.9,57.8),       2, 'Fastlandet (Smålandskusten)')
) as p(coord, ord, nm)
where r.slug = 'gotland-fastland-isvag';

update public.viking_roads set description =
  'Vinterled över Mälarens is (skyddat vatten). Bärig kärnis normalt januari–mars; tumregel ~10 cm bär gående, ~18–20 cm häst med släde. Skyddade fjärdar frös pålitligt (jfr att isvägar finns i Luleå skärgård än idag) → en reguljär säsongsled är rimlig. Linjen är en schematisk korridor mellan belagda strandpunkter — ingen fysisk lämning finns; sträckningen är en rekonstruerad säsongsled, inte en dokumenterad väg.'
where slug = 'malaren-isvag';

update public.viking_roads set description =
  'Hel isbrygga över öppna Östersjön mellan Gotland och fastlandet (~85 km) bildas ENDAST under stränga isvintrar, inte årligen — detta är ett UNDANTAG, ej en reguljär led. Bärig havsis kräver långvarig sträng kyla (kärnkyla jan–feb). Konkreta år kräver källbeläggning innan de påstås. Linjen är en schematisk korridor mellan strandpunkter, inte en dokumenterad sträckning.'
where slug = 'gotland-fastland-isvag';

insert into public.viking_roads (id, name, name_en, road_type, slug, description, start_coordinates, end_coordinates)
select gen_random_uuid(), 'Åland–Sverige isväg', 'Åland–Sweden ice road', 'vintervag', 'aland-sverige-isvag',
  'Isväg över Ålands hav mellan Eckerö (Åland) och Grisslehamn (Väddö, Sverige), ~45 km öppet hav. Hel bärig is bildas bara under stränga vintrar. BELAGT undantag: i mars 1809 marscherade ryska trupper (Bagrations kår) över Ålands hav mot Grisslehamn under finska kriget. Ej en reguljär led — schematisk korridor mellan belagda hamnar, markerad som extremvinter-överfart.',
  point(19.61667,60.20000), point(18.81639,60.10028)
where not exists (select 1 from public.viking_roads where slug='aland-sverige-isvag');

insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'ice_corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(19.61667,60.20000), 1, 'Eckerö (Åland)'),
  (point(18.81639,60.10028), 2, 'Grisslehamn (Väddö)')
) as p(coord, ord, nm)
where r.slug = 'aland-sverige-isvag';
