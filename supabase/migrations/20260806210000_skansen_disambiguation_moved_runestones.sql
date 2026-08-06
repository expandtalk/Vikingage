-- Skansen: geo-disambiguering + flyttade runstenar (källbelagt, INGEN GISSNING).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
--
-- Skansen (friluftsmuseum, Djurgården, Stockholm) = Wikidata Q725108 (grundat 1891, Artur Hazelius).
-- Fyra runstenar står på Skansen, flyttade dit från ursprungssocknar (Wikidata P276=Q725108):
--   U 871 (Gryta), U 419 (Norrsunda), U 72 (Spånga), Sö 352 (Överjärna).
-- Ursprungssocknarnas exakta koordinater OVERIFIERADE → lat/lng NULL, certainty='unknown'.
-- Homonym: "Allsång på Skansen" (Q1757014) = SVT-program, off-topic → vid sidan.

insert into public.excursions (id, name, region, grp, period, coordinates, description_sv, description_en)
values (
  'skansen-friluftsmuseum',
  'Skansen (friluftsmuseum)',
  'Djurgården, Stockholm',
  'Uppland & Mälardalen',
  'Vikingatid–nutid',
  point(18.10200, 59.32418),
  'Världens äldsta friluftsmuseum, grundat 1891 av Artur Hazelius på Djurgården i Stockholm. Fyra runstenar har flyttats hit från andra socknar och står nu i museiområdet: U 871 (från Gryta), U 419 (från Norrsunda), U 72 (från Spånga) och Sö 352 (från Överjärna). Varje sten bär sin egen datering, ristartradition och ursprungsplats — Skansen är en samlingsplats, inte ursprunget. Runstenslägen enligt Wikidata (P276=Q725108).',
  'The world''s oldest open-air museum, founded 1891 by Artur Hazelius on Djurgården, Stockholm. Four runestones were moved here from other parishes and now stand on the museum grounds: U 871 (from Gryta), U 419 (from Norrsunda), U 72 (from Spånga) and Sö 352 (from Överjärna). Each stone keeps its own dating, carving tradition and place of origin — Skansen is a collection site, not the origin. Runestone locations per Wikidata (P276=Q725108).'
)
on conflict (id) do update set
  name = excluded.name, region = excluded.region, grp = excluded.grp, period = excluded.period,
  coordinates = excluded.coordinates, description_sv = excluded.description_sv,
  description_en = excluded.description_en, updated_at = now();

select public.rebuild_search_document('excursion', md5('excursion:skansen-friluftsmuseum')::uuid);

with st as (
  select id as inscription_id, signum, socken
  from public.runic_inscriptions
  where signum in ('U 871','U 419','U 72','Sö 352')
),
del as (
  delete from public.inscription_locations il using st
  where il.inscription_id = st.inscription_id and il.source like 'Wikidata P276%'
  returning 1
)
insert into public.inscription_locations
  (inscription_id, signum, role, seq, place_name, parish, lat, lng, certainty, source, note)
select st.inscription_id, st.signum, 'current', 2, 'Skansen', 'Djurgården, Stockholm',
       59.32418, 18.10200, 'certain', 'Wikidata P276 (Q725108)', 'Flyttad till Skansen; nuvarande läge.'
from st
union all
select st.inscription_id, st.signum, 'original', 1, st.socken, st.socken,
       null, null, 'unknown', 'Wikidata P276 (Q725108)',
       'Ursprungssocken enligt runsignum; exakt ursprungskoordinat overifierad.'
from st;

delete from public.entity_senses where term = 'skansen';
insert into public.entity_senses
  (term, sense_label_sv, sense_label_en, our_domain, rank, entity_type, entity_id, destination, note_sv, note_en)
values
 ('skansen', 'Skansen (friluftsmuseum, Stockholm)', 'Skansen (open-air museum, Stockholm)', true, 0,
   'excursion', md5('excursion:skansen-friluftsmuseum')::uuid, '/excursions/skansen-friluftsmuseum',
   'Friluftsmuseet på Djurgården — fyra runstenar flyttade hit.',
   'The open-air museum on Djurgården — four runestones moved here.'),
 ('skansen', 'Allsång på Skansen', 'Allsång på Skansen', false, 5,
   null, null, null,
   'SVT:s sommarprogram (Q1757014) — vi fokuserar på platsen Skansen.',
   'SVT summer TV show (Q1757014) — we focus on the place Skansen.');
