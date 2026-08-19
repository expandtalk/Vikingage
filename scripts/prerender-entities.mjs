// Dynamisk per-entitet-prerender: genererar statisk HTML med SKRÄDDARSYDD <title>/meta/canonical/OG
// för entitetssidor (utflykter + content-pages) så crawlers inte får startsidans skal (Lennarts fynd:
// /excursions/karlevistenen hade generisk titel). Kör efter prerender-meta.mjs i build. Läser DB via
// .env; om DB saknas loggas det och bygget fortsätter (bryter aldrig bygget).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist');
const ORIGIN = 'https://vikingage.se';
const SITE = 'Viking Age';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clip = (s, n = 155) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).replace(/[\s,;:.]+\S*$/, '') + '…' : t; };

const env = (() => { try { return Object.fromEntries(fs.readFileSync(path.join(__dirname, '../.env'), 'utf8').split('\n').filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })); } catch { return {}; } })();

const emit = (tpl, { route, title, desc, lang = 'sv' }) => {
  if (!route || !/^\/[\w\-/åäöÅÄÖ.]+$/.test(route)) return false; // hoppa oväntade slugs
  const fullTitle = `${title} | ${SITE}`;
  const canonical = ORIGIN + route;
  const locale = lang === 'en' ? 'en_GB' : 'sv_SE';
  let html = tpl
    // strippa shell-mallens (startsidans) canonical/og:url så vi inte får DUBBLA canonical
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<meta property="og:url"[^>]*>/gi, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}" />`)
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace('</head>', `  <link rel="canonical" href="${canonical}" />\n  <meta property="og:url" content="${canonical}" />\n  <meta property="og:locale" content="${locale}" />\n  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description: desc, url: canonical, inLanguage: lang, isPartOf: { '@id': 'https://vikingage.se/#website' } })}</script>\n  </head>`);
  const noscript = `<noscript><main><h1>${esc(title)}</h1><p>${esc(desc)}</p><p><a href="/">${SITE}</a> · <a href="/sitemap.xml">Sitemap</a></p></main></noscript>`;
  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);
  const outDir = path.join(distPath, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  return true;
};

const main = async () => {
  if (!fs.existsSync(path.join(distPath, 'index.html'))) { console.log('prerender-entities: dist/index.html saknas — hoppar'); return; }
  if (!env.SUPABASE_DB_PASSWORD) { console.log('prerender-entities: ingen DB (.env) — hoppar (bygget fortsätter)'); return; }
  const tpl = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
  const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
  let n = 0;
  try {
    await c.connect();
    // Utflykter — id är slug (t.ex. karlevistenen); description_sv → meta.
    const exc = await c.query(`select id, name, region, description_sv from excursions where id is not null`);
    for (const e of exc.rows) {
      const desc = clip(e.description_sv) || `Utflykt i ${e.region || 'Sverige'} — vikingatida och medeltida lämningar med källbelagd kontext.`;
      if (emit(tpl, { route: `/excursions/${e.id}`, title: `${e.name} — Utflykt`, desc, lang: 'sv' })) n++;
    }
    // Content-pages (Birka m.fl.) — url + teaser_sv.
    const cp = await c.query(`select url, title_sv, teaser_sv from content_pages where url like '/%'`);
    for (const p of cp.rows) {
      const desc = clip(p.teaser_sv) || `${p.title_sv} — källbelagd kunskapssida på Viking Age.`;
      if (emit(tpl, { route: p.url, title: p.title_sv, desc, lang: p.url.startsWith('/en/') ? 'en' : 'sv' })) n++;
    }
  } catch (e) { console.log('prerender-entities: DB-fel — hoppar:', e.message); }
  finally { try { await c.end(); } catch { /* noop */ } }
  console.log(`✅ Per-entitet-prerender: ${n} entitetssidor (utflykter + content-pages).`);
};
main();
