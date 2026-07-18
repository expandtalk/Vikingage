-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap Vr, 10 rader).
-- 10 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
($$e14acb19-1c17-4804-931e-24356f140a62$$,$$Vr 5$$,$$L 1981$$,59.2047,12.8148,$${IHS} petrus ⁓ kuratus ⁓$$,$$"{Iesus} "Petrus curatus$$,NULL,$${Iesus} Petrus curatus$$,$$Ca. 1350$$,$$latininskrift$$,$$Kyrkklocka$$,$$Malm$$,$$Värmland$$,$$Sweden$$),
($$249e2103-fff5-4b20-a5c6-67d18150b1bb$$,$$Vr NOR1995;19B$$,NULL,59.3125,13.99,$$+ kristin a mi{K}$$,$$"Kristin a mik.$$,NULL,$$Kristin owns me.$$,NULL,$$Fyndnr 986. Inskriften starkt sliten.$$,$$Sländtrissa$$,NULL,$$Värmland$$,$$Sweden$$),
($$a43bc746-10d7-499c-8395-081828f2edc2$$,$$Vr NOR1995;19A$$,NULL,59.3125,13.99,$$…$$,$$…$$,NULL,$$…$$,NULL,$$Fyndnr 821. Ännu inte undersökt och läst.$$,$$Bleck, dubbelvikt$$,$$Bly$$,$$Värmland$$,$$Sweden$$),
($$f67a0a86-b6c6-4dc8-bc98-7e2e346f72f6$$,$$Vr 2$$,NULL,59.4191,13.811,$$uibiurn · bruþur · sin$$,$$"Vébjǫrn, bróður sinn.$$,NULL,$$Vébjǫrn, his brother.$$,NULL,$$Troligen har en parsten funnits med inskriftens början.$$,$$Runsten$$,$$Röd gnejsgranit$$,$$Värmland$$,$$Sweden$$),
($$09790896-aab6-4acd-962b-4cf649d58251$$,$$Vr Runrön23;258A$$,NULL,59.3125,13.99,$$§A r-ua §B isonb--un-(n)… §C æþ--tu…$$,$$§A … §B … §C …$$,NULL,$$§A … §B … §C …$$,NULL,$$Fyndnr 1618.$$,$$Bleck$$,$$Bly$$,$$Värmland$$,$$Sweden$$),
($$7fef45aa-2e57-4360-9450-3fef558cff7d$$,$$Vr Runrön23;258B$$,NULL,59.3125,13.99,$$§A lukæs ma^kn §B þulm-$$,$$§A "Lucas(?) "Magn[us](?) §B …$$,$$§A Lukas(?) Magnus(?) §B …$$,$$§A Lucas(?) Magnús(?) §B …$$,NULL,$$Fyndnr 169.$$,$$Bleck$$,$$Bly$$,$$Värmland$$,$$Sweden$$),
($$cf04fd7f-6821-4155-9914-2000ad975f4c$$,$$Vr 4$$,$$L 2003$$,59.6868,13.4675,$$fuþorkhniastblmʀ fuþ…$$,$$<fuþorkhniastblmʀ fuþ…>$$,NULL,$$<fuþorkhniastblmʀ fuþ…>$$,$$Början av 1200-talet$$,$$futhark$$,$$Dopfunt, sockeln$$,$$Sandsten$$,$$Värmland$$,$$Sweden$$),
($$3dd8737a-4776-494a-aaaf-e1dd106dd72d$$,$$Vr 3$$,$$L 1040$$,59.3163,13.5324,$$: (b)iaurn : ri(s)-- [: stin : þin… ]iftr : iskir : si… …$$,$$"Bjǫrn reis[ti] stein þenn[a] eptir "Ásgeir, si[nn] …$$,NULL,$$Bjǫrn raised this stone in memory of Ásgeirr, his …$$,NULL,NULL,$$Runsten$$,$$Röd gnejs$$,$$Värmland$$,$$Sweden$$),
($$45e774ae-1146-4a23-80c3-cf4f4e7640ca$$,$$Vr 1$$,$$KJ 70$$,59.2854,14.1357,$$…ubaz hite ⁓ h^arabana^z ¶ h^ait… ¶ ek e^rilaz runoz waritu$$,$$"[Le]ubaz(?) haite. "Hrabnaz hait[e]. Ek, erilaz, runoz writu.$$,NULL,$$Leubaz am I called. Hrafn am I called. I, the eril, write the runes.$$,$$520/530–560/570 (Imer 2007)$$,$$Har ingått i ett stort minnesmärke bestående av resta stenar i en ring.$$,$$Runsten$$,$$Rödaktig gnejsgranit$$,$$Värmland$$,$$Sweden$$),
($$f92d249e-773d-41b2-ae37-7b2a1be03377$$,$$Vr NOR1994;27$$,NULL,59.8119,12.5758,$$--jþaah^ar (f)arkano$$,$$… …$$,NULL,$$…$$,$$520/530–560/570 550–700$$,$$Läses från höger till vänster.$$,$$Runsten$$,$$Finkornig grå gnejs$$,$$Värmland$$,$$Sweden$$)
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
