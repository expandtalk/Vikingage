-- Maritimt lager in i kunskapsgrafen (per segel-navigatorns rekommendation, Daniel-godkänt).
-- Sjö-predikat + registrering av maritime_nodes/crossing_points/fairways som entity_registry-noder
-- (id = tabellens id, 1:1). KVAR (större): exponera i resolve_place MED disambiguering (Åbo-fällan).
-- Rensade även anakronismerna Helsingfors (1550) + Mariehamn (1861) ur valdemar_route_points via skript.
insert into public.rel_predicates (code,label_sv,label_en,subject_type,object_type,description,version) values
  ('connects','förbinder','connects','*','*','Maritim nod förbinder farvatten/led.',1),
  ('leg_of','etapp av','leg of','*','fairway','Punkt/överfart som etapp av en farled.',1),
  ('hazard_near','grund/hinder nära','hazard near','*','*','Grund/hinder nära en punkt (crossing_points).',1),
  ('portage_between','båtdrag mellan','portage between','*','*','Ed/drag mellan två vatten.',1),
  ('shelter_for','lä/nattläger för','shelter for','*','*','Skyddad hamn/nattläger.',1)
on conflict (code) do nothing;

insert into public.entity_registry (id, entity_type, label)
  select id, 'maritime_node', coalesce(nullif(name,''),'maritime_node') from public.maritime_nodes
  on conflict (id) do update set entity_type=excluded.entity_type, label=excluded.label;
insert into public.entity_registry (id, entity_type, label)
  select id, 'crossing_point', coalesce(nullif(name,''),'crossing_point') from public.crossing_points
  on conflict (id) do update set entity_type=excluded.entity_type, label=excluded.label;
insert into public.entity_registry (id, entity_type, label)
  select id, 'fairway', coalesce(nullif(name,''),'fairway') from public.fairways
  on conflict (id) do update set entity_type=excluded.entity_type, label=excluded.label;
