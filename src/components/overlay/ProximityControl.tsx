import React from 'react';
import { X, Circle, Square, Hexagon, Save, Trash2, Download } from 'lucide-react';
import {
  useProximityProbe,
  setProbe,
  setProbeRadiusKm,
  setProbeShape,
  setProbeMode,
  setProbeNote,
  clearProbe,
  TRANSPORT_MODES,
  type ProbeShape,
} from '@/hooks/useProximityProbe';
import { useHypothesisAreas } from '@/hooks/useHypothesisAreas';
import { probeToGeoJSON, probeToCSV } from '@/utils/probeExport';

// Flytande kontroll som visas när en räckvidds-sond är aktiv (klick på objekt,
// högerklick på kartan eller linjalen). Form (cirkel/fyrkant/hexagon), transport-
// preset (dagsresa) och fri radie. Varje form är optimal under olika regler (title).
const SHAPES: { key: ProbeShape; label: string; Icon: typeof Circle; rule: string }[] = [
  { key: 'circle', label: 'Cirkel', Icon: Circle, rule: 'Jämn räckvidd åt alla håll (isotrop) — öppen terräng, gång/rodd utan hinder.' },
  { key: 'square', label: 'Fyrkant', Icon: Square, rule: 'Sidor mot kardinalriktningarna (N/S/Ö/V) — räta strukturer: vägkors, rutindelning.' },
  { key: 'hexagon', label: 'Hexagon', Icon: Hexagon, rule: 'Effektiv yttäckning utan glapp (Christaller k=7) — täck ett helt område med centralorter.' },
];

// Svenska etiketter för ortnamnens element_category (annars visas råa slugs).
const PN_CAT_LABEL: Record<string, string> = {
  sakralt: 'Sakralt / gudar', bebyggelse: 'Bebyggelse', centralort: 'Centralort',
  ting_ratt: 'Ting / rätt', vang: 'Vång / åker', vang_excl: 'Vång (excl.)',
  val_ospec: 'Val (ospec.)', kust_hamn: 'Kust / hamn', natur: 'Natur',
};
const pnLabel = (c?: string | null) => (c ? PN_CAT_LABEL[c] ?? c : 'övrigt');

// Nedladdning helt klient-side (Blob) — ingen server involverad.
const downloadText = (filename: string, mime: string, text: string) => {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};
const slug = (s: string) => (s || 'omrade').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'omrade';

