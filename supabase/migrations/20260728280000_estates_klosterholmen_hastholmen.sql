-- Två källförda maktsäten till estates (fyller bl.a. Öland-luckan, QA #14). Koordinater ur källorna.
-- estates.id saknar default (jfr cult_sites) → gen_random_uuid(). Insert lat/lng (geom antas genereras).

begin;

insert into public.estates (id, name, estate_type, first_attested, lat, lng, confidence, source, description)
select gen_random_uuid(), v.name, v.etype, v.attested, v.lat, v.lng, v.conf, v.src, v.descr
from (values
  ('Klosterholmen (Nackholm)', 'storgård', 1300, 57.19689, 16.94073, 'trolig',
    'RAÄ, Det medeltida Sverige. Öland (Axelsson m.fl. 1996)',
    'Källarmurar efter en större byggnad på Klosterholmen vid Hornsjön (Ölands enda insjö, en havsvik fram till 700–800-tal). RAÄ: sannolikt en befäst medeltida storgård — boningshus på holmen, ekonomibyggnader på fastlandet, vallgravar (vattenfyllda före 1800-talets sjösänkningar) + kajplats; "en mindre Glimmingehus". Alt. teori: kungsgård rest ~mitten 1500-tal på Gustav Vasas order. Namnet Klosterholmen kom av att ruinen tidigare felaktigt antogs vara S:t Ottos kapell (koppling till Roma kloster, Gotland). Kallas även Nackholm.'),
  ('Klippholmen (Hästholmen)', 'borg', 1370, 58.27965, 14.63448, 'belagd',
    'Mats Areskoug; Det medeltida Sverige',
    'Riddaren Gerhard Snakenborgs borg (Albrekt av Mecklenburgs man) vid Vätterns östra strand, sent 1300-tal. Hästholmen, strax söder om Omberg, var en viktig medeltida hamn för Vättern-transporter och räknades på 1300-talet som en av rikets städer — innan Vadstena (Birgitta-effekten) tog över som viktigaste östra hamnen. Klippholmen är idag en halvö intill hamnen.')
) as v(name, etype, attested, lat, lng, conf, src, descr)
where not exists (select 1 from public.estates e where e.name = v.name);

commit;

-- Kontroll: select name, estate_type, lat, lng from estates where name in ('Klosterholmen (Nackholm)','Klippholmen (Hästholmen)');
