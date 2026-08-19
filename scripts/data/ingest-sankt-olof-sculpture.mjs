// St Olof-skulptur (Västernorrlands museum, CC BY) → church_artworks (artwork_type='skulptur').
// Hotlänkad DigitaltMuseum-bild (aldrig rehostad; Licens CC BY = OK). Identiteten markeras OSÄKER —
// källan säger själv att attributen saknas → "möjligen Sankt Olof" (INGEN GISSNING).
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();
const row = {
  artwork_type:'skulptur',
  title:'Helgonkonung, möjligen Sankt Olof (träskulptur)',
  motif:'Stående helgonkonung; attribut (yxa, riksäpple/ciborium) saknas → identiteten osäker, tolkas ofta som Sankt Olof',
  dating_text:'1450–1499 (senare hälften av 1400-talet)', year_from:1450, year_to:1499,
  material:'Trä — hugget, bemålat, förgyllt',
  condition:'Kronans tinnar, större delen av högerhanden, vänsterarmen och delar av fotstycket saknas; väl bibehållen förgyllning och blått',
  image_url:'https://dms-cf-06.dimu.org/image/013Ajt3CZJ1c?dimension=1200x1200',
  image_attribution:'Västernorrlands museum (CC BY) — DigitaltMuseum D00038',
  source:'Västernorrlands museums föremålssamling (DigitaltMuseum)',
  source_url:'https://digitaltmuseum.se/0210211481572/skulptur',
  license:'CC BY',
  notes:'Senmedeltida helgonskulptur (h. 43 cm). Kungafiguren saknar attribut, varför identiteten är OSÄKER — men den tolkas ofta som Sankt Olof (vars kult var stark i Norrland redan i början av 1200-talet). Oxmuleskor och stark polykromi (blått/guld/grönt/svart) är typiska för den senmedeltida konsten i Norrland. Har tillhört ett altare.',
};
const ex = await c.query(`select id from church_artworks where source_url=$1 limit 1`, [row.source_url]);
if (ex.rows.length) { console.log('finns redan:', ex.rows[0].id); }
else {
  const ks = Object.keys(row), ph = ks.map((_,i)=>`$${i+1}`);
  const r = await c.query(`insert into church_artworks (${ks.join(',')}) values (${ph.join(',')}) returning id`, Object.values(row));
  console.log('inlagd i church_artworks:', r.rows[0].id, '· artwork_type=skulptur · CC BY hotlänkad');
}
await c.end();
