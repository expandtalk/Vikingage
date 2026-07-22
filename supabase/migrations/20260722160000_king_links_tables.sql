-- Länktabeller kung↔lämning. Applicerad via MCP execute_sql; fil = proveniens.
-- king_fortress_links: typad FK till viking_fortresses (integritet).
-- king_site_links: polymorf (kyrka/fornlämning/ortnamn/källa/inskrift) — flexibel.
-- confidence: belagd | trolig | tradition (aldrig påstå mer än källan bär).

create table if not exists public.king_fortress_links (
  id uuid primary key default gen_random_uuid(),
  king_id uuid not null references public.historical_kings(id) on delete cascade,
  fortress_id uuid not null references public.viking_fortresses(id) on delete cascade,
  relation text not null default 'byggherre',
  confidence text not null default 'trolig',
  source text, note text,
  created_at timestamptz not null default now(),
  unique (king_id, fortress_id, relation)
);
alter table public.king_fortress_links enable row level security;
drop policy if exists kfl_read on public.king_fortress_links;
create policy kfl_read on public.king_fortress_links for select using (true);
drop policy if exists kfl_write on public.king_fortress_links;
create policy kfl_write on public.king_fortress_links for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.king_site_links (
  id uuid primary key default gen_random_uuid(),
  king_id uuid not null references public.historical_kings(id) on delete cascade,
  site_type text not null,   -- ecclesiastical | heritage | place_name | fortress | inscription | spring
  site_id uuid not null,
  relation text not null,
  confidence text not null default 'trolig',
  source text, note text,
  created_at timestamptz not null default now(),
  unique (king_id, site_type, site_id, relation)
);
alter table public.king_site_links enable row level security;
drop policy if exists ksl_read on public.king_site_links;
create policy ksl_read on public.king_site_links for select using (true);
drop policy if exists ksl_write on public.king_site_links;
create policy ksl_write on public.king_site_links for all using (public.is_admin()) with check (public.is_admin());

-- Seed: Harald Blåtand → de fem ringborgarna (byggherre, trolig via dendro).
insert into public.king_fortress_links (king_id, fortress_id, relation, confidence, source, note)
select k.id, f.id, 'byggherre', 'trolig',
  'Dendrokronologi + geometrisk Trelleborgstyp, ~980',
  'Snävt daterad slutfas knyter borgen till Harald Blåtands regering (ej epigrafiskt namngiven).'
from public.historical_kings k, public.viking_fortresses f
where k.name='Harald Blåtand'
  and f.name in ('Trelleborg (Slagelse)','Fyrkat','Aggersborg','Nonnebakken','Borgring')
on conflict (king_id, fortress_id, relation) do nothing;

-- Seed: Emund den gamle → Vallagravfältet (RAÄ 77:1), folktradition (ej belagt).
insert into public.king_site_links (king_id, site_type, site_id, relation, confidence, source, note)
select k.id, 'heritage', h.id, 'begravd', 'tradition',
  'Folktradition (Årsta/Valla)',
  'Traditionen säger Emund begravd vid Valla. Den arkeologiska hövdinggraven på Årstafältet är daterad ~900–950, ~100 år före Emund (d.~1060) — ej samma grav.'
from public.historical_kings k, public.heritage_sites h
where k.name='Emund den gamle' and h.source_uri like '%Brännkyrka 77:1%'
on conflict (king_id, site_type, site_id, relation) do nothing;
