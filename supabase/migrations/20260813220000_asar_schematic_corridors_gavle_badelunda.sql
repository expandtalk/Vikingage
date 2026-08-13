-- Grova SCHEMATISKA korridorer för två rullstensåsar genom BELAGDA orter (Wikipedia/Wikidata-koord,
-- verifierade 2026-08-13) — INTE den exakta geologiska åslinjen (SGU isälvsavlagringar kan ersätta
-- senare). kind='corridor' (renderas av road_overview; off_route=false). waypoint_type='landmark'
-- (constraint tillåter bridge/junction/landmark). point=(lng,lat). Applicerad i prod via MCP; repo-spegel.
insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(17.00694,60.39389), 1, 'Hedesunda'),
  (point(17.01500,60.65194), 2, 'Valbo'),
  (point(17.14444,60.67472), 3, 'Gävle'),
  (point(17.21500,60.81778), 4, 'Trödje'),
  (point(17.07306,60.89528), 5, 'Hamrånge (Bergby)')
) as p(coord, ord, nm)
where r.slug = 'gavleasen';

insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(15.98028,60.28028), 1, 'Hedemora'),
  (point(16.18361,60.13889), 2, 'Avesta'),
  (point(16.64472,59.63056), 3, 'Anundshög / Badelunda (Västerås)'),
  (point(17.01833,58.75833), 4, 'Nyköpingstrakten')
) as p(coord, ord, nm)
where r.slug = 'badelundaasen';

update public.viking_roads set description =
  'Gävleåsen — rullstensås, gren av Enköpingsåsen, som sträcker sig från Hedesunda i söder genom Valbo och Gävle norrut mot Trödje och Hamrånge; korsar Gavleån och Testeboån. Den gamla färdvägen Norrstigen följde delvis åsen (som på delar även kallas Valboåsen). Linjen på kartan är en SCHEMATISK korridor genom belagda orter (Wikipedia/Wikidata-koordinater) — inte den exakta geologiska åslinjen (SGU isälvsavlagringar kan läggas in senare). Källor: gd.se 2008, Wikipedia.'
where slug = 'gavleasen';

update public.viking_roads set description =
  'Badelundaåsen — en av de stora mellansvenska rullstensåsarna (gren av Enköpingsåsen), från sjön Siljan i Dalarna i norr genom Hedemora och Avesta, förbi Västerås/Badelunda (Anundshög) mot Nyköpingstrakten i söder. Forntida färdvägar följde delvis åsen. Linjen är en SCHEMATISK korridor genom belagda orter (Wikipedia-koordinater) — ej den exakta geologiska åslinjen (SGU). Den norra delen mot Siljan är ännu inte inritad. Källor: Länsstyrelsen (Anundshög), Wikipedia.'
where slug = 'badelundaasen';
