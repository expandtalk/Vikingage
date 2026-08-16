-- Rökstenen (Ög 136): sektionsstruktur + konkurrerande läsningar (claim-ledgrat).
-- Källa: runolog-utredning 2026-08-16 (von Friesen 1920, Wessén 1958, Höfler 1952, Ralph 2007,
-- Holmberg/Gräslund/Sundqvist/Williams 2020, Ousbäck oberoende). Rättar 'väringar'→'märingar (Mæringar)'.
-- EJ infört (saknar källa): Hedeby-träpinnen, 'Erik Refilsson'. location_hypotheses används EJ (plats-scopad).

-- 1) Claim-liggare för textläsningar (inscription/feature-scopad; skild från plats-scopad place_claim).
create table if not exists public.interpretation_claim (
  id uuid primary key default gen_random_uuid(),
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  feature_id uuid references public.inscription_features(id) on delete set null,
  part_key text,                       -- minnesformel/theoderik_strof/gatosvit/chiffer
  reading_translit text,               -- vad som STÅR (transkription)
  normalization text,                  -- normaliserad fornnordisk form
  translation text,                    -- vad det BETYDER (översättning)
  scholar_name text,                   -- auktoritativ attribution (fullständigt namn)
  scholar_id uuid references public.research_scholars(id) on delete set null,
  year int,
  source text,
  status text not null check (status in ('transkription','etablerad','omstridd','oberoende','forkastad')),
  confidence numeric check (confidence between 0 and 1),
  note text,
  created_at timestamptz not null default now()
);
comment on table public.interpretation_claim is
  'Konkurrerande läsningar av runinskrifter, claim-ledgrat. status: transkription (vad som står) / etablerad (fackgranskad huvudläsning) / omstridd / oberoende (icke fackgranskad) / forkastad. Attribution i scholar_name (fullständigt namn). Ingen auto-befordran av tolkning.';
create index if not exists idx_intclaim_insc on public.interpretation_claim(inscription_id);
create index if not exists idx_intclaim_part on public.interpretation_claim(part_key);

alter table public.interpretation_claim enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='interpretation_claim' and policyname='ic_public_read') then
    create policy ic_public_read on public.interpretation_claim for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='interpretation_claim' and policyname='ic_admin_write') then
    create policy ic_admin_write on public.interpretation_claim for all
      using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- 1b) Utöka feature_type-vokabulären med 'textparti' (segmentering av inskrift i partier).
alter table public.inscription_features drop constraint if exists inscription_features_feature_type_check;
alter table public.inscription_features add constraint inscription_features_feature_type_check
  check (feature_type = any (array['boneformel','ristarformel','nekrolog','familjerelation','endast_namn',
    'trollformel','kors','flerstensmonument','poetisk','dubbellasning','skiljetecken','ornamentstil','textparti']));

-- 2) Segmentering: fyra textpartier som inscription_features (feature_type='textparti', note=part_key).
insert into public.inscription_features (inscription_id, feature_type, feature_value, status, source, note)
select r.id, 'textparti', v.translit, 'belagt', 'Rundata/runkartan.se (Ög 136); runolog-utredning 2026-08-16', v.part_key
from public.runic_inscriptions r,
(values
  ('minnesformel','aft uamuþ stonta runaR þaR (i)n uarin faþi faþiR aft faikion sunu'),
  ('theoderik_strof','raiþ þiaurikʀ hin þurmuþi stiliʀ flutna strąntu hraiþmaraʀ sitiʀ nu karuʀ o kuta sinum skialti ub fatlaþʀ skati marika'),
  ('gatosvit','þat sagum … (t.ex. tjugo kungar på Själland; Sibbi i Vé, nittioårig, avlade en son)'),
  ('chiffer','skiftchiffer/samstavsrunor + numeriskt chiffer + kryssen på ovansidan')
) as v(part_key, translit)
where r.signum = 'Ög 136'
  and not exists (select 1 from public.inscription_features f
                  where f.inscription_id=r.id and f.feature_type='textparti' and f.note=v.part_key);

-- 3) Läsningar (interpretation_claim). feature_id kopplas via note=part_key.
insert into public.interpretation_claim
  (inscription_id, feature_id, part_key, reading_translit, normalization, translation, scholar_name, year, source, status, confidence, note)
select r.id,
       (select f.id from public.inscription_features f where f.inscription_id=r.id and f.feature_type='textparti' and f.note=c.part_key),
       c.part_key, c.reading_translit, c.normalization, c.translation, c.scholar_name, c.year, c.source, c.status, c.confidence, c.note
