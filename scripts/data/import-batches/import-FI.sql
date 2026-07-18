-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap FI, 6 rader).
-- 6 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
-- Dedup: WHERE NOT EXISTS på signum + ON CONFLICT(id). Ren data, idempotent. Kör i editorn.
insert into public.runic_inscriptions
  (id, signum, alternative_signum, coordinates, coord_source, coord_confidence,
   transliteration, normalization, translation_sv, translation_en, dating_text,
   scholarly_notes, object_type, material, landscape, country, data_source)
select
  v.id::uuid, v.signum,
  case when v.alt is not null then string_to_array(v.alt,'|') else null::text[] end,
  case when v.lat is not null then point(v.lng::float8, v.lat::float8) else null::point end,
  case when v.lat is not null then 'rundata_evighetsrunor' else null end,
  case when v.lat is not null then 'high' else null end,
  v.translit, v.norm, v.tsv, v.ten, v.dating, v.notes, v.otype, v.material, v.landscape,
  coalesce(v.country,'Sweden'), 'rundata_evighetsrunor'
from (values
($$befa0e1e-273d-45b9-8a48-769e3843661f$$,$$FI Harjula2016;218$$,NULL,60.451,22.278,$$a^u^æ ma^ria^ ^gr¶a^kia$$,$$Ave Maria gratia$$,NULL,$$Ave Maria gratia$$,$$Mitten av 1300-talet – början av 1400-talet$$,$$Hittad 1998. Läses nerifrån och upp.$$,$$Laggkärlsbotten$$,$$Trä$$,NULL,$$Sweden$$),
($$5f395b70-9325-4a80-8a3a-faabe0052137$$,$$FI NOR1998;14$$,$$X FiNOR1998;14$$,59.94,22.5,$$…si : raþi : ma… …- · þorfas… …$$,$$… Raði ma[ðr](?) … "Þorfas[t] …$$,NULL,$$… interpret man(?) … Þorfastr …$$,NULL,NULL,$$Fragment av runsten$$,$$Jotnisk sandsten$$,NULL,$$Sweden$$),
($$4b9d90fa-1c1d-47d4-ad55-be3054671718$$,$$FI SAO1987;38$$,$$X FiSAO1987;38$$,61.6491,27.2564,$$§A botui §B (h)eui a mik$$,$$§A "Botvi §B "Hægvi a mik.$$,NULL,$$§A Bótvé §B Hegvé owns me.$$,$$1000-talet$$,$$Föremålsform och namnen visar att spännet har gotländskt ursprung.$$,$$Spänne$$,$$Silver$$,NULL,$$Sweden$$),
($$e8b51135-b608-498e-8d53-51c6677afac3$$,$$FI Harjula2016;220$$,NULL,60.45,22.274,$$a^u^æ ma^ria^ ^agra^kia ¶ bl^æna^ ^tominu¶s$$,$$Ave Maria, gratia plena, Dominus.$$,NULL,$$Ave Maria, gratia plena, Dominus.$$,$$Före 1450$$,$$Hittad 1992.$$,$$Laggkärlsbotten$$,$$Trä$$,NULL,$$Sweden$$),
($$b49b8fe2-7e31-4639-a89f-ece784c49309$$,$$FI Harjula2016;222$$,NULL,60.451,22.276,$${B} ual^æ$$,$$Bene vale$$,NULL,$$Live well!$$,$$Mitten av 1300-talet – mitten av 1400-talet$$,$$Hittad 1986-87.$$,$$Laggkärlsbotten$$,$$Trä$$,NULL,$$Sweden$$),
($$0955bf2d-b42b-4345-aee1-6d8a5af705e3$$,$$FI Harjula2019;247$$,NULL,60.451,22.278,$$a^u^æ$$,$$Ave$$,NULL,$$Ave$$,$$Mitten av 1300-talet – 1400-talet$$,$$Hittad 1998.$$,$$Kam$$,$$Hjorthorn$$,NULL,$$Sweden$$)
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
