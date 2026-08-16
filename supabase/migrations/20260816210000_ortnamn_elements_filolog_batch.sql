-- Ortnamns-elementkatalog: filolog-batch (39 nya led), befordrat efter orkestrator-granskning.
-- Rulings: (2) bebyggelseled = activity_category 'settlement' (vokab = kolumnkommentar, ej CHECK → OK);
-- (3) include=false för icke-kult (include styr KULT-anrikningstestet; natur/bebyggelse ska ej väga in),
-- include=true endast för sakrala 'vi'; (5) homonymer (ås/hamn/varv, sami várri vs finska vaara,
-- sami johka vs finska joki) taggas EJ auto — hanteras källkritiskt vid hits. Etymologi = källbelagd
-- (SOL 2003/Hellquist/Vikstrand/Sammallahti/SSA/Isof); djupetymologi/organisationstolkning = hypotes i
-- ortnamn_element_interpretations, ej fast sanning. on conflict do nothing skyddar de 37 befintliga.
insert into public.ortnamn_element_config
  (element_key, label, category, strength, include, forms, owner, note, period_stratum, language_origin, activity_category)
values
  ('by',   '-by (gård/by)',              'settlement','probable',false,'-by; By','gemensam','SOL s.v. -by; Hellquist s.v. by','vikingatid–tidig medeltid','old_norse','settlement'),
  ('torp', '-torp (utflyttargård)',      'settlement','probable',false,'-torp,-arp,-rup','gemensam','SOL s.v. -torp; sydsv. -arp/-rup','(sen)vikingatid–medeltid','old_norse','settlement'),
  ('måla', '-måla (röjningsnamn)',       'settlement','probable',false,'-måla,-måle','gemensam','SOL s.v. -måla; Värend/Blekinge','senmedeltid','old_norse','settlement'),
  ('sta',  '-sta/-stad(a) (bebyggelse)', 'settlement','probable',false,'-sta,-stad,-stada','gemensam','SOL s.v. -sta(d); skilj från stad (urban)','järnålder–vikingatid','old_norse','settlement'),
  ('säter','-säter (säte/fäbod)',        'settlement','probable',false,'-säter,-sätter,-sätra','gemensam','SOL s.v. -säter','yngre järnålder–medeltid','old_norse','settlement'),
  ('ryd',  '-ryd (röjning)',             'settlement','probable',false,'-ryd,-red,-röd,-rud','gemensam','SOL s.v. -ryd','vikingatid–medeltid','old_norse','settlement'),
  ('hult', '-hult (dunge)',              'natur','weak',false,'-hult,-holt','gemensam','SOL s.v. -hult; natur/sekundär bebyggelse','svårdaterat','old_norse','topographic'),
  ('böle', '-böle (boställe)',           'settlement','probable',false,'-böle,-böl','gemensam','SOL s.v. -böle; Norrland','(sen)vikingatid–medeltid','old_norse','settlement'),
  ('bygd', 'bygd (bebott land)',         'settlement','weak',false,'bygd-,-bygden','gemensam','Hellquist s.v. bygd','svårdaterat','old_norse','settlement'),
  ('träsk','-träsk (insjö/sankmark)',    'natur',null,false,'-träsk,Träsk-','gemensam','SOL/Hellquist; djupetymologi hypotes','svårdaterat','old_norse','topographic'),
  ('mosse','-mosse (mosse)',             'natur',null,false,'-mosse,-mossa','gemensam','Hellquist s.v. mosse','svårdaterat','old_norse','topographic'),
  ('myr',  '-myr (myr/kärr)',            'natur',null,false,'-myr,-myra','gemensam','Hellquist s.v. myr','svårdaterat','old_norse','topographic'),
  ('sjö',  '-sjö (insjö)',               'natur',null,false,'-sjö,-sjön','gemensam','Hellquist s.v. sjö','svårdaterat','old_norse','topographic'),
  ('näs',  '-näs (udde)',                'natur',null,false,'-näs,-näset','gemensam','Hellquist s.v. näs; ie *nas-','svårdaterat','old_norse','topographic'),
  ('vik',  '-vik (bukt)',                'natur',null,false,'-vik,-viken','gemensam','Hellquist s.v. vik; koppla ej till viking','svårdaterat','old_norse','topographic'),
  ('holme','-holme (liten ö)',           'natur',null,false,'-holm,-holme','gemensam','Hellquist s.v. holme','svårdaterat','old_norse','topographic'),
  ('ö',    '-ö (ö)',                     'natur',null,false,'-ö,-ön,-öa','gemensam','Hellquist s.v. ö; urgerm *awjō','svårdaterat','old_norse','topographic'),
  ('berg', '-berg (berg)',               'natur',null,false,'-berg,-berga','gemensam','Hellquist s.v. berg; ie *bʰerǵʰ-','svårdaterat','old_norse','topographic'),
  ('ås',   '-ås (höjdrygg/ås)',          'natur',null,false,'-ås,-åsen','gemensam','HOMONYM: skilj áss gud/ände; disambiguera per namn','svårdaterat','old_norse','topographic'),
  ('hamn', '-hamn (hamn)',               'seafaring',null,false,'-hamn,-hamnen','gemensam','HOMONYM fsv hamn/hagi betesmark; disambiguera','svårdaterat','old_norse','seafaring'),
  ('naust','naust/nöst (båthus)',        'seafaring',null,false,'naust-,nöst-,-nöste','gemensam','SOL s.v. naust; Norsk stadnamnleksikon','svårdaterat','old_norse','seafaring'),
  ('snäck','snäck- (krigsskepp)',        'seafaring',null,false,'snäck-,snäcke-,snäcka-','gemensam','SOL; Olsson 1972 ledung; ledungskoppling hypotes','(sen)vikingatid–tidig medeltid','old_norse','seafaring'),
  ('varv', '-varv (varv/vändplats)',     'seafaring',null,false,'-varv,-hvarf','gemensam','Hellquist s.v. varv; sjöfartsbetydelse contested','svårdaterat','old_norse','seafaring'),
  ('vad',  '-vad (vadställe)',           'communication',null,false,'-vad,-vada','gemensam','Hellquist s.v. vad; lat vadum','svårdaterat','old_norse','communication'),
  ('javri','jávri/jávrre/jaevrie (sjö)', 'natur',null,false,'-jávri,-jávrre(→-jaur/-jaure),-jaevrie','gemensam','Isof; Sammallahti 1998; sv -jaur/-jaure','svårdaterat','sami','topographic'),
  ('johka','johka (älv/bäck)',           'natur',null,false,'-johka,-johkå(→-jokk/-jåkk)','gemensam','Isof; Sammallahti 1998; HOMONYM finska joki','svårdaterat','sami','topographic'),
  ('varri','várri (fjäll)',              'natur',null,false,'-várri,-várre(→-vare),-vaerie','gemensam','Isof; Sammallahti 1998; HOMONYM finska vaara','svårdaterat','sami','topographic'),
  ('luokta','luokta (vik)',              'natur',null,false,'-luokta(→-lokt)','gemensam','Isof; Sammallahti 1998','svårdaterat','sami','topographic'),
  ('vaggi','vággi (dal)',                'natur',null,false,'-vagge','gemensam','Isof; Sammallahti 1998','svårdaterat','sami','topographic'),
  ('njarga','njárga (udde)',             'natur',null,false,'-njarka,-njarga','gemensam','Isof; Sammallahti 1998','svårdaterat','sami','topographic'),
  ('suolu','suolu (ö)',                  'natur',null,false,'-suolo,-suolu','gemensam','Isof; Sammallahti 1998','svårdaterat','sami','topographic'),
  ('jeaggi','jeaggi (myr)',              'natur',null,false,'-jägge,-jegge','gemensam','Isof; Sammallahti 1998','svårdaterat','sami','topographic'),
  ('jarvi','järvi (sjö)',                'natur',null,false,'-järvi,-järv','gemensam','Isof; SSA s.v. järvi; HOMONYM sami jávri','svårdaterat','finnic','topographic'),
  ('joki', 'joki (älv/å)',               'natur',null,false,'-joki,-jok','gemensam','Isof; SSA s.v. joki; HOMONYM sami johka','svårdaterat','finnic','topographic'),
  ('vaara','vaara (skogklädd höjd)',     'natur',null,false,'-vaara,-vara','gemensam','Isof; SSA s.v. vaara; HOMONYM sami várri','svårdaterat','finnic','topographic'),
  ('koski','koski (fors)',               'natur',null,false,'-koski','gemensam','Isof; SSA s.v. koski','svårdaterat','finnic','topographic'),
  ('niemi','niemi (udde/näs)',           'natur',null,false,'-niemi,-niem','gemensam','Isof; SSA s.v. niemi','svårdaterat','finnic','topographic'),
  ('saari','saari (ö)',                  'natur',null,false,'-saari,-saar','gemensam','Isof; SSA s.v. saari','svårdaterat','finnic','topographic'),
  ('karl', 'Karl(a)- (Karleby)',         'power','contested',false,'karl-,karla-,karle-','gemensam','SOL s.v. Karleby; organisationstolkning hypotes; vs personnamn','(sen)vikingatid–tidig medeltid','old_norse','administration'),
  ('rink', 'Rink(a)- (Rinkaby)',         'power','contested',false,'rink-,rinka-','gemensam','SOL s.v. Rinkaby; organisationstolkning hypotes','vikingatid','old_norse','administration'),
  ('tegn', 'Tegn(e)- (Tegneby)',         'power','contested',false,'tegn-,tegne-,thegn-','gemensam','SOL s.v. Tegneby; runsv. þegn; organisationstolkning hypotes','vikingatid–tidig medeltid','old_norse','administration'),
  ('vi',   '-vi (helgedom)',             'sacral','strong',true,'-vi,-vé,-vä,Vi-','gemensam','SOL s.v. -vi; Vikstrand 2001; teofora starkast','äldre skikt (urnordisk sakral toponymi)','proto_norse','cult')
