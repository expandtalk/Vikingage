// Delar en "... (values\n<tuples>\n) as ..."-fil i N mindre körbara SQL-satser
// (samma prefix/suffix, delmängd av tuple-raderna) så de får plats i ett MCP-anrop.
// Kör: node scripts/chunk-sql-values.mjs <infil> <chunkStorlek> <utprefix>
import { readFileSync, writeFileSync } from 'node:fs';

const [infile, sizeArg, outPrefix] = process.argv.slice(2);
const chunkSize = parseInt(sizeArg, 10) || 3000;
const text = readFileSync(infile, 'utf8');

const marker = '(values\n';
const start = text.indexOf(marker);
if (start === -1) throw new Error('hittade inte "(values\\n"');
const headEnd = start + marker.length;
const head = text.slice(0, headEnd);              // t.o.m. "(values\n"
const rest = text.slice(headEnd);

// Suffix börjar vid raden "\n) as " (avslutar values-listan)
const sufMatch = rest.match(/\n\) as /);
if (!sufMatch) throw new Error('hittade inte "\\n) as "');
const tuplesBlock = rest.slice(0, sufMatch.index);
const suffix = rest.slice(sufMatch.index + 1);    // "( as ...;" (utan inledande newline)

// Tuple-rader är kommaseparerade, en tuple per rad
const tuples = tuplesBlock.split(',\n');
console.log(`Tuples: ${tuples.length}, chunkStorlek ${chunkSize}`);

let n = 0;
for (let i = 0; i < tuples.length; i += chunkSize) {
  n++;
  const slice = tuples.slice(i, i + chunkSize).join(',\n');
  const sql = head + slice + '\n' + suffix;
  const name = `${outPrefix}${String(n).padStart(2, '0')}.sql`;
  writeFileSync(name, sql);
  console.log(`  ${name} (${slice.length} tecken, ${Math.min(chunkSize, tuples.length - i)} tuples)`);
}
console.log(`Klar: ${n} chunks`);
