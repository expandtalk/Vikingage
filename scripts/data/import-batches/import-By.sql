-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap By, 4 rader).
-- 4 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
($$8ff5e9e2-c0ae-422f-b298-40b65837f756$$,$$By Futhark2016;103$$,NULL,41.0087,28.9791,$$a^r(i)(n)ba^rþr r^a(s)(t) runa^r þasi$$,$$"Arinbárðr reist rúnar þessar.$$,NULL,$$Arinbárðr carved these runes.$$,$$Ca. 1050–1150$$,NULL,NULL,$$Marmor$$,NULL,$$Sweden$$),
($$bf78b524-364b-4b74-96ed-9ef5fba28db9$$,$$By Fv1970;248$$,$$X ByFv1970;248$$,41.0087,28.9791,$$(a)lftan ---t----l-a-----$$,$$"Halfdan …$$,$$Halvdan …$$,$$Halfdan …$$,NULL,$$Första runan skulle kunna vara rester av en h-runa. Läst efter teckning i Fornvännen s. 248. Wiktorsson 2017 läser alftan ik t(r)…k -ikil i miklak, vilket han menar kan tänkas tolkas Halvdan högg, ung man stor i Miklagård.$$,NULL,$$Marmor$$,NULL,$$Sweden$$),
($$e650e124-0a98-433b-ad99-0651f2e71f6e$$,$$By NOR1999;26$$,$$X ByNOR1999;26$$,41.0087,28.9791,$$arni$$,$$"Árni$$,$$Arne$$,$$Árni$$,NULL,$$Upptäckt 1975. Mats G. Larsson läser ari : k... (Fornvännen 1989:12ff, http://fornvannen.se/pdf/1980talet/1989_012.pdf).$$,NULL,$$Marmor$$,NULL,$$Sweden$$),
($$77c0edff-a092-429f-902f-6561a24dd8cc$$,$$By NT1984;32$$,$$X ByNT1984;32|L 2053$$,45.4346,12.35,$$§A … : (h)(i)(a)(k)(u) þ(i)(r) (h)(i)lfniks (m)i(n) -----… ¶ … (e)(n) i hafn þesi þir (m)(i)(n) i-ku runar at (h)a(u)-sa buta -…(h)(u)(a)-… ¶ … --þ^u s^uiar þ(e)ta| |a l^einu ¶ … f…- aþr gailt^ ^uan kear(u)- §B tr(i)ki(r) ⁓ ris(t) r(u)(n)(i)(r) … §C (:) a(s)(m)un(t)r × ri(s)(t)(i) (×) … …(n)(a)r þisar × þair × is(k)-… … (þ)(u)(r)l(i)f(r) ---- auk × - (×) -…-o-…---(t)-… ¶ -ufru(k)…r…(s)--…--…uanf(a)(r)(n) ×$$,$$§A … hioggu(?) þæiʀ hælfnings mænn … … en i hafn þessi þæiʀ mænn hi[o]ggu(?) runaʀ at "Hau[r]sa bonda …hva[tan](?) … [Re]ðu(?) sviar þetta a leiun. … F[ioll](?)/F[ors](?) aðr giald vann gærv[a]. §B Drængiaʀ ristu runiʀ … §C "Asmundr risti … [ru]naʀ þessaʀ þæiʀ "Æsk[ell](?) … "Þorlæifʀ(?) … ok … … …$$,NULL,$$§A … they cut(?), the troops men … but in this harbour the men cut runes in memory of Haursi, a … vigorous(?) husbandman … Swedes arranged(?) this on the lion … He fell(?)/perished(?) before he could gain payment. §B Valiant men carved the runes … §C Ásmundr carved … the runes, they Áskell(?) … Þorleifr(?) … and …$$,NULL,$$De tre inskrifterna har ristats vid olika tillfällen.$$,$$Lejonfigur$$,$$Marmor$$,NULL,$$Sweden$$)
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
