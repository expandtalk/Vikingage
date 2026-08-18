-- Ortnamns-TYP-referensskikt (utkast) — det vetenskapliga typ-skiktet OVANPÅ den operativa
-- element-taggern (ortnamn_element_config). Grundar namntyper på tre axlar och kodar
-- källkritik + dateringsosäkerhet så att inget påstås utan proveniens (INGEN GISSNING).
--
--   AXEL A = när namnet först SKREVS (belägg) — hanteras per NAMN i place_names (SOL-ingest), ej här.
--   AXEL B = namnbildningsskikt/motiv (TYPENS ålder, ALDRIG ett enskilt namns bevisade ålder).
--   AXEL C = fonologiskt/ortografiskt utvecklingssteg som attesterade FORMER kan bära
--            (supradental rn/rs/rt fr. 1300-tal; vik>vi; l~r; bestämd form ~1200) — NoB 104 (2016).
--
-- "Lager" = PARALLELLA system, inte en nedåtgående stapel:
--   A_centralplats · B_sakral · C_maritim_militar · expansion_bebyggelse · natur_hydronym
--
-- Dateringsgrund kodar Per Vikstrands kritik (rec. av Peder Dam, NoB 104) av gängse
-- typ-dateringskriterier: kyrkofrekvens/storlek/fyndtäthet är trubbiga → hellre daterad arkeologi.
-- requires_human=true för allt som kräver tolkning/etymologi/gudakoppling (befordras av människa).
-- teofor_risk flaggar ytformer som lockar till FALSK teofor/sakral taggning (Torsvid = Tor+vik, ej vi).
--
-- Status: alla rader 'forslag' (människa-i-loopen). Befordras forslag → granskad → kanon.

