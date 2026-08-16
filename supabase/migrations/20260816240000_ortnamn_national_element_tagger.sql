-- Homonym-säker NATIONELL ortnamns-led-parser.
-- Ersätter regex-gissning med EXPLICIT, källförankrad match-spec per led (affix + stammar + blocklista).
-- element_keys[] = MASKINELL KANDIDAT-tagg (för kartfilter), homonym-vaktad. Etymologi/tolkning bor
-- kvar i claim-liggaren (ortnamn_element_interpretations); en tagg är INGEN etymologisk sanning.
-- Konvention ur ortnamn_element_config.forms: '-x'=efterled (suffix), 'x-'=förled (prefix).

alter table public.ortnamn_element_config
  add column if not exists match_affix text
    check (match_affix in ('prefix','suffix','either','whole')),
  add column if not exists match_stems text[],
  add column if not exists match_block text[];

-- Curerad match-spec. Stammar i gemener (matchas mot lower(name)). Homonym-vakter kommenterade.
-- HÖG KONFIDENS: väletablerade bebyggelse-/natur-/sami-led + teofora förled MED genitiv-vakt.
update public.ortnamn_element_config c set
  match_affix = v.affix, match_stems = v.stems, match_block = v.block
from (values
  -- Bebyggelseled (efterled)
  ('by','suffix', array['by'], array[]::text[]),
  ('torp','suffix', array['torp','arp','rup'], array[]::text[]),
  ('sta','suffix', array['sta','stad','stada'], array[]::text[]),
  ('tuna','either', array['tuna'], array[]::text[]),  -- Vallentuna/Sigtuna (efterled) OCH Tunadal (förled)
  ('inge','suffix', array['inge','inga','linge','ninge'], array[]::text[]),
  ('losa','suffix', array['lösa','lösan'], array[]::text[]),
  ('säter','suffix', array['säter','sätter','sätra'], array[]::text[]),
  ('ryd','suffix', array['ryd','röd','rud'], array[]::text[]),  -- 'red' utelämnad (för brusig)
  ('måla','suffix', array['måla','måle'], array[]::text[]),
  ('hult','suffix', array['hult','holt'], array[]::text[]),
  ('böle','suffix', array['böle','böl'], array[]::text[]),
  ('husby','whole', array['husby','husaby'], array[]::text[]),
  -- Naturled (efterled)
  ('näs','suffix', array['näs','näset'], array[]::text[]),
  ('vik','suffix', array['vik','viken'], array[]::text[]),
  ('sjö','suffix', array['sjö','sjön'], array[]::text[]),
  ('berg','suffix', array['berg','berga'], array[]::text[]),
  ('holme','suffix', array['holm','holme','holmen'], array[]::text[]),
  ('lund','suffix', array['lund','lunda'], array[]::text[]),
  ('hamn','suffix', array['hamn','hamnen'], array[]::text[]),
  ('ås','suffix', array['åsen','ås'], array[]::text[]),
  ('myr','suffix', array['myr','myra','myren'], array[]::text[]),
  ('mosse','suffix', array['mosse','mossa','mossen'], array[]::text[]),
  ('träsk','either', array['träsk'], array[]::text[]),
  ('vad','suffix', array['vad','vada'], array[]::text[]),
  ('ed','prefix', array['eds'], array[]::text[]),
  ('hammar','prefix', array['hammar'], array[]::text[]),
  ('horn','prefix', array['horn'], array[]::text[]),
  ('hov','prefix', array['hov'], array[]::text[]),
  ('ting','prefix', array['tings','ting'], array[]::text[]),
  ('karl','prefix', array['karla','karle','karls'], array[]::text[]),
  ('smed','prefix', array['smed'], array[]::text[]),
  ('snäck','prefix', array['snäck'], array[]::text[]),
  ('naust','either', array['naust','nöst','nöste'], array[]::text[]),
  -- Teofora förled MED homonym-vakt (genitiv). val UTELÄMNAT medvetet (filolog: konflaterar 3 rötter).
  ('tor','prefix', array['tors'], array['torsk','torst','torsö vägen']),  -- Torsåker/Torslunda ✓, Torp/Torn/torsk ✗
  ('oden','prefix', array['odens','oden','odin'], array[]::text[]),
  ('frö','prefix', array['frös'], array[]::text[]),  -- endast genitiv 'frös-'; 'fröj'/'frö' utelämnade (fröjd=glädje läcker)
  ('härn','prefix', array['härn'], array[]::text[]),
  ('skade','prefix', array['skäde','skade'], array[]::text[]),
  ('vi','suffix', array['svi','evi'], array['järvi']),  -- kultled: -svi (Odensvi/Frösvi/Torsvi) + -evi (Ullevi/Skedevi/Härnevi); blockar finskt -järvi
  -- Sami/finska led (norr; efterled)
  ('jaur','suffix', array['jaur','jaure','jávri','jávrre','jävri','jävr'], array[]::text[]),
  ('johka','suffix', array['johka','johkå','jokk','jåkk'], array[]::text[]),
  ('joki','suffix', array['joki'], array[]::text[]),  -- 'jok' (3 tecken) utelämnat (brusigt)
  ('luokta','suffix', array['luokta','lokt'], array[]::text[]),
  ('varri','suffix', array['várri','várre','vaerie'], array[]::text[]),
  ('vaara','suffix', array['vaara'], array[]::text[]),
  ('njarga','suffix', array['njarka','njarga'], array[]::text[]),
  ('jeaggi','suffix', array['jägge','jegge'], array[]::text[]),
  ('niemi','suffix', array['niemi'], array[]::text[]),
  ('saari','suffix', array['saari'], array[]::text[]),
  ('koski','suffix', array['koski'], array[]::text[]),
  ('suolu','suffix', array['suolo','suolu'], array[]::text[]),
  ('jarvi','suffix', array['järvi'], array[]::text[]),
  ('vaggi','suffix', array['vagge'], array[]::text[])
) as v(k, affix, stems, block)
where c.element_key = v.k;

