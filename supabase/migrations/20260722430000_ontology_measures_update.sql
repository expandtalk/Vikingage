-- Uppdatera ontologins mätoperationskatalog med RPC:er byggda efter v1. Applicerad via
-- MCP execute_sql; fil = proveniens. ontology_measures.applies_to är text[].
insert into public.ontology_measures (code,label_sv,label_en,rpc,inputs,output_unit,applies_to,status,description) values
 ('distance_free','Fritt avståndstest','Free distance test','distance_stats','p_test[], p_baseline[], p_target','meter (median/kvartiler)',array['place_name'],'active','Medianavstånd från valfria ortnamnsled till närmaste mål (kyrka/fornborg/kulturlager/runsten/spolia).'),
 ('shape_reach','Antal inom dagsresa','Count within day-reach','shape_reach_stats','p_test[], p_baseline[], p_target, p_shape, p_radius_km','antal (median per grupp)',array['place_name'],'active','Antal mål inom form (cirkel/fyrkant/hexagon) av given radie/dagsresa kring varje ort. Christallers principer.'),
 ('church_nn','Avstånd mellan kyrkor','Church nearest-neighbour','church_nn_stats','—','meter (fördelning)',array['church'],'active','Varje kyrkas avstånd till närmaste andra kyrka — sockennätets maskvidd (median ~3 km, p90 ~9,4 km).'),
 ('match_preview','Ordförädling','Word refinement','placename_match_preview','p_patterns[], p_excludes[], p_boundary','antal + exempel',array['place_name'],'active','Hur många OSM-ortnamn ett mönster träffar (+ exempel) — tuna en sökterm innan hypotes.')
on conflict (code) do nothing;
