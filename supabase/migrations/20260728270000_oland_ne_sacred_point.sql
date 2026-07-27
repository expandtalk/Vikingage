-- Ölands nordöstra udde (Trollskogen/Grankullavik) — "helig udde"-komplex enligt J-H Fallgren.
-- LÅG KONFIDENS: koordinater APPROXIMATIVA (gissade ur Google Maps-vy av Daniel, EJ inmätta);
-- källor är alltpaoland.se + Fallgrens föreläsning (ej peer-review). Läggs som cult_sites →
-- syns på /sv/oland (kult-lager), men märkta som hypotes/tradition, inte fastställda fynd.
-- cult_sites.sources är text[] (array).

begin;

insert into public.cult_sites (id, name, type, region, lat, lng, established_period, description, sources)
select gen_random_uuid(), v.name, v.type, 'Öland', v.lat, v.lng, v.period, v.descr, v.src
from (values
  ('Hjerteskeppet', 'tradition/samlingsplats', 57.3594, 17.1221, 'järnålder (osäkert)',
    'Avlång försänkning i Trollskogen (nära Byxelkrok) formad som ett skepp. Sägen: sista viloplats för ett strandat skepp, inbäddat i sten/grus från havet; på bottnen en brunn vars vatten enligt tradition haft övernaturliga krafter. Nyttjad som förråd/samlingsplats av svenskarna under 1400-talets krig mot Danmark. Arkeologen J-H Fallgren tolkar den som en möjlig forntida samlings-/tingsplats för Östersjö-resenärer vid den nordöstra udden. KOORDINAT APPROXIMATIV (gissad, ej inmätt).',
    array['alltpaoland.se (adress Trollkungavägen, Byxelkrok); Jan-Henrik Fallgren (föreläsning). Koordinat approximativ, ej inmätt.']::text[]),
  ('Grankullaviks jaktmur', 'gränsmur (hypotes)', 57.3470, 17.1229, 'vendel-/folkvandringstid (Fallgren, hypotes)',
    'Stenmur över den smalaste delen av Ölands nordöstra udde. Länge tolkad som medeltida, men J-H Fallgren daterar den tidigare (vendel-/folkvandringstid) utifrån att den ligger ~4,5 m över havet. Fallgren tolkar udden som en "helig udde" (där land, hav och himmel möts) avgränsad från det profana med muren. KOORDINAT APPROXIMATIV (gissad, ej inmätt); källa = föreläsning.',
    array['Jan-Henrik Fallgren (föreläsning, YouTube). Redatering = hypotes. Koordinat approximativ, ej inmätt.']::text[])
) as v(name, type, lat, lng, period, descr, src)
where not exists (select 1 from public.cult_sites c where c.name = v.name);

commit;

-- Kontroll: select name, type, lat, lng from cult_sites where name in ('Hjerteskeppet','Grankullaviks jaktmur');
