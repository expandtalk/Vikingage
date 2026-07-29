-- Bildlager för avrättnings-domänen ur K-samsök (bara fria licenser: cc0/pdmark/by/by-sa).
-- Illustrerar platser, metoder (bila/stegling) och bödelsmotiv. Attribution = institution.
create table if not exists execution_media (
  id           uuid primary key default gen_random_uuid(),
  title        text,
  term         text,                 -- söktermen som gav träff (avrättningsplats/bödel/stegling…)
  thumb_url    text,
  image_url    text,                 -- lowres för visning
  highres_url  text,
  license      text,                 -- kortform: cc0 | pdmark | by | by-sa
  license_url  text,
  attribution  text,                 -- institution (krävs för by/by-sa)
  place_label  text,
  source_uri   text unique,          -- K-samsök entityUri (idempotens)
  created_at   timestamptz default now()
);
alter table execution_media enable row level security;
drop policy if exists execution_media_read on execution_media;
create policy execution_media_read on execution_media for select using (true);
drop policy if exists execution_media_write on execution_media;
create policy execution_media_write on execution_media for all using (is_admin()) with check (is_admin());
