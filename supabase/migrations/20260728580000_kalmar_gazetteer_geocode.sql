-- Geokodning + gazetteer-flagga för Kalmar-ortnamnen. Koordinater ENBART ur auktoritativt
-- ortregister (place_names, Lantmäteri-gazetteern), spatialt begränsat till Kalmarsidan av
-- sundet (Daniel: merparten ligger på fastlandssidan). Namn som INTE finns i registret får
-- ingen koord (får ej gissas) och grupperas som egen kategori i UI.
begin;
alter table public.kalmar_place_names
  add column if not exists gazetteer_match boolean not null default false;

-- Belagda i ortregistret (place_names) — exakt namnmatch inom Kalmar-bbox:
update public.kalmar_place_names set lat=56.6723, lng=16.2327, gazetteer_match=true,
  source=coalesce(source,'')||' · koord: place_names (Lantmäteri-gazetteer)' where name='Dörby';
update public.kalmar_place_names set lat=56.6341, lng=16.2658, gazetteer_match=true,
  source=coalesce(source,'')||' · koord: place_names' where name='Dunö';
update public.kalmar_place_names set lat=56.5542, lng=16.1805, gazetteer_match=true,
  source=coalesce(source,'')||' · koord: place_names' where name='Hagby';
update public.kalmar_place_names set lat=56.6470, lng=16.1864, gazetteer_match=true,
  source=coalesce(source,'')||' · koord: place_names' where name='Råby';
update public.kalmar_place_names set lat=56.6477, lng=16.2200, gazetteer_match=true,
  source=coalesce(source,'')||' · koord: place_names' where name='Rinkaby';
update public.kalmar_place_names set lat=56.6796, lng=16.2365, gazetteer_match=true,
  source=coalesce(source,'')||' · koord: place_names' where name='Smedby';
update public.kalmar_place_names set lat=56.6780, lng=16.2181, gazetteer_match=true,
  source=coalesce(source,'')||' · koord: place_names' where name='Tingby';
update public.kalmar_place_names set lat=56.6259, lng=16.1116, gazetteer_match=true,
  source=coalesce(source,'')||' · koord: place_names' where name='Ölvingstorp';
-- Hossmo finns i registret (bekräftar kyrko-koordinaten) — flagga men behåll Fornsök-koord:
update public.kalmar_place_names set gazetteer_match=true where name='Hossmo';
commit;