create table if not exists public.ortnamn_typ_referens (
  id uuid primary key default gen_random_uuid(),
  typ_key text not null unique,
  label text not null,
  system text not null
    check (system in ('A_centralplats','B_sakral','C_maritim_militar','expansion_bebyggelse','natur_hydronym')),
  funktion text,
  -- AXEL B (typens skikt)
  bildningsskikt text,
  bildningsskikt_from int,
  bildningsskikt_to int,
  -- AXEL C (fonologisk/ortografisk daterbarhet i attesterade former)
  fonologiska_markorer jsonb not null default '[]'::jsonb,  -- [{markor,datering,effekt,kalla}]
  -- dateringens säkerhet + grund (Vikstrand-kritiken)
  dateringsgrund text[] not null default '{}',  -- utbredning|storlek|kyrkofrekvens|fyndtathet|daterad_arkeologi|lingvistik|skriftliga_kallor
  datering_konfidens text not null default 'hypotes'
    check (datering_konfidens in ('belagt','valetablerad','hypotes','omtvistad')),
  -- no-guessing-vakter
  requires_human boolean not null default true,
  teofor_risk text not null default 'none' check (teofor_risk in ('none','low','medium','high')),
  homonym_note text,
  element_key text,   -- mjuk koppling till ortnamn_element_config (ingen FK: config-tillägg kan saknas)
  kalla text not null,
  note text,
  status text not null default 'forslag' check (status in ('forslag','granskad','kanon')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ortnamn_typ_referens is
  'Vetenskapligt typ-referensskikt för ortnamn. Tre axlar (A belägg=per namn, B bildningsskikt, C fonologi). Parallella system, ej stapel. Källciterat, konfidens- och teofor-risk-märkt. Människa-i-loopen (status forslag→granskad→kanon).';
comment on column public.ortnamn_typ_referens.bildningsskikt is 'AXEL B: namnTYPENS skikt — aldrig enskilt namns bevisade ålder.';
comment on column public.ortnamn_typ_referens.fonologiska_markorer is 'AXEL C: daterbara ljud-/skrivsteg i attesterade former (NoB 104).';
comment on column public.ortnamn_typ_referens.teofor_risk is 'Risk att ytform lockar till falsk teofor/sakral taggning (jfr Torsvid=Tor+vik).';

alter table public.ortnamn_typ_referens enable row level security;
drop policy if exists ortnamn_typ_referens_read on public.ortnamn_typ_referens;
create policy ortnamn_typ_referens_read on public.ortnamn_typ_referens for select using (true);
drop policy if exists ortnamn_typ_referens_write on public.ortnamn_typ_referens;
create policy ortnamn_typ_referens_write on public.ortnamn_typ_referens for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------------------------------
-- SEED (utkast, källciterat). Kanonkällor: SOL 2003 (Svenskt ortnamnslexikon, red. Wahlberg);
-- Vikstrand 2001 (Gudarnas platser); NoB 104 (2016): Andersson (supradentaler), Fridell (Torsvid),
-- Vasshus (icke-teofora lund), Huldén (Töl-), Vikstrand (rec. Dam); Olsson 1972 (snäck/ledung);
-- Holmberg 1969 (tuna); Pamp 1988. Alla rader status='forslag'.
-- ---------------------------------------------------------------------------------------------------
insert into public.ortnamn_typ_referens
  (typ_key,label,system,funktion,bildningsskikt,bildningsskikt_from,bildningsskikt_to,
   fonologiska_markorer,dateringsgrund,datering_konfidens,requires_human,teofor_risk,homonym_note,element_key,kalla,note)
values
-- ===== A: CENTRALPLATS / ADMINISTRATIV (järnålder → tidig medeltid) =====
('tuna','-tuna (centralort)','A_centralplats','Förvaltnings-/centralort; ofta knuten till hundare',
  'romersk järnålder–vendel/vikingatid',1,800,'[]'::jsonb,
  array['utbredning','lingvistik'],'omtvistad',true,'medium',
  'Teofor förled (Torstuna/Ultuna) ELLER *Thors[akers]tuna; keltiskt lån *dunom omtvistat',
  'tuna','SOL 2003 s.v. -tuna; Holmberg 1969; Vikstrand 2001',
  'Centralortsterm; nära koppling till hundaresnamn (Sollentuna/Vallentuna). AXEL B, ej enskilt namn.'),
('sal','sal / -sala (hall/centralgård)','A_centralplats','Hallbyggnad/centralgård (yngre järnålder)',
  'yngre järnålder',400,1000,'[]'::jsonb,
  array['utbredning','lingvistik'],'hypotes',true,'medium',
  'Odensala m.fl.: sal vs al (SOL uttryckligt); dubbel betydelse ''bod/härbärge'' vs ''festsal/hall''',
  'sal','SOL 2003 s.v. sal; Brink 1996; Vikstrand 2001',
  'Betydelseutveckling omdiskuterad (slåtterbod vs prestige-hall). Teofora sal-namn per-namn.'),
('husaby','husaby / Husby (kungl. förvaltningsgård)','A_centralplats','Kunglig förvaltningsgård (Uppsala öd)',
  '1000–1200-tal',1000,1300,'[]'::jsonb,
  array['skriftliga_kallor','utbredning'],'belagt',false,'none',null,
  'husby','SOL 2003 s.v. husaby',
  'YNGRE än tuna som centralortsterm — ~samtida med sockenskiktet. Ligger EJ under socken i tidsdjup. Jfr transfer-mechanisms-model.'),
('karleby','Karl(a)- (Karleby) — organisationsnamn?','A_centralplats','Ev. specialist-/tjänstemannaby (kungens/stormans karlar)',
  '(sen)vikingatid–tidig medeltid',800,1300,'[]'::jsonb,
  array['utbredning'],'omtvistad',true,'none',
  'ON karl ''fri man/kungs man'' vs personnamn/binamn Karl — per-namn',
  'karl','SOL 2003 s.v. Karleby',
  'Organisationstolkning seriöst diskuterad men hypotes per namn. Attribuerade tolkningar → ortnamn_element_interpretations.'),
('sta','-sta(d) (bebyggelse/äga)','A_centralplats','Bebyggelse/äga; ''plats, ställe (för något)''',
  'romersk järnålder–vikingatid',1,800,
  jsonb_build_array(jsonb_build_object(
    'markor','supradental rs (jfr rn/rt)','datering','fr. förra hälften 1300-tal',
    'effekt','-stad-komposita + genitiv-s förled bär r+dental-assimilation; ls~rs-växling daterar LJUDÄNDRING, ej namnet (Marstrand<Malstrand)',
    'kalla','Andersson, NoB 104 (2016)')),
  array['utbredning','lingvistik'],'valetablerad',true,'low',
  '-sta(d) bebyggelse vs stad ''köpstad/urban ort'' (medeltida, eget skikt)',
  'sta','SOL 2003 s.v. -sta(d); Andersson NoB 104 (2016)',
  'Produktivitetens tyngdpunkt romersk järnålder. Förledstolkning (personnamn/terräng) kräver människa.'),
-- ===== B: SAKRAL / TEOFOR (förkristen, järnålder → vikingatid) =====
('vi','-vi / vé (helgedom)','B_sakral','Helig plats, kultplats',
  'urnordisk sakral toponymi (äldre skikt)',1,1000,
  jsonb_build_array(
    jsonb_build_object('markor','vik>vi (obetonad ställning)','datering','sen fsv./dialektalt',
      'effekt','-vi kan DÖLJA -vik; hyperkorrekt -vid uppstår (Torsvid = Tor+VIK, ej vé)',
      'kalla','Fridell ''Torsvid'', NoB 104 (2016)'),
    jsonb_build_object('markor','vide-sammandragning','datering','—',
      'effekt','Vimossen/Visjön/Vibäcken innehåller ofta vide (träd), ej vé',
      'kalla','SOL 2003 s.v. -vi')),
  array['utbredning','lingvistik'],'valetablerad',true,'high',
  'vé (helgedom) vs vik (bukt) vs vide (buske) vs adj. vī- ''helig'' — per-namn OBLIGATORISKT',
  'vi','SOL 2003 s.v. -vi; Vikstrand 2001',
  'Teofora -vi (Odensvi/Frösvi/Ullevi/Torsvi) starkaste sakralindikatorn — MEN aldrig regex. Torsvid är varningsfallet.'),
('lund','-lund (lund; ev. helig)','B_sakral','Lund/dunge; i förkristen kontext ev. helig lund',
  'svårdaterat (förkristen där sakral)',null,1100,'[]'::jsonb,
  array['utbredning'],'hypotes',true,'medium',
  'Helig lund vs profan träddunge — per-namn (närhet kyrka/sakralnamn/centralitet indicier)',
  'lund','SOL 2003 s.v. lund; Vasshus NoB 104 (2015/2016)',
  'Icke-teofora lund KAN vara sakrala (Vasshus) men lund ofta profan. Indicier, ej bevis.'),
('hov','-hov (hov/kultbyggnad)','B_sakral','Hov; ev. förkristen kultbyggnad',
  'yngre järnålder–vikingatid',400,1050,'[]'::jsonb,
  array['utbredning'],'hypotes',true,'medium',
  'Kultbyggnad vs senare nobiliserande -hov (Sturehov/Åkeshov, 1600-tal) — skilj kronologiskt',
  'hov','SOL 2003 s.v. hov',
  'Efterledsbruket -hov som statusnamn är tidigmodernt; sakralt hov är fornt. Per-namn.'),
('harg','-harg / hörg (kultplats)','B_sakral','Harg; stenaltare/kultplats',
  'yngre järnålder–vikingatid',400,1050,'[]'::jsonb,
  array['utbredning'],'hypotes',true,'medium',
  'harg ''kultplats'' vs harg ''stenig mark/stenröse'' — per-namn',
  'harg','SOL 2003 s.v. harg; Vikstrand 2001',
  'Sakralt när teofor/centralt; annars terrängbetecknande.'),
('sakral_aker','teofor -åker (helig åker)','B_sakral','Rituellt brukad åker (endast teofora komposita)',
  'järnålder–vikingatid',1,1050,'[]'::jsonb,
  array['utbredning'],'hypotes',true,'high',
  'Endast teofora (Torsåker/Odensåker/Ulleråker) sakrala; åker annars profan odlad mark',
  null,'SOL 2003 s.v. åker; Vikstrand, OUÅ 2002',
  'Sakral-åker-namn ingår ofta i distriktsnamn men saknar känd bebyggelse. Aldrig regex på ''åker''.'),
('deity_forled','gudanamnsförled (Tor/Frö/Oden/Ull/Njärd)','B_sakral','Teofor förled i sammansatt namn',
  'förkristen (järnålder–vikingatid)',1,1050,'[]'::jsonb,
  array['lingvistik'],'omtvistad',true,'high',
  'Ull=guden vs appellativ ''glans/glänta''; Tor vs Torp/Torsvid(vik); Frö vs frö ''fruktbar''; per-namn sensdisambiguering OBLIGATORISK',
  null,'Vikstrand 2001 (Gudarnas platser); SOL 2003; Huldén NoB 104 (2016)',
  'Huldéns Töl- visar: ytform ger INGEN grupp. Regex på gudanamn är förbjudet. Kandidat-flagga → verifierare fäller dom per namn.'),
-- ===== C: MARITIM / MILITÄR ORGANISATION (vikingatid) =====
('snack','snäck- (snäckhamn/krigsskepp)','C_maritim_militar','Ledungshamn för krigsskepp (snekkja)',
  '(sen)vikingatid–tidig medeltid',800,1300,'[]'::jsonb,
  array['utbredning'],'hypotes',true,'none',
  null,'snäck','SOL 2003 s.v. snäck-; Olsson 1972',
  'Ledungskoppling välargumenterad (Olsson: snäckhamnar→tingen; Gotland eget system). Se snack-names-gotland-ledung.'),
('naust','naust / nöst (båthus)','C_maritim_militar','Båthus/vinterupplag för skepp',
  'svårdaterat (kustnärt)',null,null,'[]'::jsonb,
  array['utbredning'],'hypotes',true,'none',
  null,'naust','SOL 2003 s.v. naust; Norsk stadnamnleksikon',
  'Vanligt i väst/Norge, glesare i Sverige. Gränsfall shipbuilding/seafaring.'),
('ledung','ledung / hundare / skeppslag (organisation)','C_maritim_militar','Sjömilitär uppbådsorganisation',
  'vikingatid–tidig medeltid',700,1300,'[]'::jsonb,
  array['skriftliga_kallor','utbredning'],'valetablerad',true,'none',
  null,null,'SOL 2003; Olsson 1972',
  'SYSTEM, ej enskilt led. Omfattar snäck-, roþs- (Roslagen), hundare, tingsplatser. Bär snäck/naust/hamn-namnen.'),
('hamn_maritim','-hamn (hamn)','C_maritim_militar','Hamn/naturhamn',
  'svårdaterat',null,null,'[]'::jsonb,
  array['utbredning'],'hypotes',true,'medium',
  'ON hǫfn ''hamn'' vs fsv. hamn/hagi ''betesmark, fägata'' (inåt land) — disambiguera mot läge',
  'hamn','SOL 2003; Hellquist SEO s.v. hamn',
  'Kustläge stärker hamn-tolkning; inlandsläge talar för betesmark-homonymen.'),
-- ===== EXPANSION: BEBYGGELSE (vikingatid → medeltid; separat skikt, EJ ''djupare'') =====
('by','-by (gård/by)','expansion_bebyggelse','Gård/by (expansionsskikt)',
  'vikingatid–tidig medeltid',700,1300,'[]'::jsonb,
  array['utbredning','storlek'],'belagt',false,'none',null,
  'by','SOL 2003 s.v. -by; Pamp 1988',
  'En av de mest produktiva expansionstyperna. Kirkeby o.d. = sammansatt appellativ, ej primär -by.'),
('torp','-torp (utflyttargård)','expansion_bebyggelse','Sekundär utflyttargård/nybygge',
  '(sen)vikingatid–medeltid',900,1500,'[]'::jsonb,
  array['utbredning'],'belagt',false,'none',
  'sydsv. reduktioner -arp/-rup','torp','SOL 2003 s.v. -torp',
  'Betydelse ''nybygge'' i huvudsak; äldre -torp (Ljustorp/Munktorp) ev. ''betesmark''.'),
('ryd','-ryd (röjning)','expansion_bebyggelse','Röjning/nyodling',
  'vikingatid–medeltid',800,1400,'[]'::jsonb,
  array['utbredning'],'belagt',false,'none',
  'väst-/götaformer -red/-röd','ryd','SOL 2003 s.v. -ryd',
  'Röjningsskikt, kärnområde Götaland.'),
('mala','-måla (röjningsnamn)','expansion_bebyggelse','Uppmätt nyröjt hemman',
  'senmedeltid (~1300–1500)',1300,1500,'[]'::jsonb,
  array['utbredning'],'belagt',false,'none',null,
  'måla','SOL 2003 s.v. -måla',
  'Kärnområde Värend/Blekinge. Yngsta bebyggelseröjningsskiktet.'),
('bole','-böle (boställe)','expansion_bebyggelse','Boställe/nybygge',
  '(sen)vikingatid–medeltid',900,1500,'[]'::jsonb,
  array['utbredning'],'belagt',false,'none',null,
  'böle','SOL 2003 s.v. -böle',
  'Nordsvensk expansion särskilt.'),
('sater','-säter (säte/fäbod/utmark)','expansion_bebyggelse','Utmarksäng/fäbod/säte',
  'yngre järnålder–medeltid',400,1400,'[]'::jsonb,
  array['utbredning'],'valetablerad',false,'none',null,
  'säter','SOL 2003 s.v. -säter',
  'Utmarksbruk; fvn. sætr ''fäbodställe'' i väst/norr.'),
-- ===== NATUR / HYDRONYM (äldsta substrat / ofta odaterbart) =====
('vin','-vin (ängsmark/betesmark)','natur_hydronym','Betesmark/äng',
  'äldsta skikt (äldre järnålder; proto_norse-kandidat)',null,600,'[]'::jsonb,
  array['utbredning','lingvistik'],'hypotes',true,'low',
  'Teofor förled (no. Frøysin/Ullarin) — svenska ex. osäkra; per-namn',
  null,'SOL 2003 s.v. -vin; Fridell/Elmevik',
  'Ägo-/naturnamn (betesmark), ej primärt bebyggelse. Ett av de allra äldsta skikten.'),
('hem','-hem / -um (boplats/gård)','natur_hydronym','Boplats/gård/bygd',
  'äldsta skikt (äldre järnålder)',null,600,'[]'::jsonb,
  array['utbredning','lingvistik'],'hypotes',true,'low',
  '-hem vs sammandraget -um (Tanum<Tuneim); teofor förled per-namn',
  null,'SOL 2003 (hem-namn); Andersson NoB 103',
  'Bland de äldsta bebyggelseskikten; ofta reducerat till -um/-em.'),
('hydronym_substrat','gamla vattendragsnamn (substrat)','natur_hydronym','Älv-/sjö-/ånamn av hög ålder',
  'äldsta (förhistoriskt substrat)',null,null,'[]'::jsonb,
  array['lingvistik'],'omtvistad',true,'none',
  'Forneuropeisk hydronymi (Krahe/Bichlmeier-skolan) omtvistad',
  null,'NoB 104 (2016); Andersson 2016',
  'Rekonstruktioner (*form) kräver ljudlagsargument; hellre öppet än gissat. Aldrig auto-etymologi.')
on conflict (typ_key) do nothing;
