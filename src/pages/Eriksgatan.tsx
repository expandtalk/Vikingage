import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArticleProvenance } from '../components/ArticleProvenance';
import { useLanguage } from '@/contexts/LanguageContext';
import { PlaceMap } from '@/components/map/PlaceMap';
import type { LegendLayerDef } from '@/hooks/map/useMapLegendState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

// /sv/eriksgatan — dedikerad sida för den kungliga riksrundan, på den delade PlaceMap-motorn.
// Tematisk kärna: det ZOOM-PROGRESSIVA landskaps-lagret (progressiveAdmin) — Eriksgatan följde
// LANDSKAPSLAGARNA (kungen "togs till konung" av varje lands ting). Rutt + landmärken ur DB
// (viking_roads 'eriksgatan' + road_overview). Modifierbar legend via PlaceMap.extraDefs:
// tingsplatser (thing_sites), runstenar & kyrkor (eriksgata_nearby) som egna av/på-bara lager.
// Rutt-linjen är SCHEMATISK och märkt så — exakt vägsträckning mellan anhalterna är okänd
// (raka linjer korsar sjöar; det är ingen påstådd färdväg). INGEN GISSNING.

interface Waypoint { name: string | null; type: string | null; lat: number; lng: number; ord: number }
interface Landmark { name: string; type: string | null; lat: number; lng: number; description: string | null; significance: string | null }
interface RoadOverview { name: string; type: string | null; description: string | null; slug: string; waypoints: Waypoint[]; landmarks: Landmark[] }
interface RoadRow { name: string; name_en: string | null; description: string | null; description_en: string | null; total_length_km: number | null }
interface ThingSite { name: string | null; thing_type: string | null; landscape: string | null; lat: number; lng: number; description: string | null; confidence: string | null; source: string | null; period_start: number | null; period_end: number | null }
interface NearbyRune { signum: string; lat: number; lng: number }
interface NearbyChurch { name: string; type: string; lat: number; lng: number }

