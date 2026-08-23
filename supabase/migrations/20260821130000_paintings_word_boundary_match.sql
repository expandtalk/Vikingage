-- Fix: paintings_for_query matchade på SUBSTRÄNG (t ilike %p_name% ELLER p_name ilike %t%), vilket gav
-- falska träffar — t.ex. Mårten Eskil Winges Tor-målning (match_term "tor") blev hero för "stenstorp"
-- ("stensTORp" innehåller "tor"). Byt till ORDGRÄNS-matchning (\y…\y) så termen måste vara ett helt ord
-- i frågan (eller frågan ett helt ord i termen). Titel-match behålls som exakt-ish ilike.
create or replace function public.paintings_for_query(p_name text, lim int default 6)
returns table (
  image_url text, title text, artist text, year int, depicts_event text,
  license_code text, license_url text, descr_url text, caveat text
) language sql stable set search_path = public as $$
  -- Sanera bort regex-metatecken (parenteser m.m.) så \y-mönstret aldrig kan brytas av frågan.
  with q as (select regexp_replace(trim(p_name), '[^[:alnum:]åäöÅÄÖ -]', ' ', 'g') as p)
  select h.image_url, h.title, h.artist, h.year, h.depicts_event,
         h.license_code, h.license_url, h.descr_url, h.caveat
  from public.history_paintings h, q
  where length(q.p) >= 3 and (
    exists (
      select 1 from unnest(h.match_terms) t0
      cross join lateral (select regexp_replace(t0, '[^[:alnum:]åäöÅÄÖ -]', ' ', 'g') as t) s
      -- helt ord: "tor" matchar EJ "stenstorp"; "vasa" matchar "gustav vasa"; "oden" matchar "oden"
      where length(s.t) >= 2 and (q.p ~* ('\y' || s.t || '\y') or s.t ~* ('\y' || q.p || '\y'))
    )
    or h.title ~* ('\y' || q.p || '\y')
  )
  order by h.year nulls last
  limit greatest(1, least(coalesce(lim,6), 12));
$$;
revoke all on function public.paintings_for_query(text, int) from public;
grant execute on function public.paintings_for_query(text, int) to anon, authenticated;
