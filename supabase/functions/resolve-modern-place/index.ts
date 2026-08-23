// resolve-modern-place — lös upp en MODERN plats/byggnad/adress som INTE finns i vår historiska
// kartdata (t.ex. "Katarinahuset", "A-House", "Stadsgården 6"). Vi gissar aldrig: vi frågar öppna
// register och returnerar bara belagd koordinat med proveniens.
//   1) Wikidata (CC0): wbsearchentities → P625. Notabla byggnader/platser.
//   2) Nominatim/OSM (ODbL): adress-/namngeokodning som fallback (server-side → korrekt User-Agent).
// Svar: { found, label, description, lat, lng, source, id }. found=false → klienten faller tillbaka
// på "utanför vår täckning"-studsen.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGINS = ['https://vikingage.se', 'https://www.vikingage.se', 'http://localhost:5176', 'http://localhost:8080'];
const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin',
});
const UA = 'VikingAge/1.0 (https://vikingage.se; kontakt via sajten)';

interface Resolved { found: boolean; label?: string; description?: string; lat?: number; lng?: number; source?: 'wikidata' | 'osm'; id?: string; }

// Wikidata: sök entitet → hämta P625 (koordinat) för första träffen som har en.
async function viaWikidata(q: string, lang: string): Promise<Resolved | null> {
  const s = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=${lang}&uselang=${lang}&format=json&limit=5&origin=*`, { headers: { 'User-Agent': UA } });
  if (!s.ok) return null;
  const sj = await s.json();
  const cands = (sj.search ?? []) as { id: string; label?: string; description?: string }[];
  if (!cands.length) return null;
  const ids = cands.map((c) => c.id).join('|');
  const e = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims&format=json&origin=*`, { headers: { 'User-Agent': UA } });
  if (!e.ok) return null;
  const ej = await e.json();
  for (const c of cands) {
    const claims = ej.entities?.[c.id]?.claims;
    const p625 = claims?.P625?.[0]?.mainsnak?.datavalue?.value;
    if (p625 && typeof p625.latitude === 'number' && typeof p625.longitude === 'number') {
      return { found: true, label: c.label ?? q, description: c.description, lat: p625.latitude, lng: p625.longitude, source: 'wikidata', id: c.id };
    }
  }
  return null;
}

// Nominatim: namn-/adressgeokodning (fallback). Begränsa till Sverige (viewbox/countrycodes) för relevans.
async function viaNominatim(q: string): Promise<Resolved | null> {
  const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=1&countrycodes=se&addressdetails=1`, { headers: { 'User-Agent': UA } });
  if (!r.ok) return null;
  const j = await r.json();
  const hit = (j ?? [])[0];
  if (!hit || !hit.lat || !hit.lon) return null;
  return { found: true, label: hit.display_name?.split(',').slice(0, 2).join(',') ?? q, description: hit.type, lat: Number(hit.lat), lng: Number(hit.lon), source: 'osm', id: String(hit.osm_id ?? '') };
}

Deno.serve(async (req) => {
  const ch = cors(req.headers.get('origin'));
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...ch, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { headers: ch });
  try {
    const { q, language = 'sv' } = await req.json().catch(() => ({}));
    const query = String(q ?? '').trim();
    if (query.length < 2) return json({ found: false });
    let res: Resolved | null = null;
    try { res = await viaWikidata(query, language === 'en' ? 'en' : 'sv'); } catch { /* fall through */ }
    if (!res) { try { res = await viaNominatim(query); } catch { /* fall through */ } }
    return json(res ?? { found: false });
  } catch (e) {
    return json({ found: false, error: String(e) }, 200);
  }
});
