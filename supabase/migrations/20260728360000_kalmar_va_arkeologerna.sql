-- Kalmarmuren steg 2 (Arkeologerna VA-projekt 2022–23). Bloggen ger nya murpartier kvalitativt
-- (kv Cedern ~2 m brett, "mitt mellan Söder- och Västerport"; nytt parti N om Molinsgatan över
-- Slottsvägen) men INGA koordinater — de exakta SWEREF-inmätningarna sitter i rapport-PDF:erna.
-- Ärligt: källan + Cedern-partiet som INTERPOLERAT (läge härlett mellan portarna, flaggat).
-- Exakt geometri kräver rapport-georef ell. KLM GIS-skikt (mejl) — läggs in i tur.
begin;

insert into public.fort_source (citation, archive, year, url)
select 'Kalmar Vattens VA-projekt i Gamla stan 2022–23 (Arkeologerna/SHM): ~30 000 fynd, ~50 medeltida tomter, ett tiotal gator och nya partier av stadsmuren (bl.a. kv Cedern ~2 m brett; nytt parti N om Molinsgatan över Slottsvägen). Allt inmätt i SWEREF 99 TM.',
  'Arkeologerna (Statens historiska museer), CC BY', 2023,
  'https://arkeologerna.com/bloggar/det-medeltida-kalmar-blir-synligt/mer-av-kalmar-medeltida-stadsmur/'
where not exists (select 1 from public.fort_source where citation like 'Kalmar Vattens VA-projekt%');

-- Cedern-partiet: läge INTERPOLERAT mitt mellan Söder- och Västerport (blogg ger ej koord).
insert into public.fort_element
  (site, element_type, name, start_earliest, start_latest, end_earliest, end_latest, evidence, evidence_class, pos_uncertainty_m, geom, published)
select 'Kalmar gamla stad', 'kurtin',
  'Murparti i kv Cedern (Arkeologerna VA 2022–23, ~2 m brett)',
  1300, 1300, 1690, 1690, 'dokumenterad', 'interpolerad', 120,
  public.ST_Centroid(public.ST_Collect(a.geom, b.geom)), true
from public.fort_element a, public.fort_element b
where a.site='Kalmar gamla stad' and a.name ilike 'Söderport%'
  and b.site='Kalmar gamla stad' and b.name ilike 'Västerport%'
  and not exists (select 1 from public.fort_element where site='Kalmar gamla stad' and name ilike 'Murparti i kv Cedern%');

-- Källkoppling med ärlig not om läget.
insert into public.fort_element_source (element_id, source_id, note)
select e.id, s.id,
  'Kv Cedern, ~mitt mellan Söder- och Västerport (Arkeologerna VA 2022–23, murparti ~2 m brett). LÄGE INTERPOLERAT mellan portarna — exakt SWEREF ur rapport/KLM GIS återstår.'
from public.fort_element e, public.fort_source s
where e.site='Kalmar gamla stad' and e.name ilike 'Murparti i kv Cedern%'
  and s.citation like 'Kalmar Vattens VA-projekt%'
  and not exists (select 1 from public.fort_element_source es where es.element_id=e.id and es.source_id=s.id);

commit;