on conflict (element_key) do nothing;

-- Proto_norse-nyans (HYPOTES) på tre av de äldsta befintliga bebyggelsetyperna.
update public.ortnamn_element_config
set language_origin = 'proto_norse',
    note = trim(both ' ' from coalesce(note,'')||' [språkskikt proto_norse = HYPOTES; typens ålder diskuterad, SOL/Vikstrand/Pamp]')
where element_key in ('inge','losa','tuna');

-- Attribuerade/omtvistade tolkningar → interpretations (ej fast sanning i note). Källkritik.
insert into public.ortnamn_element_interpretations (element_key, interpretation, proponent, status, source, note)
values
  ('karl','Karleby = organisationsnamn (kungens/hövdingens karlar, tjänstemannaby knuten till maktcentrum)','central-place-forskning (Brink; Andersson)','hypotes','SOL 2003 s.v. Karleby; central-place-litteratur — sida ej verifierad','Konkurrerar med personnamn/binamn Karl. Verifiera publikation+sida före kanon.'),
  ('rink','Rinkaby = organisationsnamn i centralmakts-klustret (rinkr krigare/storman)','central-place-forskning','hypotes','SOL 2003 s.v. Rinkaby','vs personnamn.'),
  ('tegn','Tegneby = organisationsnamn (þegn kungens man/tjänare)','central-place-/runologisk forskning','hypotes','SOL 2003 s.v. Tegneby; runsv. þegn','vs personnamn.'),
  ('snäck','snäck-namn knutna till ledungens uppbådsorganisation/snäckhamnar','Olsson 1972','hypotes','Olsson, Fornvännen 1972 (snäckhamnar/ledung)','Gotland eget system; koppling välargumenterad men hypotes per namn.'),
  ('varv','-varv/-hvarf = skeppsvarv','—','contested','Hellquist s.v. varv/hvarf','Ofta i st. topografiskt ''vändpunkt/krök''; sjöfartsbetydelse per namn ej belagd utan lokal källa.'),
  ('ås','-ås = áss ''gud'' (teofort, t.ex. Torsås)','—','contested','SOL 2003','Homonym med áss ''höjdrygg/ås'' (topografiskt) och ''ände/hank''; disambiguera per namn.')
on conflict do nothing;
