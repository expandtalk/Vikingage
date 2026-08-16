-- SÄKER backfill (ingen ny etymologi): activity_category ur befintlig category; language_origin='old_norse'
-- för de 37 nordiska leden (etablerat — alla är fornnordiska/urgermanska namnled). Nyanser (proto_norse
-- vs old_norse) + samiska/nya led läggs källbelagt via filolog-förslag (människa-i-loopen).
update public.ortnamn_element_config set activity_category = case
  when category in ('sacral','sakralt') then 'cult'
  when category = 'power' then 'administration'
  when category in ('settlement','bebyggelse') then 'settlement'
  when category = 'näring' then 'trade'
  when category = 'communication' then 'communication'
  when category = 'coastal_defense' then 'defence'
  when category = 'natur' then 'topographic'
  else activity_category end
where activity_category is null;
update public.ortnamn_element_config set language_origin = 'old_norse' where language_origin is null;
