-- (1) Torshälla: Albertus Pictors "Abraham med glasögon" (korets valv) — verifierat via Svenska kyrkan
--     (Torshälla församling). Unik medeltida bild som visar att glasögon användes. Sakuppgift + källa.
-- (2) Skånelagen fanns redan i historical_sources (1210, Codex Runicus) men rights='unknown' → medeltida
--     lag = public_domain. Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
insert into public.church_artworks (church_id, artist_id, artwork_type, title, motif, dating_text, location_in_church, source, source_url, notes)
select '6893537b-50a7-4e0d-b739-b291df3c82fe', '673ec546-adc2-418b-af69-e8e664cb1940',
  'kalkmålning', 'Abraham med glasögon',
  'Abraham framställd bärande glasögon (detalj i korvalvets takmålningar)',
  'mitten av 1400-talet', 'Korets valv',
  'Svenska kyrkan, Torshälla församling', 'https://www.svenskakyrkan.se/torshalla/torshalla-kyrka',
  'Unik bild — troligen den enda från denna tidsperiod som visar att glasögon användes. Sakuppgift ur församlingens egen beskrivning.'
where not exists (select 1 from public.church_artworks
  where church_id='6893537b-50a7-4e0d-b739-b291df3c82fe' and title='Abraham med glasögon');

update public.historical_sources set rights='public_domain'
where title ilike '%skånelag%' and rights::text='unknown';
