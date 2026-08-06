-- Söksurfacing för museum_objects: bulk-index + trigger som håller search_document synkat.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- TODO durabilitet: gren i rebuild_search_document('museum_object') för full-ombyggnads-överlevnad.
INSERT INTO public.search_document (entity_type, entity_id, label, sublabel, body_sv)
SELECT 'museum_object', m.id, coalesce(nullif(m.title,''), m.name),
  concat_ws(' · ', 'föremål', nullif(m.category,''), nullif(m.material,''), nullif(m.find_place,'')),
  concat_ws(' ', m.description, m.period, m.find_landscape, m.find_socken, m.find_kommun)
FROM public.museum_objects m
ON CONFLICT (entity_type, entity_id) DO UPDATE SET label = excluded.label, sublabel = excluded.sublabel, body_sv = excluded.body_sv;

CREATE OR REPLACE FUNCTION public.museum_object_search_sync() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $FN$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.search_document WHERE entity_type = 'museum_object' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;
  INSERT INTO public.search_document (entity_type, entity_id, label, sublabel, body_sv)
  VALUES ('museum_object', NEW.id, coalesce(nullif(NEW.title,''), NEW.name),
    concat_ws(' · ', 'föremål', nullif(NEW.category,''), nullif(NEW.material,''), nullif(NEW.find_place,'')),
    concat_ws(' ', NEW.description, NEW.period, NEW.find_landscape, NEW.find_socken, NEW.find_kommun))
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET label = excluded.label, sublabel = excluded.sublabel, body_sv = excluded.body_sv;
  RETURN NEW;
END $FN$;
DROP TRIGGER IF EXISTS trg_museum_object_search ON public.museum_objects;
CREATE TRIGGER trg_museum_object_search AFTER INSERT OR UPDATE OR DELETE ON public.museum_objects
  FOR EACH ROW EXECUTE FUNCTION public.museum_object_search_sync();
