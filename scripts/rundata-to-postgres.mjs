// P0: Konverterar rundata.sql (Evighetsrunor, Sequel Pro/MariaDB-dump 2020-11-29)
// till Postgres-SQL för staging-schemat `rundata_raw` (docs/kunskapsgraf-arkitektur.md).
//
// Principer:
//  - RÅTT lyft: alla tabeller, alla rader. Ingen datamodellering här.
//  - Hex→uuid VID GRÄNSEN: BINARY(16)-nycklar (X'32hex') blir uuid. Konverteringen är
//    bijektiv (uuid = hex med bindestreck) — original-hex återfås med replace(id::text,'-','').
//  - Kolumner utan constraints (allt nullable, inga index) — integritet byggs i faserna.
//  - MySQL-fällor: zero-dates → NULL, \-escapes → PG-standard, ENUM → text.
//  - `_meta`-tabell bär source_version (dumpen är EN frusen edition → schemastämpel).
//
// Kör: node scripts/rundata-to-postgres.mjs
// Ut:  scripts/data/rundata-raw/000_schema.sql + NNN_data_*.sql + manifest.json

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SRC = 'rundata.sql';
const OUT_DIR = 'scripts/data/rundata-raw';
const SCHEMA = 'rundata_raw';
const SOURCE_VERSION = '2020-11-29'; // ur dumpens header (Genereringstid)
const CHUNK_BYTES = 600 * 1024;      // ~600 KB per fil (MCP execute_sql-vänligt)
const ROWS_PER_STMT = 500;

const sql = readFileSync(SRC, 'utf8');
const lines = sql.split('\n');

// ---------- 1. DDL: parsa CREATE TABLE-block ----------
const typeMap = (mysqlType) => {
  const t = mysqlType.trim();
  if (/^BINARY\(16\)$/i.test(t)) return 'uuid';
  if (/^(VAR)?BINARY\(\d+\)$/i.test(t)) return 'bytea';
  if (/^TINYINT/i.test(t)) return 'smallint';
  if (/^SMALLINT/i.test(t)) return 'smallint';
  if (/^(MEDIUM|BIG)?INT/i.test(t)) return /^BIGINT/i.test(t) ? 'bigint' : 'integer';
  if (/^VARCHAR\((\d+)\)/i.test(t)) return t.match(/^VARCHAR\((\d+)\)/i)[0].toLowerCase();
  if (/^CHAR\((\d+)\)/i.test(t)) return t.match(/^CHAR\((\d+)\)/i)[0].toLowerCase();
  if (/^(TINY|MEDIUM|LONG)?TEXT/i.test(t)) return 'text';
  if (/^(DATETIME|TIMESTAMP)/i.test(t)) return 'timestamp';
  if (/^DATE$/i.test(t)) return 'date';
  if (/^TIME$/i.test(t)) return 'time';
  if (/^(DOUBLE|FLOAT)/i.test(t)) return 'double precision';
  if (/^DECIMAL\((\d+),(\d+)\)/i.test(t)) {
    const m = t.match(/^DECIMAL\((\d+),(\d+)\)/i);
    return `numeric(${m[1]},${m[2]})`;
  }
  if (/^ENUM\(/i.test(t)) return 'text';
  if (/^YEAR/i.test(t)) return 'integer';
  return 'text'; // okänd typ → text (rått lyft, tappa inget)
};

const q = (name) => `"${name.toLowerCase()}"`;

const tables = {}; // name -> { cols: [{name, pgType, isUuid, isBytea, isDate, isNum}] }
let ddl = [];
{
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^CREATE TABLE `([^`]+)` \($/);
    if (!m) { i++; continue; }
    const tname = m[1];
    const cols = [];
    i++;
    while (i < lines.length && !/^\)/.test(lines[i])) {
      const cm = lines[i].match(/^\s*`([^`]+)`\s+([A-Za-z]+(?:\([^)]*\))?)/);
      if (cm) {
        const pgType = typeMap(cm[2]);
        cols.push({
          name: cm[1],
          pgType,
          isUuid: pgType === 'uuid',
          isBytea: pgType === 'bytea',
          isDate: pgType === 'timestamp' || pgType === 'date',
        });
      }
      // KEY/INDEX/PRIMARY/UNIQUE/CONSTRAINT-rader ignoreras (rått staging)
      i++;
    }
    tables[tname] = { cols };
    ddl.push(
      `create table ${SCHEMA}.${q(tname)} (\n` +
      cols.map((c) => `  ${q(c.name)} ${c.pgType}`).join(',\n') +
      `\n);`
    );
    i++;
  }
}

// ---------- 2. Värdeparser (en rad = en tupel `\t(...),` eller `\t(...);`) ----------
// Char-för-char så kommatecken/parenteser inuti strängar inte splittrar fel.
function parseTuple(line) {
  const s = line.trim().replace(/[,;]$/, '');
  if (!s.startsWith('(') || !s.endsWith(')')) return null;
  const inner = s.slice(1, -1);
  const vals = [];
  let i = 0;
  while (i < inner.length) {
    while (inner[i] === ' ' || inner[i] === ',') i++;
    if (i >= inner.length) break;
    if (inner.startsWith('NULL', i)) { vals.push(null); i += 4; continue; }
    if (inner[i] === 'X' && inner[i + 1] === "'") { // X'hex'
      const end = inner.indexOf("'", i + 2);
      vals.push({ hex: inner.slice(i + 2, end) });
      i = end + 1; continue;
    }
    if (inner[i] === "'") { // MySQL-sträng med \-escapes
      let out = '';
      i++;
      while (i < inner.length) {
        const ch = inner[i];
        if (ch === '\\') {
          const nx = inner[i + 1];
          if (nx === "'") out += "'";
          else if (nx === '"') out += '"';
          else if (nx === '\\') out += '\\';
          else if (nx === 'n') out += '\n';
          else if (nx === 'r') out += '\r';
          else if (nx === 't') out += '\t';
          else if (nx === '0') out += '\0';
          else if (nx === 'Z') out += '\x1a';
          else out += nx;
          i += 2; continue;
        }
        if (ch === "'") { i++; break; }
        out += ch; i++;
      }
      vals.push({ str: out });
      continue;
    }
    // tal (eller annat oquotat)
    let j = i;
    while (j < inner.length && inner[j] !== ',') j++;
    vals.push({ raw: inner.slice(i, j).trim() });
    i = j;
  }
  return vals;
}

