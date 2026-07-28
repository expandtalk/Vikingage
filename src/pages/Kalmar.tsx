import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, FlaskConical, Info, Compass, Anchor, ScrollText, Coins as CoinsIcon, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// /sv/kalmar — forskningshubb för det tidiga/medeltida Kalmar i Möre. Binder ihop:
//  - Ortnamnsforskningen kring Hossmo (husaby-nukleusen, SOL 2003, kalmar_place_names)
//  - Den medeltida staden (stadsmuren → /sv/kalmar-stadsmur, hamnen Kättilen, äldsta breven)
//  - Fynden (coins: Äspelund-medaljongen, Varvsholmen-denarerna m.fl.)
// Hederlighetsprincip (Daniel: "man får inte hitta på"): per ortnamn flaggas om SOL behandlar
// exakt orten (locality), bara elementet (element) eller inte alls (none). Koord bara där de kan
// beläggas (Hossmo = kyrkan/Fornsök, Grimskär = rutt-verifierad); resten geokodas som eget steg.

interface PlaceName {
  id: string; name: string; category: string; sol_headword: string | null;
  sol_match: string; sol_note: string | null; element_reading: string | null;
  interpretation: string | null; lat: number | null; lng: number | null; source: string | null;
  gazetteer_match: boolean; coord_precision: string | null;
  head_element: string | null; semantic_domain: string | null; period_stratum: string | null;
}
interface PlaceForm { place_name: string; attested_form: string; attested_year: number | null; form_kind: string | null; source: string; verified: boolean; dialect_note: string | null; }
interface Harbor { name: string; harbor_type: string | null; lat: number | null; lng: number | null; description: string | null; }
interface Coin { name: string; metal: string | null; find_place: string | null; coordinates: { x: number; y: number } | string | null; significance: string | null; }

// coins.coordinates är Postgres 'point' → postgREST ger strängen "(x,y)" i browsern (pg ger {x,y}).
// Tål båda formerna. Point = (x=lng, y=lat).
const parsePoint = (v: Coin['coordinates']): { x: number; y: number } | null => {
  if (!v) return null;
  if (typeof v === 'object') {
    const x = Number((v as { x: unknown }).x), y = Number((v as { y: unknown }).y);
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
  }
  const m = String(v).match(/\(?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)?/);
  return m ? { x: +m[1], y: +m[2] } : null;
};
interface Ev { event_name: string; year_start: number | null; description: string | null; location_status: string | null; }

const CAT_LABEL: Record<string, string> = {
  husaby: 'Husaby', by_administrativt: 'Administrativ by', by: 'By', torp: 'Torp',
  'ö': 'Ö', skär_grund: 'Skär/grund', terräng: 'Terräng', vattendrag: 'Vattendrag',
  'lösa': 'Lösa-namn', socken: 'Socken/kyrkby',
};
// Semantiska fält (sidoordnat per område) + periodskikt (namnledskronologin = "kontoplanen")
const DOMAIN_LABEL: Record<string, string> = {
  krig: 'Krig', 'rätt': 'Rätt/ting', hantverk: 'Hantverk', makt_administration: 'Makt/adm.',
  jordbruk: 'Jordbruk', natur_växt: 'Natur/växt', 'träslag': 'Träslag', terräng_sten: 'Terräng/sten',
  bebyggelse: 'Bebyggelse', personnamn: 'Personnamn', vatten_kust: 'Vatten/kust', kult: 'Kult', 'okänd': 'Okänd',
};
const STRATUM_META: Record<string, { color: string; label: string }> = {
  'järnålder': { color: '#f472b6', label: 'Järnålder' },
  vikingatid: { color: '#f59e0b', label: 'Vikingatid' },
  tidig_medeltid: { color: '#fbbf24', label: 'Tidig medeltid' },
  medeltid: { color: '#a3e635', label: 'Medeltid' },
  efterreformatorisk: { color: '#38bdf8', label: 'Efterreformatorisk' },
  'okänd': { color: '#94a3b8', label: 'Okänt skikt' },
};
const MATCH_META: Record<string, { color: string; label: string }> = {
  locality: { color: '#22c55e', label: 'SOL: orten belagd' },
  element: { color: '#eab308', label: 'SOL: bara elementet (annan ort)' },
  none: { color: '#94a3b8', label: 'Ej i SOL — endast ledanalys' },
};
const METAL_COLOR: Record<string, string> = { guld: '#f4c430', silver: '#c0c0c0', brons: '#cd7f32', koppar: '#b87333' };

