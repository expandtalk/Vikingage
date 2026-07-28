-- Grimskär: rätt koordinat (Grimskärs skans, Google Maps-pin från Daniel) + historik som data.
-- Medeltida namn Stegelholmen (avrättningsplats, steglingsplats). En grima (grinande huvud på
-- stolpe) varnade för revet Skansgrundet + var inseglingsmärke → namnet Grimskär (belagt 1534).
-- Skans från 1623 (sten från öländska borgar), lotsstation till 1940. OBS: skilt från Stora
-- Grimskär vid Muskö/Nynäshamn (59.104/18.569) — annan ö.
begin;
update public.kalmar_place_names set
  lat = 56.6521776, lng = 16.3702873,
  coord_precision = 'forskare',
  head_element = 'grima (grinande huvud på stolpe)',
  semantic_domain = 'rätt',
  period_stratum = 'medeltid',
  interpretation = 'Medeltida Stegelholmen — avrättningsplats där dömda steglades (kroppsdelar på hjul ovan mark). En grima (grinande huvud på stolpe) varnade för revet Skansgrundet och tjänade som inseglingsmärke för fredlig handel → namnet Grimskär (belagt 1534). Strategiskt: inget skepp når Kalmar osett härifrån; anfallen 22 ggr utan att intas. Grimskärs skans (fyruddig stjärna) uppförd från 1623 av 400 man med sten från öländska borgar; 200 år i krigstjänst → Kungliga Lotsverket (mitten 1800-t, fyr + fyrbostäder) → utspelad roll 1940.',
  source = 'Kalmar lokalhistoria (Daniel Larsson) · koord: Grimskärs skans (Google Maps-pin, 2026-07-28)'
 where name = 'Grimskär';

insert into public.place_name_forms (place_id,place_name,attested_form,attested_year,year_precision,form_kind,source,verified,dialect_note)
select k.id,k.name,f.form,f.yr,f.yp,f.kind,f.src,f.ver,f.dn from (values
 ('Grimskär','Stegelholmen',null,'sekel','historisk_belägg','Kalmar lokalhistoria (Daniel Larsson)',false,'medeltida namn — avrättnings-/steglingsplats'),
 ('Grimskär','Grimskär',1534,'exakt','historisk_belägg','lokalhistoria (belagt 1534)',false,'grima på stolpe → ortnamnet')
) as f(pname,form,yr,yp,kind,src,ver,dn)
join public.kalmar_place_names k on k.name=f.pname;
commit;