const sb = supabase as unknown as {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
  from: (t: string) => any;
};
const esc = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const EriksgatanMap: React.FC<{ road: RoadOverview | null; sv: boolean }> = ({ road, sv }) => {
  const mapRef = useRef<L.Map | null>(null);
  const groups = useRef<Record<string, L.LayerGroup>>({});

  const defs: LegendLayerDef[] = [
    { key: 'e_rutt', label: sv ? 'Rutt (schematisk)' : 'Route (schematic)', color: '#d97706', group: 'layer', defaultOn: true },
    { key: 'e_stader', label: sv ? 'Städer & kloster' : 'Towns & monasteries', color: '#fb923c', group: 'layer', defaultOn: true },
    { key: 'e_gisslebyten', label: sv ? 'Gisslebyten (belagd överlämning)' : 'Hostage exchanges (attested handover)', color: '#f59e0b', group: 'layer', defaultOn: true },
    { key: 'e_landmarken', label: sv ? 'Landmärken' : 'Landmarks', color: '#fbbf24', group: 'layer', defaultOn: true },
    { key: 'e_tingsplatser', label: sv ? 'Tingsplatser' : 'Assembly (ting) sites', color: '#22d3ee', group: 'layer', defaultOn: true },
    { key: 'e_runstenar', label: sv ? 'Runstenar (≤1 km)' : 'Runestones (≤1 km)', color: '#ef4444', group: 'layer', defaultOn: false },
    { key: 'e_kyrkor', label: sv ? 'Medeltida kyrkor (≤500 m)' : 'Medieval churches (≤500 m)', color: '#a855f7', group: 'layer', defaultOn: false },
  ];
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(defs.map((d) => [d.key, d.defaultOn !== false])),
  );

  const { data: things = [] } = useQuery({
    queryKey: ['thing-sites-eriksgata'],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<ThingSite[]> => {
      const { data } = await sb.from('thing_sites')
        .select('name,thing_type,landscape,lat,lng,description,confidence,source,period_start,period_end')
        .not('lat', 'is', null);
      return (data ?? []) as ThingSite[];
    },
  });
  const { data: nearby = { runestones: [], churches: [] } } = useQuery({
    queryKey: ['eriksgata-nearby'],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<{ runestones: NearbyRune[]; churches: NearbyChurch[] }> => {
      try {
        const { data } = await sb.rpc('eriksgata_nearby', { radius_m: 1000 });
        const n = (data ?? {}) as { runestones?: NearbyRune[]; churches?: NearbyChurch[] };
        return { runestones: n.runestones ?? [], churches: n.churches ?? [] };
      } catch { return { runestones: [], churches: [] }; }
    },
  });

  // Rita alla lager (töm + fyll varje grupp). Körs när kartan eller datan ändras.
  const draw = () => {
    const map = mapRef.current;
    if (!map || !groups.current.e_rutt) return;
    Object.values(groups.current).forEach((g) => g.clearLayers());

    const pts = (road?.waypoints ?? []).filter((w) => w.lat != null && w.lng != null).map((w) => [w.lat, w.lng] as [number, number]);
    if (pts.length >= 2) {
      // SCHEMATISK linje: tunn, halvtransparent, streckad — märkt att exakt sträckning är okänd.
      L.polyline(pts, { color: '#d97706', weight: 2.5, opacity: 0.55, dashArray: '4,7' })
        .bindPopup(sv
          ? '<b>Eriksgatan (schematisk)</b><br/><span style="font-size:11px;color:#78350f">Linjen förbinder de belagda landskaps-anhalterna ur landskapslagarna. Den <b>exakta</b> vägsträckningen mellan anhalterna är okänd — raka linjer kan korsa sjöar. Detta är ingen påstådd färdväg.</span>'
          : '<b>The Eriksgata (schematic)</b><br/><span style="font-size:11px;color:#78350f">The line connects the attested province stops from the provincial laws. The <b>exact</b> route between stops is unknown — straight segments may cross lakes. This is not a claimed path.</span>')
        .addTo(groups.current.e_rutt);
    }
    (road?.waypoints ?? []).forEach((w) => {
      if (w.lat == null || w.lng == null) return;
      const gisslebyte = w.type === 'junction' || w.type === 'bridge';
      L.circleMarker([w.lat, w.lng], { radius: gisslebyte ? 6 : 5, color: '#7c2d12', weight: 2, fillColor: gisslebyte ? '#f59e0b' : '#fb923c', fillOpacity: 0.95 })
        .bindPopup(`<b>${esc(w.name ?? '')}</b>${gisslebyte ? `<br/><span style="font-size:11px;color:#78350f">${sv ? 'Belagd gränsöverlämning (gisslebyte) — här avlöstes landskapens följe och gisslan/lejd växlades.' : 'Attested border handover (hostage exchange) — the escort of one province handed the king to the next.'}</span>` : ''}`)
        .addTo(groups.current[gisslebyte ? 'e_gisslebyten' : 'e_stader']);
    });
    (road?.landmarks ?? []).forEach((f) => {
      if (f.lat == null || f.lng == null) return;
      L.circleMarker([f.lat, f.lng], { radius: 7, color: '#78350f', weight: 2, fillColor: '#fbbf24', fillOpacity: 1 })
        .bindPopup(`<b>${esc(f.name)}</b>${f.description ? `<br/><span style="font-size:11px;color:#78350f">${esc(f.description)}</span>` : ''}`)
        .addTo(groups.current.e_landmarken);
    });
    // Tingsplatser (thing_sites) — här togs kungen till konung / svor lagen i varje land.
    things.forEach((t) => {
      if (t.lat == null || t.lng == null) return;
      const period = (t.period_start || t.period_end) ? `${t.period_start ?? '?'}–${t.period_end ?? '?'}` : null;
      L.circleMarker([t.lat, t.lng], { radius: 6, color: '#155e75', weight: 2, fillColor: '#22d3ee', fillOpacity: 0.9 })
        .bindPopup(
          `<b>${esc(t.name ?? (sv ? 'Tingsplats' : 'Assembly site'))}</b>` +
          `<br/><span style="font-size:11px;color:#0e7490">${esc([t.thing_type, t.landscape].filter(Boolean).join(' · '))}${period ? ` · ${period}` : ''}</span>` +
          (t.description ? `<div style="font-size:11px;color:#334155;margin-top:4px;max-width:230px">${esc(t.description)}</div>` : '') +
          (t.confidence ? `<br/><span style="font-size:10px;color:#64748b">${sv ? 'Konfidens' : 'Confidence'}: ${esc(t.confidence)}</span>` : '') +
          (t.source ? `<br/><span style="font-size:10px;color:#64748b">${sv ? 'Källa' : 'Source'}: ${esc(t.source)}</span>` : ''),
        )
        .addTo(groups.current.e_tingsplatser);
    });
    nearby.runestones.forEach((r) => {
      L.circleMarker([r.lat, r.lng], { radius: 3, color: '#b91c1c', weight: 1, fillColor: '#ef4444', fillOpacity: 0.85 })
        .bindPopup(`<b>${esc(r.signum)}</b><br/>${sv ? 'Runsten nära leden' : 'Runestone near the route'}`)
        .addTo(groups.current.e_runstenar);
    });
    nearby.churches.forEach((c) => {
      L.circleMarker([c.lat, c.lng], { radius: 3, color: '#7e22ce', weight: 1, fillColor: '#a855f7', fillOpacity: 0.85 })
        .bindPopup(`<b>${esc(c.name)}</b><br/>${esc(c.type)} ${sv ? 'nära leden' : 'near the route'}`)
        .addTo(groups.current.e_kyrkor);
    });

    const all: [number, number][] = [...pts, ...(road?.landmarks ?? []).filter((f) => f.lat != null && f.lng != null).map((f) => [f.lat, f.lng] as [number, number])];
    if (all.length >= 2) map.fitBounds(L.latLngBounds(all), { padding: [40, 40], maxZoom: 8 });
  };

  // Synka lager-synlighet mot legend-togglarna.
  const syncVisibility = () => {
    const map = mapRef.current;
    if (!map) return;
    Object.entries(groups.current).forEach(([key, g]) => {
      const on = enabled[key] !== false;
      if (on && !map.hasLayer(g)) g.addTo(map);
      else if (!on && map.hasLayer(g)) map.removeLayer(g);
    });
  };

  const onMapReady = (map: L.Map, initialEnabled: Record<string, boolean>) => {
    mapRef.current = map;
    defs.forEach((d) => { groups.current[d.key] = L.layerGroup(); });
    setEnabled((prev) => ({ ...prev, ...initialEnabled }));
    draw();
    syncVisibility();
  };

  useEffect(() => { draw(); syncVisibility(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [road, things, nearby]);
  useEffect(() => { syncVisibility(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [enabled]);

  return (
    <PlaceMap
      center={{ lat: 59.3, lng: 16.2 }} zoom={6} layers={[]} progressiveAdmin
      heightClass="h-[70vh]" extraDefs={defs} onMapReady={onMapReady} onEnabledChange={setEnabled}
    />
  );
};

// Liten statusetikett för etymologi-sektionen.
const Stat: React.FC<{ kind: 'belagt' | 'hypotes' | 'sagen'; sv: boolean }> = ({ kind, sv }) => {
  const m = {
    belagt: { c: '#22c55e', sv: 'Belagt', en: 'Attested' },
    hypotes: { c: '#f59e0b', sv: 'Hypotes', en: 'Hypothesis' },
    sagen: { c: '#a855f7', sv: 'Sägen/folketymologi', en: 'Legend/folk etymology' },
  }[kind];
  return <Badge variant="secondary" className="text-[10px] align-middle" style={{ backgroundColor: m.c + '22', color: m.c, borderColor: m.c + '55' }}>{sv ? m.sv : m.en}</Badge>;
};

const Eriksgatan: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data: road = null } = useQuery({
    queryKey: ['road-overview', 'eriksgatan'],
    queryFn: async () => {
      const { data } = await sb.rpc('road_overview', { p_slug: 'eriksgatan' });
      return (data ?? null) as RoadOverview | null;
    },
  });
  const { data: row = null } = useQuery({
    queryKey: ['viking-road-row', 'eriksgatan'],
    queryFn: async () => {
      const { data } = await sb.from('viking_roads').select('name,name_en,description,description_en,total_length_km').eq('slug', 'eriksgatan').maybeSingle();
      return (data ?? null) as RoadRow | null;
    },
  });

  const desc = sv ? row?.description : (row?.description_en ?? row?.description);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Eriksgatan — kungens rundresa genom landskapen"
        titleEn="The Eriksgata — the king's progress through the provinces"
        description="Den nyvalde kungens rundresa för att tas till konung av varje lands ting. Kartan visar leden genom landskapen med zoom-progressiva gränser (landskap → kommun → socken), tingsplatser, runstenar och kyrkor."
        descriptionEn="The newly elected king's circuit to be accepted as king by each province's assembly. The map shows the route through the provinces with zoom-progressive boundaries, assembly sites, runestones and churches."
        keywords="Eriksgatan, kungaval, landskapslagar, ting, tingsplats, Mora stenar, Uppland, Södermanland, Östergötland, Västergötland, Närke, Västmanland"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Crown className="h-8 w-8 text-gold" /> {sv ? 'Eriksgatan' : 'The Eriksgata'}
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">
            {sv ? 'Kungens rundresa genom landskapen' : "The king's progress through the provinces"}
            {row?.total_length_km ? ` · ~${row.total_length_km} km` : ''}
          </p>
          {desc && <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">{desc}</p>}
        </div>

        <EriksgatanMap road={road} sv={sv} />

        <p className="text-xs text-muted-foreground mt-3 mb-6 opacity-90">
          {sv
            ? 'Legenden är modifierbar — tänd/släck rutt, städer & kloster, gisslebyten, tingsplatser, runstenar och kyrkor. Gisslebytena (Ramundeboda, Oppboga bro, Östens bro) är de belagda gränsöverlämningarna; övriga anhalter är städer och kloster längs vägen. Rutt-linjen är SCHEMATISK: den exakta sträckningen mellan anhalterna är okänd, så raka linjer kan korsa sjöar (eriksgatan gick delvis med båt över Mälaren) — det är ingen påstådd färdväg. Landskaps-lagret byts när du zoomar (landskap → kommun → socken/stad).'
            : 'The legend is adjustable — toggle route, towns & monasteries, hostage exchanges, assembly sites, runestones and churches. The hostage-exchange points (Ramundeboda, Oppboga bro, Östens bro) are the attested border handovers; the other stops are towns and monasteries along the way. The route line is SCHEMATIC: the exact path between stops is unknown, so straight segments may cross lakes (the Eriksgata partly went by boat across Lake Mälaren) — it is not a claimed route. The boundary layer switches as you zoom (province → municipality → parish/town).'}
        </p>

        {/* Etymologi: Eriksgata — belagt vs hypotes */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-xl">
            {sv ? 'Vad betyder ”Eriksgata”?' : 'What does “Eriksgata” mean?'}
          </CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">{sv ? 'Institutionen är belagd. ' : 'The institution is attested. '}</span>
              <Stat kind="belagt" sv={sv} />{' '}
              {sv
                ? 'Att den nyvalde kungen red en rundresa och togs till konung av varje lands ting — där ömsesidiga eder svors och gisslan/lejd växlades vid landskapsgränserna — står i konungabalkarna (landskapslagarna) och hos Saxo (~1200). Äldsta säkert verifierade formen: Upplandslagen ~1296, »Vm ærix gatu« (genitiv-s finns redan där).'
                : 'That the newly elected king rode a circuit and was accepted as king by each province’s assembly — where mutual oaths were sworn and hostages/safe-conduct exchanged at the borders — is stated in the royal sections of the provincial laws and in Saxo (~1200). Oldest securely verified form: the Uppland Law ~1296, “Vm ærix gatu”.'}
            </p>
            <p>
              <span className="text-foreground font-medium">{sv ? 'Namnets etymologi är däremot oviss. ' : 'The etymology of the name, however, is uncertain. '}</span>
              <Stat kind="hypotes" sv={sv} />{' '}
              {sv
                ? 'SAOB skriver ”av ovisst urspr.”, Hellquist ”av mycket omtvistad härledning”. Fyra härledningar konkurrerar:'
                : 'The Swedish Academy dictionary calls it “of uncertain origin”, Hellquist “of much-disputed derivation”. Four derivations compete:'}
            </p>
            <ul className="space-y-2 pl-1">
              <li>
                <span className="text-foreground">{sv ? 'Mansnamnet Erik + gata' : 'The personal name Erik + gata'}</span>{' '}
                {sv ? '— ytformen pekar hit (defaultläsning). Men att en bestämd kung Erik gav namnet är ' : '— the surface form points here (default reading). But that a specific King Erik gave the name is '}
                <Stat kind="sagen" sv={sv} />.
              </li>
              <li>
                <span className="text-foreground">{sv ? 'Erik som appellativ ’allhärskare’ (*Ein-rīkr, en + rīk)' : 'Erik as an appellative “all-ruler” (*Ein-rīkr, en + rīk)'}</span>{' '}
                — <Stat kind="hypotes" sv={sv} />.
              </li>
              <li>
                <span className="text-foreground">{sv ? 'Eds-härledningen (minoritetsspåret): *ēþ-rīk- ’edbekräftelse’ → *ēþrīkis-gata ’edbekräftelsens väg’' : 'The oath derivation (minority track): *ēþ-rīk- “oath-confirmation” → *ēþrīkis-gata “the oath-confirmation road”'}</span>{' '}
                — {sv
                  ? 'publicerad av Hjalmar Lindroth (Historisk tidskrift 1912) och diskuterad av Elis Wadstein (HT 1914), stödd av det juridiska ordet eþrikiæ i Hälsingelagen. Ett '
                  : 'published by Hjalmar Lindroth (Historisk tidskrift 1912) and discussed by Elis Wadstein (HT 1914), supported by the legal word eþrikiæ in the Hälsinge Law. A '}
                <Stat kind="hypotes" sv={sv} />{' '}
                {sv ? 'respektabelt minoritetsalternativ — inte den naiva ”ed + gata”, och inte den rådande uppfattningen.' : 'respectable minority alternative — not the naive “oath + road”, and not the prevailing view.'}
              </li>
              <li>
                <span className="text-foreground">{sv ? 'Uppsala-relik-hypotesen: leden utgick från Uppsala där Erik den heliges reliker förvarades' : 'The Uppsala-relic hypothesis: the progress began in Uppsala, where the relics of St Erik were kept'}</span>{' '}
                — {sv ? 'namnet kan komma därav. Ett ' : 'the name may derive from this. A '}<Stat kind="hypotes" sv={sv} />{sv ? ' (Populär Historia 1/2021, Olle Larsson).' : ' (Populär Historia 1/2021, Olle Larsson).'}
              </li>
              <li className="text-slate-400">
                {sv ? '’Rida riket runt’ / ’lag’ — ' : '“Ride around the realm” / “law” — '}
                <Stat kind="sagen" sv={sv} /> {sv ? '(ingen forskarförespråkare).' : '(no scholarly proponent).'}
              </li>
            </ul>
            <p className="text-[12px] text-slate-500">
              {sv
                ? 'Att hålla isär: institutionen (belagt) och namnetymologin (hypotes). Lindroths/Wadsteins originalartiklar och Äldre Västgötalagens ordform bör läsas mot primärtext innan de citeras med namngiven forskare — den kontrollen är ännu inte gjord.'
                : 'To keep apart: the institution (attested) and the name etymology (hypothesis). Lindroth’s/Wadstein’s original articles and the word form in the Older Västgöta Law should be read against the primary texts before being cited with named scholars — that check has not yet been done.'}
            </p>
          </CardContent>
        </Card>

        {/* Belagd historik — kända eriksgator (fakta, källa Populär Historia; ej verbatim) */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-xl">
            {sv ? 'Kända eriksgator' : 'Documented Eriksgata journeys'}
          </CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              {sv
                ? 'Institutionen nämns i landskapslagarna från 1200-talet, men den första eriksgata där den namngivne kungen är känd genomfördes av Magnus Eriksson 1335. Kungavalet skedde på Mora äng utanför Uppsala; utformningen kodifierades i Upplandslagens konungabalk (stadfäst 1296) och sedan i Magnus Erikssons landslag (~1350).'
                : 'The institution is mentioned in the 13th-century provincial laws, but the first Eriksgata with a named king was made by Magnus Eriksson in 1335. The king was elected at Mora meadow outside Uppsala; the form was codified in the Uppland Law (1296) and later in the national law of Magnus Eriksson (~1350).'}
            </p>
            <p>
              {sv
                ? 'Fyra kungar red belagt eriksgata på 1400-talet: Erik av Pommern (1401), Kristofer (1442), Karl Knutsson (1448–49) och Kristian I (1458). Den sista lagenliga eriksgatan reds av Karl IX 1609 — nästan ett halvsekel efter att arvkungadömet infördes (Gustav Vasa 1544/Erik XIV 1560), varefter resan förlorade sin ursprungliga funktion.'
                : 'Four kings are documented to have ridden the Eriksgata in the 1400s: Erik of Pomerania (1401), Christopher (1442), Karl Knutsson (1448–49) and Christian I (1458). The last lawful Eriksgata was ridden by Karl IX in 1609.'}
            </p>
            <p className="text-[12px] text-slate-500">
              {sv
                ? 'Fakta ur Populär Historia 1/2021 (Olle Larsson) + landskapslagarna — sammanställt i egna ord, ej verbatim (upphovsrätt).'
                : 'Facts from Populär Historia 1/2021 (Olle Larsson) and the provincial laws — summarised in our own words, not verbatim (copyright).'}
            </p>
          </CardContent>
        </Card>

        {road && ((road.landmarks?.length ?? 0) > 0 || (road.waypoints?.length ?? 0) > 0) && (
          <div className="grid gap-6 sm:grid-cols-2">
            {(road.landmarks?.length ?? 0) > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold">{sv ? 'Platser längs vägen' : 'Places along the route'}</h2>
                <ul className="space-y-2">
                  {road!.landmarks.map((l, i) => (
                    <li key={i} className="border-l-2 border-slate-700 pl-2.5">
                      <span className="text-sm font-medium text-white">{l.name}</span>
                      {l.description && <span className="block text-xs text-slate-400 leading-snug">{l.description}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {(road.waypoints?.length ?? 0) > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold">{sv ? 'Sträckning (etapper)' : 'Route (waypoints)'}</h2>
                <ol className="space-y-1">
                  {road!.waypoints.map((w, i) => (
                    <li key={i} className="text-sm text-slate-300">{i + 1}. {w.name}{(w.type === 'junction' || w.type === 'bridge') ? (sv ? ' · gisslebyte (överlämning)' : ' · hostage exchange (handover)') : ''}</li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        )}

        <ArticleProvenance
          sv={sv}
          reviewedDate="2026-08-16"
          sources={[
            'Upplandslagen, Konungabalken (Schlyter 1834)',
            'SAOB s.v. eriksgata',
            'Elof Hellquist, Svensk etymologisk ordbok (1922)',
            'Hjalmar Lindroth, Historisk tidskrift (1912)',
            'Elis Wadstein, Historisk tidskrift (1914)',
            'Saxo Grammaticus, Gesta Danorum (~1200)',
            'Populär Historia 1/2021, Olle Larsson (fakta, ej verbatim)',
            'thing_sites (RAÄ Fornsök m.fl.)',
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Eriksgatan;
