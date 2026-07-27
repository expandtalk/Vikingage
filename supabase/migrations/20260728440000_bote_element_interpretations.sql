-- böte — omtvistat ortnamnselement (kustförsvar/navigation), INTE kult. Läggs i element-katalogen
-- som egen kategori med include=false (grumlar ej kult-anrikningstestet). De fyra konkurrerande
-- etymologierna lagras attribuerade (obs≠tolkning: plural, tidsstämplad) i en egen tolkningstabell,
-- samma modell som event_location_candidates. Källa: Huldén, Namn och bygd 100 (2012); Språkbruk 2/2012.
begin;

insert into public.ortnamn_element_config (element_key, label, category, strength, include, forms, owner, note) values
  ('böte', 'Böte (signaleld/sjömärke)', 'coastal_defense', 'contested', false,
   'böte, -böte: kustnamn Blekinge–norra Uppland, Åland, Finska vikens nordkust (+4 öster om Kvarken)',
   'gemensam',
   'Omtvistat element (ålder/funktion/etymologi diskuterade i ~200 år). Kopplar till vårdkas-/beacon-domänen; Sölve Göransson använde "vårdböte belagd" för kända vårdkasplatser längs Öland och Kalmarsunds kust. include=false: kustförsvar, ej kult — ska ej väga in i kult-anrikningen.')
on conflict (element_key) do nothing;

-- Attribuerade tolkningar (competing interpretations) — konsolideras aldrig till "svaret".
create table if not exists public.ortnamn_element_interpretations (
  id uuid primary key default gen_random_uuid(),
  element_key text references public.ortnamn_element_config(element_key) on delete cascade,
  interpretation text not null,
  proponent text,
  status text,           -- t.ex. 'trovärdigast enligt Huldén'
  source text,
  note text,
  created_at timestamptz not null default now()
);
alter table public.ortnamn_element_interpretations enable row level security;
drop policy if exists oei_read on public.ortnamn_element_interpretations;
create policy oei_read on public.ortnamn_element_interpretations for select using (true);

insert into public.ortnamn_element_interpretations (element_key, interpretation, proponent, status, source, note)
select 'böte', v.i, v.p, v.s, 'Huldén, "Böte – ett omtvistat ortnamnselement", Namn och bygd vol. 100 (2012); ref. Språkbruk 2/2012 (Rönnbacka)', v.n
from (values
  ('Signaleld tänd för att vägleda sjöfarare; av fornsv. böta ''slå eld'' (medellågtyskt lån).', 'Tor Evert Karsten', null::text, null::text),
  ('Varningseld / vårdkas som tändes när fientliga fartyg närmade sig — tecken åt ledungen (lokala flottenheten). Utgår från annat verb böta ''transportera hö/ved i små mängder'' (övre Dalarnas dialekt).', 'Ivar Modéer m.fl.', null, 'Modéer daterar bötena till vikingatiden.'),
  ('Svensk nybildning böte ''det man sätter eld på'', av det inlånade böta ''slå eld'' (jfr beta–bete).', 'Rolf Pipping', 'Huldén anser Pippings tolkning trovärdigast', null),
  ('Tillkom först EFTER vikingatid, för att trygga handelssjöfarten längs Östersjökusten; böten var snarare sjömärken (vid fara varningseld), möjligen annorlunda än äldre vårdkasar. Lånord. "Berg"-betydelsen sekundär → många "oäkta" böten där berget inte längre syns.', 'Lars Huldén', null, 'Spridningsmönstret talar för lånord även utan direkt mlty. motsvarighet (jfr boten/buten ''fat, tunna'').')
) as v(i, p, s, n)
where not exists (select 1 from public.ortnamn_element_interpretations e where e.element_key='böte' and e.proponent=v.p);

commit;
