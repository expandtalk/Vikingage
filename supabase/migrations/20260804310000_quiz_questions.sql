-- Frågesport auto-genererad ur KG:ns BELAGDA fakta, expert-kuraterbar.
-- Princip: bara belagda tripplar blir frågor (confidence='belagd'), alltid med källa; myt/sägen
-- får finnas men märks confidence='myth' (enligt Eddan/källa), aldrig som belagt. Auto-genererade
-- rader är UTKAST (status='auto') och blir INTE publika förrän en expert verifierar (status='verified').
-- RLS: publik läsning endast av verifierade frågor.

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_sv text NOT NULL,
  question_en text,
  answer text NOT NULL,
  distractors text[] NOT NULL,
  entity_type text,
  entity_id uuid,
  fact_key text,
  confidence text NOT NULL DEFAULT 'belagd',   -- 'belagd' | 'myth'
  source text,
  difficulty text NOT NULL DEFAULT 'medel',
  status text NOT NULL DEFAULT 'auto',          -- 'auto' | 'verified' | 'rejected'
  created_by text NOT NULL DEFAULT 'generator',
  verified_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read verified quiz" ON quiz_questions;
CREATE POLICY "public read verified quiz" ON quiz_questions FOR SELECT USING (status = 'verified');

-- Pilot-seed: öländska fornborgar med BELAGD datering (Eketorp, Sandby, Träbyborg).
-- Vedby (trolig) och odaterade utesluts medvetet av belagt-filtret.
INSERT INTO quiz_questions (question_sv, question_en, answer, distractors, entity_type, entity_id, fact_key, confidence, source) VALUES
 ('Från vilken tidsperiod är Sandby borg på Öland?','From which period is Sandby borg on Öland?',
  'Folkvandringstid (ca 400–550 e.Kr.)', ARRAY['Bronsålder','Vikingatid','Vendeltid'],
  'hillfort','53969468-2554-4b19-871a-2fa51d79f333','dating','belagd','Kalmar läns museum; Victor et al. (DiVA)'),
 ('Vad gör Sandby borg unik bland Sveriges fornborgar?','What makes Sandby borg unique among Sweden''s hillforts?',
  'Invånarna dödades och lämnades obegravda (massaker ca 480 e.Kr.)', ARRAY['Den beboddes in i medeltiden','Den byggdes av romerska legionärer','Den var en kristen klosteranläggning'],
  'hillfort','53969468-2554-4b19-871a-2fa51d79f333','feature','belagd','Kalmar läns museum; Victor et al. (DiVA)'),
 ('Hur ligger Sandby borg i terrängen?','How is Sandby borg situated?',
  'Lågt vid kusten — en kustringborg, inte en höjdborg', ARRAY['På en hög klippa','Inne i landet vid en insjö','På en holme i Kalmarsund'],
  'hillfort','53969468-2554-4b19-871a-2fa51d79f333','terrain','belagd','Terrängdata (höjdmodell + SGU jordart), on_height=false'),
 ('Vad är särskilt med Eketorps borg på Öland?','What is special about Eketorp ring fort?',
  'Den återbrukades under medeltiden (Eketorp III, ca 1000–1300)', ARRAY['Den övergavs efter en massaker','Den byggdes aldrig färdig','Den var enbart en fyrplats'],
  'hillfort',NULL,'feature','belagd','Eketorp-projektet (Borg/Näsman/Wegraeus)'),
 ('När anlades Eketorps borg (äldsta fasen)?','When was Eketorp first built?',
  'Omkring 300 e.Kr.', ARRAY['Omkring 800 f.Kr.','Omkring 1200 e.Kr.','Omkring 50 e.Kr.'],
  'hillfort',NULL,'dating','belagd','Eketorp-projektet (Borg/Näsman/Wegraeus)'),
 ('Från vilken period är Träbyborg på Öland?','From which period is Träbyborg on Öland?',
  'Folkvandringstid (ca 375–550 e.Kr.)', ARRAY['Yngre bronsålder','Högmedeltid','Vikingatid'],
  'hillfort',NULL,'dating','belagd','Papmehl-Dufay & Isaksson 2025; Stenberger 1933')
ON CONFLICT DO NOTHING;
