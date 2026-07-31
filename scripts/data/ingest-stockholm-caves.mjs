// Ingest av Länsstyrelsen Stockholms grottinventering (Söderstam & Westman, "Grottor i
// Stockholms län", 1984) → heritage_sites som raa_type='naturgrotta'. Rikets nät (RT90 2.5
// gon V) → WGS84 via Lantmäteriets Gauss-Krüger. Rekreativt värde (R1–R3) → place_signals
// 'sight' (rapporten har redan bedömt sevärdheten). Koordinater trunkerade till 100 m i
// rapporten → läge ~±100 m, flaggas approximativt.
// Kör: node scripts/data/ingest-stockholm-caves.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));

// RT90 2.5 gon V → WGS84 (Lantmäteriet, direkt-parametrar).
function rt90ToWgs84(x, y) {
  const axis = 6378137.0, flat = 1/298.257222101;
  const cm = 15.806284529444, k0 = 1.00000561024, fn = -667.711, fe = 1500064.274;
  const e2 = flat*(2-flat), n = flat/(2-flat);
  const aRoof = axis/(1+n)*(1+n*n/4+n*n*n*n/64);
  const d1=n/2-2*n*n/3+37*n*n*n/96-n*n*n*n/360, d2=n*n/48+n*n*n/15-437*n*n*n*n/1440,
        d3=17*n*n*n/480-37*n*n*n*n/840, d4=4397*n*n*n*n/161280;
  const As=e2+e2**2+e2**3+e2**4, Bs=-(7*e2**2+17*e2**3+30*e2**4)/6,
        Cs=(224*e2**3+889*e2**4)/120, Ds=-(4279*e2**4)/1260;
  const R=Math.PI/180, l0=cm*R;
  const xi=(x-fn)/(k0*aRoof), eta=(y-fe)/(k0*aRoof);
  const ch=Math.cosh, sh=Math.sinh;
  const xiP=xi-d1*Math.sin(2*xi)*ch(2*eta)-d2*Math.sin(4*xi)*ch(4*eta)-d3*Math.sin(6*xi)*ch(6*eta)-d4*Math.sin(8*xi)*ch(8*eta);
  const etaP=eta-d1*Math.cos(2*xi)*sh(2*eta)-d2*Math.cos(4*xi)*sh(4*eta)-d3*Math.cos(6*xi)*sh(6*eta)-d4*Math.cos(8*xi)*sh(8*eta);
  const phiS=Math.asin(Math.sin(xiP)/ch(etaP));
  const dl=Math.atan(sh(etaP)/Math.cos(xiP));
  const lon=(l0+dl)/R;
  const lat=(phiS+Math.sin(phiS)*Math.cos(phiS)*(As+Bs*Math.sin(phiS)**2+Cs*Math.sin(phiS)**4+Ds*Math.sin(phiS)**6))/R;
  return [lat, lon];
}

