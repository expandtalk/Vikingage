#!/usr/bin/env node
/**
 * fetch-lagar.mjs — hämtar fornsvensk lagtext (public domain, Schlyter via Project Runeberg)
 * och lägger in den i `source_texts` för respektive landskapslag i `historical_sources`.
 *
 * VARFÖR: lagarna visar "metadata / fulltext ännu ej inlagd" i /texter eftersom inga
 * source_texts-rader finns. Detta skript ingesterar den RIKTIGA texten. Ingen text hittas
 * på — den hämtas från källan; hittar skriptet ingen text skriver det INGET.
 *
 * KÄLLA: Schlyter, "Samling af Sweriges Gamla Lagar" (Corpus Iuris Sueo-Gotorum Antiqui),
 * fri (utg. 1827–1877). Project Runeberg har volymerna som OCR. OBS: OCR-kvaliteten och de
 * exakta verk-/sid-id:na MÅSTE du verifiera — se `LAWS` nedan och dry-run-utskriften.
 *
 * SÄKERHET / ARBETSSÄTT (som dina andra pipelines):
 *   - Dry-run som standard. Skriver INGET utan `--commit`.
 *   - Hämtar bara laggar som SAKNAR source_texts (rör ej redan ingesterad text).
 *   - Kräver SUPABASE_URL + SUPABASE_SERVICE_KEY i miljön (skrivroll; ej i klienten).
 *
 * KÖR:
 *   node scripts/data/fetch-lagar.mjs            # dry-run: visar vad som skulle hämtas/skrivas
 *   node scripts/data/fetch-lagar.mjs --commit   # skriver till source_texts
 *
 * BEROENDEN: @supabase/supabase-js (finns i projektet), Node 18+ (inbyggd fetch).
 */
import { createClient } from '@supabase/supabase-js';

const COMMIT = process.argv.includes('--commit');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Saknar SUPABASE_URL / SUPABASE_SERVICE_KEY i miljön.');
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// Lag → Project Runeberg-källa. `url` = sida med OCR-text (verifiera!). `pages` kan vara en
// lista av sid-URL:er om verket är paginerat. Lämna url tom ('') för att hoppa över en lag.
// VERIFIERA varje url mot runeberg.org (sök "Schlyter Samling af Sweriges Gamla Lagar").
const LAWS = [
  { title: 'Äldre Västgötalagen', url: '', note: 'Schlyter vol 1 (Westgöta-Lagen 1827)' },
  { title: 'Östgötalagen',        url: '', note: 'Schlyter vol 2 (Östgöta-Lagen)' },
  { title: 'Upplandslagen',       url: '', note: 'Schlyter vol 3 (Uplands-Lagen)' },
  { title: 'Södermannalagen',     url: '', note: 'Schlyter vol 4 (Södermanna-Lagen)' },
  { title: 'Västmannalagen',      url: '', note: 'Schlyter vol 5 (Westmanna-Lagen)' },
  { title: 'Hälsingelagen',       url: '', note: 'Schlyter vol 6 (Helsinge-Lagen)' },
  { title: 'Gutalagen',           url: '', note: 'Schlyter vol 7/9 (Gotlands-Lagen)' },
  { title: 'Skånelagen',          url: '', note: 'Schlyter vol 9/11 (Skåne-Lagen)' },
  { title: 'Dalalagen',           url: '', note: 'Schlyter (Dala-Lagen / Äldre Västmannalagen)' },
  { title: 'Smålandslagen (Kristnorätten)', url: '', note: 'Schlyter (Smålands-Lagens kyrkobalk)' },
  { title: 'Magnus Erikssons landslag', url: '', note: 'Schlyter vol 10 (Konung Magnus Erikssons Landslag)' },
  { title: 'Alsnö stadga',        url: '', note: 'Diplomatarium Suecanum / Schlyter-appendix' },
];

// Grov OCR-städning + sektionsdelning (balk/flock). Justera vid behov efter dry-run.
const cleanOcr = (raw) => raw
  .replace(/\r/g, '')
  .replace(/-\n(\p{Ll})/gu, '$1')     // avstavningar
  .replace(/[ \t]+/g, ' ')
  .trim();

const splitSections = (text) => {
  // Dela på balk-/flock-rubriker (versal-inledda korta rader) — heuristik, granska i dry-run.
  const parts = text.split(/\n(?=[A-ZÅÄÖ][^\n]{0,40}\.?\n)/u).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [text];
};

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'vikingage-lagar/1.0 (forskning)' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.text();
}

async function main() {
  console.log(`fetch-lagar — ${COMMIT ? 'COMMIT' : 'DRY-RUN'}\n`);
  const { data: sources, error } = await sb
    .from('historical_sources')
    .select('id, title')
    .in('title', LAWS.map((l) => l.title));
  if (error) { console.error(error); process.exit(1); }
  const byTitle = new Map((sources ?? []).map((s) => [s.title, s.id]));

  for (const law of LAWS) {
    const sourceId = byTitle.get(law.title);
    if (!sourceId) { console.log(`- ${law.title}: saknas i historical_sources — hoppar`); continue; }
    if (!law.url) { console.log(`- ${law.title}: ingen url satt (${law.note}) — VERIFIERA & fyll i`); continue; }

    // Rör ej lagar som redan har text.
    const { count } = await sb.from('source_texts').select('*', { count: 'exact', head: true }).eq('source_id', sourceId);
    if (count && count > 0) { console.log(`- ${law.title}: har redan ${count} sektioner — hoppar`); continue; }

    let sections;
    try { sections = splitSections(cleanOcr(await fetchText(law.url))); }
    catch (e) { console.log(`- ${law.title}: HÄMTNING MISSLYCKADES (${e.message}) — skriver inget`); continue; }
    if (!sections.length) { console.log(`- ${law.title}: ingen text extraherad — skriver inget`); continue; }

    console.log(`- ${law.title}: ${sections.length} sektioner (${sections[0].slice(0, 60)}…)`);
    if (!COMMIT) continue;

    const rows = sections.map((txt, i) => ({
      source_id: sourceId, stanza_no: i + 1, original_norse: txt,
      norse_source: `Schlyter, Samling af Sweriges Gamla Lagar (PD) via Project Runeberg — ${law.url}`,
    }));
    const { error: insErr } = await sb.from('source_texts').insert(rows);
    console.log(insErr ? `    FEL: ${insErr.message}` : `    ✓ ${rows.length} sektioner inlagda`);
  }
  console.log(`\n${COMMIT ? 'Klart.' : 'Dry-run klar — fyll i/verifiera LAWS-url:er, kör sedan --commit.'}`);
}
main();
