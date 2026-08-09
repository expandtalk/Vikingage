// YouTube-adapter: kanal (@handle) → uploads-spellista → ALLA videor med RIKTIGA watch?v=-ID + meta.
// Kräver YOUTUBE_API_KEY i .env (YouTube Data API v3). Consent-väggen gäller HTML-scraping, INTE API:t.
// Ingen gissning: video-ID/titel/datum/visningar kommer direkt från API:t. Idempotent på external_ref=yt:<id>.
// Kör: node ingest-youtube.mjs <source_ref> <@handle> [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const [, , SOURCE_REF, HANDLE] = process.argv;
const APPLY = process.argv.includes('--apply');
if (!SOURCE_REF || !HANDLE) { console.error('Usage: node ingest-youtube.mjs <source_ref> <@handle> [--apply]'); process.exit(1); }

const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const KEY = env.YOUTUBE_API_KEY;
if (!KEY) { console.error('Saknar YOUTUBE_API_KEY i .env. Aktivera "YouTube Data API v3" i Google Cloud Console → skapa API-nyckel → lägg i .env.'); process.exit(1); }

// Samma plats-/tema-ordlista som podd-ingestern (auto-taggning; FTS på titel+meta = svansen).
const DICT = [
  'birka','öland','gotland','kalmar','blekinge','halland','västmanland','östergötland','norrbotten',
  'västerbotten','dalarna','västernorrland','ångermanland','småland','skåne','stockholm','uppland','visby',
  'karlskrona','köpingsvik','skedemosse','sandby borg','gamla uppsala','uppåkra','anundshög','rosendal',
  'fornborg','runsten','runstenar','runor','hällristning','hällristningar','bildsten','gravfält','röse','rösen',
  'skeppssättning','vikingatid','vikingar','järnålder','bronsålder','stenålder','vendeltid','medeltid','ringmur',
  'kloster','kyrka','kyrkoruin','domkyrka','borg','marinarkeologi','vrak','järn','guld','offerplats','världsarv',
  'gustav iii','stormaktstiden','frihetstiden','1700-talet','byggnadsvård','pest','farsot',
];
const norm = s => (s || '').toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9\s]/g, ' ');
const DICT_N = DICT.map(t => ({ term: t, n: norm(t) }));

const api = async (path, params) => {
  const u = new URL('https://www.googleapis.com/youtube/v3/' + path);
  Object.entries({ ...params, key: KEY }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u); if (!r.ok) throw new Error(`${path} ${r.status}: ${await r.text()}`);
  return r.json();
};

async function main() {
  const handle = HANDLE.replace(/^@/, '');
  console.log(`Kanal @${handle}  (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
  const ch = await api('channels', { part: 'contentDetails,snippet', forHandle: handle });
  if (!ch.items?.length) throw new Error(`Hittade ingen kanal för @${handle}`);
  const uploads = ch.items[0].contentDetails.relatedPlaylists.uploads;

  const vids = [];
  let pageToken = '';
  do {
    const pl = await api('playlistItems', { part: 'snippet,contentDetails', playlistId: uploads, maxResults: 50, pageToken });
    for (const it of pl.items) vids.push({
      id: it.contentDetails.videoId, title: it.snippet.title,
      desc: (it.snippet.description || '').slice(0, 400),
      date: (it.contentDetails.videoPublishedAt || it.snippet.publishedAt || '').slice(0, 10) || null,
    });
    pageToken = pl.nextPageToken || '';
  } while (pageToken);

  // Visningar i batchar om 50
  const views = {};
  for (let i = 0; i < vids.length; i += 50) {
    const ids = vids.slice(i, i + 50).map(v => v.id).join(',');
    const st = await api('videos', { part: 'statistics', id: ids });
    for (const v of st.items) views[v.id] = parseInt(v.statistics?.viewCount || '0', 10);
  }
  vids.forEach(v => {
    v.views = views[v.id] ?? null;
    const hay = norm(v.title + ' ' + v.desc);
    v.terms = [...new Set(DICT_N.filter(d => new RegExp(`(^|\\s)${d.n}(\\s|$)`).test(hay)).map(d => d.term))];
  });

  console.log(`Videor: ${vids.length} · auto-taggade: ${vids.filter(v => v.terms.length).length} · ex: ${vids[0]?.title}`);
  if (!APPLY) { console.log('\nDRY-RUN — inget skrivet. --apply för att skriva.'); return; }

  const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });
  await c.connect();
  try {
    const { rows: sr } = await c.query('select id from media_sources where external_ref=$1', [SOURCE_REF]);
    if (!sr.length) throw new Error(`Okänd källa: ${SOURCE_REF} (seeda media_sources först)`);
    const srcId = sr[0].id; let ins = 0, links = 0;
    for (const v of vids) {
      const res = await c.query(
        `insert into media_items (source_id, medium, title, url, external_ref, published_at, view_count, summary_sv)
         values ($1,'youtube',$2,$3,$4,$5,$6,$7)
         on conflict (external_ref) do update set title=excluded.title, view_count=excluded.view_count,
           summary_sv=excluded.summary_sv, published_at=excluded.published_at returning id`,
        [srcId, v.title, `https://www.youtube.com/watch?v=${v.id}`, `yt:${v.id}`, v.date, v.views, v.desc]);
      const itemId = res.rows[0].id; ins++;
      for (const term of v.terms) {
        const lr = await c.query(
          `insert into media_topic_links (item_id, topic_term, relevance, origin)
           select $1,$2,1.0,'auto-keyword' where not exists (select 1 from media_topic_links where item_id=$1 and topic_term=$2)`,
          [itemId, term]);
        links += lr.rowCount;
      }
    }
    console.log(`\n✅ APPLY klar: ${ins} videor upsertade (riktiga watch?v=), ${links} nya topic_links.`);
  } finally { await c.end(); }
}
main().catch(e => { console.error(e.message); process.exit(1); });
