-- Schematiska segelleder (Kung Valdemars segelled + rekonstruerat Hansanätverk) ritades som
-- interpolerade linjer som gick RAKT ÖVER LAND (t.ex. tvärs över Öland). Källorna medger att
-- geometrin är schematisk ("EJ uppmätt segelgeometri") — men att visa en båtrutt över land är
-- vilseledande. Klipp bort land-segmenten mot verifierade landskapspolygoner (admin_boundaries).
-- Rör INTE HaV-havsplanernas riktiga farledsgeometri. Ingen ny geometri gissas — bara borttag.
with land as (select ST_Union(geom) g from public.admin_boundaries where level='landskap')
update public.fairways f
set geom = ST_CollectionExtract(ST_Difference(f.geom, land.g), 2)
from land
where (f.source ilike '%schematisk%' or f.source ilike '%Kung Valdemars jordebok%')
  and ST_Intersects(f.geom, land.g);
