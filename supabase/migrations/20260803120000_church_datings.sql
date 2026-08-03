-- church_datings — strukturerad byggnadshistorik per kyrka ur BBR/Bebyggelseregistret (RAÄ).
-- En rad = en byggnadshändelse (Nybyggnad/Ändring/Brand/Valvslagning/inredning …) med datum + ev. arkitekt.
-- Ankras på ecclesiastical_sites (kanonisk kyrkidentitet). Nycklad på BYGGNADEN (BBR-id) → undviker
-- socken/boplats-bruset som fällde K-samsök-arkivvägen (Fas II). FAKTA (datum, arkitekt, händelse) fritt;
-- ingen verbatim brödtext (copyright-guard). Se docs/superpowers/specs/2026-08-03-kyrkoarkeologi-domain.md.

CREATE TABLE IF NOT EXISTS public.church_datings (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id          uuid NOT NULL REFERENCES public.ecclesiastical_sites(id) ON DELETE CASCADE,
  church_name        text,
  event_label        text NOT NULL,     -- BBR contextLabel, t.ex. "Nybyggnad", "Brand", "Ändring - ombyggnad"
  event_type         text,              -- normaliserad hink (nybyggnad/tillbyggnad/ombyggnad/brand/valv/inredning/rivning/other)
  building_part      text,              -- härledd ur label om anges (Torn/Sakristia/Vapenhus/Korparti …)
  date_from          date,
  date_to            date,
  year_from          int,               -- härledd för tidslinje/filter
  year_to            int,
  architect          text,              -- ns7:fullName om angiven
  bbr_id             text,              -- raa/bbr/<id>
  source_uri         text,              -- full kulturarvsdata-URI
  source_institution text DEFAULT 'Riksantikvarieämbetet (BBR)',
  license            text,
  verification_status text DEFAULT 'verified',  -- BBR = auktoritativ strukturerad registerdata
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- Dedup: samma kyrka + händelse + tidsspann = en rad (idempotent ingest via upsert).
CREATE UNIQUE INDEX IF NOT EXISTS church_datings_uniq
  ON public.church_datings (church_id, event_label,
    (COALESCE(date_from, DATE '0001-01-01')), (COALESCE(date_to, DATE '0001-01-01')));
CREATE INDEX IF NOT EXISTS church_datings_church_idx ON public.church_datings (church_id);
CREATE INDEX IF NOT EXISTS church_datings_year_idx   ON public.church_datings (year_from, year_to);

ALTER TABLE public.church_datings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "church_datings public read" ON public.church_datings;
CREATE POLICY "church_datings public read" ON public.church_datings FOR SELECT USING (true);

DROP POLICY IF EXISTS "church_datings admin write" ON public.church_datings;
CREATE POLICY "church_datings admin write" ON public.church_datings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
