// Länka forskarverk → LANDSKAP även via adjektiv-/stamformer (gotländsk→Gotland, öländsk→Öland…).
// Rotorsak till "Gotland works = 0": (1) titlar använder adjektivet "gotländsk" ≠ ordet "Gotland",
// (2) Gotland (m.fl. landskap) SAKNAS som nod i entity_registry. Här: säkerställ landskapsnoderna +
// länka på namn ELLER adjektivstam (ordgräns/prefix). Distinkt → låg brusrisk. Idempotent.
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

// label → regex-stammar (namn + adjektivstam). Prefix-stam "gotländ" fångar gotländsk/gotländska.
const LS = {
  'Gotland': ['gotland','gotländ','gutnisk','gutarnas','gutar\\M'],
  'Öland':   ['öland','öländ'],
  'Uppland': ['uppland','uppländ'],
  'Södermanland': ['södermanland','sörmländ','södermanländ'],
  'Östergötland': ['östergötland','östgöt','östergötländ'],
  'Västergötland': ['västergötland','västgöt','västergötländ'],
  'Skåne': ['skåne','skånsk'],
  'Småland': ['småland','småländ'],
  'Bohuslän': ['bohuslän','bohusländ'],
  'Halland': ['halland','halländ'],
  'Blekinge': ['blekinge','blekingsk'],
  'Närke': ['närke','närkes'],
  'Värmland': ['värmland','värmländ'],
  'Västmanland': ['västmanland','västmanländ'],
  'Dalarna': ['dalarna','dalarnas'],
  'Hälsingland': ['hälsingland','hälsing'],
  'Gästrikland': ['gästrikland','gästrik'],
  'Medelpad': ['medelpad'],
  'Ångermanland': ['ångermanland','ångermanländ'],
  'Jämtland': ['jämtland','jämtländ'],
  'Härjedalen': ['härjedalen'],
  'Dalsland': ['dalsland'],
};

let ensured = 0, linkedTotal = 0;
for (const [label, stems] of Object.entries(LS)) {
  // säkerställ landskapsnod
  let id = (await c.query(`select id from entity_registry where lower(label)=lower($1) and entity_type='landscape' limit 1`, [label])).rows[0]?.id;
  if (!id) {
    id = (await c.query(`insert into entity_registry (id, entity_type, label) values (gen_random_uuid(),'landscape',$1) returning id`, [label])).rows[0].id;
    ensured++; console.log('skapade landskapsnod', label);
  }
  const rx = '\\m(' + stems.join('|') + ')';
  const r = await c.query(
    `insert into source_entity_links (source_id, object_id, predicate)
     select s.sourceid, $1::uuid, 'studies' from sources s where s.title ~* $2
     on conflict (source_id, object_id) do nothing`, [id, rx]);
  if (r.rowCount) { linkedTotal += r.rowCount; console.log(`  ${label}: +${r.rowCount} länkar`); }
}
console.log(`\nnya landskapsnoder: ${ensured}, nya länkar: ${linkedTotal}`);
for (const t of ['Gotland','Öland','Västergötland','Bohuslän','Halland','Blekinge','Värmland']) {
  const r = await c.query(`select jsonb_array_length((entity_answer_context($1))->'works') n`, [t]);
  console.log(`  ${t}.works =`, r.rows[0].n);
}
await c.end();
