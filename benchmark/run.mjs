#!/usr/bin/env node
// Kör search-benchmark.json mot den RIKTIGA edge-motorn (search-hybrid) och skriver en rapport.
//   node benchmark/run-benchmark.mjs
// Ingen build/dev-server behövs — slår direkt mot deployad Supabase edge function (anon-nyckel, publik läs-sök).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const URL = 'https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/search-hybrid';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udWlmbWNqc3BlYWF1emVoYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzQ1MzQsImV4cCI6MjA2MzYxMDUzNH0.ZkAhIwMPRe4lgAH8MxUCNjM39Vh4hyk9IVdmX0jC-z8';
const TOPK = 8;

// Diakritik-tålig fold för ankarmatchning (å/ä/ö/æ/ø/á, tvärs nordiska språk).
const fold = (s) => (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

async function search(q) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(URL, {
      method: 'POST', signal: ctrl.signal,
      headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, limit: TOPK }),
    });
    const body = await res.json();
    return { ok: res.ok, hits: body.hits ?? [], mode: body.mode ?? null, error: body.error ?? null };
  } catch (e) {
    return { ok: false, hits: [], mode: null, error: String(e?.message ?? e) };
  } finally { clearTimeout(t); }
}

const BENCH_FILE = process.argv[2] || 'suite-core-retrieval.json';
const TAG = BENCH_FILE.replace(/.*[\\/]/, '').replace(/\.json$/, '').replace(/^suite-/, '') || 'core';
const bench = JSON.parse(readFileSync(join(DIR, BENCH_FILE), 'utf8'));
const rows = [];
console.log(`Kör ${bench.probes.length} frågor mot ${URL}\n`);

for (const p of bench.probes) {
  const r = await search(p.query);
  const deadend = r.hits.length === 0;
  const anchorFold = fold(p.anchor);
  const anchor_found = p.anchor ? (!deadend && r.hits.some((h) => fold(h.label).includes(anchorFold) || fold(h.snippet).includes(anchorFold))) : null;
  const top = r.hits[0] ?? null;
  const top_type_ok = top && p.expect_types ? p.expect_types.includes(top.entity_type) : null;
  rows.push({ ...p, mode: r.mode, error: r.error, n: r.hits.length, deadend, anchor_found, top_type_ok,
    top: r.hits.slice(0, 3).map((h) => ({ t: h.entity_type, l: h.label, s: Number(h.score?.toFixed?.(3) ?? h.score) })) });
  const flag = deadend ? 'DEAD-END' : anchor_found ? 'anchor✓' : 'anchor✗';
  console.log(`${p.id.padEnd(4)} [${flag.padEnd(8)}] ${p.query}`);
  if (top) console.log(`       → ${top.entity_type} · ${top.label}  (${r.mode})`);
  await new Promise((res) => setTimeout(res, 120));
}

// Aggregat per kategori.
const cats = {};
for (const r of rows) {
  const c = (cats[r.cat] ??= { n: 0, dead: 0, anchor: 0, anchorApplicable: 0, typeOk: 0, typeApplicable: 0 });
  c.n++; if (r.deadend) c.dead++;
  if (!r.deadend && r.anchor_found !== null) { c.anchorApplicable++; if (r.anchor_found) c.anchor++; }
  if (r.top_type_ok !== null) { c.typeApplicable++; if (r.top_type_ok) c.typeOk++; }
}

const pct = (a, b) => (b === 0 ? '—' : `${Math.round((100 * a) / b)}%`);
let md = `# Benchmark: ${TAG}${bench.meta?.version ? ` (v${bench.meta.version})` : ''}\n\n`;
md += `Motor: \`${URL}\` (gte-small → search_v2 → search_v1)\n\n`;
md += `Frågor: ${rows.length} · Dead-ends: ${rows.filter((r) => r.deadend).length} · `;
md += `Ankare hittat (av ej-dead): ${rows.filter((r) => r.anchor_found).length}/${rows.filter((r) => !r.deadend).length}\n\n`;
md += `## Per kategori\n\n| Kategori | Frågor | Dead-end | Ankare hittat | Topp-typ rätt |\n|---|---|---|---|---|\n`;
for (const [c, s] of Object.entries(cats))
  md += `| ${c} | ${s.n} | ${s.dead} | ${s.anchor}/${s.anchorApplicable} (${pct(s.anchor, s.anchorApplicable)}) | ${pct(s.typeOk, s.typeApplicable)} |\n`;
md += `\n## Alla frågor\n\n| ID | Fråga | Lang | Guld query_type | n | Dead | Ankare | Topp-1 träff (typ · label · mode) |\n|---|---|---|---|---|---|---|---|\n`;
for (const r of rows) {
  const t = r.top[0];
  const topStr = t ? `${t.t} · ${t.l}` : '—';
  md += `| ${r.id} | ${r.query.replace(/\|/g, '\\|')} | ${r.lang} | ${r.query_type} | ${r.n} | ${r.deadend ? 'JA' : ''} | ${r.deadend ? '' : r.anchor_found ? '✓' : '✗'} | ${topStr.replace(/\|/g, '\\|')} (${r.mode ?? '—'}) |\n`;
}
md += `\n## Topp-3 per fråga (för inspektion)\n\n`;
for (const r of rows) {
  md += `**${r.id}** \`${r.query}\`${r.scope_note ? ` — _${r.scope_note}_` : ''}\n`;
  if (r.deadend) md += `- DEAD-END${r.error ? ` (fel: ${r.error})` : ''}\n`;
  else for (const h of r.top) md += `- ${h.t} · ${h.l} · ${h.s}\n`;
  md += `\n`;
}

const stamp = new Date().toISOString().slice(0, 10);
mkdirSync(join(DIR, 'results'), { recursive: true });
const outBase = join('results', `${TAG}-${stamp}`);
writeFileSync(join(DIR, `${outBase}.md`), md);
writeFileSync(join(DIR, `${outBase}.json`), JSON.stringify(rows, null, 2));
console.log(`\nRapport: benchmark/${outBase.replace(/\\/g, '/')}.md`);
console.log(`Dead-ends: ${rows.filter((r) => r.deadend).length} · Ankare hittat: ${rows.filter((r) => r.anchor_found).length}/${rows.filter((r) => !r.deadend).length}`);
