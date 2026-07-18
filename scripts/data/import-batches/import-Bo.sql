-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap Bo, 15 rader).
-- 15 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
($$c1e0a283-9fda-4512-8fff-ace170037b17$$,$$Bo NIYR5;221B$$,$$Bo NIYR;2|L 1975$$,57.9104,11.9121,$$raþe sa er kan namn orklaski<þorbiarn> k^r^a^k(?)$$,$$Ráði sá er kann nafn "Þorbjǫrn "Krák(?)$$,NULL,$$Interpret he who can the name Þorbjǫrn Krák(?).$$,$$Ca. 1100$$,$$Tidigare signum Bo NIYR;2.$$,$$Dopfunt$$,$$Sten$$,$$Bohuslän$$,$$Sweden$$),
($$dbbc0ac6-357e-494e-a9de-6c5b0ffb6318$$,$$Bo KJ80$$,$$KJ 80|L 2033|Bo Krause1966;70$$,58.0661,11.7345,$$ʜariwulfs/ʜariþulfs · staina-$$,$$"Hreiðulfs/"Herjulfs steina[r].$$,NULL,$$Hreiðulfr's/Herjulfr's stones.$$,$$Tidigvikingatida$$,$$Ristningen är mycket grund.$$,$$Runsten$$,$$Glimmeraktig gnejs$$,$$Bohuslän$$,$$Sweden$$),
($$1cbff4ce-16bc-40d4-b5dd-a93114d59014$$,$$Bo Boije5$$,$$L 2035$$,58.4456,11.3753,$$…$$,$$…$$,NULL,$$…$$,NULL,$$Enligt Tham (1794) är runorna blandade med andra tecken. Ännu ej runologiskt granskad.$$,$$2 fragment av runsten$$,$$Sandsten$$,$$Bohuslän$$,$$Sweden$$),
($$476cca88-fac3-44fe-a0d2-69e72476819f$$,$$Bo NIYR5;229A$$,$$Bo NIYR;6$$,57.8992,11.9337,$$· iams/iamc ·$$,$$"Jamts$$,NULL,$$Jamtr's$$,NULL,$$Tidigare signum Bo NIYR;6.$$,$$Fragment av stenåldersyxa$$,$$Sten$$,$$Bohuslän$$,$$Sweden$$),
($$d7d4916a-e175-443a-9343-aca70a7c5e83$$,$$Bo Boije4$$,$$Bo Boije$$,58.9373,11.28,$$§A fulk- §B (i)su(k) §C (k)(i)(l)fihʀ §D ftinun iþ(n)(i)n(u)fo(i)$$,$$§A … §B … §C … §D … …$$,NULL,$$§A … §B … §C … §D …$$,$$700–800-talet$$,$$Runföljden kilfihR placeras under Otolkade belägg i NRL, s. 299.$$,$$Runsten$$,$$Biotitglimmerskiffer$$,$$Bohuslän$$,$$Sweden$$),
($$01d15d22-c599-42f9-b3b6-86d860f36087$$,$$Bo NIYR5;221A$$,$$L 1676|Bo NIYR;1$$,58.3956,11.5006,$$ma^ria mær h[ia^l]be þæim er þena stæin kerþe$$,$$"María mær hjalpi þeim er þenna stein gerði.$$,NULL,$$Mary the maid may help him who made this stone.$$,NULL,$$Tidigare signum Bo NIYR;1. Ytterligare 2 hällar av kistan finns i tornet, den ena uppe vid kyrkklockan. Ornamentik i relief.$$,$$Gravhäll av eskilstunakista$$,$$Granit$$,$$Bohuslän$$,$$Sweden$$),
($$e359bf28-9e2f-465c-bed0-00dd960dd354$$,$$Bo Peterson1992$$,$$L 2034|N A14$$,58.1592,11.699,$$ʜauʀ/iauʀ i · am · tain won/þon iar o mul^a ·$$,$$"Hǫr/"Jór í "Ám stein vann/þann hér á múla.$$,NULL,$$Hǫr/Jór in Ár made the stone here on the muzzle. / Hǫr/Jór in Ár (made) this stone here on the muzzle.$$,$$800-talet$$,$$Kung Ramunders häll. Källström (2007a:416) har en avvikande läsning: iiauRi · am · tain þon iarbmul^n ·$$,$$Runsten$$,$$Glimmerhaltig gnejs$$,$$Bohuslän$$,$$Sweden$$),
($$b3c04839-c62d-464b-9612-d78930e8b227$$,$$Bo KJ73$$,$$KJ 73|Bo Krause1966;73A$$,58.667,11.2488,$$ek hra(z)az/hra(þ)az satido -tain ¶ ana----(r) ¶ swabaharjaz ¶ s-irawidaz ¶ … stainawarijaz fahido$$,$$Ek "Hrazaz/"Hraþaz satido [s]tain[a] … "Swabaharjaz s[a]irawidaz. … "Stainawarijaz fahido.$$,NULL,$$I, Hrazaz/Hraþaz raised the stone … Swabaharjaz with wide wounds. … Stainawarijaz carved.$$,$$160–375/400 (Imer 2007)$$,$$Eventuellt är första två raderna ristade av en annan ristare vid ett senare tillfälle.$$,$$Runsten$$,$$Granit$$,$$Bohuslän$$,$$Sweden$$),
($$70a83aee-bf96-4564-b98c-8be7f5f5fe2c$$,$$Bo KJ61$$,$$KJ 61|L 2064|Bo Krause1966;73B$$,58.7164,11.3333,$$þrawijan · haitinaz was$$,$$"Þrawijan haitinaz was.$$,NULL,$$Yearning was imposed (on him). / Þrawija's (monument). (I/he) was commanded/called. / (I/He) was promised to þrawija.$$,$$160–375/400 (Imer 2007)$$,NULL,$$Runsten$$,$$Granit$$,$$Bohuslän$$,$$Sweden$$),
($$6c70e017-54a2-4dac-8f49-812c46d14504$$,$$Bo NIYR5;222$$,$$L 1976|Bo NIYR;3$$,58.0533,11.853,$$suæn : kærþe <m>$$,$$"Sveinn gerði m[ik](?).$$,NULL,$$Sveinn made me(?).$$,$$Ca. 1100$$,$$Tidigare signum Bo NIYR;3. Återfanns sönderslagen på kyrkogården vid renovering 1847. Bild av Gunnar i ormgropen.$$,$$Fyrkantig dopfunt$$,$$Glimmer- eller talkskiffer$$,$$Bohuslän$$,$$Sweden$$),
($$5f8156bc-3069-4347-85cf-92dde167cc67$$,$$Bo NIYR5;225$$,$$Bo NIYR;5$$,57.849,11.9383,$$mkfþk-k-f$$,$$…$$,NULL,$$…$$,$$1100-talet$$,$$Tidigare signum Bo NIYR;5.$$,$$Trästav$$,$$Idegran$$,$$Bohuslän$$,$$Sweden$$),
($$15c9d622-81c2-4da7-a44c-f57d9286daf9$$,$$Bo NIYR5;229B$$,$$Bo NIYR;7$$,58.037,11.8849,$$fuþor{K}hniastbmlyøkhp : ion : a mik$$,$$<fuþor{k}hniastbmlyøqxp> "Jón á mik.$$,NULL,$$<fuþorkhniastbmlyøqxp> Jón owns me.$$,NULL,$$Tidigare signum Bo NIYR;7.$$,$$Trissa, ev del av besman$$,$$Täljsten$$,$$Bohuslän$$,$$Sweden$$),
($$62222c10-addc-49f5-8b39-d453df6dd356$$,$$Bo Fv1992;170$$,NULL,57.849,11.9383,$$…$$,$$…$$,NULL,$$…$$,NULL,$$Runorna är mycket svårlästa, ingen läsning och tolkning har ännu gjorts. Svaga tunna ristade linjer där några runor, i (2 st), r (2), a (1), k (1-2), t (1) och ev. en þ-runa, kan identifieras$$,$$Rester av kam$$,$$Ben/horn$$,$$Bohuslän$$,$$Sweden$$),
($$5714e8d9-5753-44e5-8bb9-9ef96dbb67c8$$,$$Bo NIYR5;224$$,$$Bo NIYR;4$$,58.3387,11.7669,$$asa fu(þ)or/fu(u)or$$,$$"Ása/ása …$$,NULL,$$Ása/the gods …$$,NULL,$$Tidigare signum Bo NIYR;4. Tätt inpå en hällristning.$$,$$Berghäll$$,$$Sten$$,$$Bohuslän$$,$$Sweden$$),
($$e4378cc2-6db3-43b0-87fa-ced0c328c9da$$,$$Bo KJ47$$,$$IK 181|Bo Krause1966;47|KJ 47$$,58.5614,11.5598,$$§A ssigaduz §B …$$,$$§A "Sig[ih]aþuz/"S[i]siga[n]duz §B …$$,NULL,$$§A Sigihaþuz/Sisiganduz §B …$$,$$Ca. 450–550$$,$$Funnen i slutet av 1800-t i en brandurna.$$,$$Medaljong$$,$$Guld$$,$$Bohuslän$$,$$Sweden$$)
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
