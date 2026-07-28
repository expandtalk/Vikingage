-- Tre nya intresseprofiler (Daniel: profilerna föråldrade — marin/kyrka/geologi saknas).
-- Profiler laddas från explore_profiles (config fallback = PROFILE_SEEDS). Lagren är kända
-- KNOWN_LAYER_KEYS. Framtid: persisterad legend-override + årsintervall + multi-val-picker.
insert into public.explore_profiles (id, sort_order, is_active, label, description, config) values
 ('marine', 7, true,
  '{"sv":"Marinarkeolog","en":"Marine archaeologist"}'::jsonb,
  '{"sv":"Farleder, hamnar, vrak och strandförskjutning","en":"Waterways, harbours, wrecks and shoreline shift"}'::jsonb,
  '{"icon":"anchor","theme":"flow","basemap":"terrain","showTimeline":true,"defaultPeriod":"all",
    "layers":{"valdemar_route":true,"water_routes":true,"river_routes":true,"paleo_shoreline":true,"viking_cities":true,"beacon_sites":true},
    "primaryLayers":["valdemar_route","water_routes"],
    "panels":{"legend":{"visible":true},"results":{"visible":true},"search":{"visible":false},"filters":{"visible":true}}}'::jsonb),
 ('church', 8, true,
  '{"sv":"Kyrkohistoriker","en":"Church historian"}'::jsonb,
  '{"sv":"Kyrkor, kristnande och kors-runstenar","en":"Churches, Christianization and cross runestones"}'::jsonb,
  '{"icon":"church","theme":"chronology","basemap":"terrain","showTimeline":true,"defaultPeriod":"all",
    "layers":{"ecclesiastical_churches":true,"religious_places":true,"runic_inscriptions":true},
    "primaryLayers":["ecclesiastical_churches","runic_inscriptions"],
    "panels":{"legend":{"visible":true},"results":{"visible":true},"search":{"visible":false},"filters":{"visible":true}}}'::jsonb),
 ('geologist', 9, true,
  '{"sv":"Geolog","en":"Geologist"}'::jsonb,
  '{"sv":"Strandlinjer, berggrund och fornborgars terräng","en":"Shorelines, bedrock and hillfort terrain"}'::jsonb,
  '{"icon":"mountain","theme":"earth","basemap":"terrain","showTimeline":true,"defaultPeriod":"all",
    "layers":{"paleo_shoreline":true,"viking_fortresses":true,"archaeological_sites":true,"river_routes":true},
    "primaryLayers":["paleo_shoreline","viking_fortresses"],
    "panels":{"legend":{"visible":true},"results":{"visible":true},"search":{"visible":false},"filters":{"visible":true}}}'::jsonb)
on conflict (id) do update set sort_order=excluded.sort_order, is_active=excluded.is_active,
  label=excluded.label, description=excluded.description, config=excluded.config;
