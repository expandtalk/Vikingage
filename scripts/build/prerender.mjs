#!/usr/bin/env node
// Fas B — byggtids-prerender av HÖGVÄRDESSIDOR till statisk HTML, så AI-crawlers som INTE kör JS ser
// korrekt <head> (title/description/canonical/hreflang) + schema.org JSON-LD + en innehålls-preview.
// Körs EFTER `npm run build` (ingen runtime-server — FTP-statisk). Skriver dist/<path>/index.html;
// SPA:n bootar och tar över #root för interaktiva användare. sameAs hämtas ur external_ids (BELAGT).
//
// VIKTIGT (deploy): webbhotellets rewrite/.htaccess måste servera den prerendrade filen NÄR den finns
// (RewriteCond %{REQUEST_FILENAME} !-f och !-d FÖRE SPA-fallbacken till /index.html), annars skrivs de
// statiska sidorna över av SPA-fallbacken. Se not sist i filen.
//
// Kör:  npm run build && node scripts/build/prerender.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const DIST = 'dist';
const SITE = 'https://vikingage.se';
const SB_URL = process.env.VITE_SUPABASE_URL ?? 'https://mnuifmcjspeaauzehasj.supabase.co';
const SB_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udWlmbWNqc3BlYWF1emVoYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzQ1MzQsImV4cCI6MjA2MzYxMDUzNH0.ZkAhIwMPRe4lgAH8MxUCNjM39Vh4hyk9IVdmX0jC-z8';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function sb(path) {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

// Bekräftade sameAs-URI:er ur external_ids. Prövar (tabell, namnkolumn)-kandidater i ordning (viking_cities
// → place_names) tills en entitet med länkar hittas. Endast kurerade poster finns i external_ids → belagt.
async function sameAsByName(candidates, name) {
  for (const [table, col] of candidates) {
    const rows = await sb(`${table}?select=id&${col}=ilike.${encodeURIComponent(name)}&limit=1`);
    const id = rows?.[0]?.id;
    if (!id) continue;
    const ext = await sb(`external_ids?select=uri&entity_table=eq.${table}&entity_id=eq.${id}&uri=not.is.null`);
    const uris = (ext ?? []).map((r) => r.uri).filter(Boolean);
    if (uris.length) return uris;
  }
  return [];
}

// Högvärdessidor. entity=Place/Landmark (geo/temporalCoverage/sameAs); annars WebPage/WebSite.
// description = kurerad BELAGD text (samma anda som sidans PageMeta). altPath = motsvarande språk (hreflang).
const PAGES = [
  {
    path: '/sv/birka', lang: 'sv', altPath: '/en/birka', type: 'LandmarksOrHistoricalBuildings',
    name: 'Birka', title: 'Birka — Sveriges första stad på Björkö i Mälaren',
    description: 'Vikingatida handelsstad på Björkö i Mälaren (ca 750–975); UNESCO-världsarv tillsammans med Hovgården. Österled mot Rus och kalifatet, kung Björn och Ansgars mission omkring 830, kammargraven Bj 581.',
    lat: 59.3362, lng: 17.5455, temporalCoverage: '750/975',
    sameAs: ['viking_cities:name:Birka'],
  },
  {
    path: '/sv/goteborg', lang: 'sv', altPath: '/en/gothenburg', type: 'Place',
    name: 'Göteborg', title: 'Göteborg — fornlämningar, hällristningar och stadens föregångare',
    description: 'Fornlämningar, hällristningar, runstenar och kyrkor kring Göteborg och Göta älvs mynning — samt stadens föregångare Lödöse, Nya Lödöse, Gullberg och Älvsborg.',
    lat: 57.7072, lng: 11.9670,
    sameAs: ['place_names:name:Göteborg', 'viking_cities:name:Göteborg'],
  },
  {
    path: '/verktyg', lang: 'sv', altPath: '/tools', type: 'WebPage',
    name: 'Verktyg', title: 'Verktyg',
    description: 'Alla verktyg i forskningsplattformen Viking Age: kartor, ortnamnsforskning, runor, forensik, 3D-modeller, räckviddssond, sök, kunskapsgraf och AI-agenter.',
  },
  {
    path: '/ai-agenter', lang: 'sv', altPath: '/ai-agents', type: 'WebPage',
    name: 'AI-agenter', title: 'AI-agenter',
    description: 'Vilka AI-agenter forskningsplattformen Viking Age använder och hur: produkt-AI plus källkritiska historie- och arkeologiagenter. Alla lyder under regeln ingen gissning — AI beskriver, människan verifierar.',
  },
];

function headInject(template, p, jsonLd) {
  const fullTitle = `${p.title} | Viking Age`;
  const canonical = SITE + p.path;
  const tags = [
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<link rel="alternate" hreflang="${p.lang}" href="${esc(canonical)}" />`,
    p.altPath ? `<link rel="alternate" hreflang="${p.lang === 'sv' ? 'en' : 'sv'}" href="${esc(SITE + p.altPath)}" />` : '',
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ].filter(Boolean).join('\n    ');

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${esc(p.description)}" />`);
  if (!/name="description"/i.test(html)) {
    html = html.replace(/<\/head>/i, `    <meta name="description" content="${esc(p.description)}" />\n  </head>`);
  }
  html = html.replace(/<\/head>/i, `    ${tags}\n  </head>`);

  // Innehålls-preview i #root (icke-JS-crawlers läser detta; React ersätter #root för användaren).
  const preview = `<main style="max-width:48rem;margin:0 auto;padding:2rem"><h1>${esc(p.name)}</h1>`
    + `<p>${esc(p.description)}</p><p><a href="${esc(canonical)}">${esc(p.name)} — Viking Age</a></p></main>`;
  html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${preview}</div>`);
  return html;
}

function buildJsonLd(p, sameAs) {
  const o = {
    '@context': 'https://schema.org', '@type': p.type, name: p.name,
    url: SITE + p.path, description: p.description, inLanguage: p.lang,
    isPartOf: { '@type': 'WebSite', name: 'Viking Age', url: SITE },
    publisher: { '@type': 'Organization', name: 'Viking Age', url: SITE },
  };
  if (sameAs?.length) o.sameAs = sameAs;
  if (p.temporalCoverage) o.temporalCoverage = p.temporalCoverage;
  const placeLike = ['Place', 'LandmarksOrHistoricalBuildings', 'PlaceOfWorship'].includes(p.type);
  if (placeLike && p.lat != null && p.lng != null) o.geo = { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng };
  return o;
}

async function main() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8');
  let n = 0;
  for (const p of PAGES) {
    let sameAs = [];
    if (p.sameAs?.length) {
      const cands = p.sameAs.map((s) => { const [t, c] = s.split(':'); return [t, c]; });
      const name = p.sameAs[0].split(':')[2];
      sameAs = await sameAsByName(cands, name);
    }
    const html = headInject(template, p, buildJsonLd(p, sameAs));
    const out = join(DIST, p.path.replace(/^\//, ''), 'index.html');
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, html, 'utf8');
    console.log(`prerender: ${p.path} → ${out}${sameAs.length ? ` (sameAs ${sameAs.length})` : ''}`);
    n++;
  }
  console.log(`Klart: ${n} sidor prerendrade i ${DIST}/.`);
  console.log('OBS deploy: säkerställ att .htaccess serverar befintlig fil (RewriteCond !-f/!-d) FÖRE SPA-fallbacken.');
}

main().catch((e) => { console.error(e); process.exit(1); });
