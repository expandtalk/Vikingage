-- Aoristisk kristnandekurva: varje stildaterad runsten sprids som uniform sannolikhet över sitt
-- Gräslund-stilfönster, summeras per 10-årsbin → kontinuerlig "andel kristna markörer över tid"
-- per landskap. Löser kyrkkurvans vänstertrunkering (stenkyrkor först ~1100; kristnandet ~950–1100).
-- Mappat mot VÅRT schema: runic_inscriptions.province (region), .style_group (Gräslund, vårt format
-- "Rak"/"Pr 4"), is_christian = has_cross OR christian_invocation. Se Namn och bygd-metodkritiken.
create table if not exists style_windows (
  style_group text primary key, year_start int not null, year_end int not null, check (year_end > year_start)
);
insert into style_windows (style_group, year_start, year_end) values
  ('Rak',980,1015),('RAK',980,1015),
  ('Fp',1010,1050),('Fp/Rak',990,1050),('Fp/Pr 1',1010,1050),
  ('Pr 1',1010,1040),('Pr1',1010,1040),('Pr 1/Pr 2',1010,1050),
  ('Pr 2',1020,1050),('Pr 2/Pr 3',1020,1075),
  ('Pr 3',1045,1075),('Pr 3/Pr 4',1045,1100),
  ('Pr 4',1060,1100),('Pr 4/Pr 5',1060,1130),
  ('Pr 5',1100,1130)
on conflict (style_group) do update set year_start=excluded.year_start, year_end=excluded.year_end;

drop materialized view if exists aoristic_christianization;
create materialized view aoristic_christianization as
with bins as (select b bin_start, b+10 bin_end from generate_series(950,1130,10) b),
dated as (
  select r.province region, (r.has_cross or r.christian_invocation is not null) is_christian,
    w.year_start, w.year_end, (w.year_end-w.year_start)::numeric wlen
  from runic_inscriptions r join style_windows w on w.style_group = r.style_group
  where r.province is not null and r.province<>''
),
weighted as (
  select d.region, b.bin_start, d.is_christian,
    greatest(0, least(d.year_end,b.bin_end)-greatest(d.year_start,b.bin_start))::numeric/d.wlen weight
  from dated d join bins b on b.bin_end>d.year_start and b.bin_start<d.year_end
)
select region, bin_start, bin_start+5 bin_mid,
  round(sum(weight),2) n_effective,
  round(sum(weight) filter (where is_christian),2) n_christian,
  case when sum(weight)>0 then round(sum(weight) filter (where is_christian)/sum(weight),4) end christian_share
from weighted group by region, bin_start order by region, bin_start;
create unique index if not exists aoristic_christ_idx on aoristic_christianization (region, bin_start);
grant select on aoristic_christianization to anon, authenticated;

-- RPC: kurvan för valda landskap + total-n (för bortfallsredovisning i UI).
create or replace function get_christianization_curve(p_regions text[])
returns table(region text, bin_mid int, n_effective numeric, christian_share numeric)
language sql stable as $$
  select region, bin_mid, n_effective, christian_share
  from aoristic_christianization where region = any(p_regions) order by region, bin_start;
$$;
grant execute on function get_christianization_curve(text[]) to anon, authenticated;
