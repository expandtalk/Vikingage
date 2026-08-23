-- ============================================================================
-- FÖRSLAG: Tema "Slaveri och tvångsarbete under svensk flagg"
-- ============================================================================
-- Källa: scratch-slaveri-tvangsarbete-nod.md (2026-08-23). Människa-i-loopen:
-- detta är ett FÖRSLAG. Att köra `supabase db push` = människans beslut att promota.
-- Platser läggs i place_suggestions (status='pending') — staging, ej kanon.
-- Värdegrund: plattformens röst = "förslavade människor". Faktum, värdering och
-- förnekelse är INTE likvärdiga. Omtvistade tal märks som spann i beskrivningen.
-- Idempotent (insert-where-not-exists / on conflict do nothing).
-- ============================================================================

-- 1. TEMA -------------------------------------------------------------------
insert into public.themes (name, name_en, slug, keywords, description, description_en)
select
  'Slaveri och tvångsarbete under svensk flagg',
  'Slavery and forced labour under the Swedish flag',
  'slaveri',
  ARRAY['slaveri','träldom','tvångsarbete','träl','trälar','slav','slavhandel','ofri','förslavad','S:t Barthélemy','Cabo Corso','Barbareskstaterna'],
  'Tvärgående tema (FÖRSLAG). Fyra system hålls isär: (I) nordisk träldom (~vikingatid–1335), '
  || '(II) svenskar förslavade i Nordafrika ~1650–1770 (svensken som offer), (III) transatlantisk/'
  || 'karibisk slavhandel under svensk flagg (svensken som förövare), samt den nationella myten '
  || '(belagt falsifierbar) och ett daterat receptions-/politiklager. Plattformen dömer inte '
  || 'värderingar; den skiljer belagt faktum från tolkning och förnekelse.',
  'Cross-cutting theme (PROPOSAL). Four systems kept separate: (I) Nordic thraldom (~Viking Age–1335), '
  || '(II) Swedes enslaved in North Africa ~1650–1770 (Swede as victim), (III) transatlantic/Caribbean '
  || 'slave trade under the Swedish flag (Swede as perpetrator), plus the national myth (demonstrably '
  || 'falsifiable) and a dated reception/politics layer.'
where not exists (select 1 from public.themes t where t.name = 'Slaveri och tvångsarbete under svensk flagg');

-- Nåbarhet: ThemePage (/tema/:slug) slår upp på slug, graf-sök matchar på keywords.
-- Säkerställ båda även om temat redan fanns utan dem (tidigare version av denna migration).
update public.themes
set slug = coalesce(slug, 'slaveri'),
    keywords = coalesce(keywords, ARRAY['slaveri','träldom','tvångsarbete','träl','trälar','slav','slavhandel','ofri','förslavad','S:t Barthélemy','Cabo Corso','Barbareskstaterna'])
where name = 'Slaveri och tvångsarbete under svensk flagg';

-- 2. KÄLLBIBLIOTEK (historical_sources) -------------------------------------
insert into public.historical_sources (title, title_en, author, written_year, covers_period_start, covers_period_end, reliability, language, description)
select * from (values
  ('Svensk slavhandel och slaveri under svensk flagga', 'Swedish slave trade and slavery under the Swedish flag', 'Holger Weiss', 2016, 1646, 1847, 'secondary'::source_reliability, 'sv', 'Modern forskning, primararkiv for System III (transatlantisk/karibisk handel under svensk flagg).'),
  ('Saltets pris', 'The price of salt', 'Joachim Ostlund', 2014, 1650, 1770, 'secondary'::source_reliability, 'sv', 'Modern forskning om svenskar forslavade i Nordafrika (System II).'),
  ('Slaveriets historia', 'A history of slavery', 'Dick Harrison', 2015, 0, 1900, 'secondary'::source_reliability, 'sv', 'Oversiktsverk; anvands for System I (nordisk traldom) och kontext.'),
  ('Historiens vita flackar', 'The white spots of history', 'Maria Ripenberg', 2019, 1600, 1900, 'secondary'::source_reliability, 'sv', 'Myt vs dokumentation; den nationella oskuldsmyten granskad.'),
  ('Beskrifning ofver barbariska slafveriet uti Barbariet', 'Account of the barbaric slavery in Barbary', 'Marcus Berg', 1757, 1750, 1757, 'primary'::source_reliability, 'sv', 'Primarkalla, System II: svensk fange som forslavad i Nordafrika.'),
  ('Alger-skrivelsen till M.G. De la Gardie', 'The Algiers letter to M.G. De la Gardie', 'Svensk fange (Alger)', 1662, 1660, 1662, 'primary'::source_reliability, 'sv', 'Primarkalla 1662, System II (svensken som offer).')
) as v(title, title_en, author, written_year, covers_period_start, covers_period_end, reliability, language, description)
where not exists (select 1 from public.historical_sources s where s.title = v.title);

-- 3. TEMATAGGNING: tema -> källor (theme_links, entity_type='source') --------
insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select t.id, 'source', s.id, 'Kalla for slaveritemat (forslag)'
from public.themes t
join public.historical_sources s
  on s.title in (
    'Svensk slavhandel och slaveri under svensk flagga',
    'Saltets pris',
    'Slaveriets historia',
    'Historiens vita flackar',
    'Beskrifning ofver barbariska slafveriet uti Barbariet',
    'Alger-skrivelsen till M.G. De la Gardie'
  )
