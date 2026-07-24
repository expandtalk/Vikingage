-- 20260724200000_runestone_classifier.sql
-- EN sanningskälla för vad som räknas som "runsten" (rest/tillhuggen stenmonument
-- med runinskrift). runic_inscriptions.object_type är okontrollerad (1053 varianter),
-- så definitionen är ett dokumenterat, källkritiskt predikat — INTE en gissad siffra.
--
-- Definition (strikt, runologisk praxis): object_type anger någon form av runsten,
-- inkl. fragment ("Fragment av runsten"), prisma-/bildstensform ("Runsten i
-- bildstensform", "Runsten i form av femsidigt prisma") och engelska "runestone".
-- MEDVETET UTANFÖR: gravhällar (liggande), fast häll/berg/jordfast block (levande
-- berg), stenkors, fristående bildstenar, byggnadssten (mursten/tegel/kvader), samt
-- alla lösa artefakter (ben, trä, metall, mynt, brakteater). Även object_type=NULL
-- (780 st) och tvetydig bar "sten" (64) hålls utanför — konservativt, ej påstått.
--
-- Utfall 2026-07-24: 2998 runstenar (SE 1988 / NO 700 / DK 278 / IS 19 / övr 13),
-- vilket matchar den nordiska konsensusen ~3000. Jfr 7920 = alla runinskrifter.

CREATE OR REPLACE FUNCTION public.is_runestone(p_object_type text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$
  SELECT p_object_type ILIKE '%runsten%' OR p_object_type ILIKE '%runestone%';
$$;

COMMENT ON FUNCTION public.is_runestone(text) IS
  'Sant om object_type anger en runsten (rest stenmonument m. runinskrift, inkl. fragment/prismaform). Sanningskälla för runstensräkning; se migration 20260724200000.';

CREATE OR REPLACE FUNCTION public.count_runestones()
RETURNS integer
LANGUAGE sql STABLE
AS $$
  SELECT count(*)::int FROM runic_inscriptions WHERE public.is_runestone(object_type);
$$;

COMMENT ON FUNCTION public.count_runestones() IS
  'Antal runstenar (strikt definition, se is_runestone). Skild från total runic_inscriptions.';

GRANT EXECUTE ON FUNCTION public.is_runestone(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_runestones() TO anon, authenticated;
