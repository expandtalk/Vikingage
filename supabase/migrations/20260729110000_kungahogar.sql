-- Kungahögar/storhögar → heritage_sites. Anundshög + Hågahögen var HÅRDKODADE utflykter i
-- src/data/excursions.ts (kurerade koord); flyttas hit så de blir sökbara som fornlämningar.
-- Skalunda hög + Gamla Uppsala östhög har FMIS-verifierade koordinater (K-samsök). Kunga-
-- traditioner märkta "traditionellt" (tolkning ≠ fakta).

insert into public.heritage_sites
  (raa_type, name, landscape, municipality, parish, lat, lng, period, existence, description,
   source_uri, register_system, register_id)
values
 ('hög', 'Anundshög', 'Västmanland', 'Västerås', 'Badelunda', 59.6103, 16.6469,
  'Järnålder–vikingatid (hög ca 500–1000-tal e.Kr.)', 'extant',
  'En av Sveriges största storhögar (~60–64 m diameter, ~9 m hög), vid Badelunda öster om Västerås. Ingår i ett stort gravfält med skeppssättningar och en runsten (Vs 13). Vid högen gick Eriksgatan. Traditionellt förknippad med sagokungen (Bröt-)Anund av Ynglingaätten — inte tillförlitligt. Koordinat: kurerad (Wikipedia).',
  'raa:anundshog', 'RAÄ Fornsök', 'Badelunda 431:1'),

 ('hög', 'Hågahögen (Kung Björns hög)', 'Uppland', 'Uppsala', 'Bondkyrko', 59.8497, 17.5878,
  'Bronsålder (ca 1000 f.Kr.)', 'extant',
  'Skandinaviens guldrikaste bronsåldersgrav, i Hågadalen väster om Uppsala (~7 m hög, ~45 m diameter): stenröse under fyra meter grästorv, ca 7 500 mansdagars arbete. Utgrävning 1902–03 (Almgren) gav mer än en tredjedel av allt känt guld från Sveriges bronsålder (bl.a. det berömda guldspännet, stulet 1986). Traditionellt "Kung Björns hög". Tolkas som föregångare till Gamla Uppsala. Koordinat: kurerad (Wikipedia).',
  'raa:hagahogen', 'RAÄ Fornsök', 'Bondkyrko 74:1'),

 ('hög', 'Skalunda hög', 'Västergötland', 'Lidköping', 'Skalunda', 58.55252, 13.00359,
  'Yngre järnålder (folkvandringstid–vendeltid)', 'extant',
  'En av Västergötlands största gravhögar, vid Vänern. Traditionellt knuten till kungar/jättar i folksägen. Koordinat: FMIS/K-samsök.',
  'raa:skalunda-hog', 'RAÄ Fornsök', null),

 ('hög', 'Östhögen, Gamla Uppsala (Kungshögarna)', 'Uppland', 'Uppsala', 'Gamla Uppsala', 59.89985, 17.63401,
  'Vendeltid (ca 500–600-tal e.Kr.)', 'extant',
  'En av de tre stora Kungshögarna i Gamla Uppsala (Östhögen, Mellanhögen/Odens hög, Västhögen/Tors hög) — rikets forntida kult- och maktcentrum. Traditionellt knutna till Ynglingakungarna Aun, Egil och Adils (Snorre). Koordinat: FMIS/K-samsök (östhögen); de tre högarna ligger tätt.',
  'raa:gamla-uppsala-osthog', 'RAÄ Fornsök', null)
on conflict (source_uri) do nothing;
