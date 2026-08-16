-- Berika Hedared + Vickleby (fakta i egna ord, källa angiven — verbatim text ej kopierad;
-- FAKTA fritt, UTTRYCK skyddat). Lägg in Salnecke slott (medeltida ägohistoria, 1640-talsbyggnad;
-- Daniel: 1600-/1700-talsslott får tas in — de har ofta äldre historia). Koord ur Wikipedia P625.

update public.ecclesiastical_sites set description =
'Sveriges enda bevarade medeltida stavkyrka, mellan Borås och Alingsås. Byggd av stående kluvna ekplankor (stavkonstruktion — en fornnordisk kyrkotyp). Årsringsdatering visar uppförande omkring 1500; en inbyggd byggnadsdel från 1100-talet vittnar om en äldre kyrka på platsen. Ursprungligen endast väggar, yttertak och stampat jordgolv — inredning och fönster (1781) tillkom senare. Restaurerad 1901 (riksantikvarie Ekhoff) och 1934–35, då äldre målningar återupptäcktes, bl.a. en altartavla med Jungfru Marias kröning. Medeltida inventarier bevaras: en madonnabild (12–1300-tal, trol. utländsk mästare), ett franskt processionskors (1100-tal enl. församlingen), förgylld silverkalk (1200-tal) och medeltida dopfunt, samt ett avlatsbrev utfärdat av biskop Vincentius i Skara 1506. Genomgripande stomrestaurering 1995–97. Källa: Svenska kyrkan (Sandhults församling) / stavkyrkan.se.'
where name ilike '%hedared%';

update public.ecclesiastical_sites set description =
'Medeltida sockenkyrka drygt en mil söder om Färjestaden, uppförd omkring mitten av 1100-talet som tornlös absidkyrka i kalksten. Ett mäktigt västtorn tillbyggdes i början av 1200-talet, med murtrappor, små celler och en s.k. skattgömma. Vad skattgömman rymde är inte dokumenterat — rimligen församlingens liturgiska värdeföremål (kalkar, patener, silver) och handlingar, men innehållet är obelagt (spekulation). Kyrkan plundrades av danskarna 1677. Under sent 1700-tal revs det medeltida koret och kyrkorummet förlängdes österut. En välbevarad dopfunt i Kalmarsundssandsten från mitten av 1200-talet finns kvar. På kyrkogården vilar bl.a. formgivaren Carl Malmsten och konstnären Artur Percy. Källa: sammanställt ur RAÄ Fornsök m.fl. (belagt/spekulation åtskilt).'
where name ilike '%vickleby%';

insert into public.medieval_castles (name, category, region, country_now, lat, lng, coord_status, period, source, note)
select 'Salnecke slott', 'herrgård', 'Uppland', 'Sverige', 59.7389, 17.3381, 'wikidata',
       '1640-tal (medeltida ägohistoria från 1302)',
       'Wikipedia: Salnecke slott (koord P625); Ulväng 2008, Herrgårdarnas historia',
       'Ett av Upplands bäst bevarade slott från slutet av Vasatiden, strax väster om Gryta kyrka nära Örsundsbro (Gryta socken, Enköpings kommun). Nuvarande tegelbyggnad i tre våningar uppförd på 1640-talet (årtalet 1646 över porten) för överbergmästaren Georg Grissbach. Platsen har dock medeltida ägohistoria: nämns från 1302 (Karl Ingeborgasson Lejonbalk bytte sin gård till Sko kloster); medeltida jord i Salnecke ägdes bl.a. av Sko kloster, Klara kloster och Uppsala ärkebiskopsbord. Byggnadsminne sedan 1967.'
where not exists (select 1 from public.medieval_castles where name ilike 'Salnecke%');
