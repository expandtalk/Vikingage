// Post-build "meta-prerender" (FTP-säkert, låg risk): skriver dist/<route>/index.html för
// högvärdessidor med rätt <title>, meta description, canonical, hreflang (sv/en/x-default), OG
// samt ett <noscript>-block med rubrik + beskrivning + länkar. JS-lösa crawlers/agenter får då
// korrekta signaler och läsbart innehåll direkt ur HTML:en; SPA:n hydrerar som vanligt när JS kör.
// (Full DOM/data-prerender är ett större separat projekt — detta är första, säkra steget.)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist');
const ORIGIN = 'https://vikingage.se';
const SITE = 'Viking Age';

// Kurerade högvärdessidor. sv/en-par → hreflang. desc = kort SEO-copy.
const PAGES = [
  { p: '/', pair: null, lang: 'sv', title: 'Utforska det nordiska arvet', desc: 'Tusentals runstenar, vikingatida platser och fornnordisk historia — källkritisk forskningsplattform med interaktiv karta och databas.' },
  { p: '/explore', pair: null, lang: 'sv', title: 'Utforska kartan', desc: 'Interaktiv karta över runstenar, fornlämningar, kyrkor, fornborgar, vägar och vikingatida platser i Skandinavien — filtrera och sök i landskapet.' },
  { p: '/sv/svamp', pair: null, lang: 'sv', title: 'Svampguide & svampkarta', desc: 'Svampguide med kännetecken, förväxlingsrisk och säkerhet — plus platsmedveten karta med nederbörd (SMHI) och marktyper. Planerings- och utbildningsstöd, aldrig en ätlighetsdom.' },
  { p: '/sv/nyheter', pair: '/en/news', lang: 'sv', title: 'Senaste forskningen', desc: 'Färska forskningsartiklar om vikingatid, arkeologi, aDNA, runor och nordisk historia ur öppna register (OpenAlex/Crossref/Europe PMC) — relevans-sorterade, med utlänk till källan.' },
  { p: '/en/news', pair: '/sv/nyheter', lang: 'en', title: 'Latest research', desc: 'Fresh research on the Viking Age, archaeology, ancient DNA, runes and Nordic history from open registries (OpenAlex/Crossref/Europe PMC) — relevance-ranked, linking out to the source.' },
  { p: '/inscriptions', pair: '/sv/runinskrifter', lang: 'en', title: 'Runic Inscriptions', desc: 'Explore thousands of Scandinavian runic inscriptions — search, filter and analyse runestones with interactive maps.' },
  { p: '/sv/runinskrifter', pair: '/inscriptions', lang: 'sv', title: 'Runinskrifter', desc: 'Utforska tusentals runinskrifter från vikingatiden. Sök, filtrera och analysera runstenar med interaktiva kartor.' },
  { p: '/en/medieval-charters', pair: '/sv/medeltidsbrev', lang: 'en', title: 'Medieval charters (SDHK)', desc: 'Browse 44,264 Swedish medieval charters up to 1540 — date, place, abstract and full text where available.' },
  { p: '/sv/medeltidsbrev', pair: '/en/medieval-charters', lang: 'sv', title: 'Medeltidsbrev', desc: 'Utforska medeltida brev (SDHK): aktyper, formler, sigill och platser — källkritiskt kopplade till kunskapsgrafen.' },
  { p: '/en/scientific-methodology', pair: '/sv/vetenskapsmetodik', lang: 'en', title: 'Scientific Methodology and AI', desc: 'A non-destructive, source-preserving method — we extract facts and cite the source instead of ingesting and shredding originals (cf. Project Panama).' },
  { p: '/sv/vetenskapsmetodik', pair: '/en/scientific-methodology', lang: 'sv', title: 'Vetenskapsmetodik och AI', desc: 'En icke-destruktiv, källbevarande metod — vi extraherar fakta och citerar källan i stället för att sluka och strimla original (jfr Project Panama).' },
  { p: '/ai-agents', pair: '/ai-agenter', lang: 'en', title: 'AI agents', desc: 'Which AI agents the platform uses and how — product AI and source-critical specialist agents. No guessing; humans verify.' },
  { p: '/ai-agenter', pair: '/ai-agents', lang: 'sv', title: 'AI-agenter', desc: 'Vilka AI-agenter plattformen använder och hur — produkt-AI och källkritiska specialistagenter. Ingen gissning; människan verifierar.' },
  { p: '/fortresses', pair: '/sv/borgar', lang: 'en', title: 'Fortresses', desc: 'Explore Viking Age fortresses, hillforts and central places in Scandinavia with interactive maps.' },
  { p: '/sv/borgar', pair: '/fortresses', lang: 'sv', title: 'Borgar & fornborgar', desc: 'Utforska vikingatida borgar, städer och fornborgar i Skandinavien. Interaktiva kartor med detaljerad information.' },
  { p: '/royal-chronicles', pair: '/sv/kungakronikor', lang: 'en', title: 'Royal Chronicles', desc: 'Medieval and Viking Age rulers of Scandinavia and Eastern Europe — dynasties, sources and historical kings.' },
  { p: '/sv/kungakronikor', pair: '/royal-chronicles', lang: 'sv', title: 'Kungakrönikor', desc: 'Medeltida och vikingatida härskare i Skandinavien och Östeuropa. Dynastier, källor och historiska kungar.' },
  { p: '/carvers', pair: '/sv/ristare', lang: 'en', title: 'Carvers', desc: 'Runic carvers and masters of the Viking Age — inscriptions, workshops and geographical distribution.' },
  { p: '/sv/ristare', pair: '/carvers', lang: 'sv', title: 'Ristare', desc: 'Runristare och mästare från vikingatiden. Se deras inskrifter, verkstäder och geografiska spridning.' },
  { p: '/sv/forsvunna-runstenar', pair: '/en/lost-runestones', lang: 'sv', title: 'De försvunna stenarna', desc: 'Runstenar som överlever som 1600- och 1700-talsteckningar (Peringskiöld, Hadorph, Bautil) — ibland allt som finns kvar.' },
  { p: '/en/lost-runestones', pair: '/sv/forsvunna-runstenar', lang: 'en', title: 'The Lost Stones', desc: 'Runestones that survive as 17th- and 18th-century drawings (Peringskiöld, Hadorph, Bautil) — sometimes all that remains.' },
  { p: '/sv/bildarkiv', pair: '/en/image-archive', lang: 'sv', title: 'Bildarkiv', desc: 'Sökbart bildarkiv: runstensteckningar, kyrkor, landmärken, historiemålningar och manuskript — varje bild med källa och licens.' },
  { p: '/en/image-archive', pair: '/sv/bildarkiv', lang: 'en', title: 'Image archive', desc: 'Searchable image archive: runestone drawings, churches, landmarks, history paintings and manuscripts — each with source and licence.' },
  { p: '/sv/de-laudibus', pair: '/en/de-laudibus', lang: 'sv', title: 'Liber de laudibus Sanctae Crucis', desc: 'Bläddringsbar utgåva av Hrabanus Maurus carmina figurata (De laudibus sanctae crucis) — public domain-blad ur Wikimedia Commons.' },
  { p: '/en/de-laudibus', pair: '/sv/de-laudibus', lang: 'en', title: 'Liber de laudibus Sanctae Crucis', desc: 'A page-turning edition of Hrabanus Maurus carmina figurata (De laudibus sanctae crucis) — public-domain leaves from Wikimedia Commons.' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (u) => ORIGIN + u;
// Kanonisk URL med SLUT-SNEDSTRECK för katalog-routes (Apache serverar /sv/ristare/ och 301:ar
// no-slash→slash → canonical/hreflang MÅSTE ha slash annars "canonicalised"/hreflang-non-200).
const canon = (u) => (u === '/' ? `${ORIGIN}/` : `${ORIGIN}${u}/`);

const tpl = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
let written = 0;

for (const page of PAGES) {
  const fullTitle = `${page.title} | ${SITE}`;
  const canonical = canon(page.p);
  const locale = page.lang === 'en' ? 'en_GB' : 'sv_SE';
  const alt = page.pair
    ? (page.lang === 'en'
        ? `  <link rel="alternate" hreflang="sv" href="${canon(page.pair)}" />\n  <link rel="alternate" hreflang="en" href="${canonical}" />\n  <link rel="alternate" hreflang="x-default" href="${canonical}" />\n`
        : `  <link rel="alternate" hreflang="sv" href="${canonical}" />\n  <link rel="alternate" hreflang="en" href="${canon(page.pair)}" />\n  <link rel="alternate" hreflang="x-default" href="${canon(page.pair)}" />\n`)
    : '';

  let html = tpl
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(page.desc)}" />`)
    // uppdatera OG (title+description) + lägg canonical/hreflang/og:url/lang
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(page.title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(page.desc)}" />`)
    .replace(/<html lang="[^"]*">/, `<html lang="${page.lang}">`)
    .replace('</head>', `  <link rel="canonical" href="${canonical}" />\n  <meta property="og:url" content="${canonical}" />\n  <meta property="og:locale" content="${locale}" />\n${alt}  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.desc, url: canonical, inLanguage: page.lang, isPartOf: { '@id': 'https://vikingage.se/#website' } })}</script>\n  </head>`);

  // <noscript>-innehåll för JS-lösa crawlers/agenter (SPA:n ersätter det när JS kör).
  const noscript = `<noscript><main><h1>${esc(page.title)}</h1><p>${esc(page.desc)}</p>`
    + `<p><a href="/">${SITE}</a> · <a href="/sitemap.xml">Sitemap</a> · <a href="/llms.txt">llms.txt</a>`
    + (page.pair ? ` · <a href="${page.pair}">${page.lang === 'en' ? 'Svenska' : 'English'}</a>` : '')
    + `</p></main></noscript>`;
  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);

  const outDir = page.p === '/' ? distPath : path.join(distPath, page.p);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  written++;
}

console.log(`✅ Meta-prerender: ${written} sidor med per-route titel/meta/hreflang/noscript.`);
