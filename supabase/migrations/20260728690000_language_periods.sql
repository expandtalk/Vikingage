-- SPRÅK-REGELVERK (Daniel): "ett regelverk kring språk med tid som språket har, plats som det har".
-- Gör ortnamnsanalysens språkbias hanterbar: varje språkskikt har temporal + geografisk räckvidd och
-- ett skriftsystem. place_name_forms.language_layer refererar code här. Runstensdatabasen
-- (runic_inscriptions) är den period-korrekta KÄLLAN för runsvenska/urnordiska namnformer.
-- Kronologi: standard (Wessén; Nationalencyklopedin) — ej påhittat.
create table if not exists public.language_periods (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,       -- refereras av place_name_forms.language_layer
  name text not null, name_en text,
  year_from int, year_to int,      -- temporal räckvidd
  region_scope text,               -- geografisk (null = hela nordiska omr.; annars 'Öland','Gotland'…)
  script text,                     -- skriftsystem
  parent_code text,                -- språkträd (protogermanska → urnordiska → …)
  is_analysis_baseline boolean default false,
  note text
);
alter table public.language_periods enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='language_periods' and policyname='lp_read') then
    create policy lp_read on public.language_periods for select using (true);
  end if;
end $$;

insert into public.language_periods (code,name,name_en,year_from,year_to,region_scope,script,parent_code,is_analysis_baseline,note) values
 ('indoeuropeiskt','Indoeuropeiska (urspr.)','Proto-Indo-European',-4500,-2500,null,null,null,false,'Rekonstruerad rot; endast för djup etymologi.'),
 ('protogermanska','Protogermanska','Proto-Germanic',-500,200,null,'—',' indoeuropeiskt',false,'Före runorna; rekonstruerad.'),
 ('urnordiska','Urnordiska','Proto-Norse',200,700,'Norden','äldre futhark (24)','protogermanska',false,'Äldsta runbelägg. Källa: äldre-futhark-inskrifter.'),
 ('runsvenska','Runsvenska (fornöstnordiska)','Runic/Old East Norse',700,1225,'Sverige','yngre futhark (16)','urnordiska',false,'VIKINGATID. Period-korrekt namnkälla = runic_inscriptions. Nyckelskiktet för vår analys.'),
 ('gutniska','Forngutniska','Old Gutnish',800,1400,'Gotland','yngre futhark / latin','runsvenska',false,'Egen gren; Gotlands namn ska mätas mot detta, ej rikssvenska.'),
 ('aldre_fornsvenska','Äldre fornsvenska','Early Old Swedish',1225,1375,'Sverige','latin','runsvenska',false,'Första diplom/lagtexter.'),
 ('yngre_fornsvenska','Yngre fornsvenska','Late Old Swedish',1375,1526,'Sverige','latin','aldre_fornsvenska',false,'SDHK-breven ligger mest här.'),
 ('nysvenska','Nysvenska','Modern Swedish',1526,2100,'Sverige','latin','yngre_fornsvenska',true,'ANALYSBASEN idag = dagens ortnamnsregister. Här sitter biasen: led matchas mot moderna former.'),
 ('kalmaritiska','Kalmaritiska (dialekt)','Kalmar dialect',1300,2100,'Kalmar/Möre','latin','nysvenska',false,'Regional plats-skopad variant; skorrande R ev. hansatida tyskt inflytande (Daniel).')
on conflict (code) do nothing;

-- Knyt place_name_forms.language_layer till regelverket (mjuk referens; default = analysbasen).
comment on column public.place_name_forms.language_layer is
  'FK-liknande: language_periods.code. Default nysvenska = analysbasen (dagens register). För period-korrekt analys: fyll med runsvenska-former ur runic_inscriptions.';
