-- Verifierade skeppssättningar från Wikidata (P31 = Q1433492 "stone ship", Sverige, med
-- koordinat). Type-korrekt breddning: RAÄ KMR saknar lämningstyp 'skeppssättning' (de ligger
-- under Stenkrets/stenrad + Gravfält), så vi kurerar de verifierade ur Wikidata (CC0,
-- auktoritativa koordinater). Ersätter den tömda fritext-skeppssättningen. source_uri = QID.
INSERT INTO public.heritage_sites (raa_type, name, municipality, lat, lng, period, description, source_uri)
SELECT 'skeppssättning', v.name, v.muni, v.lat, v.lng,
       'sen bronsålder till järnålder',
       'Verifierad skeppssättning. Källa: Wikidata ' || v.qid || ' (CC0).',
       'wikidata.org/wiki/' || v.qid
FROM (VALUES
  ('Q686510',   'Ales stenar',                       'Ystad',          55.3827, 14.0544),
  ('Q1439544',  'Askeberga skeppssättning',          'Skövde',         58.5750, 13.9839),
  ('Q30929413', 'Blomsholms skeppssättning',         'Strömstad',      58.9740, 11.2491),
  ('Q668787',   'Gannarve skeppssättning',           'Gotland',        57.3479, 18.1922),
  ('Q1551283',  'Gettlinge gravfält',                'Mörbylånga',     56.3878, 16.4342),
  ('Q1742588',  'Gnisvärds skeppssättningar',        'Gotland',        57.5083, 18.1408),
  ('Q1551330',  'Gålrums gravfält',                  'Gotland',        57.3291, 18.6573),
  ('Q1551334',  'Hjortahammar',                      'Ronneby',        56.1685, 15.4611),
  ('Q1551286',  'Hjortsberga gravfält',              'Ronneby',        56.2186, 15.4060),
  ('Q10535552', 'Inglinge hög',                      'Växjö',          56.7461, 14.9095),
  ('Q29405800', 'Noaks Ark',                         'Borgholm',       56.7756, 16.6258),
  ('Q1551355',  'Nässja skeppssättning',             'Vadstena',       58.4653, 14.8133),
  ('Q10649627', 'Rannarveskeppen',                   'Gotland',        57.3961, 18.2239),
  ('Q10657832', 'Runsa skeppssättning',              'Upplands Väsby', 59.5637, 17.8317),
  ('Q2235274',  'Skeppssättningen i Södra Ugglarp',  'Lund',           55.6373, 13.4138),
  ('Q30055412', 'Skeppssättningen vid Mjösjön',      'Umeå',           63.7564, 20.3672),
  ('Q948189',   'Stenheds skeppssättning',           'Simrishamn',     55.5400, 14.1509),
  ('Q2437390',  'Tjelvars grav',                     'Gotland',        57.6279, 18.7325),
  ('Q653109',   'Vätteryds gravfält',                'Hässleholm',     56.0164, 13.6672),
  ('Q1446707',  'Åsa gravfält',                      'Strängnäs',      59.3903, 17.1880)
) AS v(qid, name, muni, lat, lng)
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.source_uri = 'wikidata.org/wiki/' || v.qid);
