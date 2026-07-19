-- Skapar tre saknade ristare (Röd-Balle, Romund, Varin) + länkar deras stenar +
-- scholarly_notes på de berömda stenarna (Rök, Karlevi, Björketorp). Applicerad via MCP.
insert into public.carvers (id, name, region, country, gender, is_professional, description, source_ref)
select v.id::uuid, v.name, v.region, 'Sweden', 'male', false, v.descr, v.src
from (values
  ('c0000000-0000-4000-8000-000000000001','Röd-Balle','Västmanland','Balli hinn rauði / Rauð-BalliR — västmanländsk runristare känd genom Vs 15 (Lilla Kyringe, Björksta sn, trolig hemort) och Vs 24 Hassmyrastenen (Fläckebo sn), båda Pr 4 (ca 1070–1100). Binamnet den röde syftar sannolikt på en kroppslig egenhet. Måste skiljas från den uppländske Balle.','Philippa (1977); Williams (1990); Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).'),
  ('c0000000-0000-4000-8000-000000000002','Romund','Hälsingland','Romund — ristare och resare på Malstastenen (Hs 14) i Rogsta socken, ristad med stavlösa runor. Välbeställd släkt med stort gårdsinnehav. Möjligen även Sunnåstenen (Hs 15).','Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA); Peterson (1994, 2005).'),
  ('c0000000-0000-4000-8000-000000000003','Varin','Östergötland','Varinn — nämns på Rökstenen (Ög 136) som den som reste och ristade stenen efter sin son Vämod (Varinn faði æftiR Væmóð). Rökstenen (tidigt 800-tal) är en av världens mest kända runstenar.','Samnordisk runtextdatabas; Rökstenens inskrift (Ög 136).')
) as v(id, name, region, descr, src)
where not exists (select 1 from public.carvers c where c.id = v.id::uuid);

insert into public.carver_inscription (carverinscriptionid, carverid, inscriptionid, attribution, certainty, notes, lang)
select decode(replace(gen_random_uuid()::text,'-',''),'hex'), decode(v.chex,'hex'), decode(v.ihex,'hex'), v.attr::attribution_type, v.cert, v.notes, 'sv'
from (values
  ('c0000000000040008000000000000001','b00488637f26448daad0c4fbb070f4f3','signed',true,'Vs 15 Lilla Kyringe: Balli rétti stæin. Källström 2007.'),
  ('c0000000000040008000000000000001','28a009f35c1b4ac087fc5d244f596688','signed',true,'Vs 24 Hassmyrastenen: Rauð-BalliR rísti rúniR þessaR. Källström 2007.'),
  ('c0000000000040008000000000000002','a482c59635f8476aac6de5fb935b1e2d','signed',true,'Malstastenen Hs 14, stavlösa runor. Källström 2007.'),
  ('c0000000000040008000000000000003','0be64520b6634e19aa3ebb0c9ffbb8ba','signed',true,'Rökstenen Ög 136: Varinn faði æftiR Væmóð.')
) as v(chex, ihex, attr, cert, notes)
where not exists (select 1 from public.carver_inscription ci where ci.carverid=decode(v.chex,'hex') and ci.inscriptionid=decode(v.ihex,'hex'));

insert into public.carver_attributes (carver_id, attribute_type, value_sv, value_en, source_ref)
select 'c0000000-0000-4000-8000-000000000001'::uuid,'other','den röde (rauði) — kroppsligt binamn (hår eller hy)','the red (rauði) — bodily nickname (hair or complexion)','Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).'
where not exists (select 1 from public.carver_attributes ca where ca.carver_id='c0000000-0000-4000-8000-000000000001'::uuid and ca.attribute_type='other');

update public.runic_inscriptions set scholarly_notes = 'Rökstenen — en av världens mest kända runstenar (tidigt 800-tal) och en av de längsta kända runinskrifterna. Restes och ristades av Varinn efter hans son Vämod (se ristaren Varin). Blandar flera runtyper och anspelar på hjältesagor och myter.' where id='0be64520-b663-4e19-aa3e-bb0c9ffbb8ba';
update public.runic_inscriptions set scholarly_notes = 'Karlevistenen (ca 1000) — bär en av de äldsta bevarade skaldestroferna i dróttkvätt, rest till minne av en dansk hövding (Sibbe den gode, Foldars son). Ingen ristarsignatur; ristaren är okänd.' where id='ddbb1147-014c-4efb-a621-01a1b1b8f561';
update public.runic_inscriptions set scholarly_notes = 'Björketorpsstenen (Blekinge, ca 600–700-tal) — del av en monumentgrupp besläktad med Stentoften; bär en förbannelseinskrift med äldre/övergångsrunor. Ingen ristare namngiven; anonym.' where id='a0ada670-6551-4631-9907-40179e9fb876';
