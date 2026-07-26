-- Strukturerad status-gradering av gravar (Daniels idé: gravskick markerar rang).
-- Lägger status_grade + status_markers på genetic_individuals så gravkorpusen kan
-- rangordnas och färgas på kartan — inte bara beskrivas i AI-text.
-- Skala: yppersta_elit > elit > välbärgad > vanlig > okänd.

ALTER TABLE public.genetic_individuals
  ADD COLUMN IF NOT EXISTS status_grade text,
  ADD COLUMN IF NOT EXISTS status_markers text[];

COMMENT ON COLUMN public.genetic_individuals.status_grade IS 'Social rang utifrån gravskick: yppersta_elit/elit/välbärgad/vanlig/okänd';
COMMENT ON COLUMN public.genetic_individuals.status_markers IS 'Statusmarkörer (häst, svärd_nedåt, guld, mynt, ring, kor, gravtumba, dräkt…)';

UPDATE public.genetic_individuals g SET status_grade = v.grade, status_markers = v.markers
FROM (VALUES
  ('RIDD-korgraven-KarlKnutsson', 'yppersta_elit', ARRAY['kunglig','begravningsdräkt','sobelbräm','väldoftande_örter','kista','kor']),
  ('RIDD-tumban-sk1', 'yppersta_elit', ARRAY['kung','gravtumba','kor']),
  ('RIDD-tumban-sk2', 'elit', ARRAY['kunglig_familjegrav']),
  ('RIDD-tumban-sk3', 'elit', ARRAY['kunglig_familjegrav']),
  ('RIDD-tumban-sk4', 'elit', ARRAY['kunglig_familjegrav']),
  ('RIDD-tumban-sk5', 'elit', ARRAY['drottning','deformerat_kranium','kunglig_familjegrav']),
  ('RIDD-tumban-sk6', 'elit', ARRAY['deformerat_kranium_möjligt','kunglig_familjegrav']),
  ('RIDD-tumban-sk7', 'elit', ARRAY['kunglig_familjegrav']),
  ('RIDD-tumban-barn1', 'elit', ARRAY['kunglig_familjegrav','barn']),
  ('RIDD-tumban-barn2', 'elit', ARRAY['kunglig_familjegrav','barn']),
  ('VARNHEM-BirgerJarl', 'yppersta_elit', ARRAY['riksjarl','fingerring_guld','skulpterad_gravhäll','porträttrelief','framför_altare']),
  ('VARNHEM-HertigErik', 'elit', ARRAY['hertig','upphöjd_grav']),
  ('VARNHEM-Mechtild', 'elit', ARRAY['drottning','upphöjd_grav']),
  ('VRETA-kyrka-A', 'yppersta_elit', ARRAY['kunglig_tradition','klosterkyrka','storvuxen']),
  ('VRETA-kyrka-B', 'yppersta_elit', ARRAY['kunglig_tradition','klosterkyrka','storvuxen'])
) AS v(sid, grade, markers)
WHERE g.sample_id = v.sid;
