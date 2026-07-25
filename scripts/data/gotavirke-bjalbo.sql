-- Götavirke (järnåldersförsvarsvall) + Bjälboätten-berikning + Ingrid Ylva + heraldik-mynt.
-- Proveniens: Björn Granstrand (Götavirke) + medeltidsgenealogi (Bjälboätten-terminologi).
-- Bjälboätten-dynastin (55555555…) och dess kungar finns REDAN — detta är berikning.

begin;

-- 1. Götavirke + Tvärdalavallen (archaeological_sites; coordinates=point, geom=PostGIS)
insert into archaeological_sites
  (name, location, parish, county, country, period, dating, burial_type, description, geom, coordinates)
select v.name, v.location, v.parish, 'Östergötland', 'Sweden', 'Viking', v.dating, v.burial_type, v.description,
       ST_SetSRID(ST_MakePoint(v.lng, v.lat), 4326), point(v.lng, v.lat)
from (values
  ('Götavirke', 'Mellan Asplången och Lillsjön, V om Söderköping (Västra Husby)', 'Västra Husby',
   '800–1050 e.Kr. (kol-14; i bruk minst 200 år)', 'försvarsanläggning',
   'Forntida försvarsvall, ursprungligen 3 500 m lång med palissad på krönet och vallgrav på östsidan; vallen 4 m hög och upp till 12 m bred, förstärkt med stenblock. Till storleken unik i Sverige. En kedja gravfält (en per gård?) följer vallen; vid norra änden mot Asplången finns fornborgar som förlängde försvaret. Skydd mot fiende österifrån (Östersjön). Parkering/infoskyltar vid koordinaterna.',
   58.47416, 16.16722),
  ('Tvärdalavallen', 'Ca 2 km väster om Götavirke', 'Västra Husby',
   'järnålder', 'försvarsanläggning',
   'Parallell försvarsvall ~2 km väster om Götavirke; kan ha fungerat som ytterligare försvarslinje. Läge approximativt.',
   58.4740, 16.1350)
) as v(name, location, parish, dating, burial_type, description, lat, lng);

-- 2. Berika Bjälboätten-dynastin med korrekt terminologi + heraldik ----------
update royal_dynasties
   set description = 'Bjälboätten — sentida konventionellt namn efter gården Bjälbo nära Skänninge (Östergötland), ättens tidigast kända gods och maktcentrum. Namnet "Folkungaätten" (infört av Messenius 1616 via den obelagda stamfadern Folke Filbyter) undviks: i medeltida källor är "folkungar" (folkunga rote, Erikskrönikan) ett upproriskt högfrälseparti i OPPOSITION mot Bjälboätten, inte släktnamnet. Ätten delas i grenar; med Bjälboätten avses främst grenen från Birger jarl, med kungamakt från sonen Valdemar Birgersson (1250). Vapnet — gyllene lejon på tre strängar (bjälkar) på blå sköld — lever kvar i Sveriges riksvapen (2:a och 3:e fältet). Kvinnornas roll (arv, allianser, hushållsekonomi) är central men ofta underskattad, jfr Ingrid Ylva.',
       period_start = 1150
 where id = '55555555-5555-5555-5555-555555555555';

-- 3. Ingrid Ylva — Birger jarls mor, Bjälbo-matriark (kvinnlig nyckelperson) --
insert into historical_kings
  (name, status, region, gender, de_facto_ruler, external_attestation, dynasty_id,
   birth_year, death_year, role, description)
select 'Ingrid Ylva', 'historical', 'Östergötland', 'female', true, '{}', '55555555-5555-5555-5555-555555555555',
   1180, 1252, 'ättematriark',
   'Birger jarls mor och Bjälbos matriark; sägs ha styrt godset och ätten som änka. I Bjälbo kyrktorn finns "Ylvas valv", traditionellt hennes vävkammare — om textilproduktion bedrevs där i skala pekar det mot en nära nog industrialiserad hushållsekonomi (ull→vävnad som maktresurs). Exempel på kvinnornas underskattade roll i Bjälboättens maktbygge.'
where not exists (select 1 from historical_kings where name = 'Ingrid Ylva');

-- 4. Heraldik/mynt: Knut Långes bjälk-penning (motivets ursprung) ------------
insert into coins
  (name, name_en, category, issuer, issuer_king_id, mint, metal, denomination,
   period_start, period_end, obverse, reverse, significance, description)
select 'Penning, Knut Långe', 'Penny, Knut the Tall', 'medeltida', 'Knut Långe',
   (select id from historical_kings where name = 'Knut Långe' limit 1),
   'Sverige', 'silver', 'penning', 1229, 1234,
   'Kunglig gestalt', 'Tre smala bjälkar (strängar)',
   'Tre-bjälke-motivet uppträder redan på Knut Långes mynt och återkommer som strängarna bakom lejonet i Bjälboättens (Birger jarls) vapen — heraldisk föregångare till Sveriges riksvapen. Möjliggör tidsmässig kartläggning av när maktikonerna (bjälkar, lejon) etableras.',
   'Silverpenning präglad under Knut Långe (Knut Holmgersson). Bjälk-motivet knyter an till den heraldiska utvecklingen mot Bjälboättens och rikets vapen.'
where not exists (select 1 from coins where name = 'Penning, Knut Långe');

commit;
