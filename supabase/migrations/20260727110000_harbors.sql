-- Historiska hamnar (hamnar/vattenområden) som eget tematiskt lager. Knyter an till
-- strandförskjutnings-subsystemet (paleo_shorelines, strandkontroll): flera medeltida
-- hamnar ligger idag på torra land eftersom strandlinjen dragit sig tillbaka / staden flyttat.
--
-- OBS (Daniels stompunkt-fråga): Stockholms Hamnars ~200 geodetiska stompunkter är MODERN
-- mätinfrastruktur (3D-lägen för byggprojekt), inte kulturhistoria — de ingår medvetet INTE.
-- Det värdefulla är hamnarna som historiska platser + deras strandförskjutningshistoria.
--
-- INTEGRITET: koordinat = verifierad ankarpunkt (Nominatim). Den historiska hamnens
-- UTBREDNING beskrivs i text (approx_extent), inte som påhittad polygon.

CREATE TABLE IF NOT EXISTS public.harbors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  harbor_type text,                    -- medieval_trade | naval | viking | modern
  period_start integer,
  period_end integer,
  lat double precision,
  lng double precision,
  geom geometry(Point, 4326) GENERATED ALWAYS AS (
    CASE WHEN lat IS NOT NULL AND lng IS NOT NULL
         THEN ST_SetSRID(ST_MakePoint(lng, lat), 4326) END
  ) STORED,
  approx_extent text,                  -- textbeskrivning av hamnens utbredning
  shoreline_note text,                 -- hur strandförskjutning/stadsflytt påverkat läget
  current_status text,                 -- vad platsen är idag
  description text,
  description_en text,
  sources text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.harbors ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='harbors' AND policyname='harbors public read') THEN
    CREATE POLICY "harbors public read" ON public.harbors FOR SELECT USING (true);
  END IF;
END $$;

INSERT INTO public.harbors
  (name, name_en, harbor_type, period_start, period_end, lat, lng, approx_extent, shoreline_note, current_status, description, description_en, sources)
SELECT * FROM (VALUES
  ('Kalmar gamla hamn', 'Old harbour of Kalmar', 'medieval_trade', 1200, 1650,
   56.66000::double precision, 16.35850::double precision,
   'Systraströmmen och området vid den gamla staden intill slottet och medeltidskyrkan (Gamla stan, fastlandssidan) — före stadsflytten till Kvarnholmen.',
   'Kalmars medeltida stad och hamn låg på fastlandet vid slottet och S:ta Gertruds/gamla kyrkan, med hamnläge mot Systraströmmen. Efter branden 1647 och av försvarsskäl flyttades staden 1651–1658 ut till ön Kvarnholmen, där den befästa hamnen ännu ligger. Landhöjning + medveten stadsflytt gör att den gamla hamnbassängen delvis är igenslammad/land idag.',
   'Delvis land/park i Gamla stan; slottet kvar. Nuvarande hamn på Kvarnholmen.',
   'Kalmars ursprungliga hamn — en av rikets viktigaste östersjöhamnar under medeltiden, i skydd av Kalmar slott vid Kalmarsund. Kalmarunionen (1397) beseglades här. Hamnen betjänade den gamla staden på fastlandet innan hela staden revs och flyttades till Kvarnholmen mitten av 1600-talet.',
   'Kalmar''s original harbour — one of the realm''s most important Baltic ports in the Middle Ages, sheltered by Kalmar Castle at the Kalmar Sound. The Kalmar Union (1397) was sealed here. It served the old mainland town before the entire town was demolished and moved to Kvarnholmen island in the mid-17th century.',
   'Nominatim (Kalmar slott, ankarpunkt); historisk stadsflytt Kvarnholmen 1651–1658.'),

  ('Visby medeltidshamn (Almedalen)', 'Visby medieval harbour (Almedalen)', 'medieval_trade', 1100, 1400,
   57.64087::double precision, 18.29085::double precision,
   'Almedalen innanför ringmuren — idag park, under medeltiden en öppen hamnvik/lagun.',
   'Visbys blomstringstid som Hansestad byggde på hamnen vid Almedalen. Kombinationen av landhöjning och igenslamning gjorde att viken grundades upp och drog sig tillbaka; den medeltida hamnen är idag torr parkmark (Almedalen), medan modern hamn ligger utanför.',
   'Park (Almedalen); modern hamn strax SV.',
   'Gotlands och en av Östersjöns viktigaste medeltidshamnar — nav i Hansans handel. Den skyddade viken vid Almedalen låg innanför ringmuren; kajlägen och sjöbodar kantade stranden. När viken grundades upp förlorade Visby sitt naturliga hamnläge.',
   'Gotland''s — and one of the Baltic''s — foremost medieval harbours, a hub of Hanseatic trade. The sheltered inlet at Almedalen lay inside the town wall, lined with quays and boat-houses. As the inlet silted up Visby lost its natural harbour.',
   'Nominatim (Almedalen, ankarpunkt); strandförskjutning/igenslamning Gotland.'),

  ('Stockholms medeltidshamn (Skeppsbron)', 'Stockholm medieval harbour (Skeppsbron)', 'medieval_trade', 1250, 1600,
   59.32592::double precision, 18.07534::double precision,
   'Östra stranden av Stadsholmen (Gamla stan) längs nuvarande Skeppsbron/Kornhamn — kajläge mot Saltsjön.',
   'Stockholm grundades vid mitten av 1200-talet just där landhöjningen gjort passagen mellan Mälaren och Saltsjön grund nog att spärra och tullbelägga. Den medeltida strandlinjen låg innanför nuvarande Skeppsbron; senare utfyllnader (Skeppsbron 1630-tal och framåt) har flyttat kajen österut, så den medeltida hamnkanten ligger nu inne i kvarteren.',
   'Kaj/promenad (Skeppsbron); strandlinjen utfylld österut.',
   'Stockholms hamn kontrollerade porten mellan Mälaren och Östersjön — stadens hela existensberättigande. Kajerna längs Stadsholmens östsida tog emot Hansans och senare rikets sjöfart. Landhöjning och utfyllnader har successivt flyttat kajlinjen ut i Saltsjön.',
   'Stockholm''s harbour controlled the gateway between Lake Mälaren and the Baltic — the city''s entire reason for being. The quays along the east side of Stadsholmen received Hanseatic and later national shipping. Land uplift and infills have progressively pushed the quay line out into Saltsjön.',
   'Nominatim (Skeppsbron, ankarpunkt); Stockholms utfyllnadshistoria.')
) AS v(name, name_en, harbor_type, period_start, period_end, lat, lng, approx_extent, shoreline_note, current_status, description, description_en, sources)
WHERE NOT EXISTS (SELECT 1 FROM public.harbors h WHERE h.name = v.name);
