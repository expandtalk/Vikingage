-- Ortnamnsforskning kring Kalmar / Hossmo — foundation för /sv/kalmar.
-- Källa: Svenskt ortnamnslexikon (SOL) 2003 (lokalt nedladdad diva2:1175717), lokalt uppslaget.
-- HEDERLIGHETSPRINCIP (Daniel: "man får inte hitta på"): per rad flaggas sol_match =
--   'locality' = SOL behandlar EXAKT denna ort/detta objekt.
--   'element'  = SOL ger elementets betydelse men uppslaget avser ANNAN ort (betydelsen överförs).
--   'none'     = namnet finns INTE i SOL; endast transparent element-analys (hypotes, ej belagt).
-- Tesen (Hossmo = husaby-nukleus) är en tolkning, ej dom — forskaren avgör. Koordinater NULL:
-- geokodning mot Fornsök/Lantmäteri är eget steg (koord får ej gissas).

create table if not exists public.kalmar_place_names (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null,            -- husaby|by_administrativt|by|torp|ö|skär_grund|terräng|vattendrag
  sol_headword text,                     -- SOL-uppslagsord (null om ej i SOL)
  sol_match    text not null default 'none',  -- locality|element|none
  sol_note     text,                     -- SOL:s etymologi (verbatim-nära) där sådan finns
  element_reading text,                  -- ärlig ledanalys
  interpretation  text,                  -- tolkning/hypotes (flaggad)
  lat double precision, lng double precision,   -- NULL tills geokodat mot auktoritativ källa
  source text,
  created_at timestamptz default now()
);
alter table public.kalmar_place_names enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='kalmar_place_names' and policyname='kalmar_place_names_read') then
    create policy kalmar_place_names_read on public.kalmar_place_names for select using (true);
  end if;
end $$;

delete from public.kalmar_place_names;
insert into public.kalmar_place_names (name,category,sol_headword,sol_match,sol_note,element_reading,interpretation,source) values
-- === Husaby-nukleusen (SOL-belagd kärna) ===
('Hossmo','husaby','Hossmo','locality',
 'Hwsamo 1362 avskr. Förleden är ett gammalt bebyggelsenamn *Husa, avseende en föregångare till den husaby som senare funnits i socknen. Efterleden är mo ''sandig mark''. Kyrkan (rundkyrka) uppförd ca 1120–1180, en av Sveriges äldsta stenkyrkor.',
 '*Husa (husaby) + mo ''sandmark''',
 'Husaby-namn = kungligt/administrativt gods. Sannolikt Södra Möres förkristna–tidigmedeltida maktcentrum vid Ljungbyåns mynning, före Kalmars uppgång. TES — forskaren avgör.',
 'SOL 2003'),
('Rinkaby','by_administrativt','Rinkaby','element',
 'SOL: Rinkaby (och Tegneby) antas innehålla beteckningar för män i forntida konungars tjänst (fsv. rinker).',
 'rinker ''kungens hirdman'' + by',
 'Kungliga hirdmän. Förstärker husaby-nukleusen kring Hossmo — administrativ/militär funktionsby.',
 'SOL 2003 (elementbetydelse; Kalmar-Rinkaby ej separat uppslag)'),
('Tingby','by_administrativt',null,'none',null,
 'ting ''tingsplats'' + by (element-transparent)',
 'Möjlig tingsplats i samma bälte. EJ belagt i SOL — hypotes.',
 'ledanalys'),
('Smedby','by','Smedby','element',
 'SOL-uppslaget avser Smedby sn, Gräsgårds hd, Öland. Elementet smed ''smed''.',
 'smed + by',
 'Specialiserad hantverksby (smide) — vanlig komponent i centralortsmiljö.',
 'SOL 2003 (element)'),
-- === -by / -torp-bältet kring Hossmo (mestadels transparent, ej SOL-uppslag) ===
('Hagby','by','Hagby','locality','Hagby sn, tätort, Södra Möre hd, Småland.',
 'hage ''inhägnad betesmark'' + by','Bebyggelseby i Södra Möre.','SOL 2003'),
