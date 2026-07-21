-- Stiftstillhörighet över tid (church_diocese_history). Ren data, körd via MCP 2026-07-21.
-- Baslinje: Norden under Lund 1103–1164 → svenska stift under Uppsala 1164–1531 → reformationen 1531–.
-- Kräver dioceses-seed.sql + ecclesiastical_sites (sockenkyrkor Uppland/Ångermanland) först.

-- Direkt diocese_id på sockenkyrkor via landskap (Uppsala ärkestift omfattade Uppland + Norrland).
UPDATE public.ecclesiastical_sites e SET diocese_id = d.id
FROM public.dioceses d
WHERE e.kind='parish_church' AND d.code = CASE e.landscape
  WHEN 'Uppland' THEN 'uppsala'
  WHEN 'Ångermanland' THEN 'uppsala'
  ELSE NULL END
AND e.diocese_id IS NULL;

INSERT INTO public.church_diocese_history (church_id, diocese_id, from_year, to_year, note, source)
SELECT e.id, (SELECT id FROM dioceses WHERE code='lund'), 1103, 1164,
       'Under ärkestiftet Lund innan Uppsala blev eget ärkestift', 'kyrkohistorisk baslinje'
FROM public.ecclesiastical_sites e WHERE e.kind='parish_church' AND e.diocese_id IS NOT NULL;

INSERT INTO public.church_diocese_history (church_id, diocese_id, from_year, to_year, note, source)
SELECT e.id, e.diocese_id, 1164, 1531,
       'Under Uppsala ärkestift (katolsk tid) fram till reformationen', 'kyrkohistorisk baslinje'
FROM public.ecclesiastical_sites e WHERE e.kind='parish_church' AND e.diocese_id IS NOT NULL;

INSERT INTO public.church_diocese_history (church_id, diocese_id, from_year, to_year, note, source)
SELECT e.id, e.diocese_id, 1531, NULL,
       'Efter reformationen: svenska (evangelisk-lutherska) kyrkan, Laurentius Petri ärkebiskop 1531', 'reformationsbrott'
FROM public.ecclesiastical_sites e WHERE e.kind='parish_church' AND e.diocese_id IS NOT NULL;
