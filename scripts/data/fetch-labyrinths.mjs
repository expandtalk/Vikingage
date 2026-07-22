// Hämtar stenlabyrinter/trojaborgar (RAÄ K-samsök, CC0) + kuraterad Blå Jungfrun och
// POSTar till import-heritage (raa_type='labyrint'). Samma verifieringsregel som övriga
// kulturlager-typer: bara /raa/lamning/ med verifierad WGS84-koordinat ur gml:coordinates.
// Körning:  node scripts/data/fetch-labyrinths.mjs <ANON_KEY>
import https from 'https';
const ANON = process.argv[2];
if (!ANON) { console.error('Ange anon-nyckel som argument.'); process.exit(1); }
const FN = 'https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/import-heritage';
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const get = (url) => new Promise((res, rej) => { https.get(url, { headers: { 'User-Agent': UA } }, (r) => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(d)); }).on('error', rej); });
const post = (rows) => new Promise((res, rej) => {
  const body = JSON.stringify({ rows });
  const req = https.request(FN, { method:'POST', headers:{ 'Content-Type':'application/json','Content-Length':Buffer.byteLength(body), apikey:ANON, Authorization:`Bearer ${ANON}` } }, (r)=>{ let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(d)); });
  req.on('error', rej); req.write(body); req.end();
});
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const PER=100, MAX_PAGES=20, re=/labyrint/i;
const rows=[], seen=new Set();
for (let start=1; start<=MAX_PAGES*PER; start+=PER) {
  const url=`https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${PER}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent('text=labyrint')}`;
  let xml; try { xml=await get(url); } catch(e){ break; }
  const items=xml.split('<pres:item ').slice(1);
  if (!items.length) break;
  for (const it of items) {
    const label=(it.match(/<pres:itemLabel[^>]*>([^<]*)</)||[])[1]||'';
    const place=(it.match(/<pres:placeLabel[^>]*>([^<]*)</)||[])[1]||'';
    const uri=(it.match(/kulturarvsdata\.se\/[a-z]+\/[a-z]+\/[a-z0-9-]{8,}/)||[])[0]||'';
    const cm=it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
    if(!cm) continue;
    const lng=parseFloat(cm[1]), lat=parseFloat(cm[2]);
    if(!/\/raa\/lamning\//.test(uri) || !re.test(it) || !(lat>54&&lat<70&&lng>10&&lng<25)) continue;
    const key=lat.toFixed(4)+','+lng.toFixed(4);
    if(seen.has(key)) continue; seen.add(key);
    const p=place.split(',').map(x=>x.trim());
    rows.push({ raa_type:'labyrint', name:label.trim()||'Labyrint', landscape:p[3]||null, municipality:p[2]||null, parish:p[4]||null, lat, lng, source_uri:uri });
  }
  await sleep(600);
}
// Blå Jungfrun (kuraterat — saknas i Fornsök som Labyrint).
rows.push({ raa_type:'labyrint', name:'Trojeborg, Blå Jungfrun', landscape:'Småland', municipality:'Högsby', parish:'Ålem', lat:57.2486, lng:16.8378, source_uri:null });
let inserted=0;
for (let i=0;i<rows.length;i+=500){ const res=await post(rows.slice(i,i+500)); try{ inserted+=JSON.parse(res).inserted||0; }catch{ console.log('POST-svar:',res.slice(0,200)); } await sleep(300); }
console.log(`labyrint: hämtade ${rows.length} verifierade, upsert ${inserted}`);
