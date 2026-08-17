-- Snabb typeahead för sökrutan: medan man skriver dyker ortnamn + personer + namn upp direkt.
-- Använder prefix på lower(label) (idx_search_document_lower_label) + trgm-fallback (sd_label_trgm_idx).
-- Grupperar i name (namnlexikon) / person (kung/ristare/helgon) / place (ortnamn/plats/socken/stad) /
-- other, så UI:t kan leda med ortnamn + personer (Daniel: "Gustav → namnbetydelse + Gustav Vasa +
-- kungar + ristare + helgon + platser"). Capad, rankad på prefix-exakthet → prominence → popularity.

-- Prefix-index för snabb typeahead: idx_search_document_lower_label (default collation) stödjer INTE
-- LIKE 'x%'. text_pattern_ops gör det → index-range-scan i st.f. seq-scan på 454k rader.
create index if not exists idx_search_document_label_prefix
  on public.search_document (lower(label) text_pattern_ops);

create or replace function public.search_typeahead(p_q text, p_limit integer default 12)
returns table (
  entity_type text, entity_id uuid, label text, sublabel text, signum text, grp text, score double precision
)
language plpgsql
stable
set search_path to 'public'
as $$
declare
  ql text := lower(btrim(p_q));
begin
  if ql is null or length(ql) < 2 then return; end if;
  -- Dynamisk SQL med prefixet som LITERAL → planeraren ser konstanten och använder
  -- idx_search_document_label_prefix (text_pattern_ops). Med parameter i en vanlig SQL-funktion
  -- kan indexet INTE användas (generisk plan) → seq-scan 454k = ~500 ms. Nu index-range = <10 ms.
  -- %L escapar prefixet säkert (ingen injektion).
  return query execute format($q$
    with cand as (
      select d.entity_type, d.entity_id, d.label, d.sublabel, d.signum,
        case d.entity_type
          when 'viking_name' then 'name'
          when 'king' then 'person' when 'carver' then 'person' when 'saint' then 'person'
          when 'place_name' then 'place' when 'place' then 'place' when 'parish' then 'place'
          when 'city' then 'place' when 'hundred' then 'place' when 'landscape' then 'place'
          else 'other' end as grp,
        (case when lower(d.label) = %L then 100.0 else 50.0 end)
        + 3.0 * coalesce(d.prominence, 0)
        + 0.5 * ln(1 + coalesce(d.popularity, 0))
        + 4.0 * coalesce(d.popularity_score, 0)
        - 0.02 * length(d.label) as score
      from public.search_document d
      where lower(d.label) like %L
    ),
    ranked as (
      select *, row_number() over (partition by grp order by score desc, length(label)) as grp_rn
      from cand
    )
    select entity_type, entity_id, label, sublabel, signum, grp, score
    from ranked where grp_rn <= 4
    order by score desc limit %s
  $q$, ql, ql || '%', greatest(1, least(p_limit, 20)));
end;
$$;

revoke all on function public.search_typeahead(text, integer) from public;
grant execute on function public.search_typeahead(text, integer) to anon, authenticated;
