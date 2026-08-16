// Delad pipeline för Lantmäteriets NEDLADDNING-produkter (STAC-vektor → ZIP → GeoPackage).
// Används av ingest-admin-boundaries.mjs och ingest-ortnamn.mjs. © Lantmäteriet.
//
// Ingen dotenv/proj4/GDAL-dep: .env läses för hand, sql.js (WASM) läser GPKG, PostGIS gör CRS-transformen.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

/** Signalerar att åtkomsten ännu inte är godkänd (403/401 på nedladdningen). */
export class NotAuthorizedError extends Error {
  constructor(status) { super(`Ännu inte auktoriserad (HTTP ${status})`); this.status = status; }
}

/** Läs process.env + .env (env-värden vinner). Ingen override av redan satta variabler. */
export function loadEnv() {
  const out = { ...process.env };
  const envPath = path.join(REPO_ROOT, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i);
      if (m && out[m[1]] == null) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
  return out;
}

export function authHeader(env) {
  if (!env.LM_USER || !env.LM_PASS) throw new Error('Saknar LM_USER/LM_PASS (Geotorget-credentials) i miljö eller .env.');
  return 'Basic ' + Buffer.from(`${env.LM_USER}:${env.LM_PASS}`).toString('base64');
}

/** DATABASE_URL: befintlig, annars byggd ur SUPABASE_DB_PASSWORD (prod-pooler, ej db push). */
export function databaseUrl(env) {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  if (env.SUPABASE_DB_PASSWORD) {
    return `postgresql://postgres.mnuifmcjspeaauzehasj:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-0-eu-north-1.pooler.supabase.com:5432/postgres`;
  }
  throw new Error('Saknar DATABASE_URL (eller SUPABASE_DB_PASSWORD att bygga pooler-strängen ur).');
}

const STAC = 'https://api.lantmateriet.se/stac-vektor/v1';

/** Hämta senaste STAC-itemets ZIP-asset-href för en collection. */
export async function stacZipHref(collection, auth) {
  const res = await fetch(`${STAC}/collections/${collection}/items?limit=1`, {
    headers: { Authorization: auth, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`STAC ${collection}: HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  const feat = json.features?.[0];
  if (!feat) throw new Error(`Inga STAC-items i collection ${collection}`);
  const asset = Object.values(feat.assets || {}).find((a) => a.type === 'application/zip' || /\.zip$/i.test(a.href || ''));
  if (!asset?.href) throw new Error(`Ingen ZIP-asset i STAC-item för ${collection}`);
  return { href: asset.href, epsg: feat.properties?.['proj:epsg'] ?? null };
}

/** Ladda ner ZIP (Basic auth). Kastar NotAuthorizedError vid 401/403 (åtkomst ej godkänd än). */
export async function downloadZip(href, auth) {
  process.stdout.write(`Laddar ner ${href} … `);
  const res = await fetch(href, { headers: { Authorization: auth } });
  if (res.status === 401 || res.status === 403) { console.log(`HTTP ${res.status}`); throw new NotAuthorizedError(res.status); }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} vid nedladdning`);
  const buf = Buffer.from(await res.arrayBuffer());
  console.log(`${(buf.length / 1e6).toFixed(1)} MB`);
  return buf;
}

/** Packa upp ZIP, öppna första .gpkg med sql.js. Returnerar { gp, gpkgName, rowsOf }. */
export async function openGpkgFromZip(zipBuf) {
  const entry = new AdmZip(zipBuf).getEntries().find((e) => /\.gpkg$/i.test(e.entryName));
  if (!entry) throw new Error('Ingen .gpkg-fil i ZIP:en');
  const gpkgBuf = entry.getData();
  console.log(`GeoPackage: ${entry.entryName} (${(gpkgBuf.length / 1e6).toFixed(1)} MB)`);
  const SQL = await initSqlJs({ locateFile: (f) => path.join(REPO_ROOT, 'node_modules/sql.js/dist', f) });
  const gp = new SQL.Database(new Uint8Array(gpkgBuf));
  const rowsOf = (sql, params = []) => {
    const st = gp.prepare(sql); if (params.length) st.bind(params);
    const r = []; while (st.step()) r.push(st.getAsObject()); st.free(); return r;
  };
  return { gp, gpkgName: entry.entryName, rowsOf };
}

/** Feature-tabeller + geometrikolumn/SRS via GPKG:s egna metadatatabeller (self-discovery). */
export function featureTables(rowsOf) {
  return rowsOf(`SELECT table_name FROM gpkg_contents WHERE data_type='features'`).map((r) => r.table_name);
}
export function geomMeta(rowsOf, table) {
  const m = rowsOf(`SELECT column_name, srs_id FROM gpkg_geometry_columns WHERE table_name=?`, [table])[0];
  return { geomCol: m?.column_name ?? null, srsId: m?.srs_id ?? 3006 };
}
export function tableColumns(rowsOf, table) {
  return rowsOf(`PRAGMA table_info("${table}")`).map((c) => c.name);
}

/** Strippa GeoPackageBinary-headern → ren WKB (Buffer). Header: 'GP'+ver+flags+srs_id(4)+envelope. */
export function extractWKB(blob) {
  if (!blob || blob[0] !== 0x47 || blob[1] !== 0x50) throw new Error('Ej GPKG-geometri (saknar GP-magic)');
  const envIndicator = (blob[3] >> 1) & 0x07;
  const envBytes = { 0: 0, 1: 32, 2: 48, 3: 48, 4: 64 }[envIndicator];
  if (envBytes === undefined) throw new Error(`Okänd GPKG envelope-indicator: ${envIndicator}`);
  const off = 8 + envBytes;
  return Buffer.from(blob.buffer, blob.byteOffset + off, blob.length - off);
}

/** Defensiv kolumnplock: första icke-tomma värdet bland kandidatnycklar (case-insensitivt). */
export function pick(row, keys) {
  const lower = {}; for (const k of Object.keys(row)) lower[k.toLowerCase()] = row[k];
  for (const k of keys) { const v = lower[k.toLowerCase()]; if (v != null && v !== '') return String(v); }
  return null;
}
