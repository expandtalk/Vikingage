-- ============================================================================
-- Ontologi-utökning: temalager + Saxo Grammaticus.
--
-- themes = tvärgående analysteman (makt, ledung, kristnande, handel, plundring,
-- utrikesrelationer, österled). theme_links är POLYMORF (entity_type+entity_id,
-- ingen FK) så samma tema kan tagga inskrifter, källor, kungar, mynt och fynd.
-- Det gör frågor som "visa allt om österleden" möjliga tvärs över materialet.
-- ============================================================================

begin;

-- 1. Saxo Grammaticus (Gesta Danorum) som källa.
insert into public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, work_type, bias_types, description)
select * from (values
  (
    'Danernas bedrifter (Gesta Danorum)',
    'Gesta Danorum',
    'Saxo Grammaticus', 1200, null::integer, 1185,
    'legendary'::source_reliability, 'Latin', 'krönika',
    array['nationalist_danish','political_legitimacy','christian_anti_pagan']::bias_type[],
    'Danmarks stora latinska historieverk (~1200), skrivet i Lund i ärkebiskop Absalons krets och tillägnat Valdemarsätten — starkt danskt-legitimerande. De första nio böckerna är legendariska/mytiska (Amleth/Hamlet, Starkad, gudarna som forntida kungar); de senare mer samtida. Central källa till dansk elit- och maktideologi och till hur den danska kyrkan i Lund tänkte kring forntid och kungamakt. Vinklad, men oumbärlig för den danska traditionen.'
  )
) as v(title, title_en, author, written_year, covers_period_start, covers_period_end,
       reliability, language, work_type, bias_types, description)
where not exists (select 1 from public.historical_sources s where s.title = v.title);

-- 2. Temalager
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  name_en text,
  description text,
  description_en text,
  created_at timestamptz not null default now()
);

create table if not exists public.theme_links (
  id uuid primary key default gen_random_uuid(),
  theme_id uuid not null references public.themes(id) on delete cascade,
  entity_type text not null check (entity_type in ('inscription','source','king','coin','carver','site','dynasty')),
  entity_id uuid not null,   -- polymorf: pekar på olika tabeller, ingen FK
  notes text,
  created_at timestamptz not null default now(),
  unique (theme_id, entity_type, entity_id)
);
comment on table public.theme_links is 'Polymorf temataggning. entity_id refererar tabellen som entity_type anger (inscription->runic_inscriptions, source->historical_sources, king->historical_kings, coin->coins, ...). Ingen FK — tvärgående lager.';
create index if not exists theme_links_theme_idx on public.theme_links (theme_id);
create index if not exists theme_links_entity_idx on public.theme_links (entity_type, entity_id);

insert into public.themes (name, name_en, description, description_en)
select * from (values
  ('Makt & dynasti','Power & dynasty','Kungamakt, ätt och legitimering.','Royal power, lineage and legitimation.'),
  ('Ledung','Leidang','Den organiserade sjökrigsledningen/flottuppbådet.','The organised naval levy.'),
  ('Kristnande','Christianization','Övergången till kristendom och kyrkans etablering.','The conversion to Christianity and the church''s establishment.'),
  ('Handel','Trade','Handelsvägar, marknader och utbyte.','Trade routes, markets and exchange.'),
  ('Plundring & vikingafärder','Raiding & viking expeditions','Härnadståg och plundring i väster- och österled.','Raiding expeditions west and east.'),
  ('Utrikesrelationer','Foreign relations','Kontakter med Frankerriket/Karl den store, påvestolen och Bysans.','Contacts with the Frankish empire/Charlemagne, the papacy and Byzantium.'),
  ('Österled','The Eastern route','Färder österut — Ingvarståget, Rus och vägen till Bysans/Serkland.','Expeditions eastward — the Ingvar expedition, the Rus and the route to Byzantium/Serkland.')
) as v(name, name_en, description, description_en)
where not exists (select 1 from public.themes t where t.name = v.name);

-- 3. Exempeltaggar (visar den tvärgående kopplingen)
-- 3a. Inskrifter
insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select t.id, 'inscription', ri.id, v.notes
from (values
  ('Österled','Sö 179','Ingvarståget — Gripsholmsstenen'),
  ('Österled','Sö 131','Ingvarståget — Lundby'),
  ('Österled','Sö 130','Ingvarståget — Fagerlöt'),
  ('Makt & dynasti','Ög 136','Rökstenen — hjälte- och maktideologi'),
  ('Makt & dynasti','DR 295','Hällestad — Toke Gormssons hird'),
  ('Plundring & vikingafärder','DR 279','Sjörup — Fýrisvellir-gruppen'),
  ('Kristnande','DR 42','Jellingstenen — Harald Blåtand kristnar danerna'),
  ('Makt & dynasti','DR 42','Jellingstenen — rikssamling och kungamakt')
) as v(theme, signum, notes)
join public.themes t on t.name = v.theme
join public.runic_inscriptions ri on ri.signum = v.signum
on conflict (theme_id, entity_type, entity_id) do nothing;

-- 3b. Kungar
insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select t.id, 'king', k.id, v.notes
from (values
  ('Makt & dynasti','Kung Björn',null),
  ('Makt & dynasti','Kung Anund',null),
  ('Makt & dynasti','Kung Olof',null),
  ('Österled','Ingvar Vittfarne','Ledde österledsexpeditionen')
) as v(theme, king, notes)
join public.themes t on t.name = v.theme
join public.historical_kings k on k.name = v.king
on conflict (theme_id, entity_type, entity_id) do nothing;

-- 3c. Mynt (solidusskatterna)
insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select t.id, 'coin', c.id, v.notes
from (values
  ('Utrikesrelationer','Åbyskatten (solidusskatt, Sandby, Öland)','Romerska betalningar/foederati'),
  ('Handel','Åbyskatten (solidusskatt, Sandby, Öland)',null),
  ('Utrikesrelationer','Björnhovdaskatten (solidusskatt, Torslunda, Öland)','Die-länkar mot Italien'),
  ('Utrikesrelationer','Stora Brunneby-skatten (solidusskatt, Öland)','Tidig direktutbetalning')
) as v(theme, coin_name, notes)
join public.themes t on t.name = v.theme
join public.coins c on c.name = v.coin_name
on conflict (theme_id, entity_type, entity_id) do nothing;

-- 3d. Källor
insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select t.id, 'source', s.id, v.notes
from (values
  ('Makt & dynasti','Danernas bedrifter (Gesta Danorum)','Dansk maktideologi'),
  ('Makt & dynasti','Ynglingatal','Svensk kungalängd'),
  ('Utrikesrelationer','Historia om de nordiska folken','1500-talsetnografi om Norden')
) as v(theme, title, notes)
join public.themes t on t.name = v.theme
join public.historical_sources s on s.title = v.title
on conflict (theme_id, entity_type, entity_id) do nothing;

-- 4. RLS
alter table public.themes enable row level security;
alter table public.theme_links enable row level security;
drop policy if exists "themes public read" on public.themes;
create policy "themes public read" on public.themes for select using (true);
drop policy if exists "themes admin write" on public.themes;
create policy "themes admin write" on public.themes for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "theme_links public read" on public.theme_links;
create policy "theme_links public read" on public.theme_links for select using (true);
drop policy if exists "theme_links admin write" on public.theme_links;
create policy "theme_links admin write" on public.theme_links for all using (public.is_admin()) with check (public.is_admin());

grant select on public.themes, public.theme_links to anon, authenticated;
grant all on public.themes, public.theme_links to authenticated;

commit;
