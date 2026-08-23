-- UGC steg 1–2: personliga standardfilter + entitetsförankrat samtalslager.
-- Design: scratch-ugc-samtalslager-design.md. Två lager — detta är det ÖPPNA lagret (diskussion,
-- gissning/sägen tillåten), hårt skilt i renderingen från den källkritiska grafen. Ingen post blir
-- kanon här; befordran sker via staging-claim + verifierare (separat migration, steg 4).
-- Beslut: PLATT trådning (ett svarssteg), global feed, konto krävs för att posta, alla konton får
-- posta/föreslå. Anknytning till ort (med geoposition) eller person sker via entity_type+entity_key
-- som pekar in i entity_registry — en tråd hänger alltså redan på en befintlig entitet.
-- Idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS) så den kan köras om utan datatapp.

-- ============================================================================
-- STEG 1: user_preferences — personliga standardfilter på kartan
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_layers jsonb NOT NULL DEFAULT '[]'::jsonb,   -- vilka kartlager som tänds som default
  home_lat       double precision,                     -- valfri hemposition för kartans startvy
  home_lng       double precision,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_preferences IS
  'Per-användare UI-inställningar (default-kartlager, hemposition). Läses/skrivs bara av ägaren.';

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_preferences_select_own ON public.user_preferences;
CREATE POLICY user_preferences_select_own ON public.user_preferences
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_preferences_insert_own ON public.user_preferences;
CREATE POLICY user_preferences_insert_own ON public.user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_preferences_update_own ON public.user_preferences;
CREATE POLICY user_preferences_update_own ON public.user_preferences
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_preferences_delete_own ON public.user_preferences;
CREATE POLICY user_preferences_delete_own ON public.user_preferences
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- Gemensam updated_at-trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.user_preferences;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================================
-- STEG 2: discussion_posts — entitetsförankrat samtalslager
-- Befintliga kolumner: id, entity_type, entity_key, display_name, body, status, created_at.
-- Lägg till konto (user_id), platt svarslänk (parent_id), redigeringstid, flaggräknare.
-- ============================================================================
ALTER TABLE public.discussion_posts
  ADD COLUMN IF NOT EXISTS user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_id  uuid REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS flag_count integer NOT NULL DEFAULT 0;

-- Status-domän: öppen men modererbar. published (default) · flagged (community-kö) · hidden
-- (modererad bort, mjuk) · removed_gdpr (anonymiserad på begäran).
ALTER TABLE public.discussion_posts
  ALTER COLUMN status SET DEFAULT 'published';
UPDATE public.discussion_posts SET status = 'published' WHERE status IS NULL;
ALTER TABLE public.discussion_posts
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.discussion_posts DROP CONSTRAINT IF EXISTS discussion_posts_status_chk;
ALTER TABLE public.discussion_posts ADD CONSTRAINT discussion_posts_status_chk
  CHECK (status IN ('published','flagged','hidden','removed_gdpr'));

COMMENT ON TABLE public.discussion_posts IS
  'Öppet samtalslager, entitetsförankrat (entity_type+entity_key → entity_registry). Platt trådning: '
  'parent_id NULL = trådstart, annars svar (ett steg). Renderas visuellt SKILT från belagda fakta.';

