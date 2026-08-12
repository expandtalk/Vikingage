-- Eriksgatan-sidan: utpekade platser som road_landmarks (datadrivet, källbelagt) + hålvägar i
-- eriksgata_nearby-RPC. Coord Östanbro/Ramundeboda VERIFIERADE (Daniel, Wikipedia P625/DMS);
-- Mora/Rök flyttade från hårdkodad FEATURED. Text: fakta ur Wikipedia (CC BY-SA)/länsstyrelsen, ej verbatim.
INSERT INTO road_landmarks (road_id, name, name_en, landmark_type, coordinates, description, historical_significance)
SELECT r.id, v.name, v.name_en, v.ltype, point(v.lng, v.lat), v.descr, v.signif
FROM viking_roads r, (VALUES
  ('Mora stenar (kungavalsplats)','Mora stones (royal election)','junction', 17.78080, 59.79774,
   'Vid Mora ängar (Lagga sn) valdes och "togs till kung" den nyvalde innan Eriksgatan reds. Endast fragment av Mora stenar är bevarade (Historiska museet). Exakt läge osäkert (location_hypotheses).',
   'Startpunkt för Eriksgatan enligt Upplandslagens konungabalk.'),
  ('Rökstenen (Ög 136)','The Rök stone','runestone', 14.7756, 58.2956,
   'Världens längsta runinskrift (~800-tal), rest nära Eriksgatan i Östergötland. Källa: Rundata.',
   'Ikonisk vägsten längs Eriksgatan i Östergötland.'),
  ('Östanbro (Östens bro)','Ostanbro (Osten bridge)','bridge', 16.8669, 59.6194,
   'By vid Sagån, gräns mot Uppland; Östens bro nämns i Västmannalagen. Kung Östens hög och kung Skutes hög låg på var sin sida om den gamla farleden vid gränsen. Enligt brev 1504 (Svante Nilsson Sture) kungsgård under medeltiden. Källa: Wikipedia / Björksta hembygdsförening (CC BY-SA), fakta återgivna.',
   'Landskapsgräns Västmanland–Uppland på Eriksgatan (Sagån), nämnd i landslagarna.'),
  ('Ramundeboda kloster','Ramundeboda priory','resting_place', 14.5431, 58.9708,
   'Antoniterordens enda svenska konvent (känt 1475–ca 1530), vid Borasjön i Tiveden på gränsen Närke/Västergötland. Viktig rastplats där västgötarna lämnade kungen till närkingarna. Fornlämning Laxå 8, riksintresse för kulturmiljövården. Källa: Länsstyrelsen Örebro / Wikipedia (CC BY-SA), fakta återgivna.',
   'Namngiven anhalt på Eriksgatan (landslagarna); Närke/Västergötland-gräns.')
) AS v(name, name_en, ltype, lng, lat, descr, signif)
WHERE r.name='Eriksgatan'
  AND NOT EXISTS (SELECT 1 FROM road_landmarks rl WHERE rl.road_id=r.id AND rl.name=v.name);

-- eriksgata_nearby: lägg till 'halvagar' (heritage is_halvag inom radie av leden). 117 st inom 1,5 km.
CREATE OR REPLACE FUNCTION public.eriksgata_nearby(radius_m double precision DEFAULT 1000, church_radius_m double precision DEFAULT 500)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  with wl as (
    select ST_SetSRID(ST_MakeLine(ST_MakePoint((w.coordinates)[0],(w.coordinates)[1]) order by w.waypoint_order),4326)::geography g
    from road_waypoints w join viking_roads r on r.id=w.road_id where r.name='Eriksgatan'
  )
  select json_build_object(
    'runestones', (
      select coalesce(json_agg(json_build_object('signum',ri.signum,'lat',(ri.coordinates)[1],'lng',(ri.coordinates)[0])),'[]'::json)
      from runic_inscriptions ri, wl
      where ri.coordinates is not null
        and ST_DWithin(ST_SetSRID(ST_MakePoint((ri.coordinates)[0],(ri.coordinates)[1]),4326)::geography, wl.g, radius_m)
    ),
    'churches', (
      select coalesce(json_agg(json_build_object('name',e.name,'type',e.kind,'lat',e.lat,'lng',e.lng)),'[]'::json)
      from ecclesiastical_sites e, wl
      where e.geom is not null
        and (e.built_from is null or e.built_from<=1550 or e.dating_class ilike '%medeltid%')
        and ST_DWithin(e.geom::geography, wl.g, church_radius_m)
    ),
    'halvagar', (
      select coalesce(json_agg(json_build_object('name',h.name,'lat',h.lat,'lng',h.lng)),'[]'::json)
      from heritage_sites h, wl
      where h.lat is not null and h.is_halvag
        and ST_DWithin(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography, wl.g, radius_m)
    )
  );
$function$;
