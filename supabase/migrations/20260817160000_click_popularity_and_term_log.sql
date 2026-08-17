-- STEG 2: klick-popularitet in i rankningen (80% wiki / 20% klick) + STEG "se vad man söker på".
-- Wiki-popularity är GLES (20 av 454k rader) → klick blir enda popularitetssignalen för långsvansen.
-- Blandningen NORMALISERAS (wiki 10–41000 vs klick 1–100-tal går ej att blanda rått). GDPR-aggregat.

-- 1) Klick-popularitet per entitet (summa klick över alla termer) + normaliserad rank-poäng (0..1).
alter table public.search_document add column if not exists click_popularity integer not null default 0;
alter table public.search_document add column if not exists popularity_score real not null default 0;
comment on column public.search_document.popularity_score is
  'Normaliserad rank-signal 0..1 = 0.8*wiki_norm + 0.2*klick_norm (log-dämpad). Fylls av refresh_search_popularity().';

-- 2) Refresh: fold:a in klick + räkna om den normaliserade 80/20-poängen. Körs manuellt/schemalagt
--    (inte per query). Log-max normaliserar båda signalerna till jämförbar 0..1-skala.
create or replace function public.refresh_search_popularity()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  max_wiki_ln  double precision;
  max_click_ln double precision;
begin
  -- Fold in klick-summor per entitet.
  update public.search_document d
    set click_popularity = coalesce(c.n, 0)
  from (
    select entity_type, entity_id, sum(clicks)::int as n
    from public.search_click group by entity_type, entity_id
  ) c
  where c.entity_type = d.entity_type and c.entity_id = d.entity_id
    and d.click_popularity is distinct from coalesce(c.n, 0);

  -- Log-max för normalisering (skydda mot 0 → NULLIF/ln(2)-golv).
  select greatest(ln(1 + max(popularity)), ln(2)) into max_wiki_ln from public.search_document where popularity > 0;
  select greatest(ln(1 + max(click_popularity)), ln(2)) into max_click_ln from public.search_document where click_popularity > 0;
  max_wiki_ln  := coalesce(max_wiki_ln, ln(2));
  max_click_ln := coalesce(max_click_ln, ln(2));

  -- 80/20-blandning av de normaliserade (0..1) log-dämpade signalerna.
  update public.search_document d
    set popularity_score = least(1.0,
        0.8 * (ln(1 + coalesce(popularity,0)) / max_wiki_ln)
      + 0.2 * (ln(1 + coalesce(click_popularity,0)) / max_click_ln))
  where (popularity > 0 or click_popularity > 0);
end $$;

revoke all on function public.refresh_search_popularity() from public;
grant execute on function public.refresh_search_popularity() to service_role;

-- Kör en gång nu (fyller poängen för de 20 wiki-entiteterna; klick är 0 tills data samlats).
select public.refresh_search_popularity();

-- 3) "SE VAD MAN SÖKER PÅ + systemet lär sig" (Daniel): logga ALLA sökningar (ej bara 0-träff som
--    search_gaps). Rent aggregat: term → antal + antal-med-träff. Ingen individdata (GDPR).
create table if not exists public.search_term_stat (
  term        text primary key,
  searches    integer not null default 0,
  with_hits   integer not null default 0,
  last_seen   date not null default current_date
);
comment on table public.search_term_stat is
  'Aggregerad sökterms-statistik (GDPR: ingen individdata). Vad folk söker + om det gav träff.';
alter table public.search_term_stat enable row level security;

create or replace function public.log_search_term(p_term text, p_had_hits boolean default true)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare t text := lower(btrim(p_term));
begin
  if t is null or length(t) < 2 or length(t) > 60 then return; end if;
  insert into public.search_term_stat (term, searches, with_hits)
  values (t, 1, case when p_had_hits then 1 else 0 end)
  on conflict (term) do update
    set searches = search_term_stat.searches + 1,
        with_hits = search_term_stat.with_hits + case when p_had_hits then 1 else 0 end,
        last_seen = current_date;
end $$;

revoke all on function public.log_search_term(text, boolean) from public;
grant execute on function public.log_search_term(text, boolean) to anon, authenticated;
