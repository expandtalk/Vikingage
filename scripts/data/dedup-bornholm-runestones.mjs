// dedup-bornholm-runestones.mjs
// -----------------------------------------------------------------------------
// De-duplicerar Bornholms runstenar i runic_inscriptions. Samma fysiska sten
// fanns dubblerad under två signumsystem: gamla DR (Danmarks Runeindskrifter
// 1942, DR 368–409) och nya DK Bh (Nationalmuseets Danske Runeindskrifter,
// DK Bh 1–35). Crosswalken finns REDAN i vår egen data — varje DR-rad bär
// DK Bh-numret i alternative_signum (importerat ur Rundata) — och är dessutom
// DUBBELVERIFIERAD mot arild-hauge.com:s auktoritativa DR↔DK Bh-tabell (nedan).
//
// ICKE-DESTRUKTIVT & REVERSIBELT: inga rader raderas. Den kanoniska raden blir
// DK Bh (nuvarande standard); DR-dubbletten får superseded_by = DK Bh-radens id
// (→ undantas från kartvyn och count_runestones()). Återställ genom att nolla
// superseded_by. Idempotent — kan köras om utan bieffekter.
//
// SÄKERHETSGRIND: en DR-rad slås bara samman om dess signum EXAKT matchar det
// DR-nummer som den auktoritativa tabellen anger för DK Bh-numret. Allt annat
// lämnas OSAMMANFOGAT och rapporteras som "needs manual review" — vi tvingar
// aldrig fram en sammanslagning på svag evidens.
//
// Kör:  node scripts/data/dedup-bornholm-runestones.mjs           (dry-run)
//       node scripts/data/dedup-bornholm-runestones.mjs --apply   (skriver)
// -----------------------------------------------------------------------------
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');

// Auktoritativ crosswalk: DK Bh-nr → { dr: 'DR NNN', name }. Källa: arild-hauge.com
// "DK Bh – Bornholm" (verifierad 2026-07-31), korsvaliderad mot vår egen
// alternative_signum (Rundata) samt Wikidata P625 för Brogårdsstenen (DR 401).
// Endast poster där både en DK Bh-rad OCH en DR-rad finns i DB tas upp här.
const AUTH = {
  1:  { dr: 'DR 399', name: 'Klemensker-sten 1' },
  2:  { dr: 'DR 400', name: 'Klemensker-sten 2' },
  3:  { dr: 'DR 401', name: 'Brogårdsstenen', forceName: true }, // Klemensker-sten 3; störst på Bornholm (~2,7 m), vid Hasle. Wikidata Q15052246 (P625 = radens koord)
  4:  { dr: 'DR 402', name: 'Klemensker-sten 4' },
  5:  { dr: 'DR 403', name: 'Klemensker-sten 5' },
  6:  { dr: 'DR 404', name: 'Klemensker-sten 6' },
  7:  { dr: 'DR 406', name: 'Klemensker-sten 8' },
  8:  { dr: 'DR 407', name: 'Klemensker-sten 9' },
  9:  { dr: 'DR 405', name: 'Klemensker-sten 7' },
  10: { dr: 'DR 408', name: 'Rutsker-sten' },
  12: { dr: 'DR 409', name: 'Rø-sten' },
  13: { dr: 'DR 374', name: 'Bodilsker-sten 1' },
  15: { dr: 'DR 376', name: 'Bodilsker-sten 3' },
  16: { dr: 'DR 377', name: 'Bodilsker-sten 4' },
  17: { dr: 'DR 378', name: 'Bodilsker-sten 5' },
  27: { dr: 'DR 370', name: 'Åker-sten 1' },
  28: { dr: 'DR 371', name: 'Åker-sten 2' },
  29: { dr: 'DR 372', name: 'Åker-sten 3' },
  30: { dr: 'DR 373', name: 'Åker-font' },            // dopfunt (ej runsten) men äkta DR/DK-dubblett
  31: { dr: 'DR 389', name: 'Nyker-sten' },
};

const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});

// Normalisera en signumsträng till DK Bh-nummer (heltal) eller null.
function dkNum(s){
  if(!s) return null;
  const m=String(s).replace(/\s+/g,'').toUpperCase().match(/^(?:DK)?BH0*([0-9]+)$/);
  return m?+m[1]:null;
}
// Vilket DK Bh-nummer refererar en rad (via signum/primary/altsig/aka)?
function dkOf(r){
  for(const s of [r.signum, r.primary_signum, ...(r.alternative_signum||[]), ...(r.also_known_as||[])]){
    const n=dkNum(s); if(n) return n;
    if(s){ const m=String(s).replace(/\s+/g,'').toUpperCase().match(/DKBH0*([0-9]+)/); if(m) return +m[1]; }
  }
  return null;
}
const uniq=a=>[...new Set(a.filter(Boolean))];

