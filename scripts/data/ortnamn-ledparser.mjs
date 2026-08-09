// Ledparser (heuristisk) för centralorts-projekten. Ersätter delsträngsmatchning med
// START-FÖRANKRAD förled-matchning + genitiv-preferens → dödar torp-/Stor-bruset.
// Kör om anrikningstestet (kult-leder vs neutrala) för Ångermanland + Öland, parsad vs substräng.
// OBS heuristik, inte full morfologi (det kräver SOFI:s leddata). Kör: node scripts/data/ortnamn-ledparser.mjs
import pg from 'pg';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();

// START-förankrade förled-matchare (genitiv-preferens). key = led, re testas mot lowercased namn.
const CULT = [
  { key:'tor',  re:/^tors[a-zäåö]/ },                 // Tors- (genitiv): Torsåker, Torslunda, Torsvik
  { key:'fröja', re:/^fröj[ae]/ },                    // Freyja (Fröje-/Fröja-, gen. Frøyju-) — EJ fröjd (glädje)
  { key:'frö',  re:/^(frös|frö(?!j)|frey|frej|frea)/ }, // Freyr/generisk: Frös-/Frö-/Frey-. Utesluter fröj- (→ Freyja/fröjd)
  { key:'sal',  re:/^sal(a|o|e|u)/ },                 // Sal/Sala/Salom/Salum/Salem  (ej Salt-, Salteå)
  { key:'ross', re:/^(ross|hross|hors)[a-zäåö]/ },    // Ross-/Hors-
  { key:'vang', re:/^vang/ },                          // Vangsta
  { key:'stav', re:/^stav[a-zäåö]/ },                  // Stav-
  { key:'hov',  re:/^hov[a-zäåö]/ },                   // Hov- (svag, tvetydig)
  { key:'härn', re:/^härn/ },                          // Härn(a) (svag)
  { key:'gull', re:/^gull/ },                          // Gull (svag)
  { key:'katt', re:/^katt[a-zäåö]/ },                  // Katt- (svag)
  // Agnetas tillägg (2026-07-28). Konservativa förled-matchare; homonym-risk flaggad i config.
  { key:'val',  re:/^val(?!l)[a-zäåö]/ },              // Val/Vala — EJ vall/valla (topografi)
  { key:'ed',   re:/^eds[a-zäåö]/ },                   // Eds- (Edsele) — ej bara 'ed'
  { key:'hammar', re:/^hammar/ },                       // Hammar (ting?)
  { key:'horn', re:/^horn[a-zäåö]/ },                  // Horn-
  { key:'mor',  re:/^mora?[a-zäåö]/ },                 // Mor/Mora — homonym mo/mark, flaggat
  { key:'lund', re:/^lund/ },                          // Lund- (förled; efterled -lund missas)
  { key:'tuna', re:/^tuna/ },                          // Tuna-
  { key:'var',  re:/^var(?!a)[a-zäåö]/ },              // Vár — hög falsk-risk, flaggat
  { key:'skade', re:/^skade/ },                        // Skade
  { key:'hel',  re:/^hel(?!s)[a-zäåö]/ },              // Hel — ej Helsing-
  { key:'oden', re:/^od[ei]n/ },                       // Oden/Odin (Odensvi/Odensala)
  { key:'galt', re:/^galt/ },                          // Galt
  { key:'get',  re:/^get[a-zäåö]/ },                   // Get — homonym tamdjur, flaggat
  { key:'gås',  re:/^gås/ },                           // Gås
];
// substräng-varianten (som förra testet) för jämförelse:
const CULT_SUB = ['tor','frö','sal','ross','hammar','gull','härn','katt','vang','stav','hov','helg'];
const NEUTRAL_SUB = ['berg','sjö','vik','näs','holm','bäck','myr','dal','mark','lund'];
const NEUTRAL_END = /(berg|sjön?|viken?|näs|holm|bäcken?|dalen?|marken?|myr|hult|änge?)$/; // parsad neutral = topografisk efterled

let CULT_ON = CULT; // sätts efter att konfig lästs (ortnamn_element_config.include)
const parseCult = (name) => { const n=name.toLowerCase(); const hits=[]; for(const e of CULT_ON) if(e.re.test(n)) hits.push(e.key); return hits; };

// Läs forskarens ledkatalog (include-flaggor) — vilka led som räknas är forskarens beslut.
const _cfg=(await c.query('select element_key, include, category from ortnamn_element_config')).rows;
const _incl=new Set(_cfg.filter(r=>r.include).map(r=>r.element_key));
const _cat=Object.fromEntries(_cfg.map(r=>[r.element_key,r.category]));
CULT_ON = CULT.filter(e=>_incl.has(e.key));
console.log('Aktiva kult-led (ortnamn_element_config.include=true):', CULT_ON.map(e=>e.key).join(', '));
const APPLY = process.argv.includes('--apply');
const WRITE_REGION = (process.argv.find(a=>a.startsWith('--region='))||'').split('=')[1];
const hasSub = (name,keys)=>{const n=name.toLowerCase();return keys.some(k=>n.includes(k));};

const hav=(a,b,d,e)=>{const R=6371,r=Math.PI/180,dφ=(d-a)*r,dλ=(e-b)*r,x=Math.sin(dφ/2)**2+Math.cos(a*r)*Math.cos(d*r)*Math.sin(dλ/2)**2;return 2*R*Math.asin(Math.sqrt(x));};

