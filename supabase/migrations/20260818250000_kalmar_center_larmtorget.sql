-- Kalmar centrum: sök-svaret (resolve_place) centrerade på 56.6629,16.3662 (öster om Stortorget,
-- vid Linnégatan) — fel. Rätt centrum för en mötesplats är Larmtorget (där folk möts). Koordinat
-- verifierad via OpenStreetMap/Nominatim: Larmtorget, Kvarnholmen, Kalmar = 56.66279, 16.36104.
-- Uppdaterar den notabla Kalmar-raden (Småland, wikidata_sitelinks>0) som resolve_place väljer.
update public.place_names
   set lat = 56.66279, lng = 16.36104
 where lower(name) = 'kalmar' and province ilike 'Sm%' and coalesce(wikidata_sitelinks,0) > 0;