// Precisions-tier = hederlighetsaxeln (inte en gate). Forskaren avgör och kan flytta allt.
const PRECISION_META: Record<string, { color: string; label: string; solid: boolean }> = {
  fornsök: { color: '#22c55e', label: 'RAÄ Fornsök', solid: true },
  register: { color: '#22c55e', label: 'Ortregister (place_names)', solid: true },
  rutt: { color: '#22c55e', label: 'Rutt-verifierad', solid: true },
  'approx-osm': { color: '#eab308', label: 'OSM (approx)', solid: false },
  placeholder: { color: '#94a3b8', label: 'Placeholder — positioneras', solid: false },
};
const precMeta = (p: string | null) => PRECISION_META[p ?? ''] ?? { color: '#94a3b8', label: p ?? '—', solid: false };

// Egen karta över Kalmar-noden. Visar bara objekt med belagd koordinat (Hossmo kyrka, Grimskär,
// hamnen Kättilen, myntfynden). Ortnamn utan koord listas nedan, ej på kartan (geokodning pending).
const KalmarMap: React.FC<{ places: PlaceName[]; harbor: Harbor | null; coins: Coin[]; canEdit: boolean; onMove: (id: string, lat: number, lng: number) => void }> = ({ places, harbor, coins, canEdit, onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [56.66, 16.34], zoom: 11, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const layer = layerRef.current, map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    const pts: [number, number][] = [];

    places.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))).forEach((p) => {
      const husaby = p.category === 'husaby';
      const pm = precMeta(p.coord_precision);
      const color = husaby ? '#f59e0b' : pm.solid ? '#a78bfa' : pm.color;
      pts.push([p.lat!, p.lng!]);
      const popupHtml = `<b>${p.name}</b> <span style="font-size:10px;color:#888">${CAT_LABEL[p.category] ?? p.category}</span><br/><span style="font-size:11px">${p.element_reading ?? ''}</span>${p.interpretation && p.interpretation !== '—' ? `<br/><span style="font-size:11px;color:#666">${p.interpretation}</span>` : ''}<br/><span style="font-size:10px;color:${pm.color}">◉ ${pm.label}</span>${canEdit ? '<br/><span style="font-size:10px;color:#38bdf8">✎ dra för att flytta → sparas som "forskare"</span>' : ''}`;
      if (canEdit) {
        // Redigeringsläge: dragbar markör som sparar exakt läge (precision 'forskare').
        const sz = husaby ? 18 : 14;
        const icon = L.divIcon({ className: '', iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2],
          html: `<span style="display:block;width:${sz}px;height:${sz}px;border-radius:9999px;background:${color};border:2px solid #0b1220;box-shadow:0 0 5px ${color};cursor:grab"></span>` });
        L.marker([p.lat!, p.lng!], { draggable: true, icon, autoPan: true })
          .bindTooltip(p.name, { direction: 'top', offset: [0, -sz / 2], className: 'ang-clabel' })
          .bindPopup(popupHtml)
          .on('dragend', (ev: L.LeafletEvent) => {
            const ll = (ev.target as L.Marker).getLatLng();
            onMove(p.id, +ll.lat.toFixed(6), +ll.lng.toFixed(6));
          })
          .addTo(layer);
      } else {
        L.circleMarker([p.lat!, p.lng!], {
          radius: husaby ? 9 : 6, color, weight: 2, fillColor: color,
          fillOpacity: husaby ? 0.35 : pm.solid ? 0.65 : 0.2,
          dashArray: pm.solid ? undefined : '3 4', // approx/placeholder = streckad ring
        })
          .bindTooltip(p.name, { permanent: husaby, direction: 'top', offset: [0, -8], className: 'ang-clabel' })
          .bindPopup(popupHtml)
          .addTo(layer);
      }
    });

    if (harbor && Number.isFinite(Number(harbor.lat)) && Number.isFinite(Number(harbor.lng))) {
      pts.push([harbor.lat, harbor.lng]);
      L.circleMarker([harbor.lat, harbor.lng], { radius: 7, color: '#38bdf8', weight: 2, fillColor: '#38bdf8', fillOpacity: 0.5 })
        .bindTooltip(harbor.name, { direction: 'top', offset: [0, -8] })
        .bindPopup(`<b>${harbor.name}</b><br/><span style="font-size:11px">${harbor.harbor_type ?? ''}</span>${harbor.description ? `<br/><span style="font-size:11px;color:#666">${harbor.description}</span>` : ''}`)
        .addTo(layer);
    }

    coins.map((c) => ({ c, pt: parsePoint(c.coordinates) })).filter((x) => x.pt).forEach(({ c, pt }) => {
      const color = METAL_COLOR[(c.metal ?? '').toLowerCase()] ?? '#e5e7eb';
      const cy = pt!.y, cx = pt!.x;
      pts.push([cy, cx]);
      L.circleMarker([cy, cx], { radius: 6, color, weight: 2, fillColor: color, fillOpacity: 0.7 })
        .bindPopup(`<b>${c.name}</b><br/><span style="font-size:11px;color:#666">${c.find_place ?? ''}</span>${c.significance ? `<br/><span style="font-size:11px">${c.significance}</span>` : ''}`)
        .addTo(layer);
    });

    // Fit bara första gången — annars hoppar kartan vid varje sparad flytt.
    if (pts.length && !fittedRef.current) { map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 12 }); fittedRef.current = true; }
  }, [places, harbor, coins, canEdit, onMove]);

  return <div ref={containerRef} className="w-full h-[460px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 460 }} />;
};