const hexToUuid = (hex) => {
  const h = hex.toLowerCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
};

function pgLiteral(val, col) {
  if (val === null) return 'NULL';
  if (val.hex !== undefined) {
    if (val.hex.length === 32 && col && col.isUuid) return `'${hexToUuid(val.hex)}'`;
    if (val.hex.length === 32) return `'${hexToUuid(val.hex)}'`; // 16-byte binär utanför uuid-kolumn förekommer ej, men säkra
    return `'\\x${val.hex.toLowerCase()}'`;
  }
  if (val.str !== undefined) {
    let s = val.str;
    if (col && col.isDate && /^0000-00-00/.test(s)) return 'NULL'; // MySQL zero-date
    if (s.includes('\0')) s = s.replaceAll('\0', ''); // PG-text tål inte NUL
    return `'${s.replaceAll("'", "''")}'`;
  }
  if (val.raw !== undefined) return val.raw === '' ? 'NULL' : val.raw;
  return 'NULL';
}

// ---------- 3. Dataparse: INSERT-block → batchade PG-inserts ----------
const rowsByTable = {}; // name -> array av "(v1,v2,...)"-strängar
const colsByTable = {}; // name -> kolumnnamn ur INSERT-satsen (ordning!)
{
  let cur = null, curCols = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const im = line.match(/^INSERT INTO `([^`]+)` \(([^)]*)\)/);
    if (im) {
      cur = im[1];
      curCols = [...im[2].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      colsByTable[cur] = curCols;
      continue;
    }
    if (line === 'VALUES') continue;
    if (cur && line.startsWith('\t(')) {
      const vals = parseTuple(line);
      if (!vals) { console.error(`PARSE FAIL ${cur}: ${line.slice(0, 120)}`); continue; }
      const tcols = tables[cur].cols;
      const colDefs = curCols.map((cn) => tcols.find((c) => c.name === cn));
      const lits = vals.map((v, k) => pgLiteral(v, colDefs[k]));
      (rowsByTable[cur] ??= []).push(`(${lits.join(',')})`);
      continue;
    }
    if (cur && !line.startsWith('\t')) { cur = null; curCols = null; }
  }
}

// ---------- 4. Skriv ut: schema + chunkade datafiler + manifest ----------
mkdirSync(OUT_DIR, { recursive: true });

const schemaSql = [
  `-- Genererad av scripts/rundata-to-postgres.mjs — redigera INTE för hand.`,
  `-- Källa: rundata.sql (Evighetsrunor), dumpdatum ${SOURCE_VERSION}.`,
  `drop schema if exists ${SCHEMA} cascade;`,
  `create schema ${SCHEMA};`,
  `comment on schema ${SCHEMA} is 'Rått staging-lyft av Evighetsrunor-dumpen (rundata.sql). Ej PostgREST-exponerat. Se docs/kunskapsgraf-arkitektur.md P0.';`,
  ...ddl.map((d) => d),
  `create table ${SCHEMA}._meta (source_file text, source_version text, tool text, loaded_at timestamptz default now());`,
  `insert into ${SCHEMA}._meta (source_file, source_version, tool) values ('rundata.sql', '${SOURCE_VERSION}', 'Sequel Pro dump av MariaDB 10.1.38 / scripts/rundata-to-postgres.mjs');`,
].join('\n\n');
writeFileSync(path.join(OUT_DIR, '000_schema.sql'), schemaSql + '\n');

let chunkNo = 1, buf = [], bufBytes = 0;
const flush = () => {
  if (!buf.length) return;
  writeFileSync(path.join(OUT_DIR, `${String(chunkNo).padStart(3, '0')}_data.sql`), buf.join('\n') + '\n');
  chunkNo++; buf = []; bufBytes = 0;
};

const manifest = {};
for (const [tname, rows] of Object.entries(rowsByTable)) {
  manifest[tname] = rows.length;
  const cols = colsByTable[tname].map((c) => q(c)).join(',');
  for (let i = 0; i < rows.length; i += ROWS_PER_STMT) {
    const stmt = `insert into ${SCHEMA}.${q(tname)} (${cols}) values\n${rows.slice(i, i + ROWS_PER_STMT).join(',\n')};`;
    buf.push(stmt);
    bufBytes += stmt.length;
    if (bufBytes >= CHUNK_BYTES) flush();
  }
}
flush();

for (const t of Object.keys(tables)) if (!manifest[t]) manifest[t] = 0;
writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify({ source_version: SOURCE_VERSION, tables: manifest }, null, 2));

const total = Object.values(manifest).reduce((a, b) => a + b, 0);
console.log(`Tabeller: ${Object.keys(tables).length} (${Object.keys(rowsByTable).length} med data)`);
console.log(`Rader totalt: ${total}`);
console.log(`Datafiler: ${chunkNo - 1} chunkar i ${OUT_DIR}/`);
