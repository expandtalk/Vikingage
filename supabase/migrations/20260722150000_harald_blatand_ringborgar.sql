-- Berikning: Harald Blåtands fem ringborgar + hans biografi. Applicerad via MCP
-- execute_sql; fil = proveniens. Poäng (Daniel): den snävt dendrokronologiskt daterade
-- geometriska slutfasen gör att borgarna med rimlig säkerhet kan knytas till en
-- namngiven kung. Dateringar med osäkerhetsflagga (Nonnebakken svag; Borgring aldrig
-- färdigbyggd → construction_end null). Källor: Nationalmuseet, Videnskab.dk,
-- Vikingeskibsmuseet, dendrokronologi. UNESCO-världsarv 2023 (redan unesco_site=true).

update public.viking_fortresses set
  construction_period = 'ca 980 (Harald Blåtands regeringstid)',
  historical_significance = 'En av Harald Blåtands fem ringborgar av Trelleborgstyp, uppförda under en mycket kort, centralt planlagd byggnadsfas omkring 980 (Harald Blåtand regerade ca 958–987). Den snävt dendrokronologiskt daterade geometriska slutfasen — perfekta cirklar med symmetriskt placerade karréhus — gör att borgarna med rimlig säkerhet kan knytas till en namngiven kung; ett ovanligt exempel på fornlämningar kopplade till en specifik regent. Sedan 2023 på Unescos världsarvslista.',
  archaeological_notes = 'Säkrast daterad av de fem: dendrokronologi visar att eken fälldes hösten 980 och att bygget skedde omkring våren 981. Anläggningen tycks ha använts endast omkring 10–15 år. 16 långhus i den inre borggården + 14 i den yttre. Källa: dendro (Wikipedia/Nationalmuseet).'
where name = 'Trelleborg (Slagelse)';

update public.viking_fortresses set
  construction_period = 'ca 980 (Harald Blåtands regeringstid)',
  historical_significance = 'En av Harald Blåtands fem ringborgar av Trelleborgstyp, uppförda under en mycket kort, centralt planlagd byggnadsfas omkring 980 (Harald Blåtand regerade ca 958–987). Den snävt dendrokronologiskt daterade geometriska slutfasen gör att borgarna med rimlig säkerhet kan knytas till en namngiven kung; ett ovanligt exempel på fornlämningar kopplade till en specifik regent. Sedan 2023 på Unescos världsarvslista.',
  archaeological_notes = 'Dendrodaterad. Timmer kan ha fällts redan 974/975, men borgen räknas ändå till samma ~980-horisont som de övriga. 16 långhus. Källa: Videnskab.dk.'
where name = 'Fyrkat';

update public.viking_fortresses set
  construction_period = 'ca 980 (Harald Blåtands regeringstid)',
  historical_significance = 'En av Harald Blåtands fem ringborgar av Trelleborgstyp, uppförda under en mycket kort, centralt planlagd byggnadsfas omkring 980 (Harald Blåtand regerade ca 958–987). Den snävt dendrokronologiskt daterade geometriska slutfasen gör att borgarna med rimlig säkerhet kan knytas till en namngiven kung; ett ovanligt exempel på fornlämningar kopplade till en specifik regent. Sedan 2023 på Unescos världsarvslista.',
  archaeological_notes = 'Klart störst av de fem: ca 240 m i diameter med hela 48 långhus (mot 16 på Fyrkat och Trelleborg). Daterad till samma tid, ~980. Källa: Nationalmuseet.'
where name = 'Aggersborg';

update public.viking_fortresses set
  construction_period = 'ca 980 (Harald Blåtands regeringstid, osäker)',
  historical_significance = 'En av Harald Blåtands fem ringborgar av Trelleborgstyp, uppförda under en mycket kort, centralt planlagd byggnadsfas omkring 980 (Harald Blåtand regerade ca 958–987). Den snävt dendrokronologiskt daterade geometriska slutfasen gör att borgarna med rimlig säkerhet kan knytas till en namngiven kung; ett ovanligt exempel på fornlämningar kopplade till en specifik regent. Sedan 2023 på Unescos världsarvslista.',
  archaeological_notes = 'Sämst bevarad (ligger under nutida Odense). Endast ett enstaka lösryckt dendroprov, från efter 967 — dateringen är därför osäkrare än de övrigas. Nyare undersökningar visar att vikingatidsborgen anlades ovanpå en ca 200 år äldre anläggning. Källa: Videnskab.dk, Vikingeskibsmuseet.'
where name = 'Nonnebakken';

update public.viking_fortresses set
  construction_period = 'sent 970-tal (Harald Blåtand), aldrig färdigbyggd',
  construction_end = null,
  historical_significance = 'Den femte av Harald Blåtands ringborgar, upptäckt så sent som 2014 genom att man extrapolerade mönstret i de fyra kändas placering. Antas ha påbörjats av Harald Blåtand i slutet av 970-talet men blev aldrig färdigbyggd. Den snävt daterade geometriska Trelleborgstypen gör att den med rimlig säkerhet kan knytas till en namngiven kung. Sedan 2023 på Unescos världsarvslista.',
  archaeological_notes = 'Uppförd med säkerhet efter 966 (dendro); en kol-14 wiggle-match på bränt timmer placerar bygget i 900-talets andra hälft. Aldrig färdigbyggd. Källa: Videnskab.dk m.fl.'
where name = 'Borgring';

-- Harald Blåtands biografi: lägg till ringborgarna, gör källor sökbara, rätta
-- reign_start 935→958 (935 krockade med fadern Gorm den Gamle, 920–958).
update public.historical_kings set
  reign_start = 958,
  external_attestation = array['Jellingstenarna','Adam av Bremen','Heimskringla'],
  sources = 'Jellingstenarna (runsten); Adam av Bremen, Gesta Hammaburgensis; Snorre Sturlasson, Heimskringla; arkeologi: de fem ringborgarna (dendrokronologi).',
  description = 'Kung av Danmark ca 958–986 (son till Gorm den Gamle). Sjökonung med kontroll över Danmark, Östersjön och Kattegatt. Omnämnd på Jellingstenarna – där han säger sig ha "vunnit hela Danmark och Norge och gjort danerna kristna" – samt av Adam av Bremen och i Heimskringla. Lät omkring 980 uppföra de fem geometriska ringborgarna av Trelleborgstyp (Trelleborg vid Slagelse, Fyrkat, Aggersborg, Nonnebakken och Borgring). Borgarnas snävt dendrokronologiskt daterade slutfas knyter dem med rimlig säkerhet till hans regering – ett ovanligt exempel på monument kopplade till en namngiven kung; sedan 2023 på Unescos världsarvslista. Hög tillförlitlighet genom flera samtida källor.'
where name = 'Harald Blåtand';
