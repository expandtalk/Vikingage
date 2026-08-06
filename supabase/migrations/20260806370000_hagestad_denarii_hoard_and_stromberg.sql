-- Hagestad-skatten (romerska denarer) + arkeolog Märta Strömberg.
-- Applicerad i prod via MCP (repo-spegling). 2026-08-06. Fakta paraphraserade (Klein 1931/Wikipedia).
INSERT INTO public.coins (name, name_en, category, metal, denomination, period_start, period_end, find_place, coordinates, significance, description, sources)
SELECT 'Hagestad-skatten (romerska denarer)', 'The Hagestad hoard (Roman denarii)',
  'myntskatt', 'silver', 'denar', 54, 211,
  'Hagestad, Ystad kommun, Skåne', point(14.1389, 55.4278),
  'Ett av få stora fastlandsfynd av romerska denarer i Sverige',
  'Myntskatt med romerska denarer präglade under kejsare från Nero (54–68) till Septimius Severus (193–211), samt ett antal kejsarinnor under samma tid. En av få stora fastlandsfynd av romerska denarer; sammanställningen gjord i Statens historiska museum. Faktakälla: Ernst Klein 1931 (paraphraserad).',
  'Ernst Klein 1931 (faktakälla); Wikipedia (koordinat)'
WHERE NOT EXISTS (SELECT 1 FROM public.coins c WHERE c.name = 'Hagestad-skatten (romerska denarer)');

INSERT INTO public.research_scholars (name, affiliation, role_title, active_period, biography, source)
SELECT 'Märta Strömberg', 'Lunds universitet', 'Arkeolog (professors namn 1978)', '1943–2012',
  'Svensk arkeolog (1921–2012) verksam vid Lunds universitet. Ledde Hagestadprojektet på Österlen (1960–70-tal) som kartlade sten-, brons- och järnålder i socknarna Hagestad, Valleberga och Ingelstorp i ett långtidsperspektiv (megalitgravar, gravfält, boplatser). Professors namn 1978, Monteliusmedaljen 2002.',
  'allmänt belagt (Wikipedia)'
WHERE NOT EXISTS (SELECT 1 FROM public.research_scholars rs WHERE rs.name = 'Märta Strömberg');
