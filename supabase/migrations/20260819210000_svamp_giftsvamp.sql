-- Giftiga / oätliga förväxlingssvampar ("oatliga") — egen tabell så de kan visas som
-- KLICKA-FÖR-ATT-VISA på /sv/svamp (man avslöjar medvetet hur de farliga ser ut) och som
-- facett "Natur · Svampar · Oätliga" i bildarkivet. SÄKERHETSKRITISKT: skiljande drag + symtom
-- är källbelagda (Giftinformationscentralen / Nylén & Ryman m.fl.), aldrig gissade. Bilder
-- hotlänkas live från Wikimedia Commons (fri licens) — rehostas aldrig.
create table if not exists svamp.giftsvamp (
  id text primary key,
  svenskt_namn text not null,
  vetenskapligt_namn text not null,
  allvarlighet smallint not null default 5,          -- 1 (oätlig/besk) … 5 (livsfarlig)
  toxin text,                                         -- verksamt gift (amatoxin, orellanin …)
  symtom text,                                        -- kort, källbelagd symtombild
  kanne_pa text,                                      -- hur man skiljer den från matsvampen
  forvaxlas_med text,                                 -- vilken matsvamp den liknar
  bild_url text, bild_licens text, bild_kredit text, bild_kalla text,
  created_at timestamptz default now()
);

alter table svamp.giftsvamp enable row level security;
drop policy if exists "public read giftsvamp" on svamp.giftsvamp;
create policy "public read giftsvamp" on svamp.giftsvamp for select using (true);
grant usage on schema svamp to anon, authenticated;
grant select on svamp.giftsvamp to anon, authenticated;

-- Seed: de kliniskt viktigaste förväxlingssvamparna. Skiljande drag hämtade ur plattformens
-- egen svamp.forvaxlingsrisk (redan källgranskad). Symtom/toxin = etablerad toxikologi.
insert into svamp.giftsvamp (id, svenskt_namn, vetenskapligt_namn, allvarlighet, toxin, symtom, kanne_pa, forvaxlas_med) values
 ('lomsk_flugsvamp','Lömsk flugsvamp','Amanita phalloides',5,'Amatoxiner (α-amanitin)',
  'Sveriges dödligaste svamp. Symtomfritt intervall 6–24 h, sedan svåra magsymtom och därefter lever- och njursvikt. Ring 112 / Giftinformationscentralen vid minsta misstanke.',
  'Grönaktig till olivbrun hatt, VITA skivor, ring på foten och en säckformad STRUMPA (volva) vid basen. Gräv alltid upp hela foten.','Champinjoner, ung stolt fjällskivling'),
 ('vit_flugsvamp','Vit flugsvamp','Amanita virosa',5,'Amatoxiner',
  'Lika livsfarlig som lömsk flugsvamp. Fördröjda symtom (6–24 h) följt av leversvikt.',
  'Helvit, ring på foten och tydlig STRUMPA/volva vid basen, INGEN ormskinnsfjällig fot. Plocka aldrig unga oöppnade vita svampar.','Stolt fjällskivling, champinjon'),
 ('toppig_giftspindling','Toppig giftspindling','Cortinarius rubellus',5,'Orellanin',
  'Orellanin skadar njurarna med veckors fördröjning (2–3 v) — lätt att missa kopplingen till svampmålet.',
  'ÄKTA SKIVOR (ej åsar) och spindelvävsrester (cortina). Kantarell har trubbiga åsar som löper ner på foten, är gul rakt igenom och doftar aprikos.','Kantarell, trattkantarell'),
 ('gifthatting','Gifthätting','Galerina marginata',5,'Amatoxiner',
  'Innehåller samma dödliga amatoxiner som flugsvamparna trots liten storlek. Växer i tuvor på ved.',
  'Liten brun svamp med ring på foten, växer på multnande ved. Förväxlas med odlade/ätliga tofsskivlingar — plocka aldrig små bruna skivlingar på ved.','Ätliga skivlingar på ved'),
 ('djavulssopp','Djävulssopp','Rubroboletus satanas',3,'Muskariner m.m.',
  'Ger kraftiga magsymtom. Ovanlig i Sverige, kalkrik mark i söder.',
  'Röd rörmynning och rödaktig fot; nätmönster. Karl Johan har vit–gulgrön rörmynning och ljust nät.','Karl Johan, andra soppar'),
 ('gallsopp','Gallsopp','Tylopilus felleus',1,'Bitterämnen (ej giftig)',
  'Inte giftig men så besk att den förstör hela svampmålet. Smaka en liten bit rå för att skilja.',
  'Rosa rörmynning och mörkt nätmönster i relief på foten. Karl Johan har ljust, fint nät och vit–gulgrön rörmynning.','Karl Johan')
on conflict (id) do update set
  svenskt_namn=excluded.svenskt_namn, vetenskapligt_namn=excluded.vetenskapligt_namn,
  allvarlighet=excluded.allvarlighet, toxin=excluded.toxin, symtom=excluded.symtom,
  kanne_pa=excluded.kanne_pa, forvaxlas_med=excluded.forvaxlas_med;

-- Publik RPC (samma mönster som svamp_artlista) — svamp-schemat exponeras inte direkt via PostgREST.
create or replace function public.svamp_giftsvamplista()
 returns table(id text, svenskt_namn text, vetenskapligt_namn text, allvarlighet smallint,
   toxin text, symtom text, kanne_pa text, forvaxlas_med text,
   bild_url text, bild_licens text, bild_kredit text, bild_kalla text)
 language sql stable security definer set search_path to 'svamp','public'
as $function$
  select g.id, g.svenskt_namn, g.vetenskapligt_namn, g.allvarlighet, g.toxin, g.symtom,
         g.kanne_pa, g.forvaxlas_med, g.bild_url, g.bild_licens, g.bild_kredit, g.bild_kalla
  from svamp.giftsvamp g order by g.allvarlighet desc, g.svenskt_namn;
$function$;
grant execute on function public.svamp_giftsvamplista() to anon, authenticated;
