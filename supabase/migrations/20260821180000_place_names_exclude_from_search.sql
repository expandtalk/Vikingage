-- Rökstenen-städning (Daniel 2026-08-21) + generell mekanism.
-- Problem: två place_name "Rökstenen" (KULTURTX, Lantmäteriets ortnamn) förorenade sök på den berömda
-- Ög 136: (1) en dublett på Ög 136:s EXAKTA koordinat (Östergötland), (2) en helt annan verklig plats
-- i Jämtland (62,81°N). superseded_by duger inte: FK kräver en peka-mål (Jämtland är ingen dublett) och
-- reconcile_place_name_clusters nollställer den på icke-namnkluster.
-- Lösning: durabel flagga `exclude_from_search`. Raden bevaras i ortnamnskorpusen (kartlabel, belägg,
-- element-analys); ENBART sök-ytan exkluderar. rebuild_search_document respekterar flaggan → överlever
-- ombygge OCH reconcile.

alter table public.place_names add column if not exists exclude_from_search boolean not null default false;

-- Patcha place_name-blocket i rebuild_search_document utan att röra övriga entitetsblock.
do $do$
declare def text;
begin
  select pg_get_functiondef(oid) into def from pg_proc where proname = 'rebuild_search_document' limit 1;
  if position('exclude_from_search' in def) = 0 then
    def := replace(def,
      'from place_names p where p.name is not null and (p_id is null or p.id = p_id)',
      'from place_names p where p.name is not null and p.exclude_from_search = false and (p_id is null or p.id = p_id)');
    execute def;
  end if;
end $do$;

-- Markera de två Rökstenen-posterna (bevaras som ortnamn, döljs i sök).
update public.place_names set exclude_from_search = true
 where id in ('fd859329-b2f8-416f-beb7-10c00dcfe407',   -- Östergötland: dublett på Ög 136:s koordinat
              '6db4c087-4938-4c5a-8728-2a41e7fcffe5');  -- Jämtland: annan verklig plats, ovidkommande

-- Omedelbar effekt: ta bort dem ur nuvarande index (ombygget håller dem borta framåt via flaggan).
delete from public.search_document
 where entity_type = 'place_name'
   and entity_id in ('fd859329-b2f8-416f-beb7-10c00dcfe407','6db4c087-4938-4c5a-8728-2a41e7fcffe5');
