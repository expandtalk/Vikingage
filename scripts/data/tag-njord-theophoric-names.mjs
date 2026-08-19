// Taggar VÄLETABLERADE teofora Njord-ortnamn (Njärd-/Nærdh-) i place_names med
// element_key 'njärd' + element_category='sacral', så de kan surfas i kartans teofor-lins
// (jfr Oden/Tor/Frö). KÄLLKRITISKT — INGEN GISSNING: bara namn med STARKT onomastiskt stöd
// taggas; omstridda och unga romantiska bildningar lämnas OTAGGADE (rapporteras separat).
//
// TAGGAS (starkt stöd i onomastisk litteratur):
//   • Närtuna (Uppland, Närtuna sn, Långhundra hd) — fsv. *Niærdha-tuna, guden Njärd + -tuna.
//     Belägg redan i DB: attested_form "Nerthetunum" (1291), attestation_source "SOL 2003".
//     Klassiskt Njord-ortnamn: SOL 2003 (Svenskt ortnamnslexikon); Per Vikstrand,
//     "Gudarnas platser" (2001); Elias Wessén om Njord-kulten. -tuna behålls i element_keys
//     (namnet är både administrativt -tuna OCH teofort); element_category sätts 'sacral' för
//     teofor-linsen (som filtrerar element_category='sacral').
//
// AVVISADE (omstridda/osäkra → lämnas otaggade, se scriptets rapport):
//   • Mjärdevi (Ög) — första led omstritt (mjärde 'fiskredskap' vs teonym), ej etablerat.
//   • Närlunda (många landskap) — bred spridning talar för appellativ *nær 'närbelägen' + lund;
//     Vikstrand skeptisk; Njord-tolkningen ej etablerad.
//   • Norderön (Jmt) — klassisk men omstridd kandidat (Njarðar-ey vs 'norra ön'); ingen belägg i DB.
//   • Nälsta (Uppland), Närdala (Skåne), Närtorpet (Vm) — svagt/oklart, inga belägg.
// AVVISADE (fel språkskikt): Njarka/Njarkajärvi/Njarkavaara (samiska/finska); Mjärden (appellativ).
// AVVISADE (unga romantiska/lärda bildningar, ej forntida kult): Njordhem, Njordstorpet
//   (modern stavning "Njord" ≠ fsv. Njärd/Nærdh; -hem/-torp unga), Närtunaby, Närtuna kyrka
//   (härledda av socknennamnet, ej självständiga teonymbärare).
//
// Idempotent. Kör:  node scripts/data/tag-njord-theophoric-names.mjs [--apply]
// (utan --apply = torrkörning som bara visar vad som skulle ändras)
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8').split(/\r?\n/)
  .filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));

// Endast STARKT belagda Njord-namn. Selektorn är avsiktligt snäv (name+socken+province)
// för att aldrig råka fånga andra Närtuna-former (Närtunaby, Närtuna kyrka, Njordhem …).
const TARGETS = [
  {
    label: 'Närtuna (Uppland, Närtuna sn)',
    where: `name = 'Närtuna' AND province = 'Uppland' AND socken = 'Närtuna'`,
    motivering: 'fsv. *Niærdha-tuna (guden Njärd + -tuna); belägg "Nerthetunum" 1291 (SOL 2003, i DB); Vikstrand 2001; Wessén.',
  },
];

async function main() {
  const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
  await c.connect();
  try {
    console.log(APPLY ? '== TILLÄMPAR (--apply) ==' : '== TORRKÖRNING (ingen --apply) ==');
    let totalTagged = 0;
    for (const t of TARGETS) {
      const before = await c.query(
        `select id, name, element_keys, element_category, socken, province, attested_form, earliest_attestation_year
           from place_names where ${t.where} order by source`);
      console.log(`\n${t.label} — ${before.rowCount} rad(er)`);
      console.log(`  motivering: ${t.motivering}`);
      for (const r of before.rows) {
        const already = Array.isArray(r.element_keys) && r.element_keys.includes('njärd') && r.element_category === 'sacral';
        console.log(`   • ${r.id}  keys=[${(r.element_keys || []).join(', ')}] cat=${r.element_category}` +
          (r.attested_form ? `  belägg="${r.attested_form}" (${r.earliest_attestation_year})` : '') +
          (already ? '  [redan taggad]' : ''));
      }
      if (APPLY) {
        // Idempotent: lägg 'njärd' bara om det saknas (bevarar 'tuna' m.fl.); sätt cat='sacral'.
        const upd = await c.query(
          `update place_names set
             element_keys = case when not (element_keys @> '{njärd}') then array_append(element_keys, 'njärd') else element_keys end,
             element_category = 'sacral',
             updated_at = now()
           where ${t.where}
             and (not (element_keys @> '{njärd}') or element_category is distinct from 'sacral')
           returning id`);
        console.log(`   → uppdaterade ${upd.rowCount} rad(er)`);
        totalTagged += upd.rowCount;
      } else {
        const n = before.rows.filter(r => !(Array.isArray(r.element_keys) && r.element_keys.includes('njärd') && r.element_category === 'sacral')).length;
        console.log(`   → skulle uppdatera ${n} rad(er)`);
        totalTagged += n;
      }
    }
    console.log(`\nKlart. ${APPLY ? 'Taggade' : 'Skulle tagga'} totalt ${totalTagged} rad(er) med element_key 'njärd'.`);
    if (!APPLY) console.log("Kör igen med --apply för att skriva.");
  } finally {
    await c.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
