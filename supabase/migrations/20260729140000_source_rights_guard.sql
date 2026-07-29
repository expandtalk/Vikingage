-- Upphovsrätts-spärr, strukturellt. Bakgrund: stadsvapentexten var klistrad från
-- upphovsrättsskyddade sajter (waslingmedia.se/heraldik.se). Regeln "fulltext endast för
-- fri licens" fanns bara som policy/minne — nu påtvingad i DB (jfr palimpsest-spärren:
-- regeln kodas, litar inte på god vilja). FAKTA (årtal, namn, blasonering) är fria; UTTRYCK
-- (ordagrann prosa/dikt) är skyddat och får bara lagras när källans licens tillåter.

begin;

-- ---------- 1. RÄTTIGHETSDISKRIMINATOR ----------
do $$ begin
  if not exists (select 1 from pg_type where typname='source_rights') then
    create type source_rights as enum
      ('public_domain','cc0','cc_by','cc_by_sa','permission_granted','copyrighted','unknown'); end if;
end $$;
alter table public.historical_sources
  add column if not exists rights source_rights not null default 'unknown';

-- Backfill: befintlig lagrad fulltext var PD enligt tidigare policy ("source_texts fulltext PD-only")
-- → märk dessa källor public_domain så triggern inte blockerar framtida redigering av dem.
update public.historical_sources
   set rights = 'public_domain'
 where rights = 'unknown'
   and id in (select distinct source_id from public.source_texts);

-- ---------- 2. FULLTEXT-SPÄRR PÅ source_texts ----------
-- Blockerar ordagranna KÄLLTEXT-kolumner om källans rights inte är fri. translation_* = eget verk → fritt.
create or replace function public.enforce_source_text_rights()
returns trigger language plpgsql as $$
declare v_rights source_rights;
begin
  -- fires bara om någon verbatim källtext-kolumn faktiskt bär innehåll
  if coalesce(new.original_norse, new.norse_source, new.sv_source, new.en_source) is null then
    return new;
  end if;
  select rights into v_rights from public.historical_sources where id = new.source_id;
  if v_rights is null or v_rights not in ('public_domain','cc0','cc_by','cc_by_sa','permission_granted') then
    raise exception
      'Ordagrann källtext får inte lagras: källan % har rights=% (ej fri licens). Lagra fakta/egen översättning, eller sätt historical_sources.rights till en fri licens om det stämmer.',
      new.source_id, coalesce(v_rights::text,'saknas');
  end if;
  return new;
end $$;

drop trigger if exists trg_enforce_source_text_rights on public.source_texts;
create trigger trg_enforce_source_text_rights
  before insert or update on public.source_texts
  for each row execute function public.enforce_source_text_rights();

commit;

-- Efter apply: regen types.ts (--linked). Klassificera källor med okänd rätt vid tillfälle
-- (default 'unknown' = säker: blockerar verbatim tills någon aktivt intygar fri licens).