where t.name = 'Slaveri och tvångsarbete under svensk flagg'
  and not exists (
    select 1 from public.theme_links tl
    where tl.theme_id = t.id and tl.entity_type = 'source' and tl.entity_id = s.id
  );

-- 4. NYCKEL-EVENTS (historical_events) --------------------------------------
insert into public.historical_events (year_start, year_end, event_name, event_name_en, description, description_en, event_type, significance_level, region_affected, sources)
select * from (values
  (1335, null, 'Traldomens avskaffande i Sverige', 'Abolition of thraldom in Sweden',
   'Belagt: traldomen upphor i Sverige (Magnus Erikssons stadga). Exakt formulering och omfang kraver-verifiering. System I.',
   'Documented: thraldom abolished in Sweden (Magnus Eriksson statute). Exact wording/scope requires verification. System I.',
   'political', 'high', ARRAY['Sverige'], ARRAY['Harrison (2015)']),
  (1646, null, 'Svensk etablering vid Cabo Corso (Guldkusten)', 'Swedish foothold at Cabo Corso (Gold Coast)',
   'Belagt: Louis De Geer sander skepp 1646; Svenska Afrikakompaniet; fortet Carolusburg (bas 1650). Forlorat efter Roskilde 1658. System III.',
   'Documented: Louis De Geer sends ships 1646; Swedish Africa Company; Fort Carolusburg (base 1650). Lost after Roskilde 1658. System III.',
   'exploration', 'high', ARRAY['Ghana','Guldkusten'], ARRAY['Weiss (2016)']),
  (1662, null, 'Alger-skrivelsen: svenskar forslavade i Nordafrika', 'The Algiers letter: Swedes enslaved in North Africa',
   'Belagt: skrivelse 1662 till M.G. De la Gardie om svenskar forslavade i Alger. Svensken som offer (System II), halls skilt fran System III.',
   'Documented: 1662 letter to M.G. De la Gardie on Swedes enslaved in Algiers. Swede as victim (System II), kept separate from System III.',
   'political', 'medium', ARRAY['Nordafrika','Alger'], ARRAY['Marcus Berg (1757)','Ostlund (2014)']),
  (1784, null, 'Sverige forvarvar S:t Barthelemy', 'Sweden acquires Saint-Barthelemy',
   'Belagt: Gustav III koper on av Frankrike 1784; Svenska Vastindiska Kompaniet; slavhandel uttrycklig i privilegiebrevet. Gustavia central transithamn. System III.',
   'Documented: Gustav III buys the island from France 1784; Swedish West India Company; slave trade explicit in the charter. Gustavia a central transit port. System III.',
   'political', 'high', ARRAY['S:t Barthelemy','Karibien'], ARRAY['Weiss (2016)']),
  (1845, null, 'Riksdagen forbjuder slaveri i hela riket', 'Parliament bans slavery throughout the realm',
   'Belagt: riksdagsbeslut 19 maj 1845 forbjuder slaveri i hela riket (foregatt av traktat 1813 och kunglig proklamation 1823).',
   'Documented: parliamentary decision 19 May 1845 bans slavery throughout the realm (preceded by the 1813 treaty and 1823 royal proclamation).',
   'political', 'high', ARRAY['Sverige','S:t Barthelemy'], ARRAY['Weiss (2016)','Ripenberg (2019)']),
  (1847, null, 'Emancipationen pa S:t Barthelemy', 'Emancipation on Saint-Barthelemy',
   'Belagt: slaveriet pa on avskaffat 1847; 523 forslavade manniskor frikoptes. System III.',
   'Documented: slavery on the island abolished 1847; 523 enslaved people were bought free. System III.',
   'political', 'high', ARRAY['S:t Barthelemy'], ARRAY['Weiss (2016)'])
) as v(year_start, year_end, event_name, event_name_en, description, description_en, event_type, significance_level, region_affected, sources)
where not exists (select 1 from public.historical_events e where e.event_name = v.event_name);

-- 5. FÖRSLAG-PLATSER (place_suggestions, status='pending' = staging) ---------
-- Koordinater markerade approximativa (moderna platser) — kraver verifiering fore promotion.
insert into public.place_suggestions (name, note, documentation, proposed_lat, proposed_lng, query_context, status)
select * from (values
  ('Gustavia, S:t Barthelemy', 'Central svensk transithamn for slavhandel 1804-1808 (System III).',
   'FORSLAG. Belagt: Gustavia var svensk frihamn och transithamn i den karibiska slavhandeln under svensk flagg. Kalla: Weiss (2016). Koordinat approximativ (modern plats) - kraver verifiering.',
   17.8968, -62.8508, 'Slaveri under svensk flagg (System III)', 'pending'),
  ('Carolusburg / Cabo Corso (Cape Coast, Ghana)', 'Svenskt fort pa Guldkusten fran 1650 (System III).',
   'FORSLAG. Belagt: svenskt fort (Carolusburg) vid Cabo Corso fran 1650, forlorat 1658; idag Cape Coast Castle. Kalla: Weiss (2016). Koordinat approximativ (modern plats) - kraver verifiering.',
   5.1053, -1.2466, 'Slaveri under svensk flagg (System III)', 'pending')
) as v(name, note, documentation, proposed_lat, proposed_lng, query_context, status)
where not exists (select 1 from public.place_suggestions p where p.name = v.name);
