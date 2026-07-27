-- Agnetas Ångermanland-vy: SOL-diff FÖRBEREDD men OBESLUTAD (hon äger Ångermanland; erbjud, ålägg ej).
-- Headline: Härnösand — SOL topografiskt (hærn 'huvud/topp' → Härnön) mot kult-läsningen (Härn=Fröja).
begin;
insert into public.ortnamn_sol_comparison (name, landscape, our_reading, our_source, sol_reading, sol_entry, diff, owner, note)
select v.* from (values
  ('Härnösand','Ångermanland',
     'Förleden Härn läst som binamn på Fröja (kult-tolkning).','kult-hypotes (Agnetas material)',
     'Härnösand = ''den sandiga platsen på Härnön''. Önamnet Härnön innehåller ett med hjärna samhörigt fsv. *hærn ''huvud, topp, hjässa'' (topografiskt, syftar på öns form) — inte gudinnan Härn.',
     'Härnösand','ja','Agneta (Ångermanland)',
     'FÖR GRANSKNING (obeslutad). SOL läser topografiskt, kult-läsningen läser Fröja-binamnet Härn. Agneta avgör — erbjuds, åläggs ej. Detta stärker den källkritik som redan noterats för klustret.'),
  ('Torsåker','Ångermanland',
     'Tor (gud) + åker — teofort kult-namn.','kult-hypotes (Agnetas material)',
     'Sammansatt av gudanamnet Tor + åker (Thorsakir 1344).','Torsåker sn, Ångermanland','nej','Agneta (Ångermanland)',
     'SOL BEKRÄFTAR teofort Tor. Ingen åtgärd behövs — men beslutet är Agnetas.')
) as v(name, landscape, our_reading, our_source, sol_reading, sol_entry, diff, owner, note)
where not exists (select 1 from public.ortnamn_sol_comparison o where o.name=v.name and o.owner='Agneta (Ångermanland)');
commit;
