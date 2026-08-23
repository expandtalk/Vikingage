-- UGC steg (forskningsområden): användarskapade områden med ÄGARSKAP = KURATOR, inte kanon.
-- Design: scratch-ugc-samtalslager-design.md §research_areas + diskussionen 2026-08-23.
-- Beslut: alla konton får föreslå (skapa) ett område och blir ägare; ägarskapet gäller BARA det
-- öppna lagret (kurera beskrivning, moderera trådar), ALDRIG kanon — faktapåståenden går fortfarande
-- staging → verifierare/Caligula → människa. Medstewards tillåts. Inaktiv ägare (>6 mån) → återtagbar.
-- Trådar hänger på ett område via discussion_posts (entity_type='research_area', entity_key=slug) —
-- återanvänder samtalslagret, inget nytt diskussionssystem. Idempotent.

-- ============================================================================
-- research_areas
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.research_areas (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 text NOT NULL UNIQUE,
  title                text NOT NULL,
  description          text,
  owner_id             uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL = föräldralöst
  owner_last_active_at timestamptz NOT NULL DEFAULT now(),                 -- för återtagning
  status               text NOT NULL DEFAULT 'active',
  -- Valfri koppling till en KANONISK entitet (tema/landskap …) via samma ankare som discussion_posts.
  -- Förorenar inte den kanoniska taxonomin — området lever i UGC-lagret men kan peka in i grafen.
  linked_entity_type   text,
  linked_entity_key    text,
  created_by           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT research_areas_status_chk CHECK (status IN ('proposed','active','archived','orphaned'))
);

COMMENT ON TABLE public.research_areas IS
  'Användarskapade forskningsområden. Ägarskap = kurator (beskrivning + trådmoderering), ALDRIG '
  'auktoritet över kanon. Trådar hänger på området via discussion_posts (entity_type=''research_area'').';

CREATE INDEX IF NOT EXISTS idx_research_areas_owner  ON public.research_areas (owner_id);
CREATE INDEX IF NOT EXISTS idx_research_areas_status ON public.research_areas (status);

DROP TRIGGER IF EXISTS set_updated_at ON public.research_areas;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.research_areas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Håll owner_last_active_at färsk när ÄGAREN själv rör sitt område (matar återtagnings-klockan).
CREATE OR REPLACE FUNCTION public.tg_research_area_owner_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.owner_id IS NOT NULL AND NEW.owner_id = auth.uid() THEN
    NEW.owner_last_active_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS research_area_owner_touch ON public.research_areas;
CREATE TRIGGER research_area_owner_touch BEFORE UPDATE ON public.research_areas
  FOR EACH ROW EXECUTE FUNCTION public.tg_research_area_owner_touch();

-- ============================================================================
-- research_area_stewards — medstewards (kurator-hjälp), utöver ägaren
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.research_area_stewards (
  area_id   uuid NOT NULL REFERENCES public.research_areas(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  added_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (area_id, user_id)
);

COMMENT ON TABLE public.research_area_stewards IS
  'Medstewards som får kurera/moderera ett område jämte ägaren. Samma gräns: kurator, inte kanon.';

-- ============================================================================
-- Hjälpfunktioner (SECURITY DEFINER, pinnad search_path) — för RLS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_research_area_owner(p_area_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.research_areas WHERE id = p_area_id AND owner_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_research_area_steward(p_area_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_research_area_owner(p_area_id)
      OR EXISTS (SELECT 1 FROM public.research_area_stewards WHERE area_id = p_area_id AND user_id = auth.uid());
$$;

-- Återtagning: ett område är återtagbart om det saknar ägare, är märkt föräldralöst, eller ägaren
-- varit inaktiv > 6 månader. Återtagning byter ägare till den inloggade och nollställer klockan.
CREATE OR REPLACE FUNCTION public.claim_research_area(p_area_id uuid)
RETURNS public.research_areas LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.research_areas;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Kräver inloggning'; END IF;
  SELECT * INTO a FROM public.research_areas WHERE id = p_area_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Området finns inte'; END IF;
  IF NOT (a.owner_id IS NULL OR a.status = 'orphaned'
          OR a.owner_last_active_at < now() - interval '6 months') THEN
    RAISE EXCEPTION 'Området är inte återtagbart (aktiv ägare)';
  END IF;
  UPDATE public.research_areas
     SET owner_id = auth.uid(), owner_last_active_at = now(), status = 'active'
   WHERE id = p_area_id
  RETURNING * INTO a;
  RETURN a;
END;
$$;

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_area_stewards ENABLE ROW LEVEL SECURITY;

-- Områden: publik läsning (utom arkiverade); alla konton får skapa (blir ägare); ägare/steward/admin
-- redigerar; ägarbyte via claim_research_area (SECURITY DEFINER) eller admin.
DROP POLICY IF EXISTS research_areas_read ON public.research_areas;
CREATE POLICY research_areas_read ON public.research_areas
  FOR SELECT USING (status <> 'archived' OR public.is_research_area_steward(id) OR public.is_admin_or_editor());

DROP POLICY IF EXISTS research_areas_insert ON public.research_areas;
CREATE POLICY research_areas_insert ON public.research_areas
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND created_by = auth.uid());

DROP POLICY IF EXISTS research_areas_update ON public.research_areas;
CREATE POLICY research_areas_update ON public.research_areas
  FOR UPDATE USING (public.is_research_area_steward(id) OR public.is_admin_or_editor())
  WITH CHECK (public.is_research_area_steward(id) OR public.is_admin_or_editor());

-- Stewards-listan: publik läsning (vem kurerar är öppet); bara ägare/admin lägger till/tar bort.
DROP POLICY IF EXISTS research_stewards_read ON public.research_area_stewards;
CREATE POLICY research_stewards_read ON public.research_area_stewards
  FOR SELECT USING (true);

DROP POLICY IF EXISTS research_stewards_insert ON public.research_area_stewards;
CREATE POLICY research_stewards_insert ON public.research_area_stewards
  FOR INSERT TO authenticated
  WITH CHECK ((public.is_research_area_owner(area_id) OR public.is_admin_or_editor()) AND added_by = auth.uid());

DROP POLICY IF EXISTS research_stewards_delete ON public.research_area_stewards;
CREATE POLICY research_stewards_delete ON public.research_area_stewards
  FOR DELETE USING (public.is_research_area_owner(area_id) OR public.is_admin_or_editor());
