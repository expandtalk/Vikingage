-- Pilot: berika ristaren Ulv i Borresta ur Källström (2007), Mästare och minnesmärken.
-- Nya carver-fält (hemgård, kön, yrkesristare, källhänvisning) + biografi + korrekt
-- upplösande carver_inscription-länkar (befintliga 2 pekar på inskrifts-id som inte
-- finns i runic_inscriptions -> visas som "Unknown"). carver_inscription-nycklar är
-- bytea = hex av uuid utan bindestreck (se RPC get_carver_inscriptions).
alter table public.carvers
  add column if not exists home_farm text,
  add column if not exists gender text,
  add column if not exists is_professional boolean,
  add column if not exists source_ref text;

update public.carvers set
  region = coalesce(region, 'Uppland'),
  home_farm = 'Borresta, Orkesta socken',
  gender = 'male',
  is_professional = false,
  description = 'Storbonde av Skålhamraätten med gården Borresta i Orkesta socken, Uppland. Enligt Yttergärdestenarna (U 343 och U 344) deltog han i tre vikingatåg mot England och tog tre danagälder — den sista Knut den stores 1018, troligen den andra vid Torkel Höges angrepp 1009, den första omkring 1000. Signerad som ristare på U 161 vid Risbyle (Täby socken) och ristade parstenen U 160; tillskrivs även U 276 Hammarby (Fresta socken), en attribution som dock är omdiskuterad (Stille tillskriver Gunnar). Sannolikt icke yrkesristare utan en jordägande stormannaätt.',
  source_ref = 'Källström, M. (2007). Mästare och minnesmärken: Studier kring vikingatida runristare och skriftmiljöer i Norden. Runrön 18, Uppsala universitet (DiVA).'
where name ilike 'ulv i borresta';

insert into public.carver_inscription (carverinscriptionid, carverid, inscriptionid, attribution, certainty, notes, lang)
select decode(replace(gen_random_uuid()::text,'-',''),'hex'),
       decode('eecd1fd623464b5cbe0c1add646db741','hex'),
       decode(v.insc_hex,'hex'), v.attr::attribution_type, v.cert, v.notes, 'sv'
from (values
  ('47a4ac9745c346bdb5881d0aacc7dfec','signed', true,  'Signerad ristning vid Risbyle, Täby sn. Källström 2007.'),
  ('cb86cc165cff4ebd928080dfb7ae2e13','signed on pair stone', true, 'Parsten till U 161 vid Risbyle; ristad av Ulv i Borresta. Källström 2007.'),
  ('64ff679a199a42b3b2d455887383af2b','attributed', false, 'Tillskriven Ulv i Borresta (Pr 1, Hammarby, Fresta sn); attributionen omdiskuterad — Stille 1992a tillskriver Gunnar. Källström 2007.')
) as v(insc_hex, attr, cert, notes)
where not exists (
  select 1 from public.carver_inscription ci
  where ci.carverid = decode('eecd1fd623464b5cbe0c1add646db741','hex')
    and ci.inscriptionid = decode(v.insc_hex,'hex')
);
