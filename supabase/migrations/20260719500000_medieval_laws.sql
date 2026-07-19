-- Medeltida svenska lagar & stadgar (rättslig grund för kungaval vid Mora sten m.m.)
-- + nytt tema "Rätt & lag". Underlag: informationsskylten vid Mora stenar + standardverk.
begin;

insert into public.themes (name, name_en, description, description_en)
select 'Rätt & lag','Law & justice','Landskapslagar, landslag och stadgar — ting, kungaval och rättsordning.','Provincial laws, national law and statutes — the thing assembly, royal election and legal order.'
where not exists (select 1 from public.themes t where t.name='Rätt & lag');

insert into public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end, reliability, language, work_type, bias_types, description)
select * from (values
  ('Äldre Västgötalagen','Older Westrogothic Law (Äldre Västgötalagen)','Anonym (nedtecknad av bl.a. Eskil lagman)',1220,1200,1280,
    'primary'::source_reliability,'Fornsvenska','lag',array['none']::bias_type[],
    'Sveriges äldsta bevarade lagtext (nedtecknad ca 1220-talet), gällande i Västergötland. Äldsta dokument som berör kungavalets former: "svear äga taga konung och likaså vräka (avsätta)". Grundläggande för det medeltida valkungadömet och Mora sten.'),
  ('Upplandslagen','Law of Uppland (Upplandslagen)','Under lagmannen Birger Persson m.fl.',1296,1296,1350,
    'primary'::source_reliability,'Fornsvenska','lag',array['political_legitimacy']::bias_type[],
    'Stadfäst 1296 av kung Birger Magnusson. Redogör i detalj för kungatillsättningens moment — valet vid Mora sten, kungaeden och eriksgatan.'),
  ('Östgötalagen','Law of Östergötland (Östgötalagen)','Anonym',1300,1290,1350,
    'primary'::source_reliability,'Fornsvenska','lag',array['none']::bias_type[],
    'Östergötlands landskapslag (ca 1300), en av de mest fullständigt bevarade. Speglar rättsordning, ting och samhällsstruktur i medeltidens Östergötland.'),
  ('Smålandslagen (Kristnorätten)','Law of Småland (church-law section)','Anonym',1300,1290,1350,
    'secondary'::source_reliability,'Fornsvenska','lag',array['christian_anti_pagan']::bias_type[],
    'Av Smålandslagen bevaras endast kyrkobalken (Kristnorätten). Visar kyrkans reglering och kristnandets rättsliga avtryck i Småland.'),
  ('Magnus Erikssons landslag','King Magnus Eriksson''s Law of the Realm','Under kung Magnus Eriksson',1350,1350,1442,
    'primary'::source_reliability,'Fornsvenska','lag',array['political_legitimacy']::bias_type[],
    'Sveriges första gemensamma landslag (~1350), som ersatte landskapslagarna. Stadgar hur kungen ska svära sin ed upplyft på Mora sten och rida eriksgata.'),
  ('Alsnö stadga','Statute of Alsnö','Kung Magnus Ladulås',1280,1280,1280,
    'primary'::source_reliability,'Fornsvenska','stadga',array['political_legitimacy']::bias_type[],
    'Utfärdad av Magnus Ladulås ~1280. Införde det världsliga frälset — skattefrihet mot rusttjänst till häst — och lade grunden för den svenska adeln.')
) as v(title, title_en, author, written_year, covers_period_start, covers_period_end, reliability, language, work_type, bias_types, description)
where not exists (select 1 from public.historical_sources s where s.title=v.title);

insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select t.id, 'source', s.id, null
from (values
  ('Rätt & lag','Äldre Västgötalagen'),('Makt & dynasti','Äldre Västgötalagen'),
  ('Rätt & lag','Upplandslagen'),('Makt & dynasti','Upplandslagen'),
  ('Rätt & lag','Östgötalagen'),
  ('Rätt & lag','Smålandslagen (Kristnorätten)'),('Kristnande','Smålandslagen (Kristnorätten)'),
  ('Rätt & lag','Magnus Erikssons landslag'),('Makt & dynasti','Magnus Erikssons landslag'),
  ('Rätt & lag','Alsnö stadga'),('Makt & dynasti','Alsnö stadga')
) as v(theme,title)
join public.themes t on t.name=v.theme
join public.historical_sources s on s.title=v.title
on conflict (theme_id, entity_type, entity_id) do nothing;

commit;
