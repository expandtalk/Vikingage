// PILOT: svenska arkeologiprofessorer → research_scholars + sources (verk).
// Verifierat mot Wikidata (Q-id + liv/affiliation); INGEN GISSNING. Facta fritt, Wikipedia-prosa EJ
// kopierad (biografi = egen kort faktatext). ISBN endast där verifierat, annars null (aldrig gissat).
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

// sourceid-typ (memory: bytea) → generera deterministiskt decode(md5(...),'hex') om ingen default.
const sc = await c.query(`select data_type, column_default from information_schema.columns where table_schema='public' and table_name='sources' and column_name='sourceid'`);
const sidBytea = /bytea/i.test(sc.rows[0]?.data_type || '') && !sc.rows[0]?.column_default;
console.log('sources.sourceid:', sc.rows[0]?.data_type, '| genererar själv:', sidBytea);

const scholars = [
  {
    name: 'Almgren, Oscar', ext: 'wikidata:Q1064466', aff: 'Uppsala universitet',
    role: 'Professor i arkeologi (Uppsala)', period: '1869–1945', status: 'avliden',
    bio: 'Svensk arkeolog, professor i Uppsala. Grundade en fibulatypologi ("Almgren-typerna", 1897) som fortfarande används i kronologi för romersk järnålder; forskade även om hällristningar och kultbruk.',
    works: [
      { title: 'Studien über nordeuropäische Fibelformen der ersten nachchristlichen Jahrhunderte', year: 1897, pub: 'Stockholm (nytryck Leipzig 1923)', type: 'dissertation', isbn: null },
      { title: 'Hällristningar och kultbruk. Bidrag till belysning av de nordiska bronsåldersristningarnas innebörd', year: 1927, pub: 'Stockholm', type: 'book', isbn: null },
      { title: 'Nordische Felszeichnungen als religiöse Urkunden', year: 1934, pub: 'Frankfurt am Main', type: 'book', isbn: null },
    ],
  },
  {
    name: 'Almgren, Bertil', ext: 'wikidata:Q5547358', aff: 'Uppsala universitet',
    role: 'Professor i arkeologi (Uppsala)', period: '1918–2011', status: 'avliden',
    bio: 'Svensk arkeolog, professor i Uppsala. Arbetade med stilteori, kronologisk källkritik och datering av hällristningar.',
    works: [
      { title: 'Bronsnycklar och djurornamentik vid övergången från vendeltid till vikingatid', year: 1955, pub: 'Uppsala', type: 'dissertation', isbn: null },
      { title: 'Die Datierung bronzezeitlicher Felszeichnungen in Westschweden', year: 1987, pub: 'Uppsala', type: 'book', isbn: null },
    ],
  },
  {
    name: 'Ambrosiani, Björn', ext: 'wikidata:Q5548627', aff: 'Riksantikvarieämbetet / Statens historiska museum (Birkaprojektet)',
    role: 'Arkeolog — ledde Birkaundersökningarna', period: 'f. 1928', status: null,
    bio: 'Svensk arkeolog vid Riksantikvarieämbetet/SHM; ledde de moderna Birkaundersökningarna (Svarta jorden) och forskade om vendeltida båtgravar och vikingatida städer.',
    works: [
      { title: 'Fornlämningar och bebyggelse. Studier i Attundalands och Södertörns förhistoria', year: 1964, pub: 'Uppsala', type: 'dissertation', isbn: null },
      { title: 'Regalia and symbols in the boat-graves (i Vendel Period Studies)', year: 1983, pub: 'Statens historiska museum, Stockholm', type: 'article', isbn: '978-91-7192-547-3' },
      { title: 'Birka Vikingastaden, vol. 1–5', year: 1991, pub: 'Riksantikvarieämbetet / SHM', type: 'book', isbn: null },
      { title: 'Towns in the Viking Age (med Helen Clarke)', year: 1991, pub: 'Leicester University Press', type: 'book', isbn: null },
    ],
  },
];

for (const s of scholars) {
  let id;
  const ex = await c.query(`select id from research_scholars where external_ref=$1 or name=$2 limit 1`, [s.ext, s.name]);
  if (ex.rows.length) {
    id = ex.rows[0].id;
    await c.query(`update research_scholars set affiliation=$2, role_title=$3, active_period=$4, life_status=$5, biography=$6, external_ref=$7, source=$8 where id=$1`,
      [id, s.aff, s.role, s.period, s.status, s.bio, s.ext, 'Wikidata (' + s.ext.split(':')[1] + ') + egen bibliografi']);
    console.log('uppdaterade', s.name, id);
  } else {
    const r = await c.query(`insert into research_scholars (name, affiliation, role_title, active_period, life_status, biography, external_ref, source) values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [s.name, s.aff, s.role, s.period, s.status, s.bio, s.ext, 'Wikidata (' + s.ext.split(':')[1] + ') + egen bibliografi']);
    id = r.rows[0].id;
    console.log('la in', s.name, id);
  }
  for (const w of s.works) {
    const exists = await c.query(`select 1 from sources where title=$1 and scholar_id=$2 limit 1`, [w.title, id]);
    if (exists.rows.length) { console.log('  (finns)', w.title.slice(0,40)); continue; }
    const sidExpr = sidBytea ? `decode(md5($7),'hex')` : `default`;
    if (sidBytea) {
      await c.query(`insert into sources (title, author, publication_year, publisher, isbn, source_type, scholar_id, sourceid) values ($1,$2,$3,$4,$5,$6,$8, decode(md5($7),'hex'))`,
        [w.title, s.name, w.year, w.pub, w.isbn, w.type, w.title + '|' + s.name, id]);
    } else {
      await c.query(`insert into sources (title, author, publication_year, publisher, isbn, source_type, scholar_id) values ($1,$2,$3,$4,$5,$6,$7)`,
        [w.title, s.name, w.year, w.pub, w.isbn, w.type, id]);
    }
    console.log('  + verk:', w.title.slice(0,45), w.year, w.isbn ? 'ISBN='+w.isbn : '');
  }
}

console.log('\n=== verifiering ===');
const v = await c.query(`select rs.name, rs.external_ref, count(s.*) n_works from research_scholars rs left join sources s on s.scholar_id=rs.id where rs.external_ref like 'wikidata:%' and rs.name in ('Almgren, Oscar','Almgren, Bertil','Ambrosiani, Björn') group by 1,2 order by 1`);
v.rows.forEach(r=>console.log(' ', r.name, '·', r.external_ref, '·', r.n_works, 'verk'));
await c.end();
