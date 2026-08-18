-- Komprimerad standardbild, högupplöst vid klick. Wikimedia-thumbnails går INTE hand-byggas
-- pålitligt (MediaWiki bucket-rundar → 400 för godtyckliga bredder), så vi lagrar den verkliga
-- thumb-URL:en från Commons-API:t (iiurlwidth). Frontend visar thumb_url som default, originalet
-- (media_url/image_url) vid klick. Icke-Wikimedia (pub.raa.se 8 MB utan thumb-endpoint, kulturhotell)
-- får thumb_url = NULL → faller tillbaka på originalet + loading="lazy".
alter table public.inscription_media   add column if not exists thumb_url text;
alter table public.historical_depictions add column if not exists thumb_url text;