-- Kolumnordning: (part_key, reading_translit, normalization, translation, scholar_name, year, source, status, confidence, note)
from public.runic_inscriptions r,
(values
  -- Parti 1: minnesformel (transkription)
  ('minnesformel',
   'aft uamuþ stonta runaR þaR (i)n uarin faþi faþiR aft faikion sunu',
   'Aft Vámóð standa rúnar þar. En Varinn fáði, faðir, aft faigian sunu.',
   'Efter Vámóðr står dessa runor. Men Varinn ristade dem, fadern, efter den döde sonen.',
   null::text, null::int,
   'Rundata; Elias Wessén, Sveriges runinskrifter (1958)', 'transkription', 0.95,
   'Belagd minnesformel; ristare Varinn efter sonen Vámóðr.'),
  -- Parti 2: Theoderik-strofen — transkription
  ('theoderik_strof',
   'raiþ þiaurikʀ hin þurmuþi stiliʀ flutna strąntu hraiþmaraʀ sitiʀ nu karuʀ o kuta sinum skialti ub fatlaþʀ skati marika',
   'Réð Þjóðríkr hinn þurmóði, stillir flutna, strandu Hreiðmarar. Sitr nú gǫrr á gota sínum, skildi umb fatlaðr, skati Mæringa.',
   'Transkription — se konkurrerande läsningar nedan.',
   null::text, null::int,
   'runkartan.se (Ög 136)', 'transkription', 0.95, null),
  -- Parti 2: etablerad (Theoderik den store) — RÄTTAD: märingar, ej väringar
  ('theoderik_strof',
   null::text,
   'Réð Þjóðríkr hinn þurmóði, stillir flutna, strandu Hreiðmarar …',
   'Rådde Þjóðríkr (Theoderik den store) den dristige, sjökrigarnas hövding, över Hreiðhavets strand. Nu sitter han rustad på sin gotiska häst, med skölden fäst, MÄRINGARNAS hövding (skati Mæringa).',
   'Otto von Friesen (1920), befäst av Elias Wessén (1958); kultvariant Otto Höfler (1952)', 1920,
   'Otto von Friesen 1920; Elias Wessén, Sveriges runinskrifter 1958; Otto Höfler 1952', 'etablerad', 0.6,
   'Dominerande läsning under 1900-talet; idag utmanad. OBS: skati marika = MÄRINGARNAS (Mæringar, Theoderiks ätt) hövding — INTE "väringar" (vanlig förväxling). "Gotisk häst" korrekt.'),
  -- Parti 2: omstridd (Bo Ralph, gåt-/hästläsning)
  ('theoderik_strof',
   'raiþ … (omtolkad ordindelning: -rikʀ → rinkʀ ''krigare'')',
   null::text,
   'Red på häst(en), den djärve krigaren — varvid Theoderik försvinner ur strofen; inskriften läses som en gåtsvit.',
   'Bo Ralph', 2007,
   'Bo Ralph 2007; Fadern, sonen och världsalltet (senare bok)', 'omstridd', 0.4,
   'Akademisk omläsning: ändrad ordindelning tar bort Theoderik. Ville också datera om till 900-talet (omstritt).'),
  -- Parti 2: omstridd (Fimbulvinter)
  ('theoderik_strof',
   null::text, null::text,
   'Inskriften som nio gåtor vars svar pekar på solen och Oden/hans krigare; kopplas till klimatkatastrofen 536 e.Kr. (fimbulvinter) och rädsla för nytt Ragnarök.',
   'Per Holmberg, Bo Gräslund, Olof Sundqvist & Henrik Williams', 2020,
   'Holmberg, Gräslund, Sundqvist & Williams, "The Rök Runestone and the End of the World", Futhark 9–10 (2020)', 'omstridd', 0.4,
   'Bygger på Ralphs gåt-ansats men behåller tidig datering (~800). Stort medialt genomslag; kritiserad, ej konsensus.'),
  -- Parti 2: OBEROENDE (Fredrik Ousbäck) — B+D i Daniels material = SAMMA upphovsman, EN rad
  ('theoderik_strof',
   'raiþ … (läst som namnet Airik/Erik)',
   null::text,
   'Rök (och Sparlösastenen) som politiskt dokument: sveakungen Björn når överhöghet i en allians med Väster-/Östergötland; sekvens läst som namnet Airik/Erik. "Rådde evigt Airik med mod som Tor …".',
   'Fredrik Ousbäck (FORMAT HISTORIA)', 2007,
   'Fredrik Ousbäck, C-uppsats 2007 + YouTube-kanalen FORMAT HISTORIA', 'oberoende', 0.15,
   'OBEROENDE, ICKE FACKGRANSKAD hypotes (YouTube + C-uppsats) — får EJ jämställas med runologisk konsensus. Samlar Daniels "B" och "D" (samma upphovsman). Hedeby-pinnen (Oddulv/Audrik) och "Erik Refilsson" är EJ införda: saknar signum/publikation — kräver Ousbäcks exakta källhänvisning + runolog-verifiering.')
) as c(part_key, reading_translit, normalization, translation, scholar_name, year, source, status, confidence, note)
where r.signum = 'Ög 136'
  and not exists (select 1 from public.interpretation_claim ic
                  where ic.inscription_id=r.id and ic.part_key is not distinct from c.part_key
                    and ic.status=c.status and coalesce(ic.scholar_name,'') = coalesce(c.scholar_name,''));
