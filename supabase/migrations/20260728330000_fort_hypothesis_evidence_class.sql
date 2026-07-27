-- Kalmar stadsmur steg 0 (Daniel): datamodellen är problemet, inte datan. "Rätt linje" finns inte
-- som EN linje — KLM:s Odengatan-undersökning jämförde tre publicerade tolkningar (Kalmar stads
-- historia, Medeltidsstaden, Åkerlund) och fann Åkerlunds bäst. Konkurrerande rekonstruktioner =
-- togglebara HYPOTESER. Och osäkerheten är extremt ojämn → evidensklass PER SEGMENT, inte en
-- utsmetad ±60 m-flagga. Kostar noll i datainsamling, gör kartan ärlig direkt.
begin;

-- Publicerade rekonstruktioner som förstaklassobjekt (togglebara lager när geometri finns per hypotes).
create table if not exists public.fort_hypothesis (
  id bigserial primary key,
  site text not null,
  name text not null,
  author text,
  year int,
  source_ref text,
  note text,
  unique (site, name)
);
alter table public.fort_hypothesis enable row level security;
drop policy if exists fh_read on public.fort_hypothesis;
create policy fh_read on public.fort_hypothesis for select using (true);

insert into public.fort_hypothesis (site, name, author, year, source_ref, note) values
  ('Kalmar gamla stad','Åkerlund','Harald Åkerlund',1951,'Åkerlund 1951',
     'KLM:s undersökning i Odengatan fann Åkerlunds sträckning passa bäst av de tre.'),
  ('Kalmar gamla stad','Medeltidsstaden Kalmar','Riksantikvarieämbetet',1979,'Medeltidsstaden 15',
     'RAÄ:s medeltidsstadsprojekt.'),
  ('Kalmar gamla stad','Kalmar stads historia',null,1979,'Kalmar stads historia I',
     'Äldre stadshistorisk tolkning.')
on conflict (site, name) do nothing;

-- Ärlighetsaxeln: evidensklass per segment + koppling till en hypotes (null = belagt faktum, ej tolkning).
alter table public.fort_element
  add column if not exists evidence_class text,
  add column if not exists hypothesis_id bigint references public.fort_hypothesis(id),
  add column if not exists pos_uncertainty_m numeric;

-- Villkorat vokabulär (tillåt null under övergången; ärv annars RAÄ:s Lägesosäkerhet i steg 1).
do $$ begin
  if not exists (select 1 from pg_constraint where conname='fort_element_evidence_class_chk') then
    alter table public.fort_element add constraint fort_element_evidence_class_chk
      check (evidence_class is null or evidence_class in
        ('uppmatt','gravd_punkt','bevarat_ovan_mark','interpolerad','hypotetisk'));
  end if;
end $$;

-- Ärlig omtaggning av Kalmars 6 befintliga element (ingen ny geometri, bara sanning om det vi har).
update public.fort_element
  set pos_uncertainty_m = coalesce(pos_uncertainty_m, pos_accuracy_m)
  where site = 'Kalmar gamla stad';

-- Bevarat, synligt muravsnitt = enda genuint säkra biten.
update public.fort_element set evidence_class = 'bevarat_ovan_mark'
  where site = 'Kalmar gamla stad' and name ilike '%Bevarat muravsnitt%';

-- Preliminär helsträckning: interpolerad längs bevarat gatunät/slott — INTE uppmätt.
update public.fort_element set evidence_class = 'interpolerad'
  where site = 'Kalmar gamla stad' and name ilike '%ungefärliga sträckning%';

-- Portlägen = rekonstruerade → hypotetiska (Söderport har dock dokumenterat läge, se not).
update public.fort_element set evidence_class = 'hypotetisk'
  where site = 'Kalmar gamla stad' and element_type = 'port';

commit;
