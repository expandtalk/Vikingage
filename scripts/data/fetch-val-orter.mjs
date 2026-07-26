// Riktig val-ort-analys: hämtar svenska orter med val-/vall-förled (Wikidata CC0),
// klassar dem PÅ EFTERLEDET (det betydelsebärande), importerar till place_names
// med element_keys ['val', <efterled>]. Sedan mäts kyrknärhet per efterled.
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

// Klassar en val-/vall-ort på EFTERLEDET
function classify(raw) {
  const n = raw.toLowerCase().replace(/\s+(gamla|nya|norra|södra|östra|västra|lilla|stora)\s+/g,' ').trim();
  if (!/^vall?[a-zåäö]/.test(n)) return null;             // måste ha val-/vall-förled
  let efterled = 'ospec', cat = 'val_ospec';
  if (/tuna$/.test(n)) { efterled='tuna'; cat='centralort'; }
  else if (/(sätra|sätter|säter)$/.test(n)) { efterled='sätra'; cat='centralort'; }
  else if (/(stad|sta)$/.test(n)) { efterled='sta'; cat='bebyggelse'; }
  else if (/inge$/.test(n)) { efterled='inge'; cat='bebyggelse'; }
  else if (/by$/.test(n)) { efterled='by'; cat='bebyggelse'; }
  else if (/(löv|lev)$/.test(n)) { efterled='löv'; cat='bebyggelse'; }
  else if (/torp$/.test(n)) { efterled='torp'; cat='bebyggelse'; }
  else if (/bo$/.test(n)) { efterled='bo'; cat='bebyggelse'; }
  else if (/(lunda|lund)$/.test(n)) { efterled='lund'; cat='sakralt'; }
  else if (/(sjö|berg|vik|näs|ås|mo|holm|hult|kärra|kärr|hagen?|dal)$/.test(n)) { efterled='natur'; cat='natur'; }
  return { efterled, cat };
}

const CLASSES = [['Q12813115','tätort'],['Q14839548','småort'],['Q532','by']];
const seen = new Set(), rows = [];
for (const [qid, feat] of CLASSES) {
  const q = `SELECT ?c ?cLabel ?coord WHERE { ?c wdt:P31 wd:${qid} ; wdt:P625 ?coord ; rdfs:label ?cLabel . FILTER(LANG(?cLabel)='sv') }`;
  let r; try { r = await sparql(q); } catch (e) { console.log(feat,'hoppad'); continue; }
  for (const b of r.results.bindings) {
    const uri = b.c.value; if (seen.has(uri)) continue; seen.add(uri);
    const m = String(b.coord.value).match(/Point\(([-\d.]+) ([-\d.]+)\)/); if (!m) continue;
    const name = b.cLabel.value; if (/^Q\d+$/.test(name)) continue;
    const cl = classify(name); if (!cl) continue;
    rows.push({ name, lat: parseFloat(m[2]), lng: parseFloat(m[1]), element_keys: ['val', cl.efterled], element_category: cl.cat, feature_type: feat, external_id: uri });
  }
  await new Promise(r=>setTimeout(r,600));
}
const byEff = {}; rows.forEach(r=>{const e=r.element_keys[1]; byEff[e]=(byEff[e]||0)+1;});
console.log('val-orter:', rows.length, '| per efterled:', JSON.stringify(byEff));
let up = 0;
for (let i=0;i<rows.length;i+=500){ const res=await post(rows.slice(i,i+500)); try{up+=JSON.parse(res).upserted||0}catch{console.log('POST:',res.slice(0,120))} await new Promise(r=>setTimeout(r,300)); }
console.log('upsert klart:', up);