const regions = [
  { name:'Ångermanland', cps:['Nora','Torsåker','Härnösand–Säbrå'], bbox:[62.20,64.00,15.00,19.00] },
  { name:'Öland',        cps:null, bbox:[56.20,57.37,16.38,17.12] },
];

for (const reg of regions) {
  const [minlat,maxlat,minlng,maxlng]=reg.bbox;
  const pn=(await c.query(`select id, name, lat, lng from place_names where lat between $1 and $2 and lng between $3 and $4 and lat is not null`,[minlat,maxlat,minlng,maxlng])).rows;
  let cps;
  if (reg.name==='Öland') cps=[ // väst-korridorens noder + Köpingsvik-hubben (Daniel)
    {lat:56.545,lng:16.462}, // Färjestaden
    {lat:56.592,lng:16.465}, // Vickleby
    {lat:56.608,lng:16.440}, // Karlevi
    {lat:56.502,lng:16.425}, // Bårby borg
    {lat:56.511,lng:16.437}, // Mörbylånga
    {lat:56.198,lng:16.398}, // Ottenby
    {lat:56.885,lng:16.727}, // Köpingsvik
  ];
  else cps=(await c.query(`select lat,lng from central_places where name = any($1) and lat is not null`,[reg.cps])).rows;
  const nearAny=(p,R)=>cps.some(cp=>hav(p.lat,p.lng,cp.lat,cp.lng)<=R);
  const R=8, total=pn.length, near=pn.filter(p=>nearAny(p,R)).length, pNear=near/total;
  const rate=(subset)=>{const m=pn.filter(subset);const mn=m.filter(p=>nearAny(p,R)).length;return {n:m.length,p:m.length?mn/m.length:0};};
  const subC=rate(p=>hasSub(p.name,CULT_SUB)), subN=rate(p=>hasSub(p.name,NEUTRAL_SUB));
  const parC=rate(p=>parseCult(p.name).length>0), parN=rate(p=>NEUTRAL_END.test(p.name.toLowerCase()));
  console.log(`\n### ${reg.name}  (baslinje ${total} namn, ${(pNear*100).toFixed(1)}% nära nod, R=${R} km) ###`);
  console.log(`  SUBSTRÄNG  kult ${subC.n} st, anrikn ${(subC.p/pNear).toFixed(2)}×  |  neutral ${subN.n} st, anrikn ${(subN.p/pNear).toFixed(2)}×  → kvot ${((subC.p/pNear)/(subN.p/pNear||1)).toFixed(2)}`);
  console.log(`  PARSAD     kult ${parC.n} st, anrikn ${(parC.p/pNear).toFixed(2)}×  |  neutral ${parN.n} st, anrikn ${(parN.p/pNear).toFixed(2)}×  → kvot ${((parC.p/pNear)/(parN.p/pNear||1)).toFixed(2)}`);
  // per-led parsad, med exempel
  const per={}; pn.forEach(p=>parseCult(p.name).forEach(k=>{(per[k]=per[k]||[]).push(p.name);}));
  console.log('  Parsade kult-led:', Object.entries(per).map(([k,v])=>`${k}:${v.length}`).join(' '));
  Object.entries(per).forEach(([k,v])=>console.log(`     ${k}: ${v.slice(0,8).join(', ')}${v.length>8?'…':''}`));
  // Lagra sambandsstyrkan (config-driven) så kartan kan visa den MED förbehåll. Enda beräkningspunkt.
  {
    const cultEnr = parC.p/pNear, neutEnr = parN.p/pNear, ratio = neutEnr>0 ? cultEnr/neutEnr : null;
    await c.query(
      `insert into ortnamn_enrichment_results
         (region, radius_km, baseline_n, near_pct, cult_n, cult_enrichment, neutral_enrichment, ratio, included_elements, owner_note, caveat, computed_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())
       on conflict (region) do update set radius_km=$2, baseline_n=$3, near_pct=$4, cult_n=$5,
         cult_enrichment=$6, neutral_enrichment=$7, ratio=$8, included_elements=$9, owner_note=$10, caveat=$11, computed_at=now()`,
      [reg.name, R, total, +pNear.toFixed(4), parC.n, +cultEnr.toFixed(2), +neutEnr.toFixed(2),
       ratio!=null?+ratio.toFixed(2):null, CULT_ON.map(e=>e.key).join(', '),
       reg.name==='Ångermanland' ? 'Ledbeslut: Agneta (Ångermanland)' : 'Ledbeslut: Daniel (Öland)',
       'Regional samlokalisering (öst-/sydsverige) förklarar en del; n är litet; styrkan beror på vilka led som räknas (ortnamn_element_config).']);
    console.log(`  → skrev anriknings-resultat (kvot ${ratio?.toFixed(2)}) till ortnamn_enrichment_results.`);
  }
  if (APPLY && reg.name===WRITE_REGION) {
    let w=0;
    for (const p of pn) { const keys=parseCult(p.name); if(keys.length){ const r=await c.query(`update place_names set element_keys=$1, element_category=$2, updated_at=now() where id=$3 and (element_keys is null or array_length(element_keys,1) is null)`,[keys,_cat[keys[0]]||'sacral',p.id]); w+=r.rowCount; } }
    console.log(`  → SKREV element_keys för ${w} kult-namn i ${reg.name} (endast där tomt; forskarens include-konfig gäller).`);
  }
}
await c.end();
