-- Ortnamns-klusterprofil: radiell anrikning av ett namnled kring ett förregistrerat epicentrum,
-- mot analytisk null (global bakgrundsandel i studieregionen + binomialt 95%-band per ring).
-- Dödar "Moment 22" (råa antal → alltid kluster): testet frågar om ringen är anrikad ÖVER bakgrund.
-- Cirkelvakt: p_exclude_home utesluter epicentrumets egen ort (t.ex. Sandby borg ~ byn Sandby).
-- Används av /sv/ortnamn (OnomasticClusterCard). REDAN APPLICERAD i prod via apply_migration.
create or replace function public.onomastic_radial_profile(
  p_lat double precision, p_lng double precision,
  p_element_keys text[], p_ring_edges_km numeric[],
  p_exclude_home text default null, p_province text default 'Öland'
) returns table(
  ring_idx int, ring_from_km numeric, ring_to_km numeric,
  total_n int, target_n int, frac double precision,
  exp_frac double precision, band_lo double precision, band_hi double precision, over_band boolean
) language sql stable as $$
  with base as (
    select
      2*6371*asin(sqrt(power(sin(radians(pn.lat - p_lat)/2),2)
        + cos(radians(p_lat))*cos(radians(pn.lat))*power(sin(radians(pn.lng - p_lng)/2),2))) as dist_km,
      (pn.element_keys && p_element_keys) as is_target
    from public.place_names pn
    where pn.province = p_province and pn.lat is not null and pn.lng is not null
      and (p_exclude_home is null or pn.normed_name is distinct from p_exclude_home)
  ),
  glob as (
    select (count(*) filter (where is_target))::double precision / nullif(count(*),0) as exp_frac from base
  ),
  rings as (
    select gs as ring_idx,
      case when gs=1 then 0::numeric else p_ring_edges_km[gs-1] end as ring_from_km,
      p_ring_edges_km[gs] as ring_to_km
    from generate_subscripts(p_ring_edges_km,1) gs
  )
  select r.ring_idx, r.ring_from_km, r.ring_to_km,
    count(b.*)::int as total_n,
    (count(b.*) filter (where b.is_target))::int as target_n,
    (count(b.*) filter (where b.is_target))::double precision / nullif(count(b.*),0) as frac,
    g.exp_frac,
    greatest(0, g.exp_frac - 1.96*sqrt(g.exp_frac*(1-g.exp_frac)/nullif(count(b.*),0))) as band_lo,
    least(1, g.exp_frac + 1.96*sqrt(g.exp_frac*(1-g.exp_frac)/nullif(count(b.*),0))) as band_hi,
    ((count(b.*) filter (where b.is_target))::double precision / nullif(count(b.*),0))
      > (g.exp_frac + 1.96*sqrt(g.exp_frac*(1-g.exp_frac)/nullif(count(b.*),0))) as over_band
  from rings r cross join glob g
  left join base b on b.dist_km >= r.ring_from_km and b.dist_km < r.ring_to_km
  group by r.ring_idx, r.ring_from_km, r.ring_to_km, g.exp_frac
  order by r.ring_idx;
$$;
grant execute on function public.onomastic_radial_profile(double precision,double precision,text[],numeric[],text,text) to anon, authenticated;
