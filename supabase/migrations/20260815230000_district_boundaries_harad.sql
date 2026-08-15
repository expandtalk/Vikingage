-- Historiska rätts-/ledungsdistrikt (härad · Gotlands ting · skeppslag · tingslag · fylke) som
-- POLYGONER, härledda via socken-union. Metod: admin_boundaries socken → namn-match public.parishes
-- → public.hundreds (Rundata). TÄCKNING PARTIELL (~39% av socknarna namn-matchar) → varje distrikt
-- får unionen av de socknar vi KUNNAT tilldela; n_socken = täckningsindikator. Detta är ett
-- FÖRSTA-PASS, EJ komplett härads-geometri — kräver socken↔härad-rekonciliering för full täckning.
-- Gotland modelleras korrekt via district_type='ting' (öns EGET system, ej fastlandets hundare-ledung).
-- Skilt från admin_boundaries (Lantmäteri-kanon) — detta är härlett historiskt lager.
create table if not exists public.district_boundaries (
  id uuid primary key default gen_random_uuid(),
  district_type text not null,       -- härad / ting / skeppslag / tingslag / fylke / herred
  name text,
  external_id text unique,           -- public.hundreds.external_id
  province text,                     -- landskap (rundata_raw.provinces)
  geom geometry(MultiPolygon,4326),
  centroid geometry(Point,4326),
  n_socken integer,
  coverage text not null default 'partiell',
  source text not null default 'Härledd: union av namn-matchade Lantmäteri-socknar per Rundata-distrikt (socken→parishes→hundreds); partiell täckning',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.district_boundaries enable row level security;
drop policy if exists district_boundaries_read on public.district_boundaries;
create policy district_boundaries_read on public.district_boundaries for select using (true);

insert into public.district_boundaries (district_type, name, external_id, province, geom, centroid, n_socken)
select h.district_type, h.name, h.external_id,
       pr.province,
       g.mp, ST_PointOnSurface(g.mp), g.n
from public.hundreds h
join lateral (
  select ST_Multi(ST_CollectionExtract(ST_Union(ST_MakeValid(a.geom)),3))::geometry(MultiPolygon,4326) mp,
         count(distinct a.code) n
  from public.parishes p
  join public.admin_boundaries a on a.level='socken' and lower(a.name)=lower(p.name)
  where p.hundred_external_id = h.external_id
) g on g.n >= 1
left join rundata_raw.provinces pr
  on h.province_external_id = upper('X' || replace(pr.provinceid::text,'-',''))
where h.district_type in ('härad','ting','skeppslag','tingslag','fylke','herred')
on conflict (external_id) do update
  set district_type=excluded.district_type, name=excluded.name, province=excluded.province,
      geom=excluded.geom, centroid=excluded.centroid, n_socken=excluded.n_socken, updated_at=now();
