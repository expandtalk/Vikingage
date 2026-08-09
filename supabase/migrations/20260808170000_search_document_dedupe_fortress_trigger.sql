-- Durabel dedup: hoppa över 'fortress'-rader i search_document när samma fort redan finns som
-- 'hillfort' (viking_fortresses inom 250 m av en swedish_hillforts). Trigger → överlever
-- rebuild_search_document utan att röra den funktionen. hillfort behålls (dess /fortresses/:id fungerar,
-- och viking_fortresses nås numera via fallback i FortressDetail).
CREATE OR REPLACE FUNCTION public.sd_skip_duplicate_fortress()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
begin
  if NEW.entity_type = 'fortress' and exists (
    select 1 from viking_fortresses vf
    where vf.id = NEW.entity_id and vf.coordinates is not null
      and exists (
        select 1 from swedish_hillforts sh
        where sh.coordinates is not null
          and ST_DWithin(sh.coordinates::geometry::geography, vf.coordinates::geometry::geography, 250)
      )
  ) then
    return null;  -- dubblett av en hillfort → indexera inte
  end if;
  return NEW;
end $$;
DROP TRIGGER IF EXISTS trg_sd_skip_dup_fortress ON public.search_document;
CREATE TRIGGER trg_sd_skip_dup_fortress BEFORE INSERT ON public.search_document
  FOR EACH ROW EXECUTE FUNCTION public.sd_skip_duplicate_fortress();