// [namn, grottyp, X(nord), Y(öst), rekreativt värde 1-3, kulturhistoria/not]
const CAVES = [
  ['Berghuset','glacial blockgrotta',6533500,1607800,1,'Beskriven 1828 (Ekström); sägen om kungadotter, vikingaskatt-tradition. Länets största glaciala blockgrotta.'],
  ['Knappelskärsgrottan','abrasionssprickgrotta (tunnelgrotta)',6529300,1622700,2,'Länets största tunnelgrotta; bildad för 800–900 år sedan.'],
  ['Kärleksgrottan','tektonisk sprickgrotta',6530600,1623100,3,null],
  ['Recenta strandgrottan på Nåttarö','abrasionssprickgrotta (tunnelgrotta)',6530500,1634300,2,'Enda kända aktiva tunnelgrottan i länet.'],
  ['Drottningstugan','abrasions-/frostvittringsgrotta',6530800,1634000,1,'Maria Eleonora gömde sig här 1640; Gustav II Adolfs hjärta grävt i sanden utanför (sägen).'],
  ['Fruberget (Frugrottan)','tektonisk sprickgrotta',6544200,1606800,2,'Botvid-legend; trollsägner; grottlabyrint (klätterutrustning krävs).'],
  ['Grottberget','tektonisk blockgrotta',6542500,1594700,1,'Uppemot 100 grottobjekt; fornborg på toppen.'],
  ['Bergskyrkan','frostvittringsblockgrotta',6547700,1595400,2,'Stor sal, två ljusschakt; träkors på huvudblocket.'],
  ['Bergskyrkans annex','frostvittringsblockgrotta',6548100,1595800,3,null],
  ['Långmossgrottan','frostvittringsblockgrotta',6552700,1596300,3,null],
  ['Tingstaviksgrottan','frostvittringsblockgrotta',6558200,1596200,3,'Använd för hembränning; eldstad i grottrummet.'],
  ['Varghålan vid Bårsjöflyet','glacial blockgrotta',6568600,1593600,3,'Gammal varglya; sista vargen i Turingetrakten sköts 1850-talet.'],
  ['Sankt Botvids grotta','tektonisk sprickgrotta',6570400,1618400,2,'Ovanlig rent tektonisk sprickgrotta; kaminklättring.'],
  ['Nysättragrottan','frostvittringssprickgrotta',6568200,1628000,3,'Vittra-sägen (1850-talet); fornborg intill.'],
  ['Mellanbergsgrottan','tektonisk sprickgrotta',6568500,1628400,3,null],
  ['Mörtsjögrottan','frostvittringsblockgrotta',6567900,1627500,3,null],
  ['Skarpnäcksgrottan','tektonisk blockgrotta',6573400,1633900,2,'Fornborg ovanför; nära Flatenbadet.'],
  ['Östra Klövbergsgrottan','tektonisk blockgrotta',6568600,1645300,3,'Länets största grottkomplex (~300 m), en av Sveriges längsta urbergsgrottor. Högt skyddsvärde.'],
  ['Västra Klövbergsgrottan','tektonisk blockgrotta',6568900,1645200,3,'Fem salar; länets finaste knoppsinterbildning.'],
  ['Karstgrottan vid Hemträsk','karstgrotta',6556200,1652200,3,'Enda kända karstgrottan i Stockholms län (urkalksten), Ornö.'],
  ['Sopgrottan på Långviksskär','tektonisk blockgrotta',6563200,1671600,3,null],
  ['Blockgrottan på Bullerö','glacial blockgrotta',6568800,1673800,2,'Bullerö naturreservat (Bruno Liljefors).'],
  ['Strandgrottan på Sandön','abrasionssprickgrotta (tunnelgrotta)',6578100,1676800,3,'Naturminne sedan 1959.'],
  ['Skevikarnas grotta','klyfta (ej egentlig grotta)',6583200,1646500,1,'Skevikarna-sekten höll gudstjänst här på 1700-talet. Naturreservat sedan 1949.'],
  ['Grottan i Hagaparken','antropogen grotta',6584400,1614400,2,'Byggd 1788–99 av ryska krigsfångar i Gustav III:s lustpark.'],
  ['Blockgrottan i Judarnskogen','frostvittringsblockgrotta',6581200,1611500,3,'Storblockig moränsträng ovan sjön Judarn (koordinat rekonstruerad ur skev OCR).'],
  ['Gåsbergsgrottan','tektonisk sprickgrotta',6588500,1611200,3,'Nedanför fornborgen Gåseborg.'],
  ['Grottorna vid Norrviken','frostvittringssprickgrotta',6594200,1621200,3,'Nära fornborg vid Tunberget.'],
  ['Birgitta bönegrotta','frostvittringsblockgrotta',6627400,1651300,2,'Heliga Birgittas första uppenbarelse (Finsta); träkors till minne.'],
  ['Kasbergsgrottorna','tektoniska sprickgrottor',6653500,1669500,2,'Tre grottor i Kasbergets sydbrant, Väddö.'],
  ['Strandgrottan vid Nothamn','abrasionsgrotta',6661000,1669700,3,'Urkalksten; nisch 2,5 m ovan havet.'],
  ['Gillberga gryt','tektonisk blockgrotta',6657200,1651200,1,'En av landets mest kända urbergsgrottor; neotektonik (jordskalv v. landhöjning). Naturminne sedan 1963.'],
];
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const R_SIGHT = { 1: 1.0, 2: 0.6, 3: 0.3 };

const c = new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
try {
  let ins=0, sig=0;
  for (const [name, type, x, y, r, note] of CAVES) {
    const [lat, lng] = rt90ToWgs84(x, y);
    const ok = lat>58.5 && lat<60.5 && lng>16.0 && lng<19.5;   // sanity: Stockholms län
    const landscape = lat >= 59.32 ? 'Uppland' : 'Södermanland';
    const desc = `${type[0].toUpperCase()+type.slice(1)}.${note?' '+note:''} Rekreativt värde R${r} (Länsstyrelsen). OBS: besök på egen risk. Källa: Länsstyrelsen Stockholm, Söderstam & Westman, »Grottor i Stockholms län« 1984.`;
    const uri = `lansstyrelsen-ab-1984/${slug(name)}`;
    console.log(`${ok?'✓':'⚠ '} ${name.padEnd(34)} ${lat.toFixed(4)},${lng.toFixed(4)} ${landscape} R${r}`);
    if (!ok) { console.log(`   ⚠ utanför förväntat område — hoppas över`); continue; }
    if (APPLY) {
      const res = await c.query(
        `INSERT INTO heritage_sites (raa_type,name,landscape,municipality,lat,lng,description,source_uri,register_system,evidence_class)
         VALUES ('naturgrotta',$1,$2,'Stockholms län',$3,$4,$5,$6,'Länsstyrelsen Stockholm 1984','namn')
         ON CONFLICT (source_uri) DO NOTHING RETURNING id`, [name, landscape, lat, lng, desc, uri]);
      if (res.rowCount) {
        ins++;
        await c.query(
          `INSERT INTO place_signals (entity_type,entity_id,signal,value,source)
           VALUES ('heritage',$1,'sight',$2,'Länsstyrelsen rekreativt värde')
           ON CONFLICT (entity_type,entity_id,signal) DO NOTHING`, [res.rows[0].id, R_SIGHT[r]]);
        sig++;
      }
    }
  }
  console.log(`\n${APPLY?`APPLY: ${ins} grottor, ${sig} rank-signaler.`:'DRY-RUN (kör --apply för att skriva).'}`);
} finally { await c.end(); }