const NameRow: React.FC<{ n: PlaceName; forms?: PlaceForm[] }> = ({ n, forms = [] }) => {
  const m = MATCH_META[n.sol_match] ?? MATCH_META.none;
  const pm = precMeta(n.coord_precision);
  const strat = n.period_stratum ? STRATUM_META[n.period_stratum] ?? STRATUM_META['okänd'] : null;
  return (
    <div className="py-2 border-b border-slate-800/60 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-foreground font-medium text-sm">{n.name}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-300">{CAT_LABEL[n.category] ?? n.category}</span>
        {n.semantic_domain && n.semantic_domain !== 'okänd' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-200">{DOMAIN_LABEL[n.semantic_domain] ?? n.semantic_domain}</span>
        )}
        {strat && <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: strat.color + '22', color: strat.color }}>{strat.label}</Badge>}
        <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: m.color + '22', color: m.color }}>{m.label}</Badge>
        <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: pm.color + '22', color: pm.color }}>◉ {pm.label}</Badge>
      </div>
      {n.head_element && <p className="text-xs text-foreground/70 mt-1">Led: <strong>{n.head_element}</strong> — {n.element_reading}</p>}
      {n.sol_note && <p className="text-xs text-muted-foreground mt-0.5"><strong>SOL:</strong> {n.sol_note}</p>}
      {n.interpretation && n.interpretation !== '—' && <p className="text-xs text-muted-foreground mt-0.5 italic">{n.interpretation}</p>}
      {forms.length > 0 && (
        <p className="text-xs text-sky-300/90 mt-0.5">
          Belagda former: {forms.map((f) => `${f.attested_form}${f.attested_year ? ` (${f.attested_year})` : ''}${f.verified ? '' : ' *'}`).join(' · ')}
          <span className="text-muted-foreground"> {forms.some((f) => !f.verified) && '(* overifierad/lokalkännedom)'}</span>
        </p>
      )}
    </div>
  );
};

