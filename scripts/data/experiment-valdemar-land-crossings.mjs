// EXPERIMENT: "segla" Valdemars segelled och hitta var den går över LAND (fel att korrigera).
// Testar varje ruttpunkt + samplade mellanpunkter mot Sveriges landpolygoner (admin_boundaries).
// En segelled ska ligga på VATTEN → punkt inuti en landpolygon = fel. Rapporterar bara — rättar inte.
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

// Introspektera admin_boundaries: nivåkolumn + geometrikolumn.
const cols = await c.query(`select column_name, data_type from information_schema.columns where table_schema='public' and table_name='admin_boundaries' order by ordinal_position`);
const colNames = cols.rows.map(r=>r.column_name);
console.log('admin_boundaries cols:', colNames.join(', '));
const geomCol = colNames.includes('geom') ? 'geom' : (colNames.includes('geometry') ? 'geometry' : null);
const levelCol = ['admin_level','level','type','boundary_level','kind'].find(x=>colNames.includes(x)) || null;
console.log('geomCol:', geomCol, '| levelCol:', levelCol);
if (!geomCol) { console.log('INGEN geometrikolumn — avbryter'); await c.end(); process.exit(0); }
if (levelCol) { const lv = await c.query(`select ${levelCol}, count(*) from admin_boundaries group by 1 order by 2 desc`); console.log('levels:'); lv.rows.forEach(r=>console.log('  ',JSON.stringify(r))); }

// Landmask = kommunpolygoner om de finns (följer kustlinjen), annars alla polygoner.
// Vi testar "punkt inuti NÅGON landpolygon" = på land.
const landFilter = levelCol ? `where (${levelCol}::text ilike '%kommun%' or ${levelCol}::text ilike '%municip%')` : '';
const nLand = await c.query(`select count(*) n from admin_boundaries ${landFilter}`);
const useFilter = Number(nLand.rows[0].n) > 50 ? landFilter : '';
console.log('landmask-polygoner:', useFilter ? nLand.rows[0].n+' (kommun)' : 'alla');

const onLand = async (lat, lng) => {
  const r = await c.query(
    `select exists(select 1 from admin_boundaries ${useFilter ? useFilter+' and' : 'where'}
       ST_Contains(${geomCol}, ST_SetSRID(ST_MakePoint($1,$2),4326))) hit`, [lng, lat]);
  return r.rows[0].hit;
};

// Ruttpunkter i ordning.
const pts = (await c.query(`select seq, name, lat, lng, section from valdemar_route_points
  where lat is not null and lng is not null order by seq asc nulls last`)).rows;
console.log('\nruttpunkter:', pts.length);

// 1) Punkter som ligger på land.
const badPoints = [];
for (const p of pts) { if (await onLand(p.lat, p.lng)) badPoints.push(p); }

// 2) Segment som korsar land (sampla 9 inre punkter mellan varje par).
const badSegs = [];
for (let i=0;i<pts.length-1;i++){
  const a=pts[i], b=pts[i+1];
  let landHits=0;
  for (let s=1;s<=9;s++){ const t=s/10; if (await onLand(a.lat+(b.lat-a.lat)*t, a.lng+(b.lng-a.lng)*t)) landHits++; }
  if (landHits>=2) badSegs.push({from:a,to:b,landHits});
}

console.log('\n===== PUNKTER PÅ LAND (', badPoints.length, ') =====');
badPoints.forEach(p=>console.log(`  seq ${p.seq} · ${p.name ?? '(namnlös)'} · ${p.lat.toFixed(4)},${p.lng.toFixed(4)} · ${p.section??''}`));
console.log('\n===== SEGMENT SOM KORSAR LAND (', badSegs.length, ') =====');
badSegs.forEach(s=>console.log(`  seq ${s.from.seq}→${s.to.seq} · "${s.from.name??'?'}"→"${s.to.name??'?'}" · ${s.landHits}/9 inre punkter på land`));
console.log('\n(Rapport endast — inga ändringar gjorda.)');
await c.end();
