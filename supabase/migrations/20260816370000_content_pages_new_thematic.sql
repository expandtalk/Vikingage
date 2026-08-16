-- Sök-entiteter (content_pages) för fyra nya sidor: häxprocesserna + temasidorna ledung/snäck/hundare.
-- Indexeras via rebuild_search_document_x('content_page', md5('content_page:'||id::text)::uuid)
-- (content_pages.id är BIGINT; jfr [[content-pages-kg-spatial]]). Teasers i egna ord.
-- Endast häxprocess-sidan har geom (Torsåker); begreppssidorna är ej platsbundna → geom null.

-- geom är NOT NULL. Begreppssidorna (ledung/snäck/hundare) är ej platsbundna → representativa
-- REGION-centroider med geom_approx=true (ärligt märkt approximativt): Svealand/Mälardalen där
-- institutionerna hörde hemma. Häxprocess = Torsåker (kärnområde), geom_approx=false.
insert into public.content_pages (slug, url, title_sv, title_en, kind, teaser_sv, teaser_en, geom, geom_approx, priority)
select * from (values
  ('haxprocesserna-angermanland', '/sv/haxprocesserna-angermanland',
   'Häxprocesserna i Ångermanland', 'The Ångermanland witch trials', 'narrative',
   'Det stora oväsendet i Ångermanland 1674–1675: trolldomskommissionen, rannsakningarna och massavrättningen på Bålberget vid Torsåker 1 juni 1675 — källkritiskt granskad.',
   'The great witch-hunt in Ångermanland 1674–1675: the commission, the trials, and the mass execution at Bålberget near Torsåker on 1 June 1675 — source-critically reviewed.',
   ST_SetSRID(ST_MakePoint(17.7416, 63.0798), 4326), false, 5),
  ('ledung', '/sv/ledung',
   'Ledung', 'Leidang', 'concept',
   'Den nordiska sjökrigsorganisationen: skeppslag, hamna och roddarlag, ledungen i landskapslagarna och övergången till skatteledung.',
   'The Norse naval levy: ship-districts, oarsman crews, the leidang in the provincial laws and its shift to a tax.',
   ST_SetSRID(ST_MakePoint(17.6389, 59.8586), 4326), true, 4),
  ('snacknamn', '/sv/snacknamn',
   'Snäck-ortnamn', 'Snäck place-names', 'concept',
   'Ortnamn på Snäck- och deras omtvistade koppling till ledungens skeppshamnar — källkritiskt, med Ingemar Olssons Gotlandsstudie.',
   'Place-names in Snäck- and their disputed link to the leidang''s ship harbours — source-critical, drawing on Ingemar Olsson''s Gotland study.',
   ST_SetSRID(ST_MakePoint(17.5000, 59.4000), 4326), true, 4),
  ('hundare', '/sv/hundare',
   'Hundare', 'The hundare (hundred)', 'concept',
   'Svealands äldre indelningsenhet, föregångare till häradet: hundaret, dess koppling till ledung och skeppslag, och den olösta etymologin.',
   'The older division of Svealand, forerunner of the härad: the hundare, its link to the leidang and ship-districts, and its unsolved etymology.',
   ST_SetSRID(ST_MakePoint(17.6389, 59.8586), 4326), true, 4)
) as v(slug, url, title_sv, title_en, kind, teaser_sv, teaser_en, geom, geom_approx, priority)
where not exists (select 1 from public.content_pages c where c.slug = v.slug);

-- Bygg sök-dokument för de nya sidorna (scopa till nya raderna → ingen dubblettnyckel).
select public.rebuild_search_document_x('content_page', md5('content_page:'||id::text)::uuid)
from public.content_pages
where slug in ('haxprocesserna-angermanland', 'ledung', 'snacknamn', 'hundare');