const Kalmar = () => {
  const [places, setPlaces] = useState<PlaceName[]>([]);
  const [harbor, setHarbor] = useState<Harbor | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [forms, setForms] = useState<PlaceForm[]>([]);
  const { canEdit } = useUserRole();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleMove = useCallback(async (id: string, lat: number, lng: number) => {
    const { error } = await (supabase.from('kalmar_place_names') as any)
      .update({ lat, lng, coord_precision: 'forskare' }).eq('id', id);
    if (error) { setSaveMsg('Kunde inte spara — saknar behörighet (editor/admin krävs).'); return; }
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, lat, lng, coord_precision: 'forskare' } : p)));
    const moved = places.find((p) => p.id === id);
    setSaveMsg(`Läge sparat ✓ ${moved ? moved.name : ''} → ${lat.toFixed(4)}, ${lng.toFixed(4)} (precision: forskare)`);
  }, [places]);

  useEffect(() => {
    (supabase.from('kalmar_place_names') as any).select('*').order('name')
      .then(({ data }: { data: PlaceName[] | null }) => setPlaces(data ?? []));
    (supabase.from('place_name_forms') as any).select('place_name,attested_form,attested_year,form_kind,source,verified,dialect_note')
      .then(({ data }: { data: PlaceForm[] | null }) => setForms(data ?? []));
    (supabase.from('harbors') as any).select('name,harbor_type,lat,lng,description').ilike('name', '%kättil%').maybeSingle()
      .then(({ data }: { data: Harbor | null }) => setHarbor(data));
    (supabase.from('coins') as any).select('name,metal,find_place,coordinates,significance')
      .or('find_place.ilike.%kalmar%,find_place.ilike.%skäggenäs%,find_place.ilike.%varvsholm%,find_place.ilike.%äspelund%')
      .then(({ data }: { data: Coin[] | null }) => setCoins(data ?? []));
    (supabase.from('historical_events') as any).select('event_name,year_start,description,location_status')
      .ilike('event_name', '%kalmar%').order('year_start')
      .then(({ data }: { data: Ev[] | null }) => setEvents(data ?? []));
  }, []);

  const sv = (a: PlaceName, b: PlaceName) => a.name.localeCompare(b.name, 'sv');
  const inReg = places.filter((p) => p.gazetteer_match).sort(sv);
  const notReg = places.filter((p) => !p.gazetteer_match).sort(sv);
  const geocoded = places.filter((p) => p.lat != null).length;
  const solLocality = places.filter((p) => p.sol_match === 'locality').length;
  const formsFor = (name: string) => forms.filter((f) => f.place_name === name);
  const needGeotag = places
    .filter((p) => p.coord_precision === 'approx-osm' || p.coord_precision === 'placeholder')
    .sort((a, b) => (a.coord_precision === 'placeholder' ? 0 : 1) - (b.coord_precision === 'placeholder' ? 0 : 1) || a.name.localeCompare(b.name, 'sv'));

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Kalmar — från Hossmo husaby till gränsstaden"
        titleEn="Kalmar — from the Hossmo husaby to the border town"
        description="Forskningssida om det tidiga och medeltida Kalmar i Möre: ortnamnsklustret kring Hossmo husaby, stadsmuren, hamnen Kättilen, de äldsta breven och fynden. Källförd (SOL 2003, RAÄ Fornsök), med redovisade osäkerheter."
        descriptionEn="Research page on early and medieval Kalmar in Möre: the place-name cluster around the Hossmo husaby, the town wall, the Kättilen harbour, the oldest charters and the finds."
        keywords="Kalmar, Hossmo, husaby, Möre, Rinkaby, ortnamn, Svenskt ortnamnslexikon, stadsmur, Kättilen, medeltid, vikingatid"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Crown className="h-8 w-8 text-gold" />
            Kalmar — från Hossmo husaby till gränsstaden
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Maktens rötter i Möre, före staden vid slottet</p>
          <p className="text-muted-foreground text-lg">
            Innan Kalmar blev rikets gränsstad låg Möres maktcentrum längre in, vid{' '}
            <strong>Ljungbyåns mynning</strong>. Ortnamnen pekar ut det: <strong>Hossmo</strong> — enligt
            Svenskt ortnamnslexikon <em>*Husa</em> ('husaby') + <em>mo</em> — är i sig ett husaby-namn, ett
            kungligt/administrativt gods, med <strong>Rinkabys</strong> hirdmän intill. Kring den noden restes
            en av Sveriges äldsta stenkyrkor (Hossmo rundkyrka, ca 1120). Sidan binder ihop den
            ortnamnsforskningen med den senare medeltida staden: <strong>muren</strong>, <strong>hamnen</strong>,
            de äldsta <strong>breven</strong> och <strong>fynden</strong>.
          </p>
        </div>

        {/* KARTA */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> Kalmar-noden på kartan</CardTitle>
          </CardHeader>
          <CardContent>
            {canEdit && (
              <div className="mb-2 flex flex-wrap items-center gap-2 rounded border border-sky-700/50 bg-sky-950/30 px-3 py-2 text-xs text-sky-200">
                <span className="font-semibold">✎ Redigeringsläge (forskare)</span>
                <span className="opacity-80">— dra en markör till rätt läge, det sparas direkt (precision blir "forskare").</span>
                {saveMsg && <span className="ml-auto text-emerald-300">{saveMsg}</span>}
              </div>
            )}
            <KalmarMap places={places} harbor={harbor} coins={coins} canEdit={canEdit} onMove={handleMove} />
            <p className="text-xs text-muted-foreground mt-2 opacity-75">
              <strong>Guld</strong> = Hossmo husaby. <strong>Lila (heldragen)</strong> = verifierad koord (register/Fornsök/rutt).
              <strong> Gul/grå (streckad ring)</strong> = approx (OSM) resp. placeholder — <em>positioneras av dig</em>.
              <strong> Blå</strong> = hamnen Kättilen. <strong>Metallfärg</strong> = myntfynd. Alla {geocoded} av {places.length} ortnamn
              är nu utsatta; klicka för precision-källa.
            </p>
          </CardContent>
        </Card>

        {/* ORTNAMN — husaby-nukleusen */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><ScrollText className="h-5 w-5" /> Ortnamnen kring Hossmo ({places.length})</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p className="text-xs opacity-80">
              Grupperade efter <strong>ortregistret</strong> (Lantmäteriets gazetteer <code>place_names</code>). Varje namn är
              kodat i det onomastiska ramverket: <strong>semantiskt fält</strong> (krig/rätt/hantverk…, som en områdes-kontoplan)
              och <strong>periodskikt</strong> ur namnledskronologin (järnålder → efterreformatorisk). Plus <strong>SOL-belägg</strong>
              (grönt = orten belagd, gult = bara elementet, grått = ej i SOL) och <strong>koord-precision</strong>. Där belagda
              äldre former finns visas de (huvudboken). Kodningen är standardläsning (kronologi + SOL 2003) — <strong>du kan ändra den</strong>.
            </p>
            <div>
              <div className="text-xs font-semibold text-emerald-300 mb-1">I ortregistret ({inReg.length})</div>
              {inReg.map((n) => <NameRow key={n.id} n={n} forms={formsFor(n.name)} />)}
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 mb-1">Saknas i ortregistret ({notReg.length}) — skär &amp; små torp, geokodade approx/placeholder</div>
              {notReg.map((n) => <NameRow key={n.id} n={n} forms={formsFor(n.name)} />)}
            </div>
          </CardContent>
        </Card>

        {/* GEOTAG-ARBETSLISTA — vilka namn som inte blivit färdig-geotaggade (forskaren positionerar) */}
        {needGeotag.length > 0 && (
          <Card className="viking-card mb-4 border-amber-600/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-300"><MapPin className="h-5 w-5" /> Ej färdig-geotaggat ({needGeotag.length})</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p className="text-xs opacity-80">Dessa har bara <strong>approximerad</strong> (OSM) eller <strong>placeholder</strong>-koordinat — de väntar på din positionering. Verifierade (register/Fornsök/rutt) visas inte här.</p>
              <div className="flex flex-wrap gap-2">
                {needGeotag.map((p) => {
                  const pm = precMeta(p.coord_precision);
                  return (
                    <span key={p.id} className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-2 py-1 text-xs" style={{ color: pm.color }}>
                      <span style={{ width: 8, height: 8, borderRadius: 9999, background: pm.color, display: 'inline-block' }} />
                      {p.name}
                      <span className="text-[10px] text-muted-foreground">{p.coord_precision === 'placeholder' ? 'placeholder' : 'approx'}</span>
                    </span>
                  );
                })}
              </div>
              <p className="text-[11px] opacity-70">{canEdit ? 'Du är inloggad som forskare: dra markörerna i kartan ovan för att sätta exakt läge — det sparas direkt (precision "forskare") och namnet försvinner härifrån.' : 'Logga in som forskare (editor/admin) för att dra markörerna och spara exakta lägen direkt i kartan.'}</p>
            </CardContent>
          </Card>
        )}

        {/* DEN MEDELTIDA STADEN */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /> Den medeltida staden</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <Link to="/sv/kalmar-stadsmur" className="block border-l-2 border-emerald-500 pl-3 py-1 hover:bg-slate-800/30 rounded-r transition-colors">
              <div className="text-foreground font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-400" /> Stadsmuren →</div>
              <div className="text-xs mt-0.5">Medeltida mur med tidsslider och evidensklass per segment (uppmätt/interpolerad/hypotetisk). Egen sida.</div>
            </Link>
            {harbor && (
              <div className="border-l-2 border-sky-500 pl-3 py-1">
                <div className="text-foreground font-medium flex items-center gap-2"><Anchor className="h-4 w-4 text-sky-400" /> {harbor.name}</div>
                <div className="text-xs mt-0.5">{harbor.description ?? harbor.harbor_type}</div>
              </div>
            )}
            {events.length > 0 && (
              <div className="border-l-2 border-amber-500 pl-3 py-1">
                <div className="text-foreground font-medium flex items-center gap-2"><ScrollText className="h-4 w-4 text-amber-400" /> Äldsta breven</div>
                {events.map((e) => (
                  <div key={e.event_name} className="text-xs mt-1">
                    <strong>{e.year_start}</strong> — {e.event_name}. {e.description}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* FYND */}
        {coins.length > 0 && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold"><CoinsIcon className="h-5 w-5" /> Fynd i Kalmar-området ({coins.length})</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {coins.map((c) => (
                <div key={c.name} className="border-b border-slate-800/60 last:border-0 py-1.5">
                  <div className="text-foreground font-medium text-sm flex items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: 9999, background: METAL_COLOR[(c.metal ?? '').toLowerCase()] ?? '#e5e7eb', display: 'inline-block' }} />
                    {c.name}
                  </div>
                  <div className="text-xs mt-0.5">{c.find_place}</div>
                  {c.significance && <div className="text-xs text-muted-foreground/80">{c.significance}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* STATUS */}
        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Status: belagt och pending</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Belagt:</strong> {solLocality} ortnamn behandlas direkt i SOL 2003 (bl.a. <em>Hossmo = *Husa + mo</em>, husaby-tolkningen). {inReg.length} finns i Lantmäteriets ortregister med register-koordinat. Hossmo rundkyrka (ca 1120) och hamnen Kättilen är källförda med koordinat (RAÄ Fornsök).</p>
            <p><strong className="text-amber-300">Tolkning, ej dom:</strong> att Hossmo-Rinkaby-noden var Möres maktcentrum <em>före</em> Kalmar är en välgrundad hypotes utifrån husaby-/rink-namnen — forskaren avgör.</p>
            <p><strong className="text-foreground">Koordinater ({geocoded}/{places.length}):</strong> alla utsatta, med precisions-flagga. Verifierade (register/Fornsök/rutt/forskare), OSM-approximerade och placeholder. <strong className="text-sky-300">Inloggad forskare (editor/admin) drar markörerna direkt i kartan</strong> — sparas som precision "forskare". Kvar: blodbadet 1505 och Kalmar-/Öland-släkterna.</p>
          </CardContent>
        </Card>

        {/* SÅ TESTAR DU */}
        <Card className="viking-card mb-4 border-sky-700/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-sky-300"><FlaskConical className="h-5 w-5" /> Så testar du materialet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Pröva noden rumsligt: öppna kartan, mät räckvidd från Hossmo och se vad som ligger inom gångavstånd (byar, gravfält, hamnen).</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Öppna <Link to="/explore?center=56.66,16.34&zoom=11" className="text-gold hover:underline">kartan (Utforska)</Link> — centrerad på Kalmar/Hossmo.</li>
              <li><strong>Högerklicka</strong> på Hossmo → <em>"Mät räckvidd härifrån"</em>, välj radie (t.ex. daglig maskvidd 9 km).</li>
              <li>Läs antalet objekt i formen och <strong>exportera</strong> till GeoJSON/CSV.</li>
            </ol>
            <div className="pt-1">
              <Link to="/explore?center=56.66,16.34&zoom=11" className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">
                <Compass className="h-4 w-4" /> Öppna kartan
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Källor: Svenskt ortnamnslexikon 2003 (SOL, diva2:1175717); RAÄ Fornsök (koordinater, kyrka); <em>Kalmar stads historia</em> 1. Data: <code>kalmar_place_names</code>, <code>harbors</code>, <code>coins</code>, <code>historical_events</code>. Metoden delar ledkatalog med <Link to="/sv/ortnamn" className="text-gold hover:underline">ortnamnssidan</Link>.</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Kalmar;