-- Aktivera de sami/finska geografiska appellativen (järvi=sjö, jokk=bäck, várri=fjäll, niemi=udde …).
-- Dessa är ordboks-säkra topografiska led, inte omstridda kult-etymologier → include=true.
update public.ortnamn_element_config set include = true
where element_key in ('jarvi','jaur','johka','joki','koski','luokta','niemi','saari',
                      'suolu','varri','vaara','njarga','jeaggi','vaggi');

-- Nationell tagger. Homonym-säker: affix-ankrad ändelse/början + per-led blocklista.
create or replace function public.tag_place_names_elements()
returns table(tagged_rows bigint, total_rows bigint)
language plpgsql as $$
begin
  -- 1) Nollställ maskinella taggar (denna funktion = auktoritet för element_keys-kandidatlagret).
  --    element_keys är NOT NULL → nollställ till tom array, inte null.
  update public.place_names set element_keys = '{}'::text[], element_category = null
    where element_keys <> '{}'::text[];

  -- 2) Match + skriv.
  with spec as (
    select element_key, category, match_affix as affix, match_stems as stems,
           coalesce(match_block, '{}'::text[]) as block
    from public.ortnamn_element_config
    where match_affix is not null and match_stems is not null and coalesce(include,true)
  ),
  n as (select id, lower(name) as nm from public.place_names where name is not null),
  matched as (
    select n.id,
           array_agg(distinct s.element_key order by s.element_key) as keys,
           (array_agg(distinct s.category) filter (where s.category is not null))[1] as cat
    from n
    join spec s on (
      case s.affix
        when 'suffix' then exists (select 1 from unnest(s.stems) st
                                   where char_length(n.nm) > char_length(st) and right(n.nm, char_length(st)) = st)
        when 'prefix' then exists (select 1 from unnest(s.stems) st
                                   where char_length(n.nm) > char_length(st) and left(n.nm, char_length(st)) = st)
        when 'whole'  then exists (select 1 from unnest(s.stems) st
                                   where n.nm = st or (char_length(n.nm) > char_length(st) and left(n.nm, char_length(st)) = st))
        when 'either' then exists (select 1 from unnest(s.stems) st
                                   where char_length(n.nm) > char_length(st)
                                     and (right(n.nm, char_length(st)) = st or left(n.nm, char_length(st)) = st))
        else false
      end
    )
    and not exists (select 1 from unnest(s.block) b
                    where left(n.nm, char_length(b)) = b or right(n.nm, char_length(b)) = b)
    group by n.id
  ),
  upd as (
    update public.place_names p
      set element_keys = m.keys, element_category = m.cat
    from matched m where p.id = m.id
    returning 1
  )
  select count(*)::bigint into tagged_rows from upd;
  select count(*)::bigint into total_rows from public.place_names where name is not null;
  return next;
end $$;

select * from public.tag_place_names_elements();
