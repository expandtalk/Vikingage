-- Royal Chronicles — steg g: importera regenter + relationer (GENERERAD, redigera ej för hand)
-- Kör EFTER 01-corrections.sql. Idempotent. Generator: scripts/gen-royal-chronicles-import.mjs
begin;

-- 89 regenter
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Emund den gamle', 1050, 1060, (select id from public.royal_dynasties where name='Munsöätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, ARRAY['tysk']::text[], false, false, 'male', 'Adam av Bremen III'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Emund den gamle'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Stenkil', 1060, 1066, (select id from public.royal_dynasties where name='Stenkilska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, ARRAY['tysk']::text[], false, false, 'male', 'Adam av Bremen; Västgötalagens kungalängd'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Stenkil'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Halsten Stenkilsson', 1067, 1070, (select id from public.royal_dynasties where name='Stenkilska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, ARRAY['tysk']::text[], false, false, 'male', 'Adam; VGL-längden'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Halsten Stenkilsson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Håkan Röde', 1070, 1079, (select id from public.royal_dynasties where name='Stenkilska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, '{}'::text[], false, false, 'male', 'VGL-längden'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Håkan Röde'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Inge den äldre', 1079, 1110, (select id from public.royal_dynasties where name='Stenkilska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, ARRAY['påvlig','rysk']::text[], false, false, 'male', 'Gregorius VII:s brev 1080 och 1081; VGL; rysk genealogi via dottern Kristina'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Inge den äldre'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Blot-Sven', 1084, 1087, NULL, 'semi_legendary'::king_status, 'Sweden', 'Motkonung', false, '{}'::text[], false, false, 'male', 'Hervarar saga (sen tradition)'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Blot-Sven'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Filip Halstensson', 1110, 1118, (select id from public.royal_dynasties where name='Stenkilska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, '{}'::text[], false, false, 'male', 'VGL-längden'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Filip Halstensson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Inge den yngre', 1110, 1125, (select id from public.royal_dynasties where name='Stenkilska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, '{}'::text[], false, false, 'male', 'VGL-längden'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Inge den yngre'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Ragnvald Knaphövde', 1125, 1126, NULL, 'semi_legendary'::king_status, 'Sweden', 'King', false, '{}'::text[], false, false, 'male', 'VGL-längden'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Ragnvald Knaphövde'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sverker den äldre', 1130, 1156, (select id from public.royal_dynasties where name='Sverkerska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, ARRAY['påvlig']::text[], false, false, 'male', 'Diplom; annaler'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sverker den äldre'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik den helige', 1156, 1160, (select id from public.royal_dynasties where name='Erikska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, ARRAY['påvlig']::text[], false, true, 'male', 'Erikslegenden; kanonisationsmaterial; relikskrin osteologiskt undersökt 2014'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik den helige'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Magnus Henriksson', 1160, 1161, NULL, 'historical'::king_status, 'Sweden', 'King', false, '{}'::text[], false, false, 'male', 'VGL-längden; Saxo'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Magnus Henriksson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sverker den yngre', 1196, 1208, (select id from public.royal_dynasties where name='Sverkerska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, ARRAY['påvlig']::text[], false, false, 'male', 'Diplom; påvebrev'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sverker den yngre'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik Knutsson', 1208, 1216, (select id from public.royal_dynasties where name='Erikska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, ARRAY['påvlig']::text[], false, false, 'male', 'Diplom; Innocentius III'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik Knutsson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Johan Sverkersson', 1216, 1222, (select id from public.royal_dynasties where name='Sverkerska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, '{}'::text[], false, false, 'male', 'Diplom'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Johan Sverkersson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik Eriksson läspe och halte', 1222, 1250, (select id from public.royal_dynasties where name='Erikska ätten' limit 1), 'historical'::king_status, 'Sweden', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; Erikskrönikan'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik Eriksson läspe och halte'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Knut Långe', 1229, 1234, NULL, 'historical'::king_status, 'Sweden', 'Motkonung', false, '{}'::text[], false, false, 'male', 'Diplom; annaler'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Knut Långe'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Ingegerd Olofsdotter', 1019, 1050, (select id from public.royal_dynasties where name='Munsöätten' limit 1), 'historical'::king_status, 'Sweden', 'Queen', false, ARRAY['rysk','bysantinsk']::text[], false, false, 'female', 'Nestorskrönikan; lokalt helgon i Novgorod (Anna)'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Ingegerd Olofsdotter'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Margareta Fredkulla', 1101, 1130, (select id from public.royal_dynasties where name='Stenkilska ätten' limit 1), 'historical'::king_status, 'Sweden', 'Queen', false, '{}'::text[], false, false, 'female', 'Diplom; Saxo'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Margareta Fredkulla'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Bo Jonsson Grip', 1371, 1386, (select id from public.royal_dynasties where name='Ätten Grip' limit 1), 'historical'::king_status, 'Sweden', 'Drots', true, '{}'::text[], false, false, 'male', 'SDHK; testamentet 1384 bevarat'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Bo Jonsson Grip'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Jöns Bengtsson Oxenstierna', 1465, 1466, (select id from public.royal_dynasties where name='Oxenstierna' limit 1), 'historical'::king_status, 'Sweden', 'Riksföreståndare', true, '{}'::text[], false, false, 'male', 'Diplom; Sturekrönikan'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Jöns Bengtsson Oxenstierna'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik Axelsson Tott', 1466, 1467, (select id from public.royal_dynasties where name='Tott' limit 1), 'historical'::king_status, 'Sweden', 'Riksföreståndare', true, '{}'::text[], false, false, 'male', 'Diplom'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik Axelsson Tott'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sten Sture den äldre', 1470, 1503, (select id from public.royal_dynasties where name='Sjöbladsätten' limit 1), 'historical'::king_status, 'Sweden', 'Riksföreståndare', true, ARRAY['påvlig','tysk']::text[], false, false, 'male', 'Diplom; hansakällor; påvebulla Uppsala universitet 1477; regerade 1470-1497 och 1501-1503'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sten Sture den äldre'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Svante Nilsson Sture', 1504, 1512, (select id from public.royal_dynasties where name='Natt och Dag' limit 1), 'historical'::king_status, 'Sweden', 'Riksföreståndare', true, '{}'::text[], false, false, 'male', 'Diplom; bevarad korrespondens'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Svante Nilsson Sture'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik Trolle', 1512, 1512, (select id from public.royal_dynasties where name='Trolle' limit 1), 'historical'::king_status, 'Sweden', 'Riksföreståndare', false, '{}'::text[], false, false, 'male', 'Rådsprotokoll; vald men tillträdde ej'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik Trolle'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sten Sture den yngre', 1512, 1520, (select id from public.royal_dynasties where name='Natt och Dag' limit 1), 'historical'::king_status, 'Sweden', 'Riksföreståndare', true, ARRAY['påvlig']::text[], false, false, 'male', 'Diplom; Trolle-processen; blodbadsplakaten'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sten Sture den yngre'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Kristina Nilsdotter Gyllenstierna', 1520, 1520, (select id from public.royal_dynasties where name='Gyllenstierna' limit 1), 'historical'::king_status, 'Sweden', 'De facto-riksledare', true, '{}'::text[], false, false, 'female', 'Diplom; samtida krönikor; ledde Stockholms försvar'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Kristina Nilsdotter Gyllenstierna'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Kristian II', 1520, 1523, (select id from public.royal_dynasties where name='Oldenburg' limit 1), 'historical'::king_status, 'Sweden', 'King', false, ARRAY['påvlig']::text[], false, false, 'male', 'Rikt diplommaterial; blodbadsdokumentationen'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Kristian II'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Godfred', 804, 810, NULL, 'historical'::king_status, 'Denmark', 'King', false, ARRAY['frankisk']::text[], false, true, 'male', 'Annales regni Francorum; Einhard; flyttade köpmännen till Hedeby 808'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Godfred'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Hemming', 810, 812, NULL, 'historical'::king_status, 'Denmark', 'King', false, ARRAY['frankisk']::text[], false, false, 'male', 'ARF; Ejdern-fördraget'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Hemming'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Horik I', 827, 854, NULL, 'historical'::king_status, 'Denmark', 'King', false, ARRAY['frankisk']::text[], false, false, 'male', 'ARF; Annales Bertiniani; Vita Anskarii'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Horik I'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Horik II', 854, 873, NULL, 'historical'::king_status, 'Denmark', 'King', false, ARRAY['frankisk']::text[], false, false, 'male', 'Annales Bertiniani; Vita Anskarii'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Horik II'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Olof av Hedeby', 900, 920, (select id from public.royal_dynasties where name='Olof-dynastin' limit 1), 'historical'::king_status, 'Denmark', 'King', false, ARRAY['tysk']::text[], false, false, 'male', 'Adam av Bremen'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Olof av Hedeby'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Gnupa', 920, 934, (select id from public.royal_dynasties where name='Olof-dynastin' limit 1), 'historical'::king_status, 'Denmark', 'King', false, ARRAY['tysk']::text[], true, false, 'male', 'Adam; Widukind (Chnuba 934); Vedelspang DR 2 DR 4'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Gnupa'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sigtrygg Gnupasson', 934, 935, (select id from public.royal_dynasties where name='Olof-dynastin' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], true, false, 'male', 'Vedelspang-stenarna resta av modern Asfrid'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sigtrygg Gnupasson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Hardeknut', 916, 936, NULL, 'semi_legendary'::king_status, 'Denmark', 'King', false, ARRAY['tysk']::text[], false, false, 'male', 'Adam av Bremen (Gorms far)'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Hardeknut'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sven Estridsen', 1047, 1076, (select id from public.royal_dynasties where name='Estridska ätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, ARRAY['tysk','påvlig']::text[], false, false, 'male', 'Adam (personlig informant); Gregorius VII:s brev; mynt'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sven Estridsen'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Niels', 1104, 1134, (select id from public.royal_dynasties where name='Estridska ätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; Saxo'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Niels'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik Emune', 1134, 1137, (select id from public.royal_dynasties where name='Estridska ätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, ARRAY['rysk']::text[], false, false, 'male', 'Diplom; Saxo; gift med Malmfrid'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik Emune'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik Lam', 1137, 1146, (select id from public.royal_dynasties where name='Estridska ätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Diplom'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik Lam'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sven Grathe', 1146, 1157, (select id from public.royal_dynasties where name='Estridska ätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, ARRAY['tysk']::text[], false, false, 'male', 'Saxo; diplom'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sven Grathe'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Knut V', 1146, 1157, (select id from public.royal_dynasties where name='Estridska ätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Saxo; diplom'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Knut V'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Valdemar den store', 1157, 1182, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Saxo (hovhistoriker); diplom; namn efter Vladimir Monomach'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Valdemar den store'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Knut VI', 1182, 1202, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; Saxo'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Knut VI'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik Plovpenning', 1241, 1250, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; annaler'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik Plovpenning'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Abel', 1250, 1252, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Diplom'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Abel'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Christoffer I', 1252, 1259, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Diplom'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Christoffer I'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik Klipping', 1259, 1286, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; mordet i Finderup 1286'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik Klipping'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Erik Menved', 1286, 1319, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, ARRAY['tysk']::text[], false, false, 'male', 'Diplom; hansakällor'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Erik Menved'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Christoffer II', 1320, 1332, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; avbrott 1326-1329'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Christoffer II'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Valdemar Atterdag', 1340, 1375, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, ARRAY['tysk']::text[], false, false, 'male', 'Diplom; hansakällor; Visby 1361; Lübeck-krönikor'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Valdemar Atterdag'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Oluf II', 1376, 1387, (select id from public.royal_dynasties where name='Valdemarätten' limit 1), 'historical'::king_status, 'Denmark', 'King', false, '{}'::text[], false, false, 'male', 'Diplom'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Oluf II'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sören Norby', 1517, 1526, NULL, 'historical'::king_status, 'Denmark', 'Kaparamiral_sjöfurste', true, ARRAY['tysk']::text[], false, false, 'male', 'Gustav Vasas registratur; lybska akter; död Florens 1530'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sören Norby'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Håkon Sigurdsson jarl', 970, 995, (select id from public.royal_dynasties where name='Ladejarlarna' limit 1), 'historical'::king_status, 'Norway', 'Jarl', true, '{}'::text[], false, false, 'male', 'Samtida skaldeverser; sagatradition'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Håkon Sigurdsson jarl'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Eirik Håkonsson jarl', 1000, 1015, (select id from public.royal_dynasties where name='Ladejarlarna' limit 1), 'historical'::king_status, 'Norway', 'Jarl', true, ARRAY['anglosaxisk']::text[], false, false, 'male', 'Skaldeverser; ASC (i Knuts tjänst)'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Eirik Håkonsson jarl'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Svein Håkonsson jarl', 1000, 1015, (select id from public.royal_dynasties where name='Ladejarlarna' limit 1), 'historical'::king_status, 'Norway', 'Jarl', true, '{}'::text[], false, false, 'male', 'Skaldeverser; sagatradition'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Svein Håkonsson jarl'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Olav Tryggvason', 995, 1000, (select id from public.royal_dynasties where name='Hårfagerätten' limit 1), 'historical'::king_status, 'Norway', 'King', false, ARRAY['anglosaxisk']::text[], false, false, 'male', 'ASC 991/994 samtida; skaldeverser; Svolder ca 1000'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Olav Tryggvason'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Gunnhild kongemor', 930, 975, NULL, 'semi_legendary'::king_status, 'Norway', 'Queen', true, '{}'::text[], false, false, 'female', 'Sagatradition; skaldeverser'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Gunnhild kongemor'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Øystein Magnusson', 1103, 1123, (select id from public.royal_dynasties where name='Hårfagerätten' limit 1), 'historical'::king_status, 'Norway', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; sagor; samregent med Sigurd Jorsalfar'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Øystein Magnusson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Magnus Blinde', 1130, 1135, (select id from public.royal_dynasties where name='Hårfagerätten' limit 1), 'historical'::king_status, 'Norway', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; sagor'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Magnus Blinde'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Harald Gille', 1130, 1136, (select id from public.royal_dynasties where name='Hårfagerätten' limit 1), 'historical'::king_status, 'Norway', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; sagor'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Harald Gille'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Inge Krokrygg', 1136, 1161, (select id from public.royal_dynasties where name='Hårfagerätten' limit 1), 'historical'::king_status, 'Norway', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; sagor'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Inge Krokrygg'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sigurd Munn', 1136, 1155, (select id from public.royal_dynasties where name='Hårfagerätten' limit 1), 'historical'::king_status, 'Norway', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; sagor'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sigurd Munn'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Øystein Haraldsson', 1142, 1157, (select id from public.royal_dynasties where name='Hårfagerätten' limit 1), 'historical'::king_status, 'Norway', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; sagor'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Øystein Haraldsson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Magnus Erlingsson', 1161, 1184, NULL, 'historical'::king_status, 'Norway', 'King', false, ARRAY['påvlig']::text[], false, false, 'male', 'Diplom; kröningsprivilegiet 1163/64'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Magnus Erlingsson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Eirik Magnusson', 1280, 1299, (select id from public.royal_dynasties where name='Sverreätten' limit 1), 'historical'::king_status, 'Norway', 'King', false, '{}'::text[], false, false, 'male', 'Rikt diplommaterial'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Eirik Magnusson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Håkon V Magnusson', 1299, 1319, (select id from public.royal_dynasties where name='Sverreätten' limit 1), 'historical'::king_status, 'Norway', 'King', false, '{}'::text[], false, false, 'male', 'Diplom; dottern Ingeborg länk till Magnus Eriksson'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Håkon V Magnusson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Askold och Dir', 860, 882, NULL, 'semi_legendary'::king_status, 'Kievrus', 'Härskare i Kiev', false, ARRAY['bysantinsk']::text[], false, false, 'male', 'Nestorskrönikan; Konstantinopel-attacken 860 samtida (Fotios)'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Askold och Dir'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Rogvolod av Polotsk', 960, 978, (select id from public.royal_dynasties where name='Polotsk-linjen' limit 1), 'historical'::king_status, 'Kievrus', 'Furste', false, ARRAY['rysk']::text[], false, false, 'male', 'Nestorskrönikan; skandinaviskt namn Ragnvald'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Rogvolod av Polotsk'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Rognéd Rogvolodovna', 960, 1000, (select id from public.royal_dynasties where name='Polotsk-linjen' limit 1), 'historical'::king_status, 'Kievrus', 'Furstinna', false, ARRAY['rysk']::text[], false, false, 'female', 'Nestorskrönikan; mor till Polotsk-grenen'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Rognéd Rogvolodovna'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Izjaslav av Polotsk', 988, 1001, (select id from public.royal_dynasties where name='Rurikdynastin' limit 1), 'historical'::king_status, 'Kievrus', 'Furste', false, ARRAY['rysk']::text[], false, false, 'male', 'Nestorskrönikan; äldsta sekundärlinjen'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Izjaslav av Polotsk'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sveneld', 940, 977, NULL, 'historical'::king_status, 'Kievrus', 'Härförare', true, ARRAY['rysk','bysantinsk']::text[], false, false, 'male', 'Nestorskrönikan; fördraget 971; tjänade Igor Olga/Svjatoslav Jaropolk'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sveneld'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sviatopolk I', 1015, 1019, (select id from public.royal_dynasties where name='Rurikdynastin' limit 1), 'historical'::king_status, 'Kievrus', 'Storfurste', false, ARRAY['rysk','tysk']::text[], false, false, 'male', 'Nestorskrönikan; Thietmar av Merseburg samtida'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sviatopolk I'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sviatopolk II', 1093, 1113, (select id from public.royal_dynasties where name='Rurikdynastin' limit 1), 'historical'::king_status, 'Kievrus', 'Storfurste', false, ARRAY['rysk']::text[], false, false, 'male', 'Nestorskrönikan; diplom'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sviatopolk II'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Vladimir Monomach', 1113, 1125, (select id from public.royal_dynasties where name='Rurikdynastin' limit 1), 'historical'::king_status, 'Kievrus', 'Storfurste', false, ARRAY['rysk','bysantinsk']::text[], false, false, 'male', 'Egen självbiografi Poutjenie; Nestorskrönikan; gift med Gyda av England'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Vladimir Monomach'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Ivar (Ímar)', 857, 873, (select id from public.royal_dynasties where name='Uí Ímair' limit 1), 'historical'::king_status, 'Västerleden', 'King', false, ARRAY['irisk','anglosaxisk']::text[], false, false, 'male', 'Annals of Ulster samtida; ASC 865; rex Nordmannorum totius Hiberniae et Britanniae'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Ivar (Ímar)'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Olav den vite', 853, 871, (select id from public.royal_dynasties where name='Uí Ímair' limit 1), 'historical'::king_status, 'Västerleden', 'King', false, ARRAY['irisk']::text[], false, false, 'male', 'Annals of Ulster'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Olav den vite'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Guthrum', 878, 890, NULL, 'historical'::king_status, 'Västerleden', 'King', false, ARRAY['anglosaxisk']::text[], false, false, 'male', 'ASC; fördraget Alfred-Guthrum bevarat; mynt'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Guthrum'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Halfdan Ragnarsson', 865, 877, (select id from public.royal_dynasties where name='Uí Ímair' limit 1), 'historical'::king_status, 'Västerleden', 'King', false, ARRAY['anglosaxisk','irisk']::text[], false, false, 'male', 'ASC; Annals of Ulster'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Halfdan Ragnarsson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Sigtrygg Caech', 917, 927, (select id from public.royal_dynasties where name='Uí Ímair' limit 1), 'historical'::king_status, 'Västerleden', 'King', false, ARRAY['irisk','anglosaxisk']::text[], false, true, 'male', 'AU; ASC; mynt'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Sigtrygg Caech'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Olav Guthfrithsson', 934, 941, (select id from public.royal_dynasties where name='Uí Ímair' limit 1), 'historical'::king_status, 'Västerleden', 'King', false, ARRAY['irisk','anglosaxisk']::text[], false, true, 'male', 'AU; ASC Brunanburh 937; mynt'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Olav Guthfrithsson'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Olav Kvaran', 941, 981, (select id from public.royal_dynasties where name='Uí Ímair' limit 1), 'historical'::king_status, 'Västerleden', 'King', false, ARRAY['irisk','anglosaxisk']::text[], false, true, 'male', 'AU; ASC; mynt; död på Iona'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Olav Kvaran'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Godred Crovan', 1079, 1095, (select id from public.royal_dynasties where name='Crovan-dynastin' limit 1), 'historical'::king_status, 'Västerleden', 'King', false, ARRAY['irisk']::text[], false, false, 'male', 'Chronicles of Mann; iriska annaler'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Godred Crovan'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Styrbjörn Starke', 970, 985, (select id from public.royal_dynasties where name='Munsöätten' limit 1), 'semi_legendary'::king_status, 'Västerleden', 'Sjökonung', false, '{}'::text[], true, false, 'male', 'Sagatradition; Fyrisvallarna runstensbelagd DR 279 DR 295; Torvald Hjaltasons samtida verser'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Styrbjörn Starke'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Alfred den store', 871, 899, (select id from public.royal_dynasties where name='Wessex-dynastin' limit 1), 'historical'::king_status, 'England', 'King', false, ARRAY['anglosaxisk']::text[], false, true, 'male', 'ASC; Assers Vita; fördraget med Guthrum'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Alfred den store'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Æthelstan', 924, 939, (select id from public.royal_dynasties where name='Wessex-dynastin' limit 1), 'historical'::king_status, 'England', 'King', false, ARRAY['anglosaxisk']::text[], false, true, 'male', 'ASC; charters; mynt; Brunanburh 937'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Æthelstan'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Æthelred II', 978, 1016, (select id from public.royal_dynasties where name='Wessex-dynastin' limit 1), 'historical'::king_status, 'England', 'King', false, ARRAY['anglosaxisk']::text[], false, true, 'male', 'ASC; charters; mynt (förlaga för nordisk myntning)'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Æthelred II'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Edvard Bekännaren', 1042, 1066, (select id from public.royal_dynasties where name='Wessex-dynastin' limit 1), 'historical'::king_status, 'England', 'King', false, ARRAY['anglosaxisk']::text[], false, false, 'male', 'ASC; Vita Ædwardi'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Edvard Bekännaren'));
insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select 'Harold Godwinson', 1066, 1066, (select id from public.royal_dynasties where name='Godwin-ätten' limit 1), 'historical'::king_status, 'England', 'King', false, ARRAY['anglosaxisk']::text[], false, false, 'male', 'ASC; Bayeux-tapeten; halvdansk via modern Gytha'
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower('Harold Godwinson'));

-- 42 relationer
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Knut den store', 'Emma av Normandie', 'äktenskap', '1017', 'Æthelreds änka; son Hardeknut kung av Danmark och England', 'Encomium Emmae Reginae; ASC'
where not exists (select 1 from public.royal_relations x where x.person_a='Knut den store' and x.person_b='Emma av Normandie' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Æthelred II', 'Emma av Normandie', 'äktenskap', '1002', 'Söner: Edvard Bekännaren och Alfred Ætheling', 'ASC'
where not exists (select 1 from public.royal_relations x where x.person_a='Æthelred II' and x.person_b='Emma av Normandie' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Emma av Normandie', 'Rollo av Normandie', 'förälder', NULL, 'Ättling i rakt led — normandisk vikingahärstamning', 'Dudo av Saint-Quentin'
where not exists (select 1 from public.royal_relations x where x.person_a='Emma av Normandie' and x.person_b='Rollo av Normandie' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Gytha Thorkelsdóttir', 'Earl Godwin', 'äktenskap', 'ca 1022', 'Son: Harold Godwinson — Englands siste anglosaxiske kung till hälften dansk', 'ASC; Vita Ædwardi'
where not exists (select 1 from public.royal_relations x where x.person_a='Gytha Thorkelsdóttir' and x.person_b='Earl Godwin' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Ulf jarl', 'Estrid Svendsdatter', 'äktenskap', 'ca 1015', 'Son: Sven Estridsen — Estridska ättens grundare; Ulf var bror till Gytha', 'Adam av Bremen; Saxo'
where not exists (select 1 from public.royal_relations x where x.person_a='Ulf jarl' and x.person_b='Estrid Svendsdatter' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Knut den store', 'Estrid Svendsdatter', 'förälder', NULL, 'Syskon (samma far Sven Tveskägg)', 'Adam av Bremen'
where not exists (select 1 from public.royal_relations x where x.person_a='Knut den store' and x.person_b='Estrid Svendsdatter' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Harold Godwinson', 'Gyda Haroldsdotter', 'förälder', NULL, 'Dottern flydde efter 1066 till Sven Estridsens hov', 'Saxo; rysk tradition'
where not exists (select 1 from public.royal_relations x where x.person_a='Harold Godwinson' and x.person_b='Gyda Haroldsdotter' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Gyda Haroldsdotter', 'Vladimir Monomach', 'äktenskap', 'ca 1074', 'Son: Mstislav med nordiska namnet Harald efter morfadern', 'Ryska genealogier; Saxo'
where not exists (select 1 from public.royal_relations x where x.person_a='Gyda Haroldsdotter' and x.person_b='Vladimir Monomach' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Vladimir Monomach', 'Mstislav Harald', 'förälder', NULL, NULL, 'Nestorskrönikan; Poutjenie'
where not exists (select 1 from public.royal_relations x where x.person_a='Vladimir Monomach' and x.person_b='Mstislav Harald' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Mstislav Harald', 'Kristina Ingesdotter', 'äktenskap', 'ca 1095', 'Dotter till Inge den äldre av Sverige', 'Ryska genealogier'
where not exists (select 1 from public.royal_relations x where x.person_a='Mstislav Harald' and x.person_b='Kristina Ingesdotter' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Mstislav Harald', 'Malmfrid Mstislavsdotter', 'förälder', NULL, NULL, 'Ryska genealogier'
where not exists (select 1 from public.royal_relations x where x.person_a='Mstislav Harald' and x.person_b='Malmfrid Mstislavsdotter' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Mstislav Harald', 'Ingeborg Mstislavsdotter', 'förälder', NULL, NULL, 'Ryska genealogier'
where not exists (select 1 from public.royal_relations x where x.person_a='Mstislav Harald' and x.person_b='Ingeborg Mstislavsdotter' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Malmfrid Mstislavsdotter', 'Sigurd Jorsalfar', 'äktenskap', 'ca 1116', 'Senare omgift med Erik Emune av Danmark', 'Sagatradition; Saxo'
where not exists (select 1 from public.royal_relations x where x.person_a='Malmfrid Mstislavsdotter' and x.person_b='Sigurd Jorsalfar' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Malmfrid Mstislavsdotter', 'Erik Emune', 'äktenskap', 'ca 1130', NULL, 'Saxo'
where not exists (select 1 from public.royal_relations x where x.person_a='Malmfrid Mstislavsdotter' and x.person_b='Erik Emune' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Ingeborg Mstislavsdotter', 'Knut Lavard', 'äktenskap', 'ca 1116', 'Son: Valdemar den store — döpt efter Vladimir Monomach', 'Saxo'
where not exists (select 1 from public.royal_relations x where x.person_a='Ingeborg Mstislavsdotter' and x.person_b='Knut Lavard' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Knut Lavard', 'Valdemar den store', 'förälder', NULL, NULL, 'Saxo; diplom'
where not exists (select 1 from public.royal_relations x where x.person_a='Knut Lavard' and x.person_b='Valdemar den store' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Olof Skötkonung', 'Ingegerd Olofsdotter', 'förälder', NULL, NULL, 'Nordisk tradition; Nestorskrönikan'
where not exists (select 1 from public.royal_relations x where x.person_a='Olof Skötkonung' and x.person_b='Ingegerd Olofsdotter' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Ingegerd Olofsdotter', 'Jaroslav den vise', 'äktenskap', '1019', 'Kallas Irina; dör som nunnan Anna; lokalt helgon i Novgorod', 'Nestorskrönikan'
where not exists (select 1 from public.royal_relations x where x.person_a='Ingegerd Olofsdotter' and x.person_b='Jaroslav den vise' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Jaroslav den vise', 'Ellisiv Jaroslavna', 'förälder', NULL, NULL, 'Nestorskrönikan'
where not exists (select 1 from public.royal_relations x where x.person_a='Jaroslav den vise' and x.person_b='Ellisiv Jaroslavna' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Ellisiv Jaroslavna', 'Harald Hårdråde', 'äktenskap', 'ca 1044', 'Harald hade tjänat vid Jaroslavs hov och i väringagardet', 'Sagatradition; skaldeverser'
where not exists (select 1 from public.royal_relations x where x.person_a='Ellisiv Jaroslavna' and x.person_b='Harald Hårdråde' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Jaroslav den vise', 'Anna av Kiev', 'förälder', NULL, 'Anna ⚭ Henrik I av Frankrike; signerade med kyrilliska bokstäver', 'Franska kungadiplom'
where not exists (select 1 from public.royal_relations x where x.person_a='Jaroslav den vise' and x.person_b='Anna av Kiev' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Olav den helige', 'Jaroslav den vise', 'exil_hos', '1028', 'Flydde till Kiev-hovet efter Knuts maktövertagande', 'Sagatradition; skaldeverser'
where not exists (select 1 from public.royal_relations x where x.person_a='Olav den helige' and x.person_b='Jaroslav den vise' and x.relation_type='exil_hos');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Magnus den gode', 'Jaroslav den vise', 'fostran', '1028-1035', 'Uppfostrad i Kiev; hämtad till norska tronen 1035', 'Sagatradition'
where not exists (select 1 from public.royal_relations x where x.person_a='Magnus den gode' and x.person_b='Jaroslav den vise' and x.relation_type='fostran');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Harald Hårdråde', 'Bysans', 'tjänst_hos', 'ca 1034-1043', 'Väringaofficer; belagd som Araltes i Kekaumenos Strategikon', 'Kekaumenos; skaldeverser'
where not exists (select 1 from public.royal_relations x where x.person_a='Harald Hårdråde' and x.person_b='Bysans' and x.relation_type='tjänst_hos');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Olav Tryggvason', 'Vladimir den store', 'fostran', 'ca 977-987', 'Uppväxt vid Vladimirs hov enligt sagatraditionen', 'Sagatradition (nivå 3)'
where not exists (select 1 from public.royal_relations x where x.person_a='Olav Tryggvason' and x.person_b='Vladimir den store' and x.relation_type='fostran');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Guthrum', 'Alfred den store', 'fadderskap', '878', 'Dop efter Edington; fördraget definierar Danelagens gräns', 'ASC; fördragstexten bevarad'
where not exists (select 1 from public.royal_relations x where x.person_a='Guthrum' and x.person_b='Alfred den store' and x.relation_type='fadderskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Olav Tryggvason', 'Æthelred II', 'fadderskap', '994', 'Konfirmation med Æthelred som fadder', 'ASC'
where not exists (select 1 from public.royal_relations x where x.person_a='Olav Tryggvason' and x.person_b='Æthelred II' and x.relation_type='fadderskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Vladimir den store', 'Anna Porphyrogenita', 'äktenskap', '988', 'Del av paketet med dop och 6000 väringar till Basileios II', 'Nestorskrönikan; bysantinska källor'
where not exists (select 1 from public.royal_relations x where x.person_a='Vladimir den store' and x.person_b='Anna Porphyrogenita' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Vladimir den store', 'Rognéd Rogvolodovna', 'äktenskap', 'ca 978', 'Efter dråpet på hennes far Rogvolod; son Izjaslav grundar Polotsk-linjen', 'Nestorskrönikan'
where not exists (select 1 from public.royal_relations x where x.person_a='Vladimir den store' and x.person_b='Rognéd Rogvolodovna' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Vladimir den store', 'Rogvolod av Polotsk', 'dråp/strid', 'ca 978', NULL, 'Nestorskrönikan'
where not exists (select 1 from public.royal_relations x where x.person_a='Vladimir den store' and x.person_b='Rogvolod av Polotsk' and x.relation_type='dråp/strid');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Styrbjörn Starke', 'Erik Segersäll', 'dråp/strid', 'ca 985', 'Fyrisvallarna; farbror mot brorson', 'DR 279 Sjörup; DR 295 Hällestad; Torvald Hjaltasons verser'
where not exists (select 1 from public.royal_relations x where x.person_a='Styrbjörn Starke' and x.person_b='Erik Segersäll' and x.relation_type='dråp/strid');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Styrbjörn Starke', 'Harald Blåtand', 'äktenskap', 'ca 980', 'Gift med Haralds dotter Tyra enligt vissa källor', 'Sagatradition (nivå 3)'
where not exists (select 1 from public.royal_relations x where x.person_a='Styrbjörn Starke' and x.person_b='Harald Blåtand' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Eufemia Eriksdotter', 'Albrekt II av Mecklenburg', 'äktenskap', '1336', 'Anspråkslänken: sonen Albrekt svensk kung 1364', 'Diplom; Mecklenburgisches Urkundenbuch'
where not exists (select 1 from public.royal_relations x where x.person_a='Eufemia Eriksdotter' and x.person_b='Albrekt II av Mecklenburg' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Magnus Eriksson', 'Eufemia Eriksdotter', 'förälder', NULL, 'Syskon — därför var Albrekt Magnus systerson', 'Diplom'
where not exists (select 1 from public.royal_relations x where x.person_a='Magnus Eriksson' and x.person_b='Eufemia Eriksdotter' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Håkon V Magnusson', 'Ingeborg Håkansdotter', 'förälder', NULL, 'Ingeborg ⚭ hertig Erik Magnusson; son Magnus Eriksson — unionslänken', 'Diplom'
where not exists (select 1 from public.royal_relations x where x.person_a='Håkon V Magnusson' and x.person_b='Ingeborg Håkansdotter' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Ingeborg Håkansdotter', 'Erik Magnusson (hertig)', 'äktenskap', '1312', 'OBS rättelse 5: hertig Erik ej gift med Beatrix', 'Diplom'
where not exists (select 1 from public.royal_relations x where x.person_a='Ingeborg Håkansdotter' and x.person_b='Erik Magnusson (hertig)' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Sven Tveskägg', 'Knut den store', 'förälder', NULL, NULL, 'Adam; ASC'
where not exists (select 1 from public.royal_relations x where x.person_a='Sven Tveskägg' and x.person_b='Knut den store' and x.relation_type='förälder');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Harald Hårdråde', 'Harold Godwinson', 'dråp/strid', '1066', 'Stamford Bridge — inomnordiskt tronkrig om England', 'ASC'
where not exists (select 1 from public.royal_relations x where x.person_a='Harald Hårdråde' and x.person_b='Harold Godwinson' and x.relation_type='dråp/strid');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Erik Emune', 'Malmfrid Mstislavsdotter', 'äktenskap', 'ca 1130', 'Dubblettkontroll mot rad 14 vid import', 'Saxo'
where not exists (select 1 from public.royal_relations x where x.person_a='Erik Emune' and x.person_b='Malmfrid Mstislavsdotter' and x.relation_type='äktenskap');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Bo Jonsson Grip', 'Albrekt av Mecklenburg', 'tjänst_hos', '1371-1386', 'Drots och kronans finansiär via pantlän', 'SDHK'
where not exists (select 1 from public.royal_relations x where x.person_a='Bo Jonsson Grip' and x.person_b='Albrekt av Mecklenburg' and x.relation_type='tjänst_hos');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Måns Bengtsson Natt och Dag', 'Engelbrekt Engelbrektsson', 'dråp/strid', '1436', 'Göksholm', 'Rimkrönikor; diplom'
where not exists (select 1 from public.royal_relations x where x.person_a='Måns Bengtsson Natt och Dag' and x.person_b='Engelbrekt Engelbrektsson' and x.relation_type='dråp/strid');
insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select 'Sten Sture den äldre', 'Karl Knutsson Bonde', 'förälder', NULL, 'Systerson — grunden för maktpositionen', 'ÄSF; SBL'
where not exists (select 1 from public.royal_relations x where x.person_a='Sten Sture den äldre' and x.person_b='Karl Knutsson Bonde' and x.relation_type='förälder');

-- Koppla relationer till historical_kings via namn (best-effort)
update public.royal_relations r set king_a_id=k.id from public.historical_kings k
  where r.king_a_id is null and lower(k.name)=lower(r.person_a);
update public.royal_relations r set king_b_id=k.id from public.historical_kings k
  where r.king_b_id is null and lower(k.name)=lower(r.person_b);

-- Integritetscheck (ska ge 0 rader): legendariska med extern attestering
-- select name from public.historical_kings where status='legendary' and array_length(external_attestation,1) > 0;

commit;
