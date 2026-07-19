-- Kiev-Rus: tidiga nyckelkällor + källkritisk nyansering av Rurik.
-- Underlag: docs/vikingarna_kievriket.docx (källkritisk komplettering).
begin;

insert into public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, work_type, bias_types, description)
select * from (values
  ('Sankt Bertins annaler (Annales Bertiniani)','Annales Bertiniani','Frankiska hovet (bl.a. Prudentius)',882,830,882,
    'primary'::source_reliability,'Latin','annaler',array['political_legitimacy']::bias_type[],
    'Frankiska annaler. Under år 839 skildras rus-sändebud vid Ludvig den frommes hov i Ingelheim som vid granskning visade sig vara svear (gens Sueonum) — det äldsta samtida omnämnandet av rus och ett av de starkaste beläggen för deras nordiska ursprung, ~20 år före Ruriks traditionella ankomst 862.'),
  ('Ibn Fadlans reseskildring (Risala)','Risala of Ibn Fadlan','Ahmad ibn Fadlan',922,921,922,
    'primary'::source_reliability,'Arabiska','reseskildring',array['temporal_distance']::bias_type[],
    'Ögonvittnesskildring (922) av ett rus-sällskap vid Volga nära Bulgar, inkl. den berömda skeppskremeringen av en hövding — stämmer väl med nordisk gravsed. Källkritik (Montgomery 2000): de rus han mötte var sannolikt redan en kulturellt blandad turkisk-slavisk-nordisk grupp. Styrker den nordiska kärnan OCH den tidiga sammansmältningen.')
) as v(title, title_en, author, written_year, covers_period_start, covers_period_end,
       reliability, language, work_type, bias_types, description)
where not exists (select 1 from public.historical_sources s where s.title = v.title);

insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select t.id, 'source', s.id, null
from (values
  ('Österled','Sankt Bertins annaler (Annales Bertiniani)'),('Utrikesrelationer','Sankt Bertins annaler (Annales Bertiniani)'),
  ('Österled','Ibn Fadlans reseskildring (Risala)'),('Handel','Ibn Fadlans reseskildring (Risala)'),('Utrikesrelationer','Ibn Fadlans reseskildring (Risala)')
) as v(theme,title)
join public.themes t on t.name=v.theme
join public.historical_sources s on s.title=v.title
on conflict (theme_id, entity_type, entity_id) do nothing;

update public.historical_kings
set description = 'Varjagisk hövding som enligt Nestorskrönikan (nedtecknad ~1113, långt i efterhand) inbjöds att härska i Novgorod ~862; grundare av Rurikdynastin. Identifieringen med Rörik av Dorestad (dansk vikingahövding) är en HYPOTES, ej fastställd. Obs: "Rus" betecknar historiskt Kiev-området och dess folk — inte det moderna Ryssland (Rossija), en betydligt senare konstruktion.'
where name = 'Rurik';

commit;