('Dörby','by','Dörby','locality','SOL listar Dörby men ger ingen utförlig etymologi i uppslaget.',
 'oklar förled + by','—','SOL 2003 (uppslag utan utförd etymologi)'),
('Ölvingstorp','torp','Ölvingstorp','locality','SOL-uppslag (Södra Möre).',
 'mansnamnet Ölving/Ölfa + torp','Personnamnstorp i Möre-bältet.','SOL 2003'),
('Kölby','by',null,'none',null,'köl ''ås/rygg'' (?) + by','EJ i SOL — obelagt.','ledanalys'),
('Törneby','by',null,'none',null,'törne ''törnbuske'' + by','Transparent, EJ i SOL.','ledanalys'),
('Skällby','by',null,'none',null,'oklar förled + by','EJ i SOL — obelagt.','ledanalys'),
('Råby','by','Råby','element','SOL-uppslaget avser Råby-Rönö, Södermanland.',
 'rå ''gräns/rågång'' el. personnamn + by','Kalmar-Råby ej separat i SOL.','SOL 2003 (element)'),
('Guttorp','torp',null,'none',null,'personnamn (Gudde/Gute?) + torp','EJ i SOL — obelagt.','ledanalys'),
('Ebbetorp','torp',null,'none',null,'mansnamnet Ebbe + torp','Transparent, EJ i SOL.','ledanalys'),
('Barketorp','torp',null,'none',null,'personnamn/barke + torp','EJ i SOL — obelagt.','ledanalys'),
('Perstorp','torp',null,'none',null,'mansnamnet Per + torp','Transparent, EJ i SOL.','ledanalys'),
('Tomteby','by',null,'none',null,'tomt/tomte + by','EJ i SOL — obelagt.','ledanalys'),
-- === Öar & skär i Kalmarsund/Kalmar skärgård (maritima namn, mest efterreformatoriska, ej SOL) ===
('Stensö','ö','Stensö','locality','SOL nämner Stensö vid Kalmar (Bild 40).',
 'sten + ö','Halvö/udde S om Kalmar (Stensö udde).','SOL 2003'),
('Aspö','ö','Aspö','element','SOL-uppslaget avser Aspö sn, Blekinge: trädbeteckningen asp + ö.',
 'asp + ö','—','SOL 2003 (element)'),
('Styrsö','ö','Styrsö','element','SOL-uppslaget avser Styrsö sn, Västergötland.',
 'styr- + ö','—','SOL 2003 (element)'),
('Grimskär','skär_grund',null,'none',null,'mansnamnet Grim (el. grima ''mask'') + skär','Lotsbyte-ö utanför Kalmar; EJ i SOL.','ledanalys'),
('Ekö','ö',null,'none',null,'ek + ö','Transparent, EJ i SOL.','ledanalys'),
('Ramsö','ö',null,'none',null,'rams (ramslök) el. personnamn + ö','EJ i SOL — obelagt.','ledanalys'),
('Boön','ö',null,'none',null,'bo ''boställe'' + ö (?)','EJ i SOL — obelagt.','ledanalys'),
('Dunö','ö',null,'none',null,'dun ''dyn/sandmark'' el. dunfågel + ö','EJ i SOL — obelagt.','ledanalys'),
('Kungsholmen','ö','Kungsholmen','element','SOL-uppslaget avser Kungsholmen, Stockholm.',
 'kungs- + holme','Kalmar-Kungsholmen (fästningsö) ej separat i SOL.','SOL 2003 (element)');

-- Sammanfattande vy: sortera fram det SOL faktiskt belägger
create or replace view public.v_kalmar_onomastic_core as
  select name, category, sol_match, element_reading, interpretation, sol_note
  from public.kalmar_place_names
  where sol_match = 'locality' or category in ('husaby','by_administrativt')
  order by (sol_match='locality') desc, category;
