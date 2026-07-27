-- Ottenby kungsgård — Ölands sydspets. Ett av kronans gods på Öland (senare kunglig
-- djurgård/Ottenby lund, muren 1653). Till estates (maktsäten). Koordinat ~sydspetsen.
begin;
insert into public.estates (id, name, estate_type, first_attested, lat, lng, confidence, source, description)
select gen_random_uuid(), 'Ottenby kungsgård', 'kungsgård', 1300, 56.198, 16.398, 'belagd',
  'Kronans gods Öland; Ottenby kungsladugård/djurgård',
  'Kungsgård på Ölands sydspets — ett av kronans gods på ön, senare kunglig djurgård (Ottenby lund; Karl X Gustavs mur 1653). Strategiskt läge vid öns södra ände och Ottenbys fågelrika udde.'
where not exists (select 1 from public.estates where name = 'Ottenby kungsgård');
commit;
