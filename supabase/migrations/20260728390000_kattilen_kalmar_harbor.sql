-- Kättilen — Kalmars medeltida hamn (mellan slottet och nuv. Kvarnholmen; Slottsfjärden = liten rest).
-- Berikar befintlig "Kalmar gamla hamn" med rätt namn + källbelagda detaljer. Källa: Kalmar Lexikon
-- + utgrävning av Slottsfjärden 1933 (A.E. Thulin, KLM/DigitaltMuseum, PD). KalmarWall-sidan visar
-- redan harbors → syns direkt. Koordinat oförändrad (Slottsfjärden-läget).
begin;
update public.harbors set
  name = 'Kättilen (Kalmars medeltida hamn)',
  name_en = 'Kättilen (medieval harbour of Kalmar)',
  harbor_type = 'medeltida hamn / naturhamn',
  period_start = 1180,
  period_end = 1658,
  current_status = 'Till största delen igenfylld; Slottsfjärden är en liten rest av Kättilen',
  approx_extent = 'Mellan Kalmar slott och nuvarande Kvarnholmen; insegling från nordost',
  description = 'Kättilen var det medeltida Kalmars hamn, mellan slottet och (nuvarande) Kvarnholmen; dagens Slottsfjärden är en liten rest. Skepp seglade till och från stadens bryggor och kajer över Kättilen, lastade och lossade eller låg i väntan på avfärd. Läget var relativt väl skyddat av slottets och Grimskärs kanoner samt mot besvärlig sjögång i Kalmarsund. Hamnen var en förutsättning för handeln som bidrog till att staden Kalmar grundades i slutet av 1100-talet; insegling skedde från nordost. När staden flyttades vid mitten av 1650-talet anlades nya bryggor och kajer på Kvarnholmen. Stora utfyllnader gjordes på norra sidan när järnvägen anlades på 1870-talet, och senare på västra sidan när Stadsparken skapades. Vid torrläggning och utgrävning av Slottsfjärden på 1930-talet (bl.a. 1933) återfanns många skeppsrester och mängder av medeltida föremål. Namnet ''kättil'' betydde förr ''skål'' (jfr kittel), från tyska kattila ur latinets catillus.',
  sources = 'Kalmar Lexikon; utgrävning av Slottsfjärden 1933 (foto A.E. Thulin, Kalmar läns museum / DigitaltMuseum, Public Domain)'
where name = 'Kalmar gamla hamn';
commit;
