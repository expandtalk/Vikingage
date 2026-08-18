-- Historiemålningar (1800-tal, PD) knutna till kungar/händelser — Cederström & Hellqvist m.fl.
-- HOTLÄNK från Wikimedia Commons (PD-Art: trogen 2D-repro av PD-verk är fri), rehostas ALDRIG.
-- KÄLLKRITIK (Daniel): 1800-talets historiemåleri är KONSTNÄRLIG TOLKNING, inte historisk källa —
-- ofta romantiserad/nationalistisk, anakronistiska detaljer. Därför en OBLIGATORISK `caveat` (varningstext)
-- per målning, plus specifika noter där kritiken är belagd (t.ex. Karl XII som nationalistisk hjältegestalt).
-- Fri om konstnären dog ≤1955 (svensk upphovsrätt = död+70). Cederström †1933, Hellqvist †1890 = PD.

create table if not exists public.history_paintings (
  id uuid primary key default gen_random_uuid(),
  wikidata_id text,
  title text not null,
  artist text not null,
  artist_death_year int,             -- proveniens för PD-bedömningen
  year int,                          -- tillkomstår (P571)
  image_url text not null unique,    -- hotlänk (Commons)
  descr_url text,                    -- Commons-filsidan
  license_code text,                 -- PD (PD-Art)
  license_url text,
  depicts_persons text[],            -- ['Karl XII', 'Magnus Stenbock']
  depicts_event text,                -- 'Slaget vid Narva 1700'
  match_terms text[],                -- sökbara termer (kungar/händelser/motiv) → paintings_for_query
  caveat text not null,              -- källkritisk varningstext (obligatorisk)
  source_institution text default 'Wikimedia Commons',
  created_at timestamptz default now()
);

create index if not exists idx_history_paintings_match on public.history_paintings using gin (match_terms);

alter table public.history_paintings enable row level security;
drop policy if exists "history_paintings public read" on public.history_paintings;
create policy "history_paintings public read" on public.history_paintings for select using (true);
drop policy if exists "history_paintings admin write" on public.history_paintings;
create policy "history_paintings admin write" on public.history_paintings for all
  using (public.is_admin()) with check (public.is_admin());

-- Sök: matcha frågan mot match_terms (kung/händelse) ELLER titel. Returnerar caveat med. anon EXECUTE.
create or replace function public.paintings_for_query(p_name text, lim int default 6)
returns table (
  image_url text, title text, artist text, year int, depicts_event text,
  license_code text, license_url text, descr_url text, caveat text
) language sql stable set search_path = public as $$
  select h.image_url, h.title, h.artist, h.year, h.depicts_event,
         h.license_code, h.license_url, h.descr_url, h.caveat
  from public.history_paintings h
  where length(trim(p_name)) >= 2 and (
    exists (select 1 from unnest(h.match_terms) t where t ilike '%'||trim(p_name)||'%' or trim(p_name) ilike '%'||t||'%')
    or h.title ilike '%'||trim(p_name)||'%'
  )
  order by h.year nulls last
  limit greatest(1, least(coalesce(lim,6), 12));
$$;
revoke all on function public.paintings_for_query(text, int) from public;
grant execute on function public.paintings_for_query(text, int) to anon, authenticated;