async function main(){
  await c.connect();
  const before=(await c.query('select count_runestones() as n')).rows[0].n;

  const rows=(await c.query(`
    select id, signum, object_type, coordinates[0] as lng, coordinates[1] as lat,
      also_known_as, alternative_signum, primary_signum, is_primary_signum_verified,
      name, superseded_by
    from runic_inscriptions
    where signum ilike 'DK Bh%' or signum ilike 'DR DKBh%'
       or exists (select 1 from unnest(coalesce(alternative_signum,'{}')) a where a ~* 'Bh ?[0-9]')
  `)).rows;

  // Gruppera på DK Bh-nummer
  const byNum={};
  for(const r of rows){ const n=dkOf(r); if(n) (byNum[n]=byNum[n]||[]).push(r); }

  const pairs=[], review=[];
  for(const [numStr,g] of Object.entries(byNum)){
    const num=+numStr;
    const dk=g.filter(r=>/^DK Bh/i.test(r.signum));
    const dr=g.filter(r=>/^DR /i.test(r.signum));
    if(dk.length===0) continue;                    // bara DR-rad(er), ingen DK Bh-kanonik → ej dubblett
    if(dk.length>1){ review.push(`DK Bh ${num}: FLERA DK Bh-rader (${dk.map(r=>r.signum).join(',')}) — hoppar`); continue; }
    const canonical=dk[0];
    const auth=AUTH[num];
    for(const d of dr){
      // Säkerhetsgrind: DR-signum måste matcha auktoritativ tabell exakt.
      if(!auth){ review.push(`${d.signum} ↔ DK Bh ${num}: ingen auktoritativ post — ej sammanfogad`); continue; }
      const drNorm=d.signum.replace(/\s+/g,' ').trim().toUpperCase();
      if(drNorm!==auth.dr.toUpperCase()){
        review.push(`${d.signum} ↔ DK Bh ${num}: DR-signum matchar inte auktoritativ (${auth.dr}) — ej sammanfogad`);
        continue;
      }
      pairs.push({num, canonical, dup:d, name:auth.name, forceName:!!auth.forceName, drSignum:auth.dr});
    }
  }
  pairs.sort((a,b)=>a.num-b.num);

  console.log(`\n=== Bornholm dedup ${APPLY?'(APPLY)':'(DRY RUN)'} ===`);
  console.log(`count_runestones() före: ${before}`);
  console.log(`Bekräftade dubblettpar (kanonisk DK Bh ⟵ dubblett DR): ${pairs.length}`);
  for(const p of pairs){
    const already=p.dup.superseded_by?' [redan undertryckt]':'';
    let setName;
    if(p.forceName && p.canonical.name!==p.name) setName=`  name="${p.canonical.name||'∅'}" → "${p.name}"`;
    else if(!p.canonical.name && p.name) setName=`  +name="${p.name}"`;
    else setName=p.canonical.name?`  (name="${p.canonical.name}" behålls)`:'';
    console.log(`  ${p.canonical.signum.padEnd(9)} ⟵ ${p.dup.signum.padEnd(9)} [${(p.dup.object_type||'∅')}]${already}${setName}`);
  }
  if(review.length){ console.log(`\nLämnade för manuell granskning (${review.length}):`); for(const r of review) console.log('  · '+r); }
  else console.log(`\nManuell granskning: 0 (alla kandidater matchade auktoritativ crosswalk).`);

  if(!APPLY){
    const wouldSuppressRunes=pairs.filter(p=>/runsten|runestone/i.test(p.dup.object_type||'')&&!p.dup.superseded_by).length;
    console.log(`\nDRY RUN: skulle undertrycka ${pairs.length} dubbletter (varav ${wouldSuppressRunes} räknas som runsten nu).`);
    console.log(`Förväntad count_runestones() efter: ${before-wouldSuppressRunes}.`);
    console.log(`Kör med --apply för att skriva.`);
    await c.end(); return;
  }

  // APPLY — allt i en transaktion.
  await c.query('BEGIN');
  try{
    for(const p of pairs){
      const canonSig=p.canonical.signum;                       // t.ex. "DK Bh 3"
      // Kanonisk rad: sätt primary_signum, verifierad, lyft in DR-signum i alt/aka, ev. namn.
      const canonAlt=uniq([...(p.canonical.alternative_signum||[]), p.dup.signum]);
      const canonAka=uniq([...(p.canonical.also_known_as||[]), p.dup.signum, p.name]);
      await c.query(
        `update runic_inscriptions set
           primary_signum=$2, is_primary_signum_verified=true,
           alternative_signum=$3, also_known_as=$4,
           name=case when $6 then $5 else coalesce(name,$5) end, updated_at=now()
         where id=$1`,
        [p.canonical.id, canonSig, canonAlt, canonAka, p.name, p.forceName]);
      // Dubblett (DR): undertryck via superseded_by, peka på kanonisk, dela primary_signum.
      await c.query(
        `update runic_inscriptions set
           superseded_by=$2, primary_signum=$3, is_primary_signum_verified=true,
           updated_at=now()
         where id=$1`,
        [p.dup.id, p.canonical.id, canonSig]);
    }
    await c.query('COMMIT');
  }catch(e){ await c.query('ROLLBACK'); console.error('ROLLBACK:', e.message); process.exitCode=1; await c.end(); return; }

  const after=(await c.query('select count_runestones() as n')).rows[0].n;
  const activeBbox=(await c.query(`
    select count(*)::int n from runic_inscriptions
    where superseded_by is null and coordinates is not null
      and coordinates[1] between 54.9 and 55.35 and coordinates[0] between 14.6 and 15.25
      and is_runestone(object_type)`)).rows[0].n;
  const suppressed=(await c.query(`select count(*)::int n from runic_inscriptions where superseded_by is not null`)).rows[0].n;
  const deleted=0;
  console.log(`\nAPPLIED.`);
  console.log(`count_runestones() efter: ${after} (före ${before}, Δ ${after-before})`);
  console.log(`Aktiva runstenar i Bornholms-bbox: ${activeBbox}`);
  console.log(`Totalt undertryckta rader (superseded_by satt): ${suppressed}`);
  console.log(`Raderade rader: ${deleted} (icke-destruktivt).`);
  await c.end();
}
main().catch(e=>{ console.error('FAILED:', e); process.exitCode=1; });
