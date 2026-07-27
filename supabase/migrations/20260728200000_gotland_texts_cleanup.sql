-- Städ efter Gotland-text-ingest: sista Gutalagen-chunken var textkritisk apparat
-- ("B. tillägger…", varianter ur handskrift B), inte ett lagkapitel. Ta bort den.
begin;
delete from public.source_texts
where source_id = (select id from public.historical_sources where title = 'Gutalagen')
  and original_norse like 'B. tillägger%';
commit;
-- Kontroll: select count(*) from source_texts st join historical_sources hs on hs.id=st.source_id where hs.title='Gutalagen';
