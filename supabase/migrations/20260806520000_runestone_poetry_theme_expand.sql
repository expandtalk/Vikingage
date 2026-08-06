-- Utöka poesi-temat med fler belagda versstenar (fornyrðislag/dróttkvätt/förbannelsevers) +
-- två omtvistade (Sparlösa, Kälvesten — märkta 'probable'). Attribution ur runologisk standard.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
INSERT INTO public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence, created_by)
SELECT r.id, 'has_theme', (SELECT id FROM public.themes WHERE slug='runstenar-poesi'),
       jsonb_build_object('notes', v.meter),
       'Kurering (runologisk standardlitteratur)', v.conf, 'curation:poesi'
FROM (VALUES
  ('Sö 56',  'fornyrðislag — "rýnstr í Miðgarði" (Fyrbyblocket)', 'certain'),
  ('Sö 130', 'fornyrðislag (Hagstugan)', 'certain'),
  ('Sö 164', 'fornyrðislag — "stóð drengila í stafn skipi" (Råby)', 'certain'),
  ('U 225',  'fornyrðislag (Bällsta, del av monument)', 'certain'),
  ('U 226',  'fornyrðislag — tingsplats/minnesmärke (Bällsta)', 'certain'),
  ('Vs 24',  'vers om husfrun (Odendisastenen, Hassmyra)', 'certain'),
  ('DR 209', 'fornyrðislag + Tor-förbannelse (Glavendrup)', 'certain'),
  ('DR 230', 'vers + förbannelse (Tryggevælde, Ragnhild)', 'certain'),
  ('DR 295', 'fornyrðislag — "flýði eigi at Uppsölum" (Hällestad)', 'certain'),
  ('Vg 119', 'arkaisk/mytologisk vers (Sparlösa) — omtvistat versmått', 'probable'),
  ('Ög 8',   'tidig alliterativ vers (Kälvesten) — omtvistat', 'probable')
) AS v(signum, meter, conf)
JOIN public.runic_inscriptions r ON r.signum = v.signum
JOIN public.entity_registry er ON er.id = r.id AND er.entity_type = 'inscription'
WHERE NOT EXISTS (
  SELECT 1 FROM public.relationship x
  WHERE x.subject_id = r.id AND x.predicate = 'has_theme'
    AND x.object_id = (SELECT id FROM public.themes WHERE slug='runstenar-poesi'));
