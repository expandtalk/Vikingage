// VRAK-ENRICHMENT: namngivna historiska vrak (södra Östersjön) som saknades i shipwrecks (mest RAÄ-
// survey utan namn). FAKTA fritt (destillerade i egna ord), PROSAN (Westerdahl/Ocean Discovery/Åkesson
// m.fl.) EJ kopierad. Koordinater markeras 'ej verifierad' (INGEN GISSNING) — verifieras separat mot
// RAÄ Fornsök/Wikidata innan geom sätts. Krigsgravar märks (gravfrid + mänskliga kvarlevor).
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

const W = [
  { name:'Foteviksskeppen (Fotevik 1–5)', vessel_type:'krigsskepp', construction:'klinkbyggt, ek', length_m:10.3,
    de:1050, dl:1130, ds:'c. 1050–1130', sy:null, se:'sänkta som spärr vid Foteviken; några använda som stensläde på is — kanske i samband med slaget vid Fotevik 1134',
    landscape:'Skåne', parish:'Foteviken', muni:'Vellinge', sig:'hög',
    notes:'Vikingatida krigsskepp sänkta för att bilda en pålspärr vid Foteviken. Fem vrak; nr 3 och 5 över 20 m. Fotevik 1 (10,3 m) är bärgat och rekonstruerat (Erik Emune). Utgrävt 1981–82.',
    attr:'Crumlin-Pedersen 1984; Ingelman-Sundberg 1982; Westerdahl 2001' },
  { name:'Knösenvraket', vessel_type:'skepp av vikingtyp', construction:'klinkbyggt, ek (repar. med furu)', length_m:17,
    de:1148, dl:1200, ds:'dendro 1148–1153, förlisning c. 1200', sy:null, se:'förlist norr om Skanör',
    landscape:'Skåne', parish:'Skanör', muni:'Vellinge', sig:'hög',
    notes:'Kraftigt klinkbyggt ekskepp av vikingtyp, ursprungligen kanske 17–20 m. Bland fynden en unik träsköld och hasselnötter. Främsta paralleller: danska Lynæsvraket.',
    attr:'Westerdahl 2001; Hörberg 1995 (FMC)' },
  { name:'Oskarshamnskoggen', vessel_type:'kogg', construction:'klinkbyggd', length_m:null,
    de:1230, dl:1250, ds:'c. 1240', sy:null, se:'förlist vid Bossholmen nära Oskarshamn',
    landscape:'Småland', parish:'Oskarshamn', muni:'Oskarshamn', sig:'hög',
    notes:'Kogg; endast botten återstår, utgrävd och delvis bärgad/konserverad 1984–1992.',
    attr:'Cederlund 1987; Rönnby & Adams' },
  { name:'Skanörskoggen', vessel_type:'kogg', construction:'klink i överdel, kravell i botten, ek', length_m:25,
    de:1390, dl:1450, ds:'dendro 1390 (polsk ek), förlisning c. 1400–1450', sy:null, se:'förlist vid Skanör, c. 4 m djup',
    landscape:'Skåne', parish:'Skanör', muni:'Vellinge', sig:'hög',
    notes:'Stor kogg, bevarad längd 18,7 m, bredd 5,3 m, ursprungligen c. 25 m — något större än Bremenkoggen. Rekonstruerad i Malmö (H. Alopaeus).',
    attr:'Hörberg 1995 (FMC); Westerdahl 2001' },
  { name:'Falsterboskeppet', vessel_type:'klinkbyggt skepp', construction:'klink, järn- senare tränaglat', length_m:13.5,
    de:1250, dl:1290, ds:'C14 + mynt (1286–1316) → andra hälften 1200-tal', sy:null, se:'hittat i sandstranden vid Falsterbo',
    landscape:'Skåne', parish:'Falsterbo', muni:'Vellinge', sig:'medel',
    notes:'Klinkbyggt skepp, c. 13,5 m, till stor del reparerat med tränaglar. Uppställt på järnvagga i Falsterbo museum, ej konserverat.',
    attr:'Åkerlund 1952; Westerdahl 2001' },
  { name:'Falsterbopråmarna', vessel_type:'pråm', construction:'flatbottnad, ek', length_m:15,
    de:1311, dl:1318, ds:'c. 1311–1318 (fundament för borgvallen)', sy:null, se:'nedlagda som fundament vid Falsterbohus',
    landscape:'Skåne', parish:'Falsterbo', muni:'Vellinge', sig:'medel',
    notes:'Sex medeltida pråmar (14–15 m; en bärgad c. 18 m), ovanliga i Nordeuropa. Ytterligare pråmar hittade under sent 1990-tal och 2000.',
    attr:'Blomqvist 1950; Ellmers 1984; Westerdahl 2001' },
  { name:'Elefanten', vessel_type:'örlogsskepp (flaggskepp)', construction:null, length_m:50,
    de:null, dl:null, ds:'byggt i Stockholm; förlist 1564', sy:1564, se:'gick på grund utanför Bornholm efter strid mot danskar/lybeckare 1564, sjönk utanför Kalmar på 5–6 m djup',
    landscape:'Småland', parish:'Kalmar', muni:'Kalmar', sig:'hög',
    notes:'Svenskt flaggskepp, c. 50 m. Aktern bärgad under C. Ekmans ledning 1933–39; del utställd på Sjöhistoriska museet.',
    attr:'Rönnby & Adams; Sportdykaren 3/2000' },
  { name:'Svärdet', vessel_type:'örlogsskepp (viceamiralskepp)', construction:null, length_m:null,
    de:null, dl:null, ds:'sjönk 1676', sy:1676, se:'träffades av brännare, brann och sjönk i strid utanför Öland 1 juni 1676 (samma slag som Kronan)',
    landscape:'Öland', parish:null, muni:'Borgholm', sig:'hög',
    notes:'Svenskt 86-kanoners viceamiralskepp. Vraket lokaliserat 2011.', attr:'A. Smirnov m.fl.' },
  { name:'Nyckeln', vessel_type:'örlogsskepp', construction:null, length_m:null,
    de:null, dl:null, ds:'sjönk 1679', sy:1679, se:'exploderade i strid och sjönk i Kalmarsund 1679',
    landscape:'Småland', parish:'Kalmar', muni:'Kalmar', sig:'medel',
    notes:'Svenskt krigsfartyg; kanoner bärgade 1686, 1766, 1841 och 1908/09.', attr:'Lanitzki: Versunken in der Ostsee' },
  { name:'Ada Gorthon', vessel_type:'ångfartyg (lastfartyg)', construction:'stål', length_m:90,
    de:null, dl:null, ds:'byggt 1917; sänkt 1942', sy:1942, se:'sänkt på svenskt territorialvatten utanför Öland sommaren 1942 av sovjetiska ubåten SC-317; sjönk på c. 30 sek',
    landscape:'Öland', parish:null, muni:'Mörbylånga', sig:'hög',
    notes:'KRIGSGRAV — 14 omkomna, 8 överlevande; mänskliga kvarlevor, gravfrid. Svenskt malmfartyg (Luleå→Rotterdam). Skrotbärgat delvis på 1950-talet; dykbart på knappt 30 m.',
    attr:'Wetterholm: Vrak i svenska vatten; SVT 1983' },
  { name:'C.F. Liljevalch', vessel_type:'lastfartyg', construction:null, length_m:null,
    de:null, dl:null, ds:'byggt 1920; sänkt 1942', sy:1942, se:'sänkt nära Öland 1942 av sovjetiska ubåten L-3, c. 70 m djup',
    landscape:'Öland', parish:null, muni:'Mörbylånga', sig:'hög',
    notes:'KRIGSGRAV — 33 omkomna, 7 överlevande; mänskliga kvarlevor, gravfrid. Dokumenterat med ROV 1987.',
    attr:'Wetterholm: Vrak i svenska vatten; Dyk 8/96' },
  { name:'Ubåtsmassakern 1915 (Director Reppenhagen m.fl.)', vessel_type:'ångdrivna lastfartyg (4 st)', construction:null, length_m:null,
    de:null, dl:null, ds:'sänkta 1915', sy:1915, se:'fyra tyska lastfartyg (Director Reppenhagen, Nicomedia, Gutrune, Walther Leonhardt) sänkta samma dag 1915 av brittiska ubåten E19, söder om Öland',
    landscape:'Öland', parish:null, muni:'Mörbylånga', sig:'medel',
    notes:'Fyra välbevarade vrak upptäckta 1982–84.', attr:'Ocean Discovery m.fl.' },
];

