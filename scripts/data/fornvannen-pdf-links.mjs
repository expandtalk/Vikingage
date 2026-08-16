#!/usr/bin/env node
// Backfill DIREKT-PDF-länk på de harvestade Fornvännen-raderna (historical_sources source_key=diva:<urn>).
// Källa: DiVA OAI-PMH metadataPrefix=swepub_mods, som bär fulltext-URL:en
// https://raa.diva-portal.org/smash/get/diva2:<id>/FULLTEXT01.pdf (verifierat application/pdf).
// Matchar på URN → UPDATE url. Idempotent (rör bara rader vars url ännu ej är en FULLTEXT-PDF).
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const OAI = 'https://raa.diva-portal.org/dice/oai';
const one = (re, s) => { const m = re.exec(s); return m ? m[1] : null; };

function dbPassword() {
  const env = fs.readFileSync(path.resolve('.env'), 'utf8');
  return env.split('\n').find((l) => l.startsWith('SUPABASE_DB_PASSWORD=')).split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}
const fetchPage = async (url) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'vikingage-harvest/1.0 (research)' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
};

async function main() {
  const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: dbPassword(), database: 'postgres' });
  await client.connect();
  let url = `${OAI}?verb=ListRecords&metadataPrefix=swepub_mods`;
  let pages = 0, mapped = 0, updated = 0;
  try {
    while (true) {
      const xml = await fetchPage(url);
      pages++;
      const re = /<record>([\s\S]*?)<\/record>/g; let m;
      while ((m = re.exec(xml))) {
        const r = m[1];
        if (/<header[^>]*status="deleted"/.test(r)) continue;
        const urn = one(/(urn:nbn:se:raa:diva-\d+)/, r);
        // Föredra FULLTEXT01.pdf; annars första FULLTEXT*.pdf.
        const pdf = one(/(https:\/\/raa\.diva-portal\.org\/smash\/get\/diva2:\d+\/FULLTEXT01\.pdf)/, r)
                 || one(/(https:\/\/raa\.diva-portal\.org\/smash\/get\/diva2:\d+\/FULLTEXT\d+\.pdf)/, r);
        if (!urn || !pdf) continue;
        mapped++;
        const res = await client.query(
          `update historical_sources set url = $1, updated_at = now()
             where source_key = $2 and (url is null or url not like '%FULLTEXT%')`,
          [pdf, `diva:${urn}`],
        );
        updated += res.rowCount;
      }
      process.stdout.write(`\r sida ${pages}: pdf-mappade ${mapped}, uppdaterade ${updated}   `);
      const token = one(/<resumptionToken[^>]*>([\s\S]*?)<\/resumptionToken>/, xml);
      if (!token || !token.trim()) break;
      url = `${OAI}?verb=ListRecords&resumptionToken=${encodeURIComponent(token.trim())}`;
    }
    console.log(`\nKLART: ${updated} Fornvännen-rader fick direkt-PDF-länk (av ${mapped} pdf-mappade records).`);
  } finally { await client.end(); }
}
main().catch((e) => { console.error('\nFEL:', e.message); process.exit(1); });