-- Index: global feed (senaste först), tråd-uppslag per entitet, svarsuppslag, per användare.
CREATE INDEX IF NOT EXISTS idx_discussion_posts_feed        ON public.discussion_posts (created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_discussion_posts_entity      ON public.discussion_posts (entity_type, entity_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_parent      ON public.discussion_posts (parent_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_user        ON public.discussion_posts (user_id);

DROP TRIGGER IF EXISTS set_updated_at ON public.discussion_posts;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Platt trådning: ett svar får bara hänga på en trådstart (parentens parent_id måste vara NULL),
-- och svaret ärver trådens entitetsankare. Djupare nästling avvisas.
CREATE OR REPLACE FUNCTION public.tg_discussion_flat_thread()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p RECORD;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    SELECT parent_id, entity_type, entity_key INTO p
      FROM public.discussion_posts WHERE id = NEW.parent_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'parent_id % finns inte', NEW.parent_id;
    END IF;
    IF p.parent_id IS NOT NULL THEN
      RAISE EXCEPTION 'Platt trådning: svar får bara hänga på en trådstart, inte på ett annat svar';
    END IF;
    -- svaret ärver trådens ankare (skydd mot fel-länkning)
    NEW.entity_type := p.entity_type;
    NEW.entity_key  := p.entity_key;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS discussion_flat_thread ON public.discussion_posts;
CREATE TRIGGER discussion_flat_thread BEFORE INSERT ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_discussion_flat_thread();

-- RLS
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;

-- Läsning: publik, men bara synliga statusar (dolt/gdpr-raderat visas ej).
DROP POLICY IF EXISTS discussion_posts_read_public ON public.discussion_posts;
CREATE POLICY discussion_posts_read_public ON public.discussion_posts
  FOR SELECT USING (status IN ('published','flagged'));

-- Postning: kräver konto; user_id måste vara den inloggade; nya poster startar som published.
DROP POLICY IF EXISTS discussion_posts_insert_auth ON public.discussion_posts;
CREATE POLICY discussion_posts_insert_auth ON public.discussion_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'published');

-- Redigering: författaren får uppdatera sin egen post (behåller published/flagged; kan mjuk-radera
-- till removed_gdpr). Statusskydd (ej hidden själv) sköts av triggern nedan.
DROP POLICY IF EXISTS discussion_posts_update_own ON public.discussion_posts;
CREATE POLICY discussion_posts_update_own ON public.discussion_posts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND status IN ('published','flagged','removed_gdpr'));

-- Moderering: admin/editor får uppdatera vilken post som helst (t.ex. status='hidden').
DROP POLICY IF EXISTS discussion_posts_moderate ON public.discussion_posts;
CREATE POLICY discussion_posts_moderate ON public.discussion_posts
  FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());

-- Ankaret får inte ändras i efterhand (integritet för trådens hemvist).
CREATE OR REPLACE FUNCTION public.tg_discussion_guard_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.entity_type IS DISTINCT FROM OLD.entity_type
     OR NEW.entity_key IS DISTINCT FROM OLD.entity_key
     OR NEW.parent_id IS DISTINCT FROM OLD.parent_id
     OR NEW.user_id   IS DISTINCT FROM OLD.user_id THEN
    -- tillåt bara om admin/editor (t.ex. GDPR-omflytt); annars oföränderligt
    IF NOT public.is_admin_or_editor() THEN
      RAISE EXCEPTION 'Ankare/parent/user på en diskussionspost är oföränderliga';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS discussion_guard_update ON public.discussion_posts;
CREATE TRIGGER discussion_guard_update BEFORE UPDATE ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_discussion_guard_update();

-- ============================================================================
-- Community-flaggning → modereringskö (driver flag_count + auto-flagged)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.discussion_post_flags (
  post_id    uuid NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason     text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)   -- en flagg per användare och post
);

ALTER TABLE public.discussion_post_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS discussion_flags_insert_auth ON public.discussion_post_flags;
CREATE POLICY discussion_flags_insert_auth ON public.discussion_post_flags
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS discussion_flags_read_mod ON public.discussion_post_flags;
CREATE POLICY discussion_flags_read_mod ON public.discussion_post_flags
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_editor());

-- Tröskel: vid >= 3 flaggor sätts posten till 'flagged' (till modereringskö). SECURITY DEFINER så
-- räknaren kan uppdatera en post flaggaren inte äger.
CREATE OR REPLACE FUNCTION public.tg_discussion_flag_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c integer;
BEGIN
  SELECT count(*) INTO c FROM public.discussion_post_flags WHERE post_id = NEW.post_id;
  UPDATE public.discussion_posts
     SET flag_count = c,
         status = CASE WHEN c >= 3 AND status = 'published' THEN 'flagged' ELSE status END
   WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS discussion_flag_count ON public.discussion_post_flags;
CREATE TRIGGER discussion_flag_count AFTER INSERT ON public.discussion_post_flags
  FOR EACH ROW EXECUTE FUNCTION public.tg_discussion_flag_count();
