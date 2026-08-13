-- Schematiska korridorer för de två återstående stub-åsarna genom BELAGDA orter (Wikipedia-koord,
-- verifierade 2026-08-13) — ej exakt geologisk åslinje (SGU). kind='corridor', point=(lng,lat).
-- Applicerad i prod via MCP; repo-spegel.
insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(17.07250,59.64028), 1, 'Enköping'),
  (point(16.85611,59.94083), 2, 'Heby'),
  (point(16.93194,60.15778), 3, 'Tärnsjö (grenpunkt)')
) as p(coord, ord, nm)
where r.slug = 'enkopingsasen';

insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(17.87917,59.76361), 1, 'Östuna kyrka'),
  (point(17.918611,59.651944), 2, 'Arlanda'),
  (point(18.06861,59.32944), 3, 'Gamla stan (Brunkebergsåsen)'),
  (point(18.12528,59.14556), 4, 'Jordbro'),
  (point(18.07056,59.11500), 5, 'Västerhaninge')
) as p(coord, ord, nm)
where r.slug = 'stockholmsasen';

update public.viking_roads set description =
  'Enköpingsåsen — stor rullstensås som sträcker sig från söder om Mälaren via Enköping och Heby till Tärnsjö, där den delar sig i två grenar (Österfärneboåsen västerut; den östra grenen fortsätter som Hedesunda-/Valbo-/Gävleåsen). Linjen är en SCHEMATISK korridor genom belagda orter (Wikipedia-koordinater) — inte den exakta geologiska åslinjen (SGU). Källa: Wikipedia.'
where slug = 'enkopingsasen';

update public.viking_roads set description =
  'Stockholmsåsen — rullstensås (~60 km) från Östuna kyrka förbi Arlanda och genom Stockholm (där den kallas Brunkebergsåsen, via Gamla stan) vidare söderut till Jordbro och Västerhaninge. Linjen är en SCHEMATISK korridor genom belagda orter (Wikipedia-koordinater) — inte den exakta geologiska åslinjen (SGU). Källa: Wikipedia.'
where slug = 'stockholmsasen';
