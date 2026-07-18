// Diagnos: har B-signum (Bautil) moderna motsvarigheter och/eller läsningar i rundata?
// Kör: node scripts/trace-bautil.mjs "B 1054" "B 1059" ...
import { readFileSync } from 'node:fs';
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['B 1054', 'B 1059', 'B 1060'];
const lines = readFileSync('rundata.sql', 'utf8').split('\n');
const hexOf = (f) => { const m = f.match(/X'([0-9A-Fa-f]+)'/); return m ? m[1].toUpperCase() : null; };
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;
const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
let cur = null;
const sigText = new Map(), sigToInsc = new Map(), inscToSig = new Map(), readingInsc = new Set();
for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i); if (m) { cur = m[1]; continue; }
  const line = raw.trim(); if (!line.startsWith('(')) continue;
  if (cur === 'signa') { const c = line.match(reSigna); if (c) sigText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim()); }
  else if (cur === 'signum_inscription') { const c = line.match(reSigIn); if (c) { const [, , sid, iid, canon] = c; sigToInsc.set(sid, iid); if (!inscToSig.has(iid)) inscToSig.set(iid, []); inscToSig.get(iid).push({ sid, canon: +canon }); } }
  else if (cur === 'readings') { const iid = hexOf((line.split(',')[1] || '')); if (iid) readingInsc.add(iid); }
}
const byText = new Map(); for (const [sid, t] of sigText) byText.set(t, sid);
for (const target of targets) {
  const sid = byText.get(target); const iid = sid ? sigToInsc.get(sid) : null;
  const sibs = iid ? inscToSig.get(iid).map((s) => ({ sig: sigText.get(s.sid), canon: s.canon })) : [];
  const canonical = sibs.slice().sort((a, b) => b.canon - a.canon)[0];
  console.log(`${target}: iRundata=${sid ? 'ja' : 'NEJ'} | inscription=${iid ? 'ja' : 'nej'} | canonical=${canonical ? canonical.sig : '-'} | aliases=[${sibs.map((s) => s.sig).join(', ')}] | harLäsning=${iid ? readingInsc.has(iid) : false}`);
}
