-- Teofora namnled (gudanamn) som förstklassig egenskap → möjliggör Agneta Nyholms (Sofiainstitutet)
-- hypotes om kristnandets namntabu (teofora namn, särskilt Tor-, blev sällsynta efter ~1100) som ett
-- TESTBART mönster. theophoric = belagt (dessa ÄR gudanamnsled); deity = vilken gudom.
alter table public.ortnamn_element_config add column if not exists theophoric boolean not null default false;
alter table public.ortnamn_element_config add column if not exists deity text;
comment on column public.ortnamn_element_config.theophoric is 'Ledet är ett gudanamn (teofort). Belagt för de klara gudanamnen; ledet≠enskilt namns tolkning.';
comment on column public.ortnamn_element_config.deity is 'Gudom: Tor/Oden/Freyr/Freyja/Skaði/Härn … (fornnordisk panteon).';

update public.ortnamn_element_config set theophoric = true, deity = d.deity
from (values
  ('tor','Tor (Þórr)'), ('oden','Oden (Óðinn)'), ('frö','Freyr'), ('fröja','Freyja'),
  ('härn','Härn (Freyja-epitet, *Hærn)'), ('skade','Skaði')
) as d(k, deity)
where ortnamn_element_config.element_key = d.k;
