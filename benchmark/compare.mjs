#!/usr/bin/env node
// Trend: jämför de TVÅ SENASTE körningarna för en svit och visar hur kvaliteten rör sig över tid.
//   node benchmark/compare.mjs [tag]     (tag: core-retrieval | researcher-personas)
// Plockar automatiskt de två nyaste results/<tag>-YYYY-MM-DD.json. Med bara en körning =
// baslinje. Mäter: svarbar% (ej dead-end), ankare hittat%, topp-typ rätt%, + förbättrade/regresserade
// per fråga. Kör run.mjs före/efter en förbättring (ingest, UGC, innehåll) → deltat syns svart på vitt.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const RES = join(DIR, 'results');
const tag = process.argv[2] || 'core-retrieval';

mkdirSync(RES, { recursive: true });
const snaps = readdirSync(RES)
  .filter((f) => f.startsWith(`${tag}-`) && f.endsWith('.json') && !f.includes('-trend-'))
  .sort(); // filnamn slutar på ISO-datum → lexikografisk sortering = kronologisk
if (snaps.length === 0) {
  console.error(`Inga snapshots för "${tag}" i benchmark/results/. Kör run.mjs först.`);
  process.exit(1);
}

const load = (f) => JSON.parse(readFileSync(join(RES, f), 'utf8'));
const curF = snaps[snaps.length - 1];
const prevF = snaps.length >= 2 ? snaps[snaps.length - 2] : null;
const cur = load(curF);
const prev = prevF ? load(prevF) : null;

const agg = (rows) => {
  const n = rows.length;
  const dead = rows.filter((r) => r.deadend).length;
  const anchorApp = rows.filter((r) => r.anchor_found !== null).length;
  const anchor = rows.filter((r) => r.anchor_found === true).length;
  const typeApp = rows.filter((r) => r.top_type_ok !== null).length;
  const typeOk = rows.filter((r) => r.top_type_ok === true).length;
  return { n, dead, answerable: n - dead, anchor, anchorApp, typeOk, typeApp };
};
const pct = (a, b) => (b === 0 ? '—' : `${Math.round((100 * a) / b)}%`);
const rank = (r) => (r.deadend ? 0 : r.anchor_found ? 2 : 1); // dead < miss < hit
const dateOf = (f) => f.slice(-15, -5); // "…-2026-08-23.json" → "2026-08-23"

const c = agg(cur);
const p = prev ? agg(prev) : null;
const pp = prev ? Object.fromEntries(prev.map((r) => [r.id, r])) : {};
const improved = [];
const regressed = [];
if (prev) {
  for (const r of cur) {
    const b = pp[r.id];
    if (!b) continue;
    if (rank(r) > rank(b)) improved.push({ r, b });
    else if (rank(r) < rank(b)) regressed.push({ r, b });
  }
}

const mark = (r) => (r.deadend ? 'DEAD' : r.anchor_found ? '✓' : '✗');
const stamp = new Date().toISOString().slice(0, 10);
let md = `# Trend: ${tag}\n\n`;
md += prev
  ? `Jämför **${dateOf(prevF)}** → **${dateOf(curF)}**\n\n`
  : `Endast en körning (**${dateOf(curF)}**) — baslinje etablerad. Kör igen efter en förbättring för trend.\n\n`;
md += `| Mått | ${prev ? dateOf(prevF) : '—'} | ${dateOf(curF)} |\n|---|---|---|\n`;
md += `| Svarbar (ej dead-end) | ${p ? pct(p.answerable, p.n) : '—'} | **${pct(c.answerable, c.n)}** |\n`;
md += `| Ankare hittat | ${p ? pct(p.anchor, p.anchorApp) : '—'} | **${pct(c.anchor, c.anchorApp)}** |\n`;
md += `| Topp-typ rätt | ${p ? pct(p.typeOk, p.typeApp) : '—'} | **${pct(c.typeOk, c.typeApp)}** |\n`;
md += `| Dead-ends (antal) | ${p ? p.dead : '—'} | **${c.dead}** |\n\n`;
if (prev) {
  md += `Förbättrade: **${improved.length}** · Regresserade: **${regressed.length}**\n\n`;
  md += `## Förbättringar\n\n`;
  md += improved.length
    ? `| ID | Fråga | Var | Nu |\n|---|---|---|---|\n` +
      improved.map(({ r, b }) => `| ${r.id} | ${r.query.replace(/\|/g, '\\|')} | ${mark(b)} | ${mark(r)} |`).join('\n') + '\n'
    : 'Inga.\n';
  md += `\n## Regressioner\n\n`;
  md += regressed.length
    ? `| ID | Fråga | Var | Nu |\n|---|---|---|---|\n` +
      regressed.map(({ r, b }) => `| ${r.id} | ${r.query.replace(/\|/g, '\\|')} | ${mark(b)} | ${mark(r)} |`).join('\n') + '\n'
    : 'Inga. 🎉\n';
}
md += `\n## Kvarstående dead-ends (mest värd att åtgärda)\n\n`;
const deads = cur.filter((r) => r.deadend);
md += deads.length ? deads.map((r) => `- **${r.id}** \`${r.query}\``).join('\n') + '\n' : 'Inga.\n';

const outF = join('results', `${tag}-trend-${stamp}.md`);
writeFileSync(join(DIR, outF), md);
console.log(`\n=== TREND: ${tag} ===`);
if (prev) {
  console.log(`Svarbar:  ${pct(p.answerable, p.n)} → ${pct(c.answerable, c.n)}`);
  console.log(`Ankare:   ${pct(p.anchor, p.anchorApp)} → ${pct(c.anchor, c.anchorApp)}`);
  console.log(`Förbättrade: ${improved.length} · Regresserade: ${regressed.length}`);
} else {
  console.log(`Baslinje: svarbar ${pct(c.answerable, c.n)}, ankare ${pct(c.anchor, c.anchorApp)}, dead-ends ${c.dead}`);
}
console.log(`Rapport: benchmark/${outF.replace(/\\/g, '/')}`);
