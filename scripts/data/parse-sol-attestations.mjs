// Parser: SOL (Isof Ortnamnslexikon) entry-lines → FAKTA-JSON (namn/typ/socken/hd/landskap/form/år/not).
// COPYRIGHT: läser rå SOL-text ur scratchpad (transient), skriver BARA fakta (ej förklarande prosa).
// Axel A = äldsta DATERBARA belägg (form+år) som står FÖRE etymologi-tankstrecket. Ingen gissning:
// ent­réer utan daterbart belägg hoppas över. avskr./sen avskr./? → note + lägre konfidens.
//
// In:  <rawfile> = en SOL-entré per rad (prosan sammanslagen till en rad).
// Ut:  scripts/data/sol-attestations.json
import { readFileSync, writeFileSync } from 'node:fs';

const RAW = process.argv[2];
const OUT = process.argv[3] || new URL('./sol-attestations.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
if (!RAW) { console.log('Ange rå-fil: node parse-sol-attestations.mjs <raw.txt> [ut.json]'); process.exit(1); }

// Bebyggelsetyper som mappar rent mot place_names (belägg hör hemma på en bebyggelserad).
// Allt annat (härad/sjö/fjäll/ö/skeppssättning/järnbruk/gårdnamn/väg/"del av" …) → skippas.
// FÖRSTA beskrivningsordet efter namnet AVGÖR: är det ej en ALLOWED-typ, avfärdas entrén.
const ALLOWED = new Set(['tätort','sn','socken','by','gods','gd','gård','hgd','stad','kn','stadsdel','samhälle','industriort']);
const SKIP_MOD = new Set(['f.d.','f.d','fd']);
const isCap = t => /^[A-ZÅÄÖ]/.test(t);
const LANDSKAP = ['Skåne','Blekinge','Halland','Bohuslän','Dalsland','Värmland','Västergötland','Östergötland','Småland','Öland','Gotland','Södermanland','Närke','Västmanland','Uppland','Dalarna','Gästrikland','Hälsingland','Härjedalen','Jämtland','Medelpad','Ångermanland','Västerbotten','Norrbotten','Lappland'];

const foldName = s => (s||'').replace(/\s+/g,' ').trim();
// Städa WebFetch-markdown: **fet**, _kursiv_, `kod`, escape, samt SPÖK-"–" som ibland stoppas in före
// belägget (våra rader ÄR pre-dash → allt efter ett omgivet streck är fortfarande belägg, ej etymologi).
const normalize = s => (s||'')
  .replace(/^#+\s*/,'').replace(/\*\*/g,'').replace(/`/g,'').replace(/\\/g,'')
  .replace(/[_*]/g,'').replace(/\s[-–—]\s/g,' ').replace(/\s+/g,' ').trim();

function splitHead(entry){
  // namn = ledande Versal-tokens; TYP = första beskrivningsordet därefter (f.d. hoppas över).
  const toks = entry.split(/\s+/);
  let i = 0, nameToks = [];
  for (; i < toks.length; i++){
    const bare = toks[i].replace(/[,.]+$/,'');
    if (isCap(bare)) { nameToks.push(bare); continue; }   // Versal → namn-del
    break;                                                // första gemena → beskrivning börjar
  }
  let typeTok = null;
  for (let k = i; k < toks.length; k++){
    const bare = toks[k].replace(/[,.]+$/,'');
    if (SKIP_MOD.has(bare.toLowerCase())) continue;       // "f.d." = modifierare
    typeTok = bare; break;                                // första riktiga beskrivningsordet
  }
  return { name: foldName(nameToks.join(' ')), typeTok, rest: toks.slice(i).join(' '), allowed: typeTok!=null && ALLOWED.has(typeTok) };
}

function landskapOf(meta){
  // sista landskapsordet i geo-meningen
  let found = null;
  for (const L of LANDSKAP){ const idx = meta.indexOf(L); if (idx >= 0) found = L; }
  return found;
}
function haradOf(meta){
  const m = meta.match(/,\s*([A-ZÅÄÖ][A-Za-zÅÄÖåäöéáí-]+(?:[- ][A-Za-zÅÄÖåäöéáí]+){0,2})\s+hd\b/); // "…, Vemmenhögs hd"
  return m ? m[1].trim() : null;
}
function sockenOf(name, typeTok, meta){
  if (typeTok === 'sn' || typeTok === 'socken') return name;               // uppslaget ÄR socknen
  const m = meta.match(/,\s*([A-ZÅÄÖ][A-Za-zÅÄÖåäöéáí]+(?:[- ][A-ZÅÄÖ]?[A-Za-zÅÄÖåäöéáí]+)?)\s+sn\b/); // "…, Skivarps sn"
  if (m) return m[1];                                                      // RAA form (Skivarps); matchern gör genitiv-tolerant jfr
  return null;
}

// Segmentet FÖRE etymologi-tankstrecket: allt fram till första " – " / " — " / " - ".
function preDash(entry){
  const idx = entry.search(/\s[–—-]\s/);
  return idx >= 0 ? entry.slice(0, idx) : entry;
}

// Plocka äldsta daterbara belägg ur pre-dash-svansen (efter geo-meningens punkt).
function attestation(pre){
  // klipp bort geo-meningen (namn, sn, hd, Landskap.) → svansen efter FÖRSTA ". " som följs av versal/parentes/år
  let tail = pre;
  const dot = pre.match(/\.\s+(?=[(\[A-ZÅÄÖ0-9])/);
  if (dot) tail = pre.slice(dot.index + 1);
  const ym = tail.match(/\b(\d{3,4})\b/);
  if (!ym) return null;
  let year = +ym[1];
  if (year < 500 || year > 1700) return null;
  // KÄLLKRITIK: "…1314 (äldst belagt 1145)" — första årtalet är INTE alltid det äldsta.
  const older = tail.match(/äldst\s+belagt\s+(\d{3,4})/i);
  let olderNote = null;
  if (older && +older[1] >= 500 && +older[1] < year) { year = +older[1]; olderNote = 'äldst belagt (form ej angiven i SOL)'; }
  // form = ord närmast före årtalet (skala bort latinsk/parentetisk apparat)
  const before = tail.slice(0, ym.index).replace(/\[[^\]]*\]/g,' ').trim();
  // ta sista "citations-biten": efter sista ')' eller '.' eller '[' , annars hela
  let form = before.split(/[)\].]/).pop().trim();
  form = form.replace(/^(mansionem regiam|mansionem|parrochia|parochia|parochie|villam|villa|ecclesiam|ecclesie|prouincia|provincia|apud|innan|vnam curiam|curiam|mansus|de|in|jn|af|ad|vti|wti|til|j|i|y|a)\s+/i,'');
  form = form.replace(/\s+(mansus|curia|curiam|villa|mansio|sokne?)$/i,'');
  form = form.replace(/[_*]/g,'').replace(/\bca\b/gi,'').replace(/\s+/g,' ').trim().slice(0,80);
  // konfidens/not
  const noteBits = [];
  const preWin = tail.slice(Math.max(0, ym.index - 24), ym.index);
  const postWin = tail.slice(ym.index + ym[1].length, ym.index + ym[1].length + 14);
  if (/sen avskr/i.test(preWin) || /sen avskr/i.test(postWin)) noteBits.push('sen avskrift');
  else if (/avskr/i.test(preWin) || /avskr/i.test(postWin)) noteBits.push('avskrift');
  if (/\?/.test(postWin.slice(0,3))) noteBits.push('osäker datering');
  if (/\bca\s*$/i.test(preWin)) noteBits.push('ca (ungefärlig)');
  if (/^-?\s*tal/i.test(postWin)) noteBits.push('decennium/ungefärlig');
  if (/med runor|runor|runinskrift/i.test(tail)) noteBits.push('runbelägg');
  if (olderNote) { noteBits.push(olderNote); form = null; }
  const conf = noteBits.length ? 'medel' : 'hög';
  return { year, form: form || null, note: noteBits.join('; ') || null, confidence: conf };
}

const raw = readFileSync(RAW, 'utf8');
const lines = raw.split(/\r?\n/).map(l => normalize(l)).filter(Boolean);
const out = [];
let skippedXref = 0, skippedNoYear = 0, skippedElement = 0, skippedType = 0;
for (const line of lines){
  if (/→/.test(line) && !/\b\d{3,4}\b/.test(preDash(line))) { skippedXref++; continue; } // ren korsref
  if (/^[a-zåäö]/.test(line)) { skippedElement++; continue; }                              // led-artikel (al, arin, by…)
  const { name, typeTok, rest, allowed } = splitHead(line);
  if (!name) continue;
  if (!allowed) { skippedType++; continue; }        // härad/sjö/fjäll/ö/monument → ej place_names-bebyggelse
  const meta = rest;
  const att = attestation(preDash(line));
  if (!att) { skippedNoYear++; continue; }
  out.push({
    name, type: typeTok || null,
    socken: sockenOf(name, typeTok, meta),
    harad: haradOf(meta),
    landskap: landskapOf(meta),
    attested_form: att.form, year: att.year,
    note: att.note, confidence: att.confidence,
    source: 'SOL (Isof Ortnamnslexikon)'
  });
}
writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
console.log(`Rader: ${lines.length}  →  belägg: ${out.length}  (hoppat: korsref ${skippedXref}, led-art ${skippedElement}, ej-bebyggelse ${skippedType}, utan daterbart belägg ${skippedNoYear})`);
console.log('Exempel:'); console.log(out.slice(0,12).map(o=>`  ${o.year}  ${o.name} [${o.socken||'?'}/${o.landskap||'?'}]  «${o.attested_form}»${o.note?'  ('+o.note+')':''}`).join('\n'));
console.log(`\nSkrivet: ${OUT}`);
