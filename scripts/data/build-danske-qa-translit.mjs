#!/usr/bin/env node
// QA: jämför runer.ku.dk:s translitteration mot VÅR (runic_inscriptions.transliteration).
// Syfte: hitta rader där vår läsning avviker → Daniel kan rätta mot källa. Ingen lagring
// av deras text; vi jämför bara normaliserade run-bokstavssekvenser (fakta-kontroll).
//
// IN:  scripts/data/danska-indskrifter.txt  (tab-sep: Signatur, Translitteration, DA, EN)
// UT:  scripts/data/danske-qa-translit.sql   (temp-tabell med DERAS normaliserade läsning
//        + join mot våra rader; normaliserar VÅR läsning i SQL identiskt; rapporterar avvikelser)
//
// Normalisering (båda sidor lika): gemener; ta bort sektionsmarkörer (Side A / §A / Indskriftdel);
// mappa kapitäler (ᴀʀʜ…) + ą/ǫ till bas; strippa till run-alfabetet [a-zþðøæå]. Orddelning,
// osäkerhetsparenteser och skadetecken ignoreras (ger annars falska träffar).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN  = path.join(__dirname, 'danska-indskrifter.txt');
const OUT = path.join(__dirname, 'danske-qa-translit.sql');

const FROM = [...'ᴀʙᴅᴇɢʜɪᴋʟᴍɴᴏᴘʀꜱᴛᴜąǫ'];
const TO   = [...'abdeghiklmnoprstuao'];
const CAP  = Object.fromEntries(FROM.map((c, i) => [c, TO[i]]));
const capRe = new RegExp('[' + FROM.join('') + ']', 'g');

function normTheirs(s) {
  s = (s || '').toLowerCase();
  s = s.replace(/\bside\s+[a-zæøå]\b/g, ' ')
       .replace(/\bindskriftdel\s*\d*/g, ' ')
       .replace(/\b(inderside|yderside|pladen|strimlen|forside|bagside|kanten|kun|del)\b/g, ' ');
  s = s.replace(capRe, c => CAP[c] || c);
  return s.replace(/[^a-zþðøæå]/g, '');
}

// Samma normalisering uttryckt i SQL (för VÅR transliteration).
const OURS_NORM_SQL = `regexp_replace(
  translate(
    regexp_replace(lower(coalesce(ri.transliteration,'')), '§[a-zæøå]', '', 'g'),
    '${FROM.join('')}', '${TO.join('')}'
  ),
  '[^a-zþðøæå]', '', 'g'
)`;

const SIGNUM_RE = /^(DK\s*)?(SkL|SlB|NJy|MJy|SJy|Syd|Sk|Sl|Hal|Bl|Bh|Sj|Fyn|Uk)\s*\d/i;
const norm = s => s.toLowerCase().replace(/dk/g, '').replace(/\s+/g, '');

const lines = fs.readFileSync(IN, 'utf8').split(/\r?\n/);
const rows = new Map(); // nsig -> tnorm
let parsed = 0, skipped = 0;
for (const line of lines) {
  const parts = line.split('\t');
  if (parts.length < 2) { skipped++; continue; }
  const sig = parts[0].trim();
  if (!SIGNUM_RE.test(sig)) { skipped++; continue; }
  const tnorm = normTheirs(parts[1]);
  if (!tnorm) continue;                 // tom/ren fragment-läsning → hoppa
  const k = norm(sig);
  if (!rows.has(k)) rows.set(k, tnorm); // första vinner
  parsed++;
}

const values = [...rows.entries()].map(([k, t]) => `('${k}','${t}')`);

const sql = `-- QA: DERAS (runer.ku.dk) vs VÅR translitteration. ${rows.size} normaliserade läsningar.
-- Endast läsning; ingen lagring av deras text. Kör via MCP/psql.
begin;
create temp table _their(nsig text primary key, tnorm text) on commit drop;
insert into _their(nsig, tnorm) values
${values.join(',\n')};

create temp table _ours on commit drop as
select ri.id, ri.signum,
       ${OURS_NORM_SQL} as onorm,
       ri.transliteration as oraw,
       lower(regexp_replace(regexp_replace(a,'DK','','gi'),'\\s+','','g')) as nsig
from public.runic_inscriptions ri, unnest(ri.alternative_signum) a;

-- Distinkt bästa matchande rad per deras signum.
create temp table _j on commit drop as
select distinct on (t.nsig) t.nsig, t.tnorm, o.signum, o.onorm, o.oraw,
       (t.tnorm = o.onorm) as eq,
       length(o.onorm) as olen, length(t.tnorm) as tlen,
       abs(length(o.onorm) - length(t.tnorm)) as dlen
from _their t join _ours o on o.nsig = t.nsig
order by t.nsig, dlen asc;   -- vid flera kandidater: den mest lika

-- Rapport: största avvikelserna, med totalsiffror på varje rad.
select j.signum, j.olen, j.tlen, j.dlen,
       left(j.oraw, 90)  as var_lasning,
       left(j.tnorm, 70) as deras_norm,
       (select count(*) from _their)                                   as deras_total,
       (select count(*) from _their t where exists (select 1 from _ours o where o.nsig=t.nsig)) as matchade,
       (select count(*) from _j)                                       as jamforda,
       (select count(*) from _j where eq)                              as identiska,
       (select count(*) from _j where not eq and dlen between 1 and 2) as sma_diff,
       (select count(*) from _j where not eq and dlen >= 3)            as stora_diff,
       (select count(*) from _j where olen = 0)                        as var_tom
from _j j
where not j.eq and j.dlen >= 3
order by j.dlen desc
limit 80;
commit;
`;

fs.writeFileSync(OUT, sql, 'utf8');
console.error(`Parsade rader: ${parsed}  (unika signum: ${rows.size})  hoppade: ${skipped}`);
console.error(`Skrev ${OUT}`);