export const ProximityControl: React.FC = () => {
  const { probe, radiusKm, shape, modeKey, counts, result, note } = useProximityProbe();
  const { areas, save, remove, isLoggedIn } = useHypothesisAreas();
  const [open, setOpen] = React.useState<Set<string>>(new Set());
  const toggle = (k: string) => setOpen((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  // Ortnamnsfilter: markerade element_category (tom mängd = visa alla).
  const [pnCats, setPnCats] = React.useState<Set<string>>(new Set());
  const togglePnCat = (c: string) => setPnCats((prev) => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });
  // Klick på ett listat objekt → flyg dit + öppna popup (satt av useMapProximityProbe).
  const focus = (lat?: number, lng?: number) => {
    if (lat != null && lng != null) (window as unknown as { __focusProbeFeature?: (a: number, b: number) => void }).__focusProbeFeature?.(lat, lng);
  };
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  // En expanderbar kategori-rad: klick fäller ut objektlistan, klick på objekt fokuserar kartan.
  const renderCat = (c: { k: string; label: string; color: string; count: number; items?: any[]; name: (r: any) => string; indent?: boolean }) => {
    const has = (c.items?.length ?? 0) > 0;
    const isOpen = open.has(c.k);
    return (
      <div key={c.k}>
        <button
          onClick={() => has && toggle(c.k)}
          aria-expanded={isOpen}
          className={`w-full flex items-center justify-between py-0.5 rounded ${has ? 'hover:bg-slate-800 cursor-pointer' : 'cursor-default opacity-70'}`}
        >
          <span className={`text-slate-300 flex items-center gap-1 ${c.indent ? 'pl-3' : ''}`}>
            <span className="w-2 text-slate-500">{has ? (isOpen ? '▾' : '▸') : ''}</span>{c.label}
          </span>
          <span className={`font-semibold ${c.color}`}>{c.count.toLocaleString()}</span>
        </button>
        {isOpen && has && (
          <div className="max-h-40 overflow-y-auto ml-1 pl-2 pr-1 py-1 space-y-0.5 border-l border-slate-700">
            {c.items!.slice(0, 300).map((r: any, i: number) => (
              <button
                key={i}
                onClick={() => focus(r.lat, r.lng)}
                className="block w-full text-left truncate text-slate-400 hover:text-amber-200 hover:underline"
                title="Visa på kartan"
              >
                {c.name(r)}
              </button>
            ))}
            {c.items!.length > 300 && <div className="text-slate-600">… {(c.items!.length - 300).toLocaleString()} till (se export)</div>}
          </div>
        )}
      </div>
    );
  };
  // Ortnamn: filtrera på vald element_category (tom mängd = alla). Objekten bär category.
  const pnAll = (result?.place_names ?? []) as any[];
  const pnFiltered = pnCats.size ? pnAll.filter((r) => pnCats.has(r.category ?? '_')) : pnAll;
  const pnPresent = Array.from(new Set(pnAll.map((r) => r.category ?? '_')));
  if (!probe) return null;
  const exportBase = `rackvidd-${slug(probe.label)}-${shape}-${radiusKm}km`;
  const exportGeoJSON = () => downloadText(`${exportBase}.geojson`, 'application/geo+json', probeToGeoJSON(probe, shape, radiusKm, result));
  const exportCSV = () => downloadText(`${exportBase}.csv`, 'text/csv', probeToCSV(result));
  const activeMode = TRANSPORT_MODES.find((m) => m.key === modeKey);
  const shapeSv = shape === 'circle' ? 'cirkeln' : shape === 'square' ? 'fyrkanten' : 'hexagonen';
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] w-80 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-xs font-medium truncate">Räckvidd: {probe.label}</span>
        <button onClick={clearProbe} aria-label="Stäng" className="text-slate-300 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form */}
      <div className="flex gap-1 mb-2">
        {SHAPES.map(({ key, label, Icon, rule }) => (
          <button
            key={key}
            onClick={() => setProbeShape(key)}
            title={rule}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[11px] border transition-colors ${
              shape === key ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Transport-presets (dagsresa) */}
      <div className="text-[10px] text-slate-400 mb-1">Dagsresa (sätter radien):</div>
      <div className="flex flex-wrap gap-1 mb-2">
        {TRANSPORT_MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setProbeMode(m.key)}
            title={m.note}
            className={`px-2 py-1 rounded text-[10px] border transition-colors ${
              modeKey === m.key ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {m.labelSv} {m.radiusKm}km
          </button>
        ))}
      </div>
      {activeMode && <div className="text-[10px] text-slate-500 mb-2">{activeMode.note}</div>}

      {/* Agnetas 9 km — daglig maskvidd (Christallers administrativa princip) */}
      <button
        onClick={() => { setProbeShape('hexagon'); setProbeRadiusKm(9); }}
        title="Agneta Nyholms tes: allt ett samhälle behöver finns inom ~9 km. Matchar sockennätets maskvidd (kyrka→kyrka p90 = 9,4 km) och Christallers administrativa princip (k=7)."
        className={`w-full mb-2 px-2 py-1.5 rounded text-[11px] border transition-colors ${
          shape === 'hexagon' && radiusKm === 9 ? 'bg-amber-500/25 border-amber-500 text-amber-100' : 'border-amber-700/60 text-amber-200 hover:bg-slate-800'
        }`}
      >
        ⬡ Daglig maskvidd 9 km (Agnetas tes)
      </button>
      <div className="text-[10px] text-slate-500 mb-2 leading-snug">
        <strong className="text-slate-400">Christallers centralortsteori:</strong> hexagonen är den administrativa
        principen (k=7) — en centralort + 6 beroende bygder. ~9 km = sockennätets maskvidd och en daglig tur-retur
        till fots. Jfr härad/fylke som ledungs-/skattedistrikt (troligen romerskinspirerat).
      </div>

      {/* Fri radie */}
      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
        <span>Radie</span>
        <span className="font-semibold text-white">{radiusKm} km <span className="text-slate-500">(⌀ {radiusKm * 2} km)</span></span>
      </div>
      <input
        type="range" min={1} max={120} step={1} value={radiusKm}
        onChange={(e) => setProbeRadiusKm(Number(e.target.value))}
        className="w-full accent-amber-500 cursor-pointer"
        aria-label="Radie i kilometer"
      />

      {/* Hypotes / anteckning knuten till området (namn = platsen, hypotes = fri text) */}
      <textarea
        value={note}
        onChange={(e) => setProbeNote(e.target.value)}
        placeholder="Hypotes / vad testar du här? (t.ex. 'kungsgård kontrollerar allt inom en dagsresa till fots')"
        rows={2}
        className="w-full mt-2 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-[11px] placeholder:text-slate-500 resize-y"
      />

      {/* Spara till kontot (inloggad): namnge + hypotes bevaras i DB (RLS = bara dina). */}
      {isLoggedIn && (
        <div className="mt-2">
          <button
            onClick={() => save.mutate({ name: probe.label || 'Namnlöst område', note, lat: probe.lat, lng: probe.lng, shape, radius_km: radiusKm })}
            disabled={save.isPending}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] border border-emerald-600/60 text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />{save.isPending ? 'Sparar…' : 'Spara område till mitt konto'}
          </button>
          {areas.length > 0 && (
            <div className="mt-1.5 max-h-28 overflow-y-auto space-y-1">
              {areas.map((a) => (
                <div key={a.id} className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => { setProbe(a.lat, a.lng, a.name); setProbeShape(a.shape); setProbeRadiusKm(Number(a.radius_km)); if (a.note) setProbeNote(a.note); }}
                    className="flex-1 min-w-0 truncate text-left text-slate-300 hover:text-white" title={a.note ?? undefined}
                  >{a.name}</button>
                  <button onClick={() => remove.mutate(a.id)} title="Ta bort" className="text-slate-500 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Antal INUTI formen (punkt-i-polygon) — det analytiska värdet */}
      {counts && (
        <div className="mt-2 pt-2 border-t border-slate-700/60">
          <div className="text-[10px] text-slate-400 mb-1">Inuti {shapeSv} ({counts.area_km2.toLocaleString()} km²) — klicka för att lista &amp; visa på kartan:</div>
          <div className="space-y-0.5 text-[11px]">
            {[
              { k: 'runestones', label: 'Runstenar', color: 'text-red-300', count: counts.runestones, items: result?.runestones, name: (r: any) => r.signum },
              { k: 'cult', label: 'Kultplatser (gudar)', color: 'text-yellow-300', count: counts.cult_sites ?? 0, items: result?.cult_sites, name: (r: any) => `${r.name}${r.type ? ' · ' + r.type : ''}` },
              { k: 'coins', label: 'Mynt', color: 'text-amber-300', count: counts.coins ?? 0, items: result?.coins, name: (r: any) => `${r.name}${r.type ? ' · ' + r.type : ''}` },
              { k: 'things', label: 'Tingsplatser', color: 'text-sky-300', count: counts.thing_sites ?? 0, items: result?.thing_sites, name: (r: any) => `${r.name}${r.type ? ' · ' + r.type : ''}` },
              { k: 'fortresses', label: 'Fornborgar', color: 'text-orange-300', count: counts.fortresses, items: result?.fortresses, name: (r: any) => `${r.name}${r.type ? ' · ' + r.type : ''}` },
              { k: 'place_curated', label: pnCats.size ? `Ortnamn (${pnFiltered.length}/${counts.place_names_curated})` : 'Ortnamn (kurerade)', color: 'text-emerald-300', count: pnCats.size ? pnFiltered.length : counts.place_names_curated, items: pnFiltered, name: (r: any) => `${r.name} · ${pnLabel(r.category)}` },
            ].map(renderCat)}

            {/* Ortnamnsfilter per kategori (makt/gudar/sakralt/natur…). Objekten bär element_category. */}
            {pnAll.length > 0 && (
              <div className="pl-3 pt-0.5 flex flex-wrap gap-1">
                {pnPresent.sort().map((cat) => {
                  const on = pnCats.has(cat);
                  const n = pnAll.filter((r) => (r.category ?? '_') === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => togglePnCat(cat)}
                      className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${on ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                    >
                      {pnLabel(cat === '_' ? null : cat)} {n}
                    </button>
                  );
                })}
                {pnCats.size > 0 && (
                  <button onClick={() => setPnCats(new Set())} className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:text-slate-300 underline">rensa</button>
                )}
              </div>
            )}

            {/* Kulturlagret uppdelat per lämningstyp (hällristningar/gravfält/…) — exakta antal ur by_type */}
            <div className="flex items-center justify-between py-0.5 pt-1 border-t border-slate-700/40">
              <span className="text-slate-400 flex items-center gap-1"><span className="w-2" />Kulturlager (alla typer)</span>
              <span className="font-semibold text-purple-300">{counts.kulturlager.toLocaleString()}</span>
            </div>
            {Object.entries(counts.kulturlager_by_type ?? {})
              .sort((a, b) => b[1] - a[1])
              .map(([type, n]) => renderCat({
                k: 'h_' + type, label: cap(type), color: 'text-purple-200', count: n,
                items: (result?.kulturlager ?? []).filter((r: any) => r.type === type),
                name: (r: any) => r.name, indent: true,
              }))}

            {/* Registrets ortnamn (OSM) räknas men ritas ej → bara antal, ej klickbart */}
            <div className="flex items-center justify-between py-0.5 opacity-70 pt-1 border-t border-slate-700/40">
              <span className="text-slate-300 flex items-center gap-1"><span className="w-2" />Ortnamn (registret)</span>
              <span className="font-semibold text-emerald-200">{counts.place_names_osm.toLocaleString()}</span>
            </div>
          </div>
          {/* Exportera resultatet — GeoJSON (QGIS) eller CSV (kalkylark). Klient-side. */}
          <div className="flex gap-1 mt-2">
            <button
              onClick={exportGeoJSON}
              title="Formens polygon + punkterna inuti — öppnas i QGIS"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[11px] border border-sky-600/60 text-sky-200 hover:bg-sky-500/15"
            >
              <Download className="h-3.5 w-3.5" />GeoJSON
            </button>
            <button
              onClick={exportCSV}
              title="Objektlistan inuti formen — för kalkylark"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[11px] border border-sky-600/60 text-sky-200 hover:bg-sky-500/15"
            >
              <Download className="h-3.5 w-3.5" />CSV
            </button>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Listorna är cappade till 1500/lager; antalen ovan är fullständiga.</div>
        </div>
      )}
      <div className="mt-2 text-[10px] text-slate-500">Prickar: ortnamn (grön) · kulturlager (lila) · runstenar (röd) · fornborg (orange). Registrets ortnamn (OSM) räknas men ritas ej.</div>
    </div>
  );
};
