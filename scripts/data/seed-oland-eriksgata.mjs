// Öland som egen maktsfär (ringborgs-ö, tidig kyrklig konsolidering) + Eriksgata-koppling.
// Ringborgskoord hämtas ur swedish_hillforts (coordinates {x,y}) — inga påhittade. Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();
try{
  await c.query('BEGIN');
  // 1) Karlevi: dansk sfär -> Öland (egen autonom öbygd)
  await c.query(`update elite_monuments set sphere='oland' where name='Karlevistenen'`);
  // 2) Öland-ringborgar ur swedish_hillforts (verifierade koord i DB)
  const forts=(await c.query(`select name, coordinates[1] lat, coordinates[0] lng
    from swedish_hillforts where name in ('Gråborg','Eketorps borg','Ismantorps borg','Sandby borg') and coordinates is not null`)).rows;
  const META={
    'Gråborg':['~500–1200 (medeltida S:t Knuts kapell intill)','Ölands största ringborg + medeltida kapell — kontinuitet borg→kristen kult'],
    'Eketorps borg':['~300–1300 (tre faser)','Rekonstruerad ringborg; boplats→garnison — öns försvarssystem'],
    'Ismantorps borg':['~200–600','9 portar — kult/tings-tolkning debatterad'],
    'Sandby borg':['~400–550','Massakern ~480 e.Kr. — infrusen ögonblicksbild av folkvandringstidens våld'],
  };
  let f=0;
  for(const {name,lat,lng} of forts){
    const [dating,note] = META[name];
    const link=`/explore?center=${lat.toFixed(4)},${lng.toFixed(4)}&zoom=13`;
    await c.query(`insert into elite_monuments (name,kind,signum,lat,lng,dating,landscape,association,influence,note,source,link,sphere)
      values ($1,'ringborg',null,$2,$3,$4,'Öland','del av Ölands ö-täckande ringborgssystem','—',$5,'Koord ur swedish_hillforts (RAÄ)',$6,'oland')
      on conflict (name) do update set kind=excluded.kind, lat=excluded.lat, lng=excluded.lng, dating=excluded.dating,
        landscape=excluded.landscape, association=excluded.association, note=excluded.note, link=excluded.link, sphere=excluded.sphere`,
      [name,lat,lng,dating,note,link]);
    f++;
  }
  // 3) Eriksgata-avstånd: linje ur road_waypoints -> avstånd till varje node
  const upd=await c.query(`
    with wp as (select coordinates[0] x, coordinates[1] y, waypoint_order o
                from road_waypoints where road_id='1b585094-beec-43ee-9cb2-0c3a40bb0323' and coordinates is not null),
         line as (select ST_MakeLine(ST_SetSRID(ST_MakePoint(x,y),4326) order by o) g from wp)
    update elite_monuments e set eriksgata_km =
      round((ST_Distance((select g from line)::geography, ST_SetSRID(ST_MakePoint(e.lng,e.lat),4326)::geography)/1000)::numeric,1)
    where e.lat is not null returning e.name, e.eriksgata_km`);
  console.log(`ringborgar: ${f}, Karlevi→Öland-sfär, eriksgata_km satt på ${upd.rowCount} noder`);
  console.log('Närmast Eriksgatan:', upd.rows.filter(r=>r.eriksgata_km!=null).sort((a,b)=>a.eriksgata_km-b.eriksgata_km).slice(0,6).map(r=>`${r.name} ${r.eriksgata_km}km`).join(' | '));
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
