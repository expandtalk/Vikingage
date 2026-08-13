-- Berika Enköpingsåsen-korridoren med Dalkarlsåsen-punkten (åsens lokala namn från Heby; koord
-- 60.03111/16.855173 verifierad via Enåkers hembygdsförening/karta 2026-08-13). Applicerad via MCP; repo-spegel.
delete from public.road_waypoints
where road_id = (select id from public.viking_roads where slug='enkopingsasen');

insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(17.07250,59.64028), 1, 'Enköping'),
  (point(16.85611,59.94083), 2, 'Heby'),
  (point(16.855173,60.03111), 3, 'Dalkarlsåsen (Enåker/Huddunge)'),
  (point(16.93194,60.15778), 4, 'Tärnsjö (grenpunkt)')
) as p(coord, ord, nm)
where r.slug = 'enkopingsasen';

update public.viking_roads set description =
  'Enköpingsåsen — stor rullstensås som sträcker sig från söder om Mälaren via Enköping och Heby (varifrån den kallas Dalkarlsåsen) till Tärnsjö, där den delar sig i två grenar: den västra (Österfärneboåsen) via Östahalvön över Dalälven mot Sandviken/Ockelbo, och den östra (Hedesunda-/Valbo-/Gävleåsen) via Hedesunda till Valbo och Gävle. Åsen har i alla tider använts som väg (idag följer riksväg 56 samt länsväg 254/272 den). Linjen är en SCHEMATISK korridor genom belagda orter (Wikipedia/hembygd-koordinater) — inte den exakta geologiska åslinjen (SGU). Källa: Wikipedia, Enåkers hembygdsförening.'
where slug = 'enkopingsasen';
