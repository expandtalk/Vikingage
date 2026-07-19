-- Fix get_carver_inscriptions() (2026-07-18)
-- Buggen: funktionen anropade ST_Y(point)/ST_X(point) (PostGIS geometry) på
-- runic_inscriptions.coordinates som är en vanlig `point` → funktionen KRASCHADE
-- helt, så ristarnas inskrifter (med koordinater) laddades aldrig → inga stenar
-- på kartan i carvers-detaljvyn. Point-accessor: p[0]=x=lng, p[1]=y=lat.
-- Lägger också till datering (period_start/end + dating_text) så aktiv period
-- kan härledas ur inskrifternas datering (carvers.period_active_* är ofta null).
-- Kör i SQL-editorn, sedan: supabase migration repair --status applied 20260718210000

create or replace function public.get_carver_inscriptions()
 returns table(carverid text, inscriptionid text, attribution attribution_type, certainty boolean, notes text, inscription jsonb)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  return query
  select
    c.id::text as carverid,
    encode(ci.inscriptionid, 'hex') as inscriptionid,
    ci.attribution,
    ci.certainty,
    ci.notes,
    jsonb_build_object(
      'id', encode(ci.inscriptionid, 'hex'),
      'signum', coalesce(r.signum, 'Unknown'),
      'location', coalesce(r.location, c.region),
      'coordinates',
      case
        when r.coordinates is not null then
          jsonb_build_object('lat', (r.coordinates)[1], 'lng', (r.coordinates)[0])
        else null
      end,
      'period_start', r.period_start,
      'period_end', r.period_end,
      'dating_text', r.dating_text
    ) as inscription
  from carvers c
  join carver_inscription ci on encode(ci.carverid, 'hex') = replace(c.id::text, '-', '')
  left join runic_inscriptions r on encode(ci.inscriptionid, 'hex') = replace(r.id::text, '-', '')
  order by c.name, ci.certainty desc;
end;
$function$;
