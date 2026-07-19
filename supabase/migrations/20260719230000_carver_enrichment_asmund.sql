-- Berikar ristaren Åsmund (Kåresson) ur Källström (2007) + Thompson (1975). Alla hans
-- 39 befintliga carver_inscription-länkar pekar på inskrifts-id som inte finns i
-- runic_inscriptions (0 upplöser -> "Unknown"). Här läggs korrekt upplösande länkar
-- till hans signerade stenar. carverid/inscriptionid = bytea(hex av uuid utan bindestreck).
update public.carvers set
  region = coalesce(region, 'Uppland'),
  gender = 'male',
  is_professional = true,
  description = 'Åsmund Kåresson (Ásmundr Kára sunn) — en av de mest produktiva och skickliga uppländska runristarna, verksam ca 1020-talet till 1000-talets mitt med tyngdpunkt kring Uppsala och ett arbetsområde från Gästrikland i norr till Stockholmstrakten i söder. Signerade ristningar fördelar sig över stilgrupperna Pr 2 till Pr 4 (en enstaka Pr 5-bestämning anses tveksam). I signaturerna växlar han mellan verben rísta, haggva och marka — marka är närmast hans kännetecken (10 av 12 uppländska belägg). Samarbetade med flera ristare: Sven, Vigmar, Härjar och troligen Ingjald. Den äldre identifikationen med missionsbiskopen Osmundus (Adam av Bremen) är numera i stort sett övergiven bland runologer.',
  source_ref = 'Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA); Thompson, C. W. (1975). Studies in Upplandic Runography.'
where id = 'f40421db-0d36-4fa6-8ec8-b3a286dcc73b';

insert into public.carver_inscription (carverinscriptionid, carverid, inscriptionid, attribution, certainty, notes, lang)
select decode(replace(gen_random_uuid()::text,'-',''),'hex'),
       decode('f40421db0d364fa68ec8b3a286dcc73b','hex'),
       decode(v.insc_hex,'hex'), v.attr::attribution_type, v.cert, v.notes, 'sv'
from (values
  ('edc9f5115a924f0980fe256106bc7d59','signed', true,  'Signatur osmuntr (nominativ). Källström 2007, Thompson 1975.'),
  ('991fd348927a4cc08e314ebaa6517b5f','signed', true,  'Tierps kyrka; signerad av Åsmund tillsammans med ristaren Härjar (Pr 3). Källström 2007.'),
  ('a25cd340b3ce4a03bf07a7871172a845','signed', true,  'Signerad ristning med attributet réttr (rätt). Källström 2007.'),
  ('744d48ebfffa446b843165401db32a47','signed', true,  'Signerad ristning med attributet réttr; signaturen i motsatt skriftriktning. Källström 2007.'),
  ('21c8e6c62bc24d3f958a4792313efd72','signed', true,  'Gästrikland — visar Åsmunds nordliga arbetsområde; signatur med réttr. Källström 2007.'),
  ('36063e39869941d6bd9b12ecdc2d6e5c','signed', true,  'Signerad ristning; signaturen placerad i rundjurets hals/svans. Källström 2007.'),
  ('edf24114accd48b2adb12fbb2a6974d3','signed', true,  'Signerad av Åsmund med minst en medristare vars namn är skadat. Källström 2007, UR 3:585.')
) as v(insc_hex, attr, cert, notes)
where not exists (
  select 1 from public.carver_inscription ci
  where ci.carverid = decode('f40421db0d364fa68ec8b3a286dcc73b','hex')
    and ci.inscriptionid = decode(v.insc_hex,'hex')
);
