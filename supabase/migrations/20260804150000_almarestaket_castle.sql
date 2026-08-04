-- Almarestäkets borg (Sankt Eriks borg) — medeltida ärkebiskopsborg, RAÄ Kungsängen 73:1.
-- Medeltida stenborg → heritage_sites (ej swedish_hillforts). geom är GENERERAD ur lat/lng.
-- Koordinat 59°28′7″N 17°47′37″Ö = 59.46861 / 17.79361 (sv.wikipedia, knuten till RAÄ Kungsängen 73:1).
--
-- Samtida med Telge hus (20260804140000): båda medeltida, båda brända under Engelbrekt-tiden (1430-tal),
-- båda återuppförda ~1440-tal. Tillsammans vaktar de Mälarens två utlopp (norr: Stäket mot Uppsala/Sigtuna;
-- söder: Tälje mot Östersjön) — vattenkontrollpunkter efter att landhöjningen slutit Mälaren till insjö.

INSERT INTO heritage_sites (name, raa_type, register_system, register_id, municipality, parish, landscape, period, lat, lng, description, source_uri, evidence_class)
SELECT 'Almarestäkets borg (Sankt Eriks borg)', 'Borg/slottslämning', 'RAÄ', 'Kungsängen 73:1',
  'Upplands-Bro', 'Kungsängen', 'Uppland', 'medeltid', 59.46861, 17.79361,
  'Medeltida borgruin på Stäketsholmen vid Stäksundet, Upplands-Bro. Kontrollerade den viktiga vattenleden Stockholm–Sigtuna/Uppsala; en föregångare fanns redan på 1100-talet (försvar för Sigtuna och Uppsala). Ärkebiskoparnas (kyrkans/påvemaktens) borg. Bränd natten till 11 nov 1434 (order av Erik av Pommern, för att hindra Engelbrekt); ny borg från 1440 (ärkebiskop Nils Ragvaldsson). Ärkebiskop Gustav Trolle innehade borgen på 1510-talet; belägrad 1516–17 av Sten Sture d.y., som 1517 drev igenom rivning trots bannlysningshot. Riven senast 1519 (teglet fraktat till Stockholm) — upptakt till Stockholms blodbad 1520. Föll i glömska under Gustav Vasa/reformationen. Källor: RAÄ Kungsängen 73:1; sv.wikipedia (CC BY-SA 4.0); Stockholms läns museum; Harrison m.fl., Almare Stäket (2017).',
  'https://sv.wikipedia.org/wiki/Almarestäkets_borg', 'documented'
WHERE NOT EXISTS (SELECT 1 FROM heritage_sites WHERE register_id='Kungsängen 73:1' OR name ILIKE '%almarestäket%');
