-- Fix: church_consolidation_by_region.t50 mätte fel. Percentilerna (t25/t50/t75) räknades över ALLA
-- byggår, så bevarade-men-ombyggda kyrkor (1800-tal) drog medianen till efter-medeltid — kortet mäter
-- KONSOLIDERING (~1075–1350), inte ombyggnad. Data: 588 byggår ≤1350 mot 1267 >1350.
-- Lösning: percentiler + n_dated räknas nu ENBART på medeltida byggår (built_from ≤ 1350).
-- n_churches (täthetens täljare) förblir totalen. Landskap utan medeltida kyrkor (t.ex. Norrland) får
-- då ärligt t50=NULL / litet n_dated — den sanna signalen (sen kristnande), ej en falsk 1900-tals-median.
create or replace function public.church_consolidation_by_region()
 returns table(region text, n_churches integer, n_dated integer, t50 integer, t25 integer, t75 integer)
 language sql
 stable
as $function$
  select landscape,
    count(*)::int,
    count(built_from) filter (where built_from <= 1350)::int,
    round(percentile_cont(0.5)  within group (order by built_from) filter (where built_from <= 1350))::int,
    round(percentile_cont(0.25) within group (order by built_from) filter (where built_from <= 1350))::int,
    round(percentile_cont(0.75) within group (order by built_from) filter (where built_from <= 1350))::int
  from public.ecclesiastical_sites
  where landscape is not null and landscape <> '' and geom is not null
  group by landscape having count(*) >= 20
  order by count(*) desc;
$function$;
