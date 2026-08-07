-- Pilot: bildingest från Sörmlands museums samlingar. Stabil bild-URL ligger i sidans og:image
-- (cust.kulturhotell.se/c24/files/fullsize/<hash>.jpg). Sö 279 = SLM M025879, Ingvarssten vid Strängnäs
-- domkyrka (RAÄ Strängnäs 125:1), licens Public Domain (PDM). Endast PD/CC ingestas, med kreditering.
-- Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
insert into public.inscription_media
  (inscription_id, media_url, media_type, file_format, description, copyright_info, source_institution)
select ri.id,
  'https://cust.kulturhotell.se/c24/files/fullsize/ba95dd7d1edd7eec40a15e30c1ee6efe.jpg',
  'photo', 'jpg',
  'Sö 279 – Ingvarssten vid Strängnäs domkyrka (nära sydvästra hörnet). RAÄ Strängnäs 125:1.',
  'Public Domain (PDM). Sörmlands museums samlingar, SLM M025879. https://sokisamlingar.sormlandsmuseum.se/objects/c24-363425/',
  'Sörmlands museum'
from public.runic_inscriptions ri
where ri.signum = 'Sö 279'
  and not exists (
    select 1 from public.inscription_media m
    where m.inscription_id = ri.id
      and m.media_url = 'https://cust.kulturhotell.se/c24/files/fullsize/ba95dd7d1edd7eec40a15e30c1ee6efe.jpg'
  );
