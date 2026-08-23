-- answer_bundle_geo — EN center-gatad aggregat-RPC i st.f. 3 separata round-trips i AnswerContext
-- (befästningar/fortifications_near, äventyr/nearby_experiences + grott-bbox).
-- Minskar söksvarets fläkt av DB-anrop. Anropar de BEFINTLIGA funktionerna internt → återanvänder
-- exakt deras utdataform (ingen dubblerad logik, ingen driftrisk mot enskild-anrops-varianten).
-- Radierna är hårdkodade till samma värden som frontend redan använde: forts 3 km,
-- experiences 25 km (p_ignore_season=true → platsforskning visar allt året runt), grottor bbox ±0,28°/±0,45°.
-- landmarks_for_place ingår MEDVETET INTE: det matchar även på place_context utan center och behåller
-- därför sitt eget namn-gatade anrop. pages_near ingår inte heller: dess frontend-resultat (regionPages)
-- var död kod (hämtades men renderades aldrig) → togs bort i samma ändring, inte konsoliderat.
-- SECURITY INVOKER; underliggande tabeller har publik läs-RLS, nearby_experiences är SECURITY DEFINER
-- (kör med egna rättigheter). anon/authenticated EXECUTE.
create or replace function public.answer_bundle_geo(
  p_lat double precision, p_lng double precision)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'forts', coalesce((select jsonb_agg(to_jsonb(f))
        from fortifications_near(p_lat, p_lng, 3000) f), '[]'::jsonb),
    'experiences', coalesce((select jsonb_agg(to_jsonb(e))
        from nearby_experiences(p_lat, p_lng, 25, 80, true) e), '[]'::jsonb),
    'caves', coalesce((select jsonb_agg(jsonb_build_object(
          'id', hs.id, 'name', hs.name, 'raa_type', hs.raa_type, 'lat', hs.lat, 'lng', hs.lng))
        from (
          select id, name, raa_type, lat, lng
          from heritage_sites
          where lat between p_lat - 0.28 and p_lat + 0.28
            and lng between p_lng - 0.45 and p_lng + 0.45
            and raa_type ilike '%grott%' and lat is not null
          limit 60) hs), '[]'::jsonb)
  );
$$;
revoke all on function public.answer_bundle_geo(double precision, double precision) from public;
grant execute on function public.answer_bundle_geo(double precision, double precision) to anon, authenticated;
