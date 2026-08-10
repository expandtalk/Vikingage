-- Per-individ forensik för massaker-/våldsplatser (Sandby borg m.fl.).
-- Källförd; FAKTA skiljs från tolkning i interpretation-fältet.
-- Applicerad på prod via MCP apply_migration (create_forensic_individuals); denna fil = repo-spegel.

create table if not exists public.forensic_individuals (
  id uuid primary key default gen_random_uuid(),
  hillfort_id uuid references public.swedish_hillforts(id) on delete set null,
  site_name text not null default 'Sandby borg',
  individual_label text,
  find_number text,
  house text,
  age text,
  sex_osteo text,
  sex_dna text,
  stature_cm text,
  body_position text,
  trauma_type text,
  trauma_description text,
  perimortem boolean,
  pathology text,
  fire_exposure text,
  interpretation text,
  confidence text,
  source text,
  source_uri text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.forensic_individuals is 'Per-individ forensik (trauma/patologi/kontext) för massaker-/våldsplatser. Källförd; skilj FAKTA från tolkning i interpretation-fältet.';

alter table public.forensic_individuals enable row level security;

drop policy if exists "forensic_individuals public read" on public.forensic_individuals;
create policy "forensic_individuals public read"
  on public.forensic_individuals for select using (true);

drop policy if exists "forensic_individuals admin write" on public.forensic_individuals;
create policy "forensic_individuals admin write"
  on public.forensic_individuals for all using (public.is_admin()) with check (public.is_admin());

-- Seed: Sandby borg, Hus 40 (Gunnarsson, Victor & Alfsdotter 2016, Sandby borg VII).
-- Idempotent: hoppar över om redan seedad.
insert into public.forensic_individuals
(hillfort_id, individual_label, find_number, house, age, sex_osteo, sex_dna, stature_cm, body_position, trauma_type, trauma_description, perimortem, pathology, fire_exposure, interpretation, confidence, source)
select h.id, v.individual_label, v.find_number, v.house, v.age, v.sex_osteo, v.sex_dna, v.stature_cm, v.body_position, v.trauma_type, v.trauma_description, v.perimortem, v.pathology, v.fire_exposure, v.interpretation, v.confidence, v.source
from (values
 ('Individ 3','F6948','Hus 40','vuxen, ≥35 år',null,null,null,'endast kranium + delar av armben (disartikulerad)','skarp','Två dödsbringande hugg med eggvapen (ev. yxa): hö pannben (~3 cm+) och vä hjässben (~5,5–7 cm).',true,'karies i kindtänder','tandrötter grad 1 (mjukvävnad kvar)','Förövaren stod ovanför → offret kan ha suttit ner (tolkning).','hög','Sandby borg VII 2016, fyndnr F6948'),
 ('Individ 4','F6447','Hus 40','vuxen (medelålders?)','man?','man (DNA, troligen)',null,'framstupa','ingen påvisad','Inga säkra dödsbringande skelettskador. Läkt fraktur hö överarm.',null,'läkt överarmsfraktur; Schmorl´s noder; 5 karies','grad 1 (mjukvävnad kvar)','Möjligt mjukdelshugg utan skelettspår (tolkning).','medel','Sandby borg VII 2016, fyndnr F6447'),
 ('Individ 5','F6356','Hus 40','vuxen, yngre medelålder','man?','man (DNA)','~178','på rygg','oklar','Tre små hål i tinningbenet (ska studeras); illa bevarad.',null,null,'grad 1 lokal',null,'låg','Sandby borg VII 2016, fyndnr F6356'),
 ('Individ 6','F6323','Hus 40','~12–15 år (~13,5)',null,'pojke (DNA)','~164–167','rak på rygg; föll över Ind 5','trubbig/skarp (mix)','Kraniekross + hål genom båda tabula (rekylartad kraft).',true,'korsbett; mild emaljhypoplasi','ingen','Rak kroppsställning → plötslig död (tolkning).','medel','Sandby borg VII 2016, fyndnr F6323'),
 ('Individ 7','F6097','Hus 40','~12–15 år',null,'pojke (DNA)','~154–157','hockerställning','trubbig','Krosskador hö pannben + hjässben (nedåtsidan).',true,'periostit (värst vä tibia); Schmorl´s noder','ingen','Kan ha hunnit kura ihop (tolkning). Alfsdotters avhandling.','osäkert (trubbigt)','Sandby borg VII 2016, fyndnr F6097'),
 ('F7182 (oidentifierad)','F7182','Hus 40','vuxen','man?',null,'~188','underben + fot','ingen påvisad','Silverbeslag (F7227) vid foten = skodetalj.',null,null,null,'Kan tillhöra Ind 3 el. 4 (obelagt).','låg','Sandby borg VII 2016, fyndnr F7182'),
 ('Individ 8','F7508','Hus 40','barn 2–5 år',null,null,null,'endast 3 bröstkotor','ingen påvisad','Resten saknas.',null,null,null,'Kotorna kan ha förflyttats av djur (tolkning).','låg','Sandby borg VII 2016, fyndnr F7508'),
 ('Individ 25','F6323','Hus 40','spädbarn 1,5–3 mån',null,null,null,'lårben intill Ind 6','ingen påvisad','Enda spädbarnselementet.',null,null,null,'Starkt belägg för kvinnor i borgen (tolkning).','belägg kvinnonärvaro','Sandby borg VII 2016, fyndnr F6323 (Ind 25)'),
 ('Individ 1','—','Hus 40 (ingången)','ung man ~17–19 år',null,null,null,'innanför ingången','skarp','Två kraftiga hugg mot huvudet (svärd/yxa).',true,null,null,'Tidigare säsong (2012); i rapport VII:s sammanfattning.','hög','Sandby borg VII 2016; Victor 2012')
) as v(individual_label, find_number, house, age, sex_osteo, sex_dna, stature_cm, body_position, trauma_type, trauma_description, perimortem, pathology, fire_exposure, interpretation, confidence, source)
cross join (select id from public.swedish_hillforts where id='53969468-2554-4b19-871a-2fa51d79f333') h
where not exists (select 1 from public.forensic_individuals fi where fi.find_number = v.find_number and fi.individual_label = v.individual_label);
