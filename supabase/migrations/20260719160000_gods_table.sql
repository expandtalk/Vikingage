-- Gör gudar till en riktig, sökbar entitet (var hårdkodade i VIKING_GODS).
-- Seedas ur frontendens lista. RLS: publik läsning. Idempotent på namn.
create table if not exists public.gods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_old_norse text,
  category text,
  domain text[] default '{}',
  description text,
  symbols text[] default '{}',
  wikidata_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.gods enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='gods' and policyname='gods_public_read') then
    create policy gods_public_read on public.gods for select using (true);
  end if;
end $$;

insert into public.gods (name, name_old_norse, category, domain, description, symbols)
select v.name, v.non, v.cat, v.dom, v.descr, v.sym
from (values
  ('Oden','Óðinn','aesir',array['Visdom','Krig','Död','Poesi'],'Allfather, högste gud bland asarna. Envägd gud som offrade sitt öga för visdom.',array['Gungnir','Sleipner','Huginn & Muninn']),
  ('Tor','Þórr','aesir',array['Åska','Styrka','Beskydd'],'Åskguden, folkets beskyddare mot jättar och ondska. Son till Oden.',array['Mjölnir','Järnhandskar','Megingjörð']),
  ('Frej','Freyr','vanir',array['Fruktbarhet','Välstånd','Fred'],'Fruktbarhets- och välståndsgud från vanernas släkt. Herre över Alfheim.',array['Gullinbursti','Skidbladner','Kornax']),
  ('Freja','Freyja','vanir',array['Kärlek','Skönhet','Fruktbarhet'],'Kärleks- och skönhetsgudinnan. Äger hälften av de stupade krigarna.',array['Brísingamen','Falkdräkt','Hildisvíni']),
  ('Balder','Baldr','aesir',array['Ljus','Renhet','Rättvisa'],'Ljusets gud, vackrast och visast bland gudarna. Odens son.',array['Draupner','Hringhorni','Ljus']),
  ('Loke','Loki','other',array['List','Förändring','Eld'],'Trickster-guden, asarnas blodsbror men också deras fiende. Föränderlig natur.',array['Eld','Nät','Förvandling']),
  ('Ty','Týr','aesir',array['Krig','Rättvisa','Mod'],'Krigsguden som offrade sin hand för att binda Fenrir. Symbol för rättvisa.',array['Svärd','Rättvåg','Enhandsgestalt']),
  ('Heimdall','Heimdallr','aesir',array['Vakt','Ljus','Hörsel'],'Regnbågsbrons väktare, ser och hör allt. Vaktar Bifrost.',array['Gjallarhorn','Bifrost','Ljus']),
  ('Frigg','Frigg','aesir',array['Äktenskap','Hem','Moderlighet'],'Odens hustru, drottning bland asarna. Beskyddar hem och familj.',array['Spinnrock','Nyckel','Fjäder']),
  ('Njörd','Njörðr','vanir',array['Sjöfart','Vind','Fiske'],'Havs- och vindguden från vanernas släkt. Frej och Frejas fader.',array['Skepp','Vågor','Vind']),
  ('Vidar','Víðarr','aesir',array['Hämnd','Tystnad','Skogar'],'Den tyste guden, ska hämnas på Fenrir vid Ragnarök. Odens son.',array['Tjocka skor','Skog','Tystnad']),
  ('Vale','Váli','aesir',array['Hämnd','Rättvisa'],'Född för att hämnas Balders död. En dag gammal när han dödade Höder.',array['Pilbåge','Hämnd']),
  ('Ull','Ullr','aesir',array['Jakt','Skidor','Pilbågsskytte'],'Jakt- och skidguden, mästare med pilbågen. Balders styvson.',array['Pilbåge','Skidor','Sköld']),
  ('Höder','Höðr','aesir',array['Mörker','Vinter'],'Den blinde guden som av misstag dödade Balder, lurad av Loke.',array['Mörker','Mistel']),
  ('Brage','Bragi','aesir',array['Poesi','Visdom','Vältalighet'],'Skaldernas gud, mästare av poesi och vältalighet.',array['Harpa','Runor','Ord']),
  ('Idun','Iðunn','aesir',array['Ungdom','Förnyelse'],'Vårdens gudinna som bevarar gudarnas ungdom med sina äpplen.',array['Äpplen','Vår','Ungdom'])
) as v(name, non, cat, dom, descr, sym)
where not exists (select 1 from public.gods g where lower(g.name) = lower(v.name));
