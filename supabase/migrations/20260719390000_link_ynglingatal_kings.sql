-- Koppla Ynglingatal (+ Ynglingasagan) till kungadatan.
-- Ynglingatal finns i historical_sources (visas på /royal-chronicles) men var inte
-- kopplat till kungarna. Ingen source<->king-FK finns; kopplingen sker via
-- historical_kings.sources (text) + dynastins description.
--
-- OBS källkritik: Ynglingatal (Tjodolf ur Hvin, ca 890) räknar upp den LEGENDARISKA
-- Ynglingaätten. De sentida svearkungarna Björn/Anund/Olof knyts till dikten via den
-- dynastiska traditionen (Ynglingatal + Snorres Ynglingasaga). Ingvar Vittfarne hör
-- INTE hemma i Ynglingatal — han får sina egna källor (Yngvars saga + Ingvarstenarna).

begin;

-- Dynastins litterära grund.
update public.royal_dynasties
set description = coalesce(description, '') ||
  E'\n\nLitterär grund: Ynglingaätten definieras av skaldedikten Ynglingatal (Tjodolf ur Hvin, ca 890) och Snorre Sturlasons Ynglingasaga (Heimskringla), som räknar upp de legendariska Ynglingakungarna (Fjölne, Sveigde … Ingjald illråde). Flertalet av dessa legendariska kungar är ännu inte inlagda i databasen.'
where id = '22d68f9b-1733-4cee-9bfc-2fd51ff84981'
  and (description is null or description not like '%Litterär grund:%');  -- idempotent: undvik re-append

-- Semi-legendariska svearkungar i Yngling-traditionen → Ynglingatal + Ynglingasagan.
update public.historical_kings
set sources = 'Ynglingatal (Tjodolf ur Hvin, ca 890); Ynglingasagan (Snorre Sturlason, Heimskringla)'
where id in (
  '1c8ca81d-a90b-400f-a3b0-ff6e26de874b',  -- Kung Björn
  'e21c8682-8498-4ee9-95b7-4d4b11e2aad5',  -- Kung Anund
  'f5ea4292-6583-4e22-908b-08bb0027e3ee'   -- Kung Olof
) and (sources is null or btrim(sources) = '');

-- Ingvar Vittfarne: egna källor (ej Ynglingatal).
update public.historical_kings
set sources = 'Yngvars saga víðförla; Ingvarstenarna (t.ex. Sö 179 Gripsholm, Sö 179–...)'
where id = 'c4830573-6d52-4a04-8dde-aed44fbc7086'
  and (sources is null or btrim(sources) = '');

commit;
