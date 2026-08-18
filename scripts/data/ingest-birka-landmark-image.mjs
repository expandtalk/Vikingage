import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
// Flygfoto: Birka med Borgberget + befästningsvallen. CC BY, Stockholms läns museum, Ingvar Lundkvist 1986.
// Hotlänkas från DigitaltMuseums EMS-bildserver (rehostas ej). LD97-0043 / DiMU 0210114040376. geom = genererad.
const url='https://ems.dimu.org/image/069ELggGVDTQN?dimension=1600x1600';
const exists=(await c.query(`select 1 from landmark_images where image_url like 'https://ems.dimu.org/image/069ELggGVDTQN%'`)).rowCount;
if(exists){ console.log('finns redan — hoppar.'); await c.end(); process.exit(0); }
await c.query(`insert into landmark_images
  (landmark_key, landmark_name, category, place_context, lat, lng, image_url, descr_url, title, caption, photographer, license_code, license_url, source_institution)
  values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
  ['birkaborgen','Birka — Borgberget','hillfort','Birka, Björkö (Ekerö)',59.332759,17.546047,
   url,'https://digitaltmuseum.org/0210114040376',
   'Birka med Borgberget och befästningsvallen (flygfoto)',
   'Flygfoto över Birka: på den öppna ytan bredde vikingastaden ut sig; bortom syns Borgberget med sin befästningsvall, och i skogen Hemlanden med ca 1600 gravar.',
   'Ingvar Lundkvist','CC BY','https://creativecommons.org/licenses/by/4.0/','Stockholms läns museum']);
console.log('koppling klar:', JSON.stringify((await c.query(`select landmark_key,title,license_code,source_institution from landmark_images where landmark_key='birkaborgen'`)).rows));
await c.end();
