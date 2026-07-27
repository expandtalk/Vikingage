-- STEP 1 (data-fundament): (3) Gamla kyrkogården/Bykyrkans plats, (1) event_location_candidates
-- (competing hypotheses m. evidens — Svolder Öresund vs Rügen), + Kalmars två äldsta brev som
-- händelser (Magnus Bengtsson, Bjälboätten). Källor: Kalmar begravningsverksamhet/Länsstyrelsen/KLM,
-- Kalmar Lexikon, Wikipedia (Magnus Bengtsson). Inga påhittade fynd — supporting_finds lämnas där okänt.
begin;

-- (3) Gamla kyrkogården = platsen där Bykyrkan/S:t Nicolai stod (RAÄ Kalmar 56:2), Kalmars äldsta bevarade kyrkogård.
insert into public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri, register_system, register_id)
select 'kyrkogård', 'Gamla kyrkogården (Bykyrkans/S:t Nicolai plats), Kalmar', 'Småland', 'Kalmar', 'Kalmar',
  56.660495, 16.351872, 'medeltid–1860-tal',
  'Kalmars äldsta bevarade kyrkogård, anlagd under 1200-talets första hälft kring Bykyrkan (S:t Nicolai), mitt i det medeltida Kalmar vid stadens torg. Kyrkan sprängdes på 1670-talet när domkyrkan på Kvarnholmen stod klar och stadens centrum flyttat dit; kyrkogården användes till 1860-talet (Södra kyrkogården togs i bruk 1863). Idag markerar utplacerade stenar kyrkans grund. Vid södra ingången står en staty av S:t Kristoffer, vägfararnas skyddshelgon och viktig Kalmar-ikon; under den kopparbilder av den sprängda Bykyrkan. I sydvästra hörnet det gula Stagnellska gravkoret (lektor Johan Stagnel, d. 1795). Fornlämning, lagskyddat kulturarv (tillsyn Länsstyrelsen Kalmar + Kalmar läns museum).',
  'https://app.raa.se/open/fornsok/', 'RAÄ', 'Kalmar 56:2'
where not exists (select 1 from public.heritage_sites where name like 'Gamla kyrkogården (Bykyrkans%');

-- (1) Competing-candidates: flera kandidatlägen per omtvistad händelse, med teori/förespråkare/fynd/källa.
create table if not exists public.event_location_candidates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.historical_events(id) on delete cascade,
  lat double precision, lng double precision,
  theory text,             -- kort namn på platsen/teorin
  proponent text,          -- historiker/tradition som förespråkar
  supporting_finds text,   -- kända fynd som talar för (null = okänt, hittas ej på)
  source text,
  note text,
  created_at timestamptz not null default now()
);
alter table public.event_location_candidates enable row level security;
drop policy if exists elc_read on public.event_location_candidates;
create policy elc_read on public.event_location_candidates for select using (true);

insert into public.event_location_candidates (event_id, lat, lng, theory, proponent, supporting_finds, source, note)
select e.id, v.lat, v.lng, v.theory, v.proponent, v.finds, v.src, v.note
from public.historical_events e, (values
  (55.95, 12.70, 'Öresund', 'Äldre tradition', null::text, 'Diskuterad i äldre litteratur', 'Öresund vid Skåne, längs färdvägen mellan väster och Östersjön.'),
  (54.60, 12.60, 'Södra Östersjön (nära Rügen)', 'Nyare forskning (bl.a. tolkning av Adam av Bremen)', null, 'Adam av Bremen m.fl.', 'Ön "Svolder/Svold" i södra Östersjön nära Rügen — idag rådande tolkning.')
) as v(lat, lng, theory, proponent, finds, src, note)
where e.event_name ilike 'Slaget vid Svolder%'
  and not exists (select 1 from public.event_location_candidates c where c.event_id=e.id and c.theory=v.theory);

-- Kalmars två äldsta brev som händelser (Magnus Bengtsson, Bjälboättens lagmansgren).
insert into public.historical_events (event_name, event_name_en, year_start, event_type, region_affected, description, sources, lat, lng, location_status)
select v.n, v.ne, v.y, 'dokument', ARRAY['Kalmar (Möre)']::text[], v.d, ARRAY[v.s]::text[], v.lat, v.lng, 'belagd'
from (values
  ('Äldsta brevet som omnämner Kalmar (byn Skälby)', 'Oldest letter mentioning Kalmar (Skälby)', 1200,
     'Det äldsta bevarade brevet som omnämner Kalmar är från omkring år 1200 och talar om byn Skälby vid Kalmar.',
     'Kalmar Lexikon', 56.663, 16.360),
  ('Äldsta brevet utfärdat i Kalmar (Magnus Bengtsson → Lübeck)', 'Oldest letter issued in Kalmar (1261)', 1261,
     'År 1261 skrev östgötalagmannen och fogden på Kalmar slott Magnus Bengtsson (Bjälboätten, stamfar till Bjälboättens lagmansgren; lagman i Östergötland + fogde på Kalmar slott ~1247–1263, d. 1263) ett brev till fogden, rådet och menigheten i Lübeck. Det är det äldsta bevarade brevet vi känner till som är utfärdat i Kalmar — ett vittnesbörd om lagmännens stora makt i landskapen och om Kalmars roll i Östersjöhandeln.',
     'Wikipedia (Magnus Bengtsson); Kalmar Lexikon', 56.6588, 16.3568)
) as v(n, ne, y, d, s, lat, lng)
where not exists (select 1 from public.historical_events h where h.event_name = v.n);

commit;
