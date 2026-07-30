-- Fornborgs-tidsserie: parsade dateringsintervall + aoristisk kurva (borgar aktiva per tidsbin).
-- Toppar = fortifikationshorisonter → indikator på krigshot (jfr folkvandringstidens borgboom).
alter table swedish_hillforts add column if not exists period_start integer;
alter table swedish_hillforts add column if not exists period_end integer;

-- Aoristisk fördelning: varje daterad borg bidrar med sin överlappnings-andel till varje bin.
-- weight = förväntat antal aktiva borgar i binet; n_forts = antal borgar som överlappar binet.
create or replace function hillfort_aoristic_curve(
  p_landscape text default null, p_bin integer default 50, p_from integer default -500, p_to integer default 1400)
returns table(bin_start integer, weight numeric, n_forts integer)
language sql stable as $$
  with f as (
    select period_start s, period_end e from swedish_hillforts
    where period_start is not null and period_end is not null and period_end > period_start
      and (p_landscape is null or landscape = p_landscape)
  ),
  bins as (select b as bin_start from generate_series(p_from, p_to - p_bin, p_bin) b)
  select b.bin_start,
    round(coalesce(sum(
      greatest(0, least(f.e, b.bin_start + p_bin) - greatest(f.s, b.bin_start))::numeric
      / nullif(f.e - f.s, 0)
    ), 0), 2) as weight,
    count(f.*) filter (where f.e > b.bin_start and f.s < b.bin_start + p_bin)::int as n_forts
  from bins b
  left join f on f.e > b.bin_start and f.s < b.bin_start + p_bin
  group by b.bin_start
  order by b.bin_start;
$$;
grant execute on function hillfort_aoristic_curve(text, integer, integer, integer) to anon, authenticated;
