// Tile-proxy för Lantmäteriets Topografiska webbkarta (topowebb-ccby, CC BY 4.0).
// Browsern kan aldrig bära LM_USER/LM_PASS — proxyn lägger Basic-auth server-side och
// serverar PNG-brickor med cache. Endast Sverige; utomlands använder frontend OSM.
//
// Frontend-URL (XYZ, som Leaflet/MapLibre): {origin}/functions/v1/topowebb-tile/<layer>/{z}/{x}/{y}.png
//   layer = topowebb | topowebb_nedtonad
// WMTS vill ha /{TileMatrix}/{TileRow}/{TileCol} = /{z}/{y}/{x} → vi tar emot XYZ och swappar.
//
// Deploy:  supabase functions deploy topowebb-tile --project-ref mnuifmcjspeaauzehasj
// Secrets: supabase secrets set LM_USER=eata0003 LM_PASS=<lösen>   (eller i dashboarden)

const LM = 'https://maps.lantmateriet.se/open/topowebb-ccby/v1/wmts/1.0.0';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  const url = new URL(req.url);
  // matcha .../<layer>/<z>/<x>/<y>.png
  const m = url.pathname.match(/\/(topowebb(?:_nedtonad)?)\/(\d+)\/(\d+)\/(\d+)\.png$/);
  if (!m) return new Response('bad path', { status: 400, headers: cors });
  const [, layer, z, x, y] = m;
  const user = Deno.env.get('LM_USER'); const pass = Deno.env.get('LM_PASS');
  if (!user || !pass) return new Response('LM credentials missing', { status: 500, headers: cors });
  // XYZ (z/x/y) → WMTS (z/y/x)
  const tileUrl = `${LM}/${layer}/default/3857/${z}/${y}/${x}.png`;
  try {
    const r = await fetch(tileUrl, { headers: { Authorization: 'Basic ' + btoa(`${user}:${pass}`) } });
    if (!r.ok) return new Response(`tile ${r.status}`, { status: r.status, headers: cors });
    return new Response(r.body, {
      headers: { ...cors, 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800, immutable' },
    });
  } catch (_e) {
    return new Response('upstream error', { status: 502, headers: cors });
  }
});
