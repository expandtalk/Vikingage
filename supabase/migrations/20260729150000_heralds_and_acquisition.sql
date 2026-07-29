-- Sköldebrev/härold-lagret. Design ur diskussion 2026-07-29 (Daniel).
-- KÄLLKRITIK (Wiktorsson 1989, "Svenska sköldebrev från medeltiden"): svensk heraldik är i grunden
-- ANTAGEN, inte beviljad — vem som helst fick ta sig ett vapen; sköldebrev (kungligt vapenbrev) är
-- undantag, inte regel. 1400-talets nordiska vapen: mest naturmotiv, få häroldsfigurer, INGA två
-- vapen av samma konstnär → talar MOT ett svenskt häroldsväsende; tinkturreglerna följdes ej →
-- validera ALDRIG tinktur mot regel för nordiskt 1400-tal. Detta kodas som en acquisition-dimension.

begin;

-- ---------- 1. FÖRVÄRVSSÄTT på bäraren ----------
do $$ begin
  if not exists (select 1 from pg_type where typname='arms_acquisition') then
    create type arms_acquisition as enum
      ('assumed','granted_charter','inherited','adopted','unknown'); end if;  -- assumed=antaget (svensk norm), granted_charter=sköldebrev
end $$;
alter table public.armorial_bearers
  add column if not exists acquisition arms_acquisition not null default 'unknown';

-- ---------- 2. HÄROLDER (person + ämbete + prosopografi) ----------
-- Härolden = tidig statstjänsteman: budbärare, ceremonimästare, upptecknare av vapen (för att hålla
-- ordning på privilegier). Prosopografi bär OSÄKERHET strukturellt (is_identity_certain).
create table if not exists public.heralds (
  herald_id      uuid primary key default gen_random_uuid(),
  name           text not null,
  byname         text,
  office         text,                 -- t.ex. "härold över tre kungariken"
  realm          text,                 -- t.ex. "Kalmarunionen"
  origin_note    text,                 -- t.ex. "sannolikt tysk (indicium: bror i Danzig)"
  active_start   integer,
  active_end     integer,
  is_identity_certain boolean not null default true,   -- false = prosopografiskt omtvistad identitet
  biography      text,                 -- egen sammanfattning (ej klistrad prosa)
  source_id      uuid references public.historical_sources(id),
  source_refs    text[] default '{}',  -- ytterligare doc-/artikelreferenser (Diplomatarium Danicum m.m.)
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.heralds enable row level security;
drop policy if exists heralds_read on public.heralds;
create policy heralds_read on public.heralds for select using (true);
drop policy if exists heralds_write on public.heralds;
create policy heralds_write on public.heralds for all using (public.is_admin()) with check (public.is_admin());

commit;

-- Efter apply: regen types.ts (--db-url). Seed (Simon Hendel + Wiktorsson/Verwohlt-källor +
-- acquisition-backfill) via scripts/data/seed-heralds.mjs. Registrera härolder i entity_registry
-- (entity_type 'herald') för graf-koppling (opposition/tjänst-relationer).
