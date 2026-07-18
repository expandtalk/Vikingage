-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap RU, 5 rader).
-- 5 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
($$13f508b0-383e-4829-874c-f1d610f7a78e$$,$$RU Melnikova2001;196$$,$$X RyMelnikova2001;196$$,57.9834,30.0298,$$§A þamuþ runaʀ is ¶ (o)(m)(u)þalþm(k)fa §B unþʀuþi(o)þa(t) ¶ haþaʀnaki(f)a(k)$$,$$§A … rúnar(?) … … §B … …$$,NULL,$$§A … runes(?) … §B …$$,$$800–900-talet$$,NULL,$$Amulett$$,$$Koppar$$,NULL,$$Sweden$$),
($$a3ea6467-ed47-4c75-bd45-5bc8aee2eb92$$,$$RU Melnikova2001;251$$,$$X RyMelnikova2001;251$$,57.9834,30.0298,$$…khniastbmlʀ$$,$$<[fuþor]khniastbmlʀ>$$,NULL,$$<fuþorkhniastbmlʀ>$$,$$1000–1050$$,$$Hittat 1958.$$,$$Runben, fragment$$,$$Ben$$,NULL,$$Sweden$$),
($$c222c751-6b39-431b-86b8-9b6b59845f1f$$,$$RU Melnikova2001;189$$,$$X RyMelnikova2001;189$$,57.9834,30.0298,$$????????????$$,$$…$$,NULL,$$…$$,$$Omkring 1000$$,$$Läst efter foto. Lönnrunorna återfinns på B-sidan av RU Melnikova2001;181.$$,$$Amulett$$,$$Brons$$,NULL,$$Sweden$$),
($$95a7ea9a-17f0-48aa-ad9b-cf54bc7cc26c$$,$$RU Melnikova2001;181$$,$$X RyMelnikova2001;181$$,57.9834,30.0298,$$§A ????i????? §B ????????????$$,$$§A … §B …$$,NULL,$$§A … §B …$$,$$Omkring 1000$$,$$Läst efter foto. B-sidans sekvens av lönnrunor återfinns på RU Melnikova2001;189.$$,$$Amulett$$,$$Brons$$,NULL,$$Sweden$$),
($$c39ef41e-ad7c-425b-99d2-788db910b30e$$,$$RU NLT2004;5$$,$$X RyNLT2004;5$$,59.9944,32.296,$$… …(t) ufir uf uaʀiþʀ hali ual-(ʀ) ri-s fron(m)ona -rot fibulsini bluka$$,$$… [hel]t yfir, of variðr halli vall[a]r rí[f]s, frán-manna [g]rend fimbul-sinni plóga.$$,NULL,$$… (and) steered - surrounded by the slope - down to the fertile pastureground - across the valiant men's neigbourhood a great following of plows.$$,$$Ca. 800$$,$$Funnen 1950.$$,$$Sländten$$,$$Gran$$,NULL,$$Sweden$$)
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
