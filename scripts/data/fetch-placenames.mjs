// Fyller place_names: hämtar svenska tätorter+småorter (Wikidata CC0), klassificerar
// namnen efter forskningsrelevanta ortnamnsefterled/förled och POSTar de som matchar.
// Heuristisk förstaklassning (efterled/förled) — ej filologiskt granskad per namn.
import https from 'https';
const ANON = process.argv[2];
const FN = 'https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/import-placenames';
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';

const sparql = (q) => new Promise((res, rej) => {
  https.get(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`,
    { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } },
    (r) => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>{ try{res(JSON.parse(d))}catch(e){rej(d.slice(0,200))} }); }).on('error', rej);
});
const post = (rows) => new Promise((res, rej) => {
  const body = JSON.stringify({ rows });
  const req = https.request(FN,{method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body),apikey:ANON,Authorization:`Bearer ${ANON}`}},(r)=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(d));});
  req.on('error',rej); req.write(body); req.end();
});

// Onomastisk klassning: efterled (slut) / teofora förled (början) → {key, category}
function classify(raw) {
  const n = raw.toLowerCase().replace(/\s+(gamla|nya|norra|södra|östra|västra|lilla|stora)\s+/g,' ').trim();
  const keys = []; let cat = null;
  const add = (k,c) => { if(!keys.includes(k)){ keys.push(k); if(!cat) cat=c; } };
  // teofora förled → sakralt (högst prioritet)
  if (/^oden|^odin/.test(n)) add('oden','sakralt');
  if (/^tors|^thors|^tor(?=[bghlsvö])/.test(n)) add('tor','sakralt');
  if (/^frö|^frøy|^fröj|^frös/.test(n)) add('frö','sakralt');
  if (/^ull(e|en|er|a)?/.test(n)) add('ull','sakralt');
  if (/^njär|^njord/.test(n)) add('njärd','sakralt');
  // sakrala efterled
  if (/lunda?$/.test(n)) add('lund','sakralt');
  if (/harg$/.test(n)) add('harg','sakralt');
  if (/hov$/.test(n)) add('hov','sakralt');
  // centralort / makt
  if (/tuna$/.test(n)) add('tuna','centralort');
  if (/sala$/.test(n)) add('sala','centralort');
  if (/^husby|^husaby|husby$/.test(n)) add('husby','centralort');
  if (/rinkeby$|rickeby$/.test(n)) add('rinkeby','centralort');
  if (/karleby$|karlby$/.test(n)) add('karleby','centralort');
  if (/sätuna$|sätra$/.test(n)) add('sätuna','centralort');
  // ting / rättskipning
  if (/hammar/.test(n)) add('hammar','ting_ratt');
  if (/hundra/.test(n)) add('hundra','ting_ratt');
  if (/härad|harad/.test(n)) add('härad','ting_ratt');
  // kust / hamn
  if (/anger$|ånger$/.test(n)) add('anger','kust_hamn');
  // bebyggelseålder
  if (/inge$/.test(n)) add('inge','bebyggelse');
  if (/[a-zåäö]hem$/.test(n)) add('hem','bebyggelse');
  return keys.length ? { keys, cat } : null;
}

const CLASSES = [['Q12813115','tätort'],['Q14839548','småort'],['Q532','by'],['Q486972','ort']];
const seen = new Set(); const rows = [];
for (const [qid, feat] of CLASSES) {
  const q = `SELECT ?c ?cLabel ?coord WHERE { ?c wdt:P31 wd:${qid} ; wdt:P625 ?coord ; rdfs:label ?cLabel . FILTER(LANG(?cLabel)='sv') }`;
  let r; try { r = await sparql(q); } catch (e) { console.log(feat,'hoppad:',String(e).slice(0,60)); continue; }
  let matched = 0;
  for (const b of r.results.bindings) {
    const uri = b.c.value; if (seen.has(uri)) continue; seen.add(uri);
    const m = String(b.coord.value).match(/Point\(([-\d.]+) ([-\d.]+)\)/); if (!m) continue;
    const name = b.cLabel.value; if (/^Q\d+$/.test(name)) continue;
    const cl = classify(name); if (!cl) continue;
    matched++;
    rows.push({ name, lat: parseFloat(m[2]), lng: parseFloat(m[1]), element_keys: cl.keys, element_category: cl.cat, feature_type: feat, external_id: uri });
  }
  console.log(`${feat}: ${r.results.bindings.length} orter, ${matched} med forskningsefterled`);
  await new Promise(r=>setTimeout(r,600));
}
console.log('totalt klassificerade:', rows.length);
let up = 0;
for (let i=0;i<rows.length;i+=500){ const res=await post(rows.slice(i,i+500)); try{up+=JSON.parse(res).upserted||0}catch{console.log('POST:',res.slice(0,150))} await new Promise(r=>setTimeout(r,300)); }
console.log('upsert klart:', up);
