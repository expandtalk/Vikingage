-- ============================================================================
-- Fas 2: Reifiera anonyma flerstensmästare.
--
-- Bakgrund: efter 20260719330000 ligger "samma hand"-attribueringar som
-- per-inskrift-noter i inscription_attributions. Där ≥2 stenar (alla i
-- runic_inscriptions) ömsesidigt attribueras varandra utgör de EN anonym
-- ristarhand som är värd en egen nod — då kopplas stenarna ihop i grafen och
-- man kan härleda t.ex. verksamhetsområde och period ur stenarna (Källströms
-- resonemang om hypotetiska ristargrupper, kap 3.3.4).
--
-- Endast SLUTNA ömsesidiga grupper tas med (alla medlemmar finns som källor i
-- inscription_attributions => garanterat i runic_inscriptions). Enkelstenar och
-- större olösta grupper (t.ex. U 1015+1017–1024, DR 372/380/401/402) lämnas som
-- noter/staging tills rundata-re-importen fyllt på de saknade stenarna.
--
-- 10 mästare, 23 stenar. Idempotent (not exists-vakter).
-- Bytea-brygga: carver_inscription.carverid/inscriptionid = hex av uuid utan '-'.
-- ============================================================================

begin;

-- Flagga anonyma ristare (för separat filtrering/rendering i frontend).
alter table public.carvers add column if not exists is_anonymous boolean not null default false;

-- 1. Skapa de anonyma mästarna (description bevarar ÄVEN de attribuerade signa
--    som ännu inte finns som egna stenar, så ingen information tappas).
insert into public.carvers (name, description, is_anonymous, is_professional, source_ref)
select v.name, v.descr, true, null, 'Källström 2007 / SRD (anonym hand, stilattribuering)'
from (values
  ('Anonym mästare (DR 293/294/343)',       'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: DR 293, DR 294, DR 343.'),
  ('Anonym mästare (DR 295/297)',           'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: DR 295, DR 297.'),
  ('Anonym mästare (DR 334/335)',           'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: DR 334, DR 335.'),
  ('Anonym mästare (DR 379/387/389)',       'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: DR 372, DR 379, DR 380, DR 387, DR 389 (DR 372 och 380 ännu ej i databasen).'),
  ('Anonym mästare (DR 392/406/408)',       'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: DR 392, DR 401, DR 402, DR 406, DR 408 (DR 401 och 402 ännu ej i databasen).'),
  ('Anonym mästare (Ög Hov22-23;25 & Hov24;25)', 'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: Ög Hov22-23;25, Ög Hov24;25.'),
  ('Anonym mästare (Öl 26/27)',             'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: Öl 26, Öl 27.'),
  ('Anonym mästare (U 665/672)',            'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: U 665, U 672.'),
  ('Anonym mästare (U 1026/1027)',          'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: U 1026, U 1027.'),
  ('Anonym mästare (Vs 18/19)',             'Anonym runristare identifierad genom stilattribuering (samma hand). Attribuerade inskrifter: Vs 18, Vs 19.')
) as v(name, descr)
where not exists (select 1 from public.carvers c where c.name = v.name);

-- 2. Länka medlemsstenarna till respektive mästare (attribution='attributed').
--    certainty följer attribueringens säkerhet (säker = true, "troligen/eventuellt" = false).
insert into public.carver_inscription
  (carverinscriptionid, carverid, inscriptionid, attribution, certainty, notes, lang)
select
  decode(replace(gen_random_uuid()::text,'-',''),'hex'),
  decode(replace(c.id::text,'-',''),'hex'),
  decode(replace(ri.id::text,'-',''),'hex'),
  'attributed',
  m.certainty,
  'Anonym hand — attribuerad flerstensgrupp (Källström 2007 / SRD)',
  'sv'
from (values
  ('Anonym mästare (DR 293/294/343)','DR 293', false),
  ('Anonym mästare (DR 293/294/343)','DR 294', false),
  ('Anonym mästare (DR 293/294/343)','DR 343', false),
  ('Anonym mästare (DR 295/297)','DR 295', false),
  ('Anonym mästare (DR 295/297)','DR 297', false),
  ('Anonym mästare (DR 334/335)','DR 334', true),
  ('Anonym mästare (DR 334/335)','DR 335', true),
  ('Anonym mästare (DR 379/387/389)','DR 379', false),
  ('Anonym mästare (DR 379/387/389)','DR 387', false),
  ('Anonym mästare (DR 379/387/389)','DR 389', false),
  ('Anonym mästare (DR 392/406/408)','DR 392', true),
  ('Anonym mästare (DR 392/406/408)','DR 406', true),
  ('Anonym mästare (DR 392/406/408)','DR 408', true),
  ('Anonym mästare (Ög Hov22-23;25 & Hov24;25)','Ög Hov22-23;25', true),
  ('Anonym mästare (Ög Hov22-23;25 & Hov24;25)','Ög Hov24;25', true),
  ('Anonym mästare (Öl 26/27)','Öl 26', true),
  ('Anonym mästare (Öl 26/27)','Öl 27', true),
  ('Anonym mästare (U 665/672)','U 665', true),
  ('Anonym mästare (U 665/672)','U 672', true),
  ('Anonym mästare (U 1026/1027)','U 1026', true),
  ('Anonym mästare (U 1026/1027)','U 1027', true),
  ('Anonym mästare (Vs 18/19)','Vs 18', true),
  ('Anonym mästare (Vs 18/19)','Vs 19', true)
) as m(carver_name, signum, certainty)
join public.carvers c            on c.name = m.carver_name
join public.runic_inscriptions ri on ri.signum = m.signum
where not exists (
  select 1 from public.carver_inscription ci
  where encode(ci.carverid,'hex') = replace(c.id::text,'-','')
    and encode(ci.inscriptionid,'hex') = replace(ri.id::text,'-','')
);

-- 3. Ta bort de nu överflödiga same_hand-noterna för de reifierade stenarna.
--    (Mästar-noden + länkarna representerar grupperingen bättre. Enkelstenar
--     och specialtyper — reading_history/skill_note — behålls som noter.)
delete from public.inscription_attributions ia
where ia.kind = 'same_hand'
  and ia.inscription_id in (
    select ri.id from public.runic_inscriptions ri
    where ri.signum in (
      'DR 293','DR 294','DR 343','DR 295','DR 297','DR 334','DR 335',
      'DR 379','DR 387','DR 389','DR 392','DR 406','DR 408',
      'Ög Hov22-23;25','Ög Hov24;25','Öl 26','Öl 27',
      'U 665','U 672','U 1026','U 1027','Vs 18','Vs 19'
    )
  );

commit;