let ins=0, upd=0;
for (const w of W) {
  const ex = await c.query(`select id from shipwrecks where name=$1 limit 1`, [w.name]);
  const cols = { name:w.name, vessel_type:w.vessel_type, construction:w.construction, length_m:w.length_m,
    dating_summary:w.ds, dating_earliest:w.de, dating_latest:w.dl, sinking_year:w.sy, sinking_event:w.se,
    parish:w.parish, municipality:w.muni, landscape:w.landscape, significance:w.sig, notes:w.notes,
    coord_source:'ej verifierad — kräver koordinatverifiering (RAÄ Fornsök/Wikidata)',
    source_license:'fakta fri; proveniens angiven', source_attribution:w.attr,
    source_ref:'Westerdahl 2001 (Vraken vid Falsterbonäset) / Per Åkesson, Nordic Underwater Archaeology' };
  if (ex.rows.length) {
    const sets = Object.keys(cols).map((k,i)=>`${k}=$${i+2}`).join(', ');
    await c.query(`update shipwrecks set ${sets} where id=$1`, [ex.rows[0].id, ...Object.values(cols)]);
    upd++; console.log('  upd', w.name);
  } else {
    const ks = Object.keys(cols); const ph = ks.map((_,i)=>`$${i+1}`);
    await c.query(`insert into shipwrecks (${ks.join(',')}) values (${ph.join(',')})`, Object.values(cols));
    ins++; console.log('  +  ', w.name);
  }
}
console.log(`\nklart: ${ins} nya, ${upd} uppdaterade. (geom NULL → koordinat verifieras separat)`);
const tot = await c.query(`select count(*) n from shipwrecks where coord_source like 'ej verifierad%'`);
console.log('vrak som väntar koordinatverifiering:', tot.rows[0].n);
await c.end();
