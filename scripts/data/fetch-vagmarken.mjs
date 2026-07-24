// Hämtar RAÄ Fornsök-lämningar av typ "Vägmärke" via K-samsök, verifierad WGS84-koord.
// Kategoriserar per subtyp DÄR den framgår av presentationsdatan (milstolpe/
// väghållningssten/gränsmärke), annars 'vägmärke' (aldrig gissad). Årtal EJ inkluderat.
// Full subtyp-klassning + årtal kräver djup FMIS-hämtning per post (senare spår).
import https from 'https'; import { writeFileSync } from 'node:fs';
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const get=(url)=>new Promise((res,rej)=>{https.get(url,{headers:{'User-Agent':UA}},(r)=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(d));}).on('error',rej);});
const PER=100, MAXSTART=20000; const rows=[]; const seen=new Set(); let capped=false;
const subtype=(t)=>{ const s=t.toLowerCase();
  if(/milst|milsten/.test(s)) return 'milstolpe';
  if(/väghålln|vaghalln/.test(s)) return 'väghållningssten';
  if(/gränsmärke|gransmarke|gränssten|granssten/.test(s)) return 'gränsmärke';
  return 'vägmärke'; };
for(let start=1; start<=MAXSTART; start+=PER){
  const url=`https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${PER}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent('text=Vägmärke')}`;
  let xml; try{ xml=await get(url);}catch(e){ await new Promise(r=>setTimeout(r,2000)); continue; }
  const items=xml.split('<pres:item ').slice(1);
  if(items.length===0) break;
  for(const it of items){
    const uri=(it.match(/kulturarvsdata\.se\/[a-z]+\/[a-z]+\/[a-z0-9-]{8,}/)||[])[0]||'';
    if(!/\/raa\/lamning\//.test(uri)) continue;
    const cm=it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</); if(!cm) continue;
    const lng=parseFloat(cm[1]), lat=parseFloat(cm[2]);
    if(!(lat>54&&lat<70&&lng>10&&lng<25)) continue;
    if(seen.has(uri)) continue; seen.add(uri);
    const label=((it.match(/<pres:itemLabel[^>]*>([^<]*)</)||[])[1]||'Vägmärke').trim();
    const place=((it.match(/<pres:placeLabel[^>]*>([^<]*)</)||[])[1]||'').split(',').map(x=>x.trim());
    rows.push({raa_type:subtype(it), name:label, landscape:place[3]||null, municipality:place[2]||null, parish:place[4]||null, lat, lng, uri});
  }
  if(start>=MAXSTART-PER && items.length===PER) capped=true;
  await new Promise(r=>setTimeout(r,600));
}
const esc=(s)=> s==null?'null':`$q$${String(s)}$q$`;
const vals=rows.map(r=>`(${esc(r.raa_type)},${esc(r.name)},${esc(r.landscape)},${esc(r.municipality)},${esc(r.parish)},${r.lat},${r.lng},${esc(r.uri)})`).join(',\n');
const counts=rows.reduce((a,r)=>{a[r.raa_type]=(a[r.raa_type]||0)+1;return a;},{});
const sql=`-- Vägmärke-lämningar ur K-samsök/FMIS. ${rows.length} rader, verifierad koord.
-- Subtyp per rad där den framgår (${JSON.stringify(counts)}); årtal EJ inkluderat (kureras senare).
insert into heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, source_uri)
select v.* from (values
${vals}
) as v(raa_type,name,landscape,municipality,parish,lat,lng,source_uri)
on conflict (source_uri) do nothing;
`;
writeFileSync('scripts/data/vagmarke-import.sql', sql);
console.log(`Hämtade ${rows.length} verifierade Vägmärke-lämningar${capped?' (CAPPAD vid '+MAXSTART+')':''}. Subtyper: ${JSON.stringify(counts)}. SQL skriven.`);
