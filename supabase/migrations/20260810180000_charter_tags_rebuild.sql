create table if not exists sdhk.charter_tags (
  sdhk_id   int not null,
  facett    text not null,
  varde     text not null,
  rule_id   text not null,
  konfidens text not null,
  unique (sdhk_id, facett, varde)
);
create index if not exists ix_charter_tags_facett on sdhk.charter_tags(facett,varde);
create index if not exists ix_charter_tags_sdhk on sdhk.charter_tags(sdhk_id);

create table if not exists sdhk.charter_year (
  sdhk_id int primary key,
  nominal_year int,
  year_qualifier text  -- exakt|efter|omkr|spann|odaterad
);

-- Städat år ur date_raw (endast rimliga medeltidsår 800-1560; annat = null/odaterad).
create or replace function sdhk.derive_year(date_raw text)
returns table(y int, q text) language sql immutable as $$
  select
    case when m[1] ~ '^(0[89]\d\d|1[0-5]\d\d)$' then m[1]::int else null end as y,
    case
      when date_raw ~* 'odat'            then 'odaterad'
      when date_raw ~* 'efter'           then 'efter'
      when date_raw ~* 'omkr|ca\.?|cirka' then 'omkr'
      when date_raw ~ '\d{4}.*[-–].*\d{4}' then 'spann'
      else 'exakt'
    end as q
  from (select (regexp_match(coalesce(date_raw,''), '(\d{4})'))) t(m);
$$;

create or replace function public.rebuild_charter_tags()
returns table(facett text, n bigint) language plpgsql security definer set search_path=sdhk,public as $$
begin
  truncate sdhk.charter_tags;
  -- regex_summary
  insert into sdhk.charter_tags(sdhk_id,facett,varde,rule_id,konfidens)
  select distinct l.sdhk_id, r.facett, r.varde, r.rule_id, r.konfidens
  from sdhk.letters_raw l join sdhk.charter_tag_rules r
    on r.aktiv and r.pattern_type='regex_summary' and coalesce(l.summary,'') ~* r.pattern
  on conflict do nothing;
  -- lang_map (mot lang_raw)
  insert into sdhk.charter_tags(sdhk_id,facett,varde,rule_id,konfidens)
  select distinct l.sdhk_id, r.facett, r.varde, r.rule_id, r.konfidens
  from sdhk.letters_raw l join sdhk.charter_tag_rules r
    on r.aktiv and r.pattern_type='lang_map' and coalesce(l.lang_raw,'') ~* r.pattern
  on conflict do nothing;
  -- date_flag (date_raw + comments)
  insert into sdhk.charter_tags(sdhk_id,facett,varde,rule_id,konfidens)
  select distinct l.sdhk_id, r.facett, r.varde, r.rule_id, r.konfidens
  from sdhk.letters_raw l join sdhk.charter_tag_rules r
    on r.aktiv and r.pattern_type='date_flag'
   and (coalesce(l.date_raw,'') ~* r.pattern or coalesce(l.comments,'') ~* r.pattern)
  on conflict do nothing;
  -- oklassificerad: brev utan någon aktor/aktyp-tagg
  insert into sdhk.charter_tags(sdhk_id,facett,varde,rule_id,konfidens)
  select l.sdhk_id,'meta','oklassificerad','meta.oklassificerad','hög'
  from sdhk.letters_raw l
  where not exists (select 1 from sdhk.charter_tags t where t.sdhk_id=l.sdhk_id and t.facett in ('aktor','aktyp'))
  on conflict do nothing;
  -- år
  truncate sdhk.charter_year;
  insert into sdhk.charter_year(sdhk_id,nominal_year,year_qualifier)
  select l.sdhk_id, d.y, d.q from sdhk.letters_raw l, lateral sdhk.derive_year(l.date_raw) d
  on conflict (sdhk_id) do nothing;

  return query select t.facett, count(*) from sdhk.charter_tags t group by t.facett order by 2 desc;
end $$;
