-- Maktgeografi (steg 1): gods/maktsäten (estates) + innehav över tid (estate_holdings)
-- med fiskal-system-dimension (ledung vs tionde m.fl.). Maktinnehavare återanvänder
-- historical_kings (individer) + royal_dynasties (ätter); magnater/ätter utan egen rad
-- bärs av holder_name. Seed = 800-talets Ynglinga-nod kring Birka (Björn/Olof/Anund +
-- Ansgar) — visar den sjöbaserade ledungen (Anunds 32 skepp) mot den gryende kyrkan.
-- tax_domain (polygoner) och power_holder-utökning för magnater kommer i steg 2.

CREATE TABLE IF NOT EXISTS public.estates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  estate_type text NOT NULL,              -- husaby | kungsgård | handelsplats | sätesgård | förläning | uppsala_öd
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  geom geometry(Point, 4326),
  first_attested integer,                 -- tidigast belagt år
  description text,
  source text,
  confidence text NOT NULL DEFAULT 'probable', -- certain | probable | hypothesis
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.estate_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  holder_kind text NOT NULL,              -- king | dynasty | magnate
  king_id uuid REFERENCES public.historical_kings(id) ON DELETE SET NULL,
  dynasty_id uuid REFERENCES public.royal_dynasties(id) ON DELETE SET NULL,
  holder_name text,                       -- fritext när ej FK (magnat/ätt utan rad)
  role text,                              -- residens | kontroll | ägare | förläningstagare | anfall
  acquired_via text,                      -- arv | gifte | förläning | erövring | grundade
  from_holder text,                       -- föregående innehavare (fritext tills vidare)
  period_start integer,
  period_end integer,
  fiscal_system text,                     -- ledung | tionde | tribut | land_skatt
  confidence text NOT NULL DEFAULT 'probable',
  source text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- geom sätts alltid ur lat/lng (samma mönster som övriga spatiala lager).
CREATE OR REPLACE FUNCTION public.set_estate_geom() RETURNS trigger AS $$
BEGIN NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS estates_set_geom ON public.estates;
CREATE TRIGGER estates_set_geom BEFORE INSERT OR UPDATE ON public.estates
  FOR EACH ROW EXECUTE FUNCTION public.set_estate_geom();

CREATE INDEX IF NOT EXISTS estates_geom_idx ON public.estates USING gist(geom);
CREATE INDEX IF NOT EXISTS holdings_estate_idx ON public.estate_holdings(estate_id);
CREATE INDEX IF NOT EXISTS holdings_period_idx ON public.estate_holdings(period_start, period_end);

-- RLS: publik läsning, admin skriv (projektkonvention, is_admin()).
ALTER TABLE public.estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estate_holdings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS estates_read ON public.estates;
DROP POLICY IF EXISTS estates_admin ON public.estates;
DROP POLICY IF EXISTS holdings_read ON public.estate_holdings;
DROP POLICY IF EXISTS holdings_admin ON public.estate_holdings;
CREATE POLICY estates_read ON public.estates FOR SELECT USING (true);
CREATE POLICY estates_admin ON public.estates FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY holdings_read ON public.estate_holdings FOR SELECT USING (true);
CREATE POLICY holdings_admin ON public.estate_holdings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ SEED: 800-talets Ynglinga-nod ============
-- Idempotent: rensa seedade estates (cascade tar holdings).
DELETE FROM public.estates WHERE name IN ('Birka', 'Hovgården (Adelsö)');

INSERT INTO public.estates (name, estate_type, lat, lng, first_attested, description, source, confidence) VALUES
  ('Birka', 'handelsplats', 59.3360, 17.5420, 750, 'Vikingatida handelsstad på Björkö i Mälaren; sveakungens intresse- och kontrollpunkt, Ansgars missionsmål ~830 och ~852.', 'Rimbert, Vita Ansgarii', 'certain'),
  ('Hovgården (Adelsö)', 'kungsgård', 59.3590, 17.4810, 800, 'Kunglig gård på Adelsö mitt emot Birka — sveakungens säte vid handelsstaden (Uppsala öd).', 'RAÄ; Adam av Bremen', 'probable');

-- Innehav (holdings). Ätten + de tre kungarna, alla knutna till Birka. fiscal_system=ledung
-- (den sjöbaserade svea-makten); Ansgar-akterna noteras som den gryende, konkurrerande kyrkan.
INSERT INTO public.estate_holdings (estate_id, holder_kind, dynasty_id, holder_name, role, period_start, period_end, fiscal_system, confidence, source, note)
SELECT e.id, 'dynasty', (SELECT id FROM public.royal_dynasties WHERE name ILIKE '%yngling%' LIMIT 1), 'Ynglingaätten', 'kontroll', 800, 900, 'ledung', 'probable', 'Rimbert; Ynglingatal', 'Svea kungaätt med bas i Mälardalen; sjömakt (ledung) via skeppslag/folkland.'
FROM public.estates e WHERE e.name='Birka';

INSERT INTO public.estate_holdings (estate_id, holder_kind, king_id, holder_name, role, period_start, period_end, fiscal_system, confidence, source, note)
SELECT e.id, 'king', k.id, k.name, r.role, r.ps, r.pe, 'ledung', 'probable', 'Rimbert, Vita Ansgarii', r.note
FROM public.estates e
JOIN (VALUES
  ('Kung Björn', 'kontroll', 829, 850, 'Tog emot Ansgar ~830 och tillät mission — allians/prestige, inte skatt än.'),
  ('Kung Olof',  'kontroll', 850, 870, 'Ansgars andra resa ~852; tillät kyrkobygge vid Birka (gryende kyrk-system).'),
  ('Kung Anund', 'anfall',   860, 880, 'Anföll Birka i landsflykt med 32 skepp — ledungsflottans mobiliseringsmakt.')
) AS r(kname, role, ps, pe, note) ON TRUE
JOIN public.historical_kings k ON k.name = r.kname
WHERE e.name='Birka';
