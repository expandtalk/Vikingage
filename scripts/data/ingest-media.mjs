// Generisk medieingester: podcast-RSS (Podbean/Acast) → media_items + auto topic_links.
// Riktiga per-avsnitts-permalänkar + meta + datum + speltid ur feeden (ingen gissning).
// Auto-taggar mot en plats-/tema-ordlista (precision); FTS på titel+meta sköter svansen (recall).
// Idempotent på external_ref = avsnittets <link>. Kör: node ingest-media.mjs <source_ref> <rss_url> [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const [, , SOURCE_REF, RSS_URL] = process.argv;
const APPLY = process.argv.includes('--apply');
if (!SOURCE_REF || !RSS_URL) { console.error('Usage: node ingest-media.mjs <source_ref> <rss_url> [--apply]'); process.exit(1); }

const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));

// Plats-/tema-ordlista (vår domän). term → matchas som ordgräns i titel+meta (unaccent-normaliserat).
const DICT = [
  // landskap/platser
  'birka','öland','gotland','kalmar','blekinge','halland','västmanland','östergötland','norrbotten',
  'västerbotten','dalarna','västernorrland','ångermanland','småland','skåne','stockholm','uppland',
  'karlskrona','köpingsvik','skedemosse','rösaringsåsen','elleholm','kristianopel','visingsö','sollerön',
  'nämforsen','falun','varberg','lojsta','västervik','gamleby','mörrumsån','styresholm','stensjö',
  'hietaniemi','atoklimpen','dagsmosse','tjolöholm','ronneby','drottningskär','gribshunden','sandby borg',
  'gamla uppsala','hovgården','björkö','hallunda','jordbro','motala','pryssgården','uppåkra','anundshög',
  // teman/perioder
  'fornborg','runsten','runstenar','runor','hällristning','hällristningar','hällmålning','gravfält',
  'röse','rösen','skeppssättning','vikingatid','vikingar','järnålder','bronsålder','stenålder','mesolitikum',
  'neolitikum','vendeltid','folkvandringstid','medeltid','kloster','kyrka','kyrkoruin','domkyrka','borg',
  'marinarkeologi','vrak','skeppsvrak','järnframställning','järn','stenhuggeri','gruva','världsarv',
  'metalldetektering','osteologi','dendrokronologi','keramik','solidus','guld','offerplats','kulthus',
  'stadsarkeologi','byggnadsminne','fäbod','skånska kriget','avrättningsplats','galgbacke',
];
const norm = s => (s || '').toLowerCase()
  .replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[éè]/g, 'e').replace(/[^a-z0-9\s]/g, ' ');
const DICT_N = DICT.map(t => ({ term: t, n: norm(t) }));

function strip(html) {
  return (html || '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1] : '';
}
function durationToSec(d) {
  d = strip(d); if (!d) return null;
  if (/^\d+$/.test(d)) return parseInt(d, 10);
  const p = d.split(':').map(Number); if (p.some(isNaN)) return null;
  return p.reverse().reduce((a, v, i) => a + v * 60 ** i, 0);
}

const UA = { 'User-Agent': 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)' };
const fetchXml = async url => (await fetch(url, { headers: UA })).text();
function parseRows(xml) {
  const items = xml.split(/<item[>\s]/).slice(1).map(b => '<item ' + b.split('</item>')[0] + '</item>');
  return items.map(b => {
    const title = strip(pick(b, 'title'));
    const link = (strip(pick(b, 'link')) || strip(pick(b, 'guid'))).split('?')[0].replace(/&#0*38;/g, '&');
    const pub = strip(pick(b, 'pubDate'));
    const dur = durationToSec(pick(b, 'itunes:duration'));
    const desc = strip(pick(b, 'description') || pick(b, 'content:encoded'));
    const date = pub ? new Date(pub).toISOString().slice(0, 10) : null;
    const hay = norm(title + ' ' + desc);
    const terms = [...new Set(DICT_N.filter(d => new RegExp(`(^|\\s)${d.n}(\\s|$)`).test(hay)).map(d => d.term))];
    return { title, link, date, dur, summary: desc.slice(0, 400), terms };
  }).filter(r => r.title && r.link && /^https?:/.test(r.link));
}

async function main() {
  console.log(`Hämtar: ${RSS_URL}  (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
  let rows = [];
  if (/\/feed\/?$/.test(RSS_URL)) {                 // WordPress-feed → paginera ?paged=N
    const base = RSS_URL.replace(/\/?$/, '/'); const seen = new Set();
    for (let p = 1; p <= 70; p++) {
      const pr = parseRows(await fetchXml(`${base}?paged=${p}`));
      const fresh = pr.filter(r => !seen.has(r.link));
      if (!fresh.length) break;
      fresh.forEach(r => seen.add(r.link)); rows.push(...fresh);
    }
  } else {
    rows = parseRows(await fetchXml(RSS_URL));
  }

  const tagged = rows.filter(r => r.terms.length).length;
  console.log(`Avsnitt: ${rows.length} · auto-taggade: ${tagged} · länkexempel: ${rows[0]?.link}`);
  console.log('Toppermer:', Object.entries(rows.flatMap(r => r.terms).reduce((a, t) => (a[t] = (a[t] || 0) + 1, a), {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 15).map(([t, n]) => `${t}:${n}`).join(', '));

  if (!APPLY) { console.log('\nDRY-RUN — inget skrivet. Lägg till --apply för att skriva.'); return; }
  const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });
  await c.connect();
  try {
    const { rows: sr } = await c.query('select id, medium from media_sources where external_ref=$1', [SOURCE_REF]);
    if (!sr.length) throw new Error(`Okänd källa: ${SOURCE_REF} (seeda media_sources först)`);
    const srcId = sr[0].id, medium = sr[0].medium;
    let ins = 0, links = 0;
    for (const r of rows) {
      const res = await c.query(
        `insert into media_items (source_id, medium, title, url, external_ref, published_at, duration_seconds, summary_sv)
         values ($1,$2,$3,$4,$4,$5,$6,$7)
         on conflict (external_ref) do update set summary_sv=excluded.summary_sv, published_at=excluded.published_at,
           duration_seconds=excluded.duration_seconds returning id`,
        [srcId, medium, r.title, r.link, r.date, r.dur, r.summary]);
      const itemId = res.rows[0].id; ins++;
      for (const term of r.terms) {
        const lr = await c.query(
          `insert into media_topic_links (item_id, topic_term, relevance, origin)
           select $1,$2,1.0,'auto-keyword'
           where not exists (select 1 from media_topic_links where item_id=$1 and topic_term=$2)`,
          [itemId, term]);
        links += lr.rowCount;
      }
    }
    console.log(`\n✅ APPLY klar: ${ins} avsnitt upsertade, ${links} nya topic_links.`);
  } finally { await c.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
