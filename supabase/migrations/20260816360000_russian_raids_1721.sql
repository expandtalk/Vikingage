-- Rysshärjningarna 1721 som historical_event. Fakta ur källa Daniel gav:
-- Lars Högberg (kartor + sammanfattande dokumentation) & Lena Hermansson (insamlade minnen),
-- "Rysshärjningarna längs Norrlandskusten 1721" (144 s + 12-sidig Kramfors-sammanfattning),
-- transkriberat ur handskrivna 1700-talsdokument. FAKTA fritt; DOKUMENTATIONEN upphovsrättsskyddad
-- -> länkas ut, rehostas ej. Ankras vid Nora kyrka (62.8727,18.0844 DB-verifierad plundrad socken).
-- Landstigningen (Hornöby) ej i DB -> koord ej fabricerad; beskrivs i texten. geom genererad -> sätts ej.
-- Beskrivningen byggs med || i korta rader (undviker psql:s lång-rad/multibyte-problem).
insert into public.historical_events (event_name, event_name_en, year_start, year_end, event_type, description, description_en, lat, lng)
select
  'Rysshärjningarna 1721',
  'The Russian raids of 1721',
  1721, 1721, 'raid',
  'I maj 1721 anfölls Norrlandskusten från Gävle i söder till Piteå i norr under stora nordiska '
  || 'krigets slutskede. Tsar Peter den stores galärflotta — enligt hembygdsdokumentationen omkring '
  || '90 fartyg, 7 000 fotsoldater och 500 kosacker med hästar — landsteg längs kusten. Den 31 maj '
  || 'rodde flottan in till Hornöby vid det som idag är Högakustenbrons norra landfäste. Omkring 300 '
  || 'kosacker till häst red genom Nora, Skog, Bjärtrå och Nordingrå socknar och plundrade och brände '
  || 'bebyggelsen, och fortsatte norrut längs kusten. Källa: Lars Högberg (kartor och sammanfattande '
  || 'dokumentation) och Lena Hermansson (insamlade bygdeminnen), "Rysshärjningarna längs Norrlands'
  || 'kusten 1721" — 144 sidor, transkriberade ur bevarade handskrivna 1700-talsdokument (Kramfors '
  || 'hembygd). Fakta återgivet i egna ord; dokumentationen är upphovsrättsskyddad och länkas: '
  || 'https://indd.adobe.com/view/8497f9be-6db8-46da-896f-d72a16b950f7 (utförlig) och '
  || 'https://indd.adobe.com/view/afa8c348-b075-431b-9c27-a93c6761e7c4 (Kramfors-sammanfattning). '
  || 'Exakt läge för landstigningen (Hornöby) är ej koordinatsatt i databasen; händelsen ankras vid '
  || 'Nora kyrka, en av de namngivna plundrade socknarna.',
  'In May 1721, during the final phase of the Great Northern War, the coast of Norrland was raided '
  || 'from Gävle in the south to Piteå in the north. Tsar Peter the Great''s galley fleet — according '
  || 'to the local documentation some 90 vessels, 7,000 foot soldiers and 500 mounted Cossacks — landed '
  || 'along the coast. On 31 May the fleet rowed into Hornöby, by what is today the northern abutment '
  || 'of the High Coast Bridge. Around 300 mounted Cossacks rode through the parishes of Nora, Skog, '
  || 'Bjärtrå and Nordingrå, plundering and burning the settlements before continuing north. Source: '
  || 'Lars Högberg (maps and summary documentation) and Lena Hermansson (collected local memories), '
  || '"The Russian raids along the Norrland coast 1721" — 144 pages transcribed from surviving '
  || '18th-century manuscripts. Facts retold in our own words; the documentation is copyrighted and '
  || 'linked, not rehosted.',
  62.8727, 18.0844
where not exists (select 1 from public.historical_events where event_name = 'Rysshärjningarna 1721');
