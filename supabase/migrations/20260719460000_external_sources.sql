-- ============================================================================
-- Externa källor: fornengelska (Beowulf), bysantinska, frankiska och påvliga/
-- kyrkliga källor — för temana Utrikesrelationer, Österled, Kristnande, Makt.
-- Metadata-poster (fulltext kan komma senare). Bias-flaggade.
-- ============================================================================

begin;

insert into public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, work_type, bias_types, description)
select * from (values
  (
    'Beowulf', 'Beowulf', 'Anonym (fornengelsk)', 1000, 450, 600,
    'legendary'::source_reliability, 'Fornengelska (Old English)', 'epos',
    array['temporal_distance']::bias_type[],
    'Fornengelskt hjälteepos (handskrift ~1000, dikten äldre), som helt utspelar sig i Skandinavien — geater, daner och Skjöldungaätten kring Hrothgars hall Heorot. Källa till den danska/geatiska sägenhistorien; Hygelacs räd mot frankerna (~520) är en av ytterst få historiskt daterbara händelser (bekräftas av Gregorius av Tours).'
  ),
  (
    'Om rikets styrelse (De Administrando Imperio)', 'De Administrando Imperio',
    'Konstantin VII Porfyrogennetos', 950, 900, 950,
    'primary'::source_reliability, 'Medeltidsgrekiska', 'traktat',
    array['political_legitimacy']::bias_type[],
    'Bysantinsk kejserlig handbok (~950). Beskriver ruserna, Dnjeprs forsar med BÅDE nordiska och slaviska namn, och den rus-bysantinska handeln — en central källa till österleden, väringarna och vägen till Miklagård.'
  ),
  (
    'Ansgars levnad (Vita Ansgarii)', 'Vita Ansgarii', 'Rimbert', 870, 801, 865,
    'primary'::source_reliability, 'Latin', 'hagiografi',
    array['christian_anti_pagan']::bias_type[],
    'Rimberts levnadsteckning över Ansgar (~870) — huvudkälla till den kristna missionen till Birka (829 och 852) och till Sveriges tidigaste kristnande. Ansgar verkade som påvligt legat för Norden under ärkestiftet Hamburg-Bremen.'
  ),
  (
    'Hamburgkyrkans historia (Gesta Hammaburgensis)', 'Gesta Hammaburgensis ecclesiae pontificum',
    'Adam av Bremen', 1075, 788, 1072,
    'secondary'::source_reliability, 'Latin', 'krönika',
    array['christian_anti_pagan','political_legitimacy']::bias_type[],
    'Nordens viktigaste kyrkohistoriska källa (~1075). Skildrar Uppsalatemplet, missionen och Hamburg-Bremens ärkestifts anspråk över hela Norden — färgad av dessa maktanspråk, men oumbärlig för 800–1000-talens kyrko- och kungahistoria.'
  ),
  (
    'Karl den stores liv (Vita Karoli Magni)', 'Vita Karoli Magni', 'Einhard', 830, 768, 814,
    'primary'::source_reliability, 'Latin', 'biografi',
    array['political_legitimacy']::bias_type[],
    'Einhards biografi över Karl den store (~830). Belyser den frankisk-danska gränsen (kung Godfred, Danevirke) och nordbornas tidiga kontakter — och konflikter — med Frankerriket.'
  ),
  (
    'Frankiska riksannalerna', 'Royal Frankish Annals (Annales regni Francorum)',
    'Anonyma (frankiska hovet)', 829, 741, 829,
    'primary'::source_reliability, 'Latin', 'annaler',
    array['political_legitimacy']::bias_type[],
    'Det frankiska hovets samtida annaler. Innehåller de tidigaste notiserna om vikingaräder och om relationerna med danska kungar (Godfred, Harald Klak) samt Karl den store — en förstahandskälla till kontakterna väster ut.'
  ),
  (
    'Nestorskrönikan (Berättelsen om gångna år)', 'Primary Chronicle (Povest vremennykh let)',
    'Tillskriven Nestor', 1113, 850, 1110,
    'secondary'::source_reliability, 'Fornöstslaviska', 'krönika',
    array['political_legitimacy']::bias_type[],
    'Den fornryska Nestorskrönikan (~1113). Berättar om varjagerna/ruserna, Ruriks kallelse, grundandet av Kievriket och de rus-bysantinska fördragen — en kärnkälla till österleden och de nordiska rötterna till Rus.'
  )
) as v(title, title_en, author, written_year, covers_period_start, covers_period_end,
       reliability, language, work_type, bias_types, description)
where not exists (select 1 from public.historical_sources s where s.title = v.title);

-- Temakoppling
insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select t.id, 'source', s.id, null
from (values
  ('Makt & dynasti','Beowulf'),
  ('Utrikesrelationer','Beowulf'),
  ('Österled','Om rikets styrelse (De Administrando Imperio)'),
  ('Utrikesrelationer','Om rikets styrelse (De Administrando Imperio)'),
  ('Handel','Om rikets styrelse (De Administrando Imperio)'),
  ('Kristnande','Ansgars levnad (Vita Ansgarii)'),
  ('Utrikesrelationer','Ansgars levnad (Vita Ansgarii)'),
  ('Kristnande','Hamburgkyrkans historia (Gesta Hammaburgensis)'),
  ('Makt & dynasti','Hamburgkyrkans historia (Gesta Hammaburgensis)'),
  ('Utrikesrelationer','Karl den stores liv (Vita Karoli Magni)'),
  ('Utrikesrelationer','Frankiska riksannalerna'),
  ('Plundring & vikingafärder','Frankiska riksannalerna'),
  ('Österled','Nestorskrönikan (Berättelsen om gångna år)'),
  ('Utrikesrelationer','Nestorskrönikan (Berättelsen om gångna år)'),
  ('Handel','Nestorskrönikan (Berättelsen om gångna år)')
) as v(theme, title)
join public.themes t on t.name = v.theme
join public.historical_sources s on s.title = v.title
on conflict (theme_id, entity_type, entity_id) do nothing;

commit;
