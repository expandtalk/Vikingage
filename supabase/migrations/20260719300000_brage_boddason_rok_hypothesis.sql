-- Lägger in skalden Brage Boddason (Bragi Boddason inn gamli) samt Fredrik Ousbäcks
-- ALTERNATIVHYPOTES att Rökstenen (Ög 136) är hans verk. Tydligt flaggad som omdiskuterad
-- (certainty=false) vid sidan av huvudtolkningen (Varin, signed). Applicerad via MCP.
insert into public.carvers (id, name, region, country, gender, is_professional, description, source_ref)
select 'c0000000-0000-4000-8000-000000000004'::uuid, 'Brage Boddason', 'Norge och Sverige', 'Sweden', 'male', false,
  'Bragi Boddason inn gamli (Brage den gamle) — räknas som den äldste namngivne nordiske skalden vars diktning bevarats, verksam under första hälften av 800-talet vid norska och svenska stormanna- och kungahov (bl.a. hos Björn at Haugi). Hans mest kända verk är skölddikten Ragnarsdrápa, som i dróttkvätt beskriver mytiska och heroiska scener (Hamdir och Sörle, Hjaðningavíg, Gefjon som plöjer, Tor mot Midgårdsormen) och traditionellt knyts till en sköld tillskriven Ragnar Lodbrok. Karakteristiskt är kenningar som havets häst (skepp) och korpens föda (de stupade). En alternativhypotes (Fredrik Ousbäck) föreslår att Brage Boddason är upphovsman till Rökstenen (Ög 136) — ej allmänt accepterad; huvudtolkningen namnger Varin.',
  'Alternativhypotes om Rökstenen: Fredrik Ousbäck. Om Bragi Boddason inn gamli: skaldediktningens äldsta bevarade skikt (Ragnarsdrápa).'
where not exists (select 1 from public.carvers where id='c0000000-0000-4000-8000-000000000004'::uuid);

insert into public.carver_inscription (carverinscriptionid, carverid, inscriptionid, attribution, certainty, notes, lang)
select decode(replace(gen_random_uuid()::text,'-',''),'hex'),
       decode('c0000000000040008000000000000004','hex'), decode('0be64520b6634e19aa3ebb0c9ffbb8ba','hex'),
       'attributed', false,
       'OMDISKUTERAD hypotes (Fredrik Ousbäck): att Rökstenen (Ög 136) ristades/diktades av skalden Brage Boddason. Ej allmänt accepterad; huvudtolkningen namnger Varin.', 'sv'
where not exists (select 1 from public.carver_inscription ci
  where ci.carverid=decode('c0000000000040008000000000000004','hex') and ci.inscriptionid=decode('0be64520b6634e19aa3ebb0c9ffbb8ba','hex'));

insert into public.carver_attributes (carver_id, attribute_type, value_sv, value_en, source_ref)
select 'c0000000-0000-4000-8000-000000000004'::uuid,'occupation','skald','skald (court poet)','Om Bragi Boddason inn gamli.'
where not exists (select 1 from public.carver_attributes ca where ca.carver_id='c0000000-0000-4000-8000-000000000004'::uuid and ca.attribute_type='occupation');

update public.runic_inscriptions set scholarly_notes = scholarly_notes ||
  ' Alternativhypotes: Fredrik Ousbäck menar att stenen ristades av skalden Brage Boddason (Bragi Boddason inn gamli, tidigt 800-tal, upphovsman till Ragnarsdrápa). Hypotesen är dock ej allmänt accepterad — huvudtolkningen namnger Varin.'
where id='0be64520-b663-4e19-aa3e-bb0c9ffbb8ba' and scholarly_notes not like '%Ousbäck%';
