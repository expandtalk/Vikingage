#!/usr/bin/env node
// Benchmark v2: kör query-understanding (ankar-extraktion) FÖRE retrieval och jämför mot baseline.
//   node benchmark/run-benchmark-v2.mjs
// Slår mot samma deployade edge (search-hybrid). Bevisar entitetsextraktionens lyft UTAN att deploya.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { understandQuery } from './lib/query-understanding.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const URL = 'https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/search-hybrid';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udWlmbWNqc3BlYWF1emVoYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzQ1MzQsImV4cCI6MjA2MzYxMDUzNH0.ZkAhIwMPRe4lgAH8MxUCNjM39Vh4hyk9IVdmX0jC-z8';
const TOPK = 8;
const fold = (s) => (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

async function search(q) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(URL, { method: 'POST', signal: ctrl.signal,
      headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, limit: TOPK }) });
    const b = await res.json();
    return { hits: b.hits ?? [], mode: b.mode ?? null, error: b.error ?? null };
  } catch (e) { return { hits: [], mode: null, error: String(e?.message ?? e) }; }
  finally { clearTimeout(t); }
}

const bench = JSON.parse(readFileSync(join(DIR, 'search-benchmark.json'), 'utf8'));
// Ladda baseline (top-1 + anchor_found) för sida-vid-sida.
let base = null;
try { base = JSON.parse(readFileSync(join(DIR, 'results-2026-08-22.json'), 'utf8')); } catch { /* valfritt */ }
const baseById = Object.fromEntries((base ?? []).map((r) => [r.id, r]));

const rows = [];
console.log(`v2 (ankar-extraktion) · ${bench.probes.length} frågor\n`);
for (const p of bench.probes) {
  const u = understandQuery(p.query);
  const r = await search(u.anchor);
  const deadend = r.hits.length === 0;
  const af = fold(p.anchor);
  const anchor_found = !deadend && r.hits.some((h) => fold(h.label).includes(af) || fold(h.snippet).includes(af));
  const top = r.hits[0] ?? null;
  const top_type_ok = top && p.expect_types ? p.expect_types.includes(top.entity_type) : null;
  const b = baseById[p.id];
  rows.push({ id: p.id, cat: p.cat, query: p.query, lang: p.lang, anchor: u.anchor, changed: u.changed,
    reason: u.reason, mode: r.mode, n: r.hits.length, deadend, anchor_found, top_type_ok,
    top: top ? { t: top.entity_type, l: top.label } : null,
    base: b ? { deadend: b.deadend, anchor_found: b.anchor_found, top: b.top?.[0] ?? null } : null });
  const now = deadend ? 'DEAD' : anchor_found ? '✓' : '✗';
  const was = b ? (b.deadend ? 'DEAD' : b.anchor_found ? '✓' : '✗') : '?';
  const delta = was !== now ? `  [${was}→${now}]${u.changed ? '' : ' (oförändr. fråga)'}` : '';
  console.log(`${p.id.padEnd(4)} ${now.padEnd(4)} ${p.query}${delta}`);
  if (u.changed) console.log(`       ankare: "${u.anchor}"${top ? `  → ${top.entity_type} · ${top.label}` : ''}`);
  else if (top) console.log(`       → ${top.entity_type} · ${top.label}`);
  await new Promise((res) => setTimeout(res, 120));
}

const N = rows.length;
const deadNow = rows.filter((r) => r.deadend).length;
const afNow = rows.filter((r) => r.anchor_found).length;
const deadWas = rows.filter((r) => r.base?.deadend).length;
const afWas = rows.filter((r) => r.base?.anchor_found).length;
const improved = rows.filter((r) => r.base && ((r.base.deadend && !r.deadend) || (!r.base.anchor_found && r.anchor_found)));
const regressed = rows.filter((r) => r.base && ((!r.base.deadend && r.deadend) || (r.base.anchor_found && !r.anchor_found)));

// Rapport.
let md = `# Sökbenchmark v2 — entitetsextraktion vs baseline\n\n`;
md += `Motor: samma edge; skillnaden = query-understanding (ankar-extraktion) före retrieval.\n\n`;
md += `| Mått | Baseline | v2 |\n|---|---|---|\n`;
md += `| Dead-ends | ${deadWas} | **${deadNow}** |\n`;
md += `| Ankare hittat (topp-8) | ${afWas}/${N} | **${afNow}/${N}** |\n\n`;
md += `Förbättrade: **${improved.length}** · Regresserade: **${regressed.length}**\n\n`;
md += `## Förbättringar\n\n| ID | Fråga | Ankare | Baseline topp-1 | v2 topp-1 |\n|---|---|---|---|---|\n`;
for (const r of improved)
  md += `| ${r.id} | ${r.query.replace(/\|/g,'\\|')} | ${r.anchor.replace(/\|/g,'\\|')} | ${r.base?.top ? `${r.base.top.t} · ${r.base.top.l}`.replace(/\|/g,'\\|') : (r.base?.deadend?'DEAD':'—')} | ${r.top ? `${r.top.t} · ${r.top.l}`.replace(/\|/g,'\\|') : '—'} |\n`;
md += `\n## Regressioner\n\n`;
if (regressed.length === 0) md += `Inga.\n`;
else { md += `| ID | Fråga | Ankare | Baseline | v2 |\n|---|---|---|---|---|\n`;
  for (const r of regressed) md += `| ${r.id} | ${r.query.replace(/\|/g,'\\|')} | ${r.anchor.replace(/\|/g,'\\|')} | ${r.base?.anchor_found?'✓':'DEAD/✗'} | ${r.deadend?'DEAD':'✗'} |\n`; }
md += `\n## Kvarstående dead-ends (v2)\n\n`;
for (const r of rows.filter((r) => r.deadend)) md += `- **${r.id}** \`${r.query}\` (ankare: "${r.anchor}")\n`;

const stamp = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIR, `results-v2-${stamp}.md`), md);
writeFileSync(join(DIR, `results-v2-${stamp}.json`), JSON.stringify(rows, null, 2));
console.log(`\n=== BASELINE → v2 ===`);
console.log(`Dead-ends:      ${deadWas} → ${deadNow}`);
console.log(`Ankare (topp-8): ${afWas}/${N} → ${afNow}/${N}`);
console.log(`Förbättrade: ${improved.length} · Regresserade: ${regressed.length}`);
console.log(`Rapport: benchmark/results-v2-${stamp}.md`);
