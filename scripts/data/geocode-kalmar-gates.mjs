// Geokoda Kalmarmurens portar i fort_element (geom = SWEREF99TM/3006).
// Västerport: verifierad koord (Krusenstiernska gården, WGS84 56°39'37"N 16°20'54"Ö) → uppgradera
//   till bevarat_ovan_mark (märken kvar enligt Daniel). Munkeporten: ny, vid dominikankonventet (SÖ),
//   koord = konventets SWEREF99TM (N6280092 E582802, ±100m). Torn kräver Pahr 1585-georef → EJ här.
// WGS84→SWEREF99TM via Lantmäteriets Gauss-konforma FRAMÅT-formler (GRS80). Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));

// ---- WGS84 (deg) → SWEREF99TM (N,E) ----
function toSweref(latDeg, lonDeg){
  const a=6378137, f=1/298.257222101, k0=0.9996, FN=0, FE=500000, lon0=15*Math.PI/180;
  const phi=latDeg*Math.PI/180, lam=lonDeg*Math.PI/180, dl=lam-lon0;
  const e2=f*(2-f), n=f/(2-f);
  const ah=a/(1+n)*(1+n*n/4+n**4/64);
  const A=e2, B=(5*e2**2-e2**3)/6, C=(104*e2**3-45*e2**4)/120, D=(1237*e2**4)/1260;
  const phistar=phi-Math.sin(phi)*Math.cos(phi)*(A+B*Math.sin(phi)**2+C*Math.sin(phi)**4+D*Math.sin(phi)**6);
  const xi=Math.atan(Math.tan(phistar)/Math.cos(dl));
  const eta=Math.atanh(Math.cos(phistar)*Math.sin(dl));
  const b1=n/2-2/3*n**2+5/16*n**3+41/180*n**4;
  const b2=13/48*n**2-3/5*n**3+557/1440*n**4;
  const b3=61/240*n**3-103/140*n**4;
  const b4=49561/161280*n**4;
  const N=k0*ah*(xi+b1*Math.sin(2*xi)*Math.cosh(2*eta)+b2*Math.sin(4*xi)*Math.cosh(4*eta)+b3*Math.sin(6*xi)*Math.cosh(6*eta)+b4*Math.sin(8*xi)*Math.cosh(8*eta))+FN;
  const E=k0*ah*(eta+b1*Math.cos(2*xi)*Math.sinh(2*eta)+b2*Math.cos(4*xi)*Math.sinh(4*eta)+b3*Math.cos(6*xi)*Math.sinh(6*eta)+b4*Math.cos(8*xi)*Math.sinh(8*eta))+FE;
  return { N, E };
}

// SJÄLVTEST: konventet WGS84 (ur tidigare invers av N6280092/E582802) ska ge tillbaka det
const t = toSweref(56.657636, 16.350714);
console.log(`Självtest konvent → N=${t.N.toFixed(1)} E=${t.E.toFixed(1)} (förväntat ~6280092 / 582802, diff N=${(t.N-6280092).toFixed(1)}m E=${(t.E-582802).toFixed(1)}m)`);

// Västerport: 56°39'37"N 16°20'54"Ö
const vlat=56+39/60+37/3600, vlon=16+20/60+54/3600;
const V = toSweref(vlat, vlon);
console.log(`Västerport (Krusenstiernska) WGS84 ${vlat.toFixed(6)},${vlon.toFixed(6)} → N=${V.N.toFixed(1)} E=${V.E.toFixed(1)}`);

if (Math.abs(t.N-6280092)>5 || Math.abs(t.E-582802)>5) { console.error('SJÄLVTEST FEL >5m — avbryter, transformen är fel.'); process.exit(1); }

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
try {
  await c.query('BEGIN');
  // Västerport → verifierat läge + evidensuppgradering (evidence=enum; verifieringen i name)
  const uv = await c.query(
    `update fort_element set geom=ST_SetSRID(ST_MakePoint($1,$2),3006),
       evidence_class='bevarat_ovan_mark', evidence='dokumenterad', pos_uncertainty_m=25,
       name='Västerport (Krusenstiernska gården — läge verifierat, portmärken kvar)'
     where element_type='port' and name ilike 'Västerport%'`, [V.E, V.N]);

  // Munkeporten → ny (vid konventet, SÖ); evidence=enum 'hypotetisk', beskrivning i name
  const exists = (await c.query(`select 1 from fort_element where element_type='port' and name ilike 'Munkeporten%'`)).rowCount;
  let im=0;
  if (!exists) {
    await c.query(
      `insert into fort_element (site, element_type, name, geom, evidence_class, evidence, published, pos_uncertainty_m)
       values ('Kalmar gamla stad','port','Munkeporten (gångport vid dominikankonventet, SÖ — läge = konventet ±100m)',
         ST_SetSRID(ST_MakePoint(582802,6280092),3006),'hypotetisk','hypotetisk', true, 100)`);
    im=1;
  }
  console.log(`Västerport uppdaterad: ${uv.rowCount}; Munkeporten ny: ${im}`);
  if (APPLY) { await c.query('COMMIT'); console.log('APPLIED (committed).'); }
  else { await c.query('ROLLBACK'); console.log('DRY RUN (rolled back). Kör med --apply.'); }
} catch(e){ await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode=1; }
finally { await c.end(); }
