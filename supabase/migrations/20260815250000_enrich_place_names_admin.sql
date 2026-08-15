-- Berika place_names (52 904 ortnamn) med admin-kontext via punkt-i-polygon mot våra polygoner:
--   socken  ← admin_boundaries level='socken' (Lantmäteri, 2341)
--   harad   ← district_boundaries härad/ting (härlett, partiell täckning)
--   province(landskap) ← admin_boundaries level='landskap' (25) — fyller ENDAST där province är NULL
-- Icke-destruktivt: befintlig province rörs ej om den redan är satt. GIST-index finns/skapas.
create index if not exists district_boundaries_geom_gix on public.district_boundaries using gist (geom);

alter table public.place_names add column if not exists socken text;
alter table public.place_names add column if not exists harad text;

-- socken (socken-polygoner överlappar ej → en träff per punkt)
update public.place_names p set socken = a.name
from public.admin_boundaries a
where a.level='socken' and p.geom is not null and ST_Contains(a.geom, p.geom) and p.socken is distinct from a.name;

-- härad/ting (district_boundaries partiell + NAMNKOLLISION → landskaps-konsistensvakt:
-- behåll bara härad vars landskap = platsens province, annars NULL. Undviker kontaminering
-- typ "Ekeby → Sköllersta härad (Närke)" på en plats i Småland.)
update public.place_names p set harad = d.name
from public.district_boundaries d
where d.district_type in ('härad','ting') and p.geom is not null and ST_Contains(d.geom, p.geom)
  and d.province is not null and d.province = p.province;

-- landskap: fyll province där NULL (verifierade polygoner täcker hela Sverige)
update public.place_names p set province = l.name
from public.admin_boundaries l
where l.level='landskap' and p.province is null and p.geom is not null and ST_Contains(l.geom, p.geom);
