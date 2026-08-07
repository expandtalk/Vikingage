-- Fortsatt bildingest från Sörmlands museum (endast PD/CC, med kreditering). Bild-URL ur sidans
-- fullsize-bild (cust.kulturhotell.se). Sö 314 = SLM (Torshälla 23:1), CC BY 4.0. Sö 198 Mervallastenen
-- = SLM X40-79 (Ytterselö 92:2), teckning ur Bautil 1750, Public Domain (PDM).
-- Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
insert into public.inscription_media
  (inscription_id, media_url, media_type, file_format, description, copyright_info, source_institution)
select ri.id, v.url, v.mtype, 'jpg', v.descr, v.cr, 'Sörmlands museum'
from (values
  ('Sö 314', 'https://cust.kulturhotell.se/c24/files/fullsize/a69466de9f9e8cf3963062a53731f403.jpg',
   'photo', 'Sö 314 – runsten vid Torshälla kyrkas södra vägg (RAÄ Torshälla 23:1).',
   'CC BY 4.0. Sörmlands museums samlingar. https://sokisamlingar.sormlandsmuseum.se/objects/c24-363432/'),
  ('Sö 198', 'https://cust.kulturhotell.se/c24/files/fullsize/60e3c5d99103d6677c7e1002f3295947.jpg',
   'teckning', 'Sö 198 Mervallastenen ur Bautil 1750 (Ytterselö 92:2). "Semgallen"/österledsfärd.',
   'Public Domain (PDM). Sörmlands museums samlingar, SLM X40-79. https://sokisamlingar.sormlandsmuseum.se/objects/c24-399029/')
) as v(signum, url, mtype, descr, cr)
join public.runic_inscriptions ri on ri.signum = v.signum
where not exists (select 1 from public.inscription_media m where m.inscription_id = ri.id and m.media_url = v.url);
