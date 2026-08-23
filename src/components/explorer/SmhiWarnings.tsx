import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useSmhiWarnings, warningCoversPoint, SmhiLevel, SmhiWarning } from '@/hooks/useSmhiWarnings';
import { useMapCenter } from '@/hooks/useMapCenter';
import { useLanguage } from '@/contexts/LanguageContext';

// Aktiva SMHI-vädervarningar under kartan. SMHI utfärdar per område/län (ej per kommun).
// Point-in-polygon mot kartans center delar listan i "Här" (täcker vyn) + "Övriga i landet".
const LEVEL_STYLE: Record<SmhiLevel, { dot: string; chip: string; sv: string; en: string; rank: number }> = {
  RED:     { dot: 'bg-red-500',    chip: 'bg-red-500/20 border-red-500 text-red-100',       sv: 'Röd',        en: 'Red',     rank: 3 },
  ORANGE:  { dot: 'bg-orange-500', chip: 'bg-orange-500/20 border-orange-500 text-orange-100', sv: 'Orange',   en: 'Orange',  rank: 2 },
  YELLOW:  { dot: 'bg-yellow-400', chip: 'bg-yellow-400/20 border-yellow-400 text-yellow-100', sv: 'Gul',      en: 'Yellow',  rank: 1 },
  MESSAGE: { dot: 'bg-slate-400',  chip: 'bg-slate-500/20 border-slate-500 text-slate-200',  sv: 'Meddelande', en: 'Message', rank: 0 },
};

const fmt = (iso?: string, sv = true) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(sv ? 'sv-SE' : 'en-GB', { day: 'numeric', month: 'short' }); }
  catch { return ''; }
};

const WarningRow: React.FC<{ w: SmhiWarning; sv: boolean }> = ({ w, sv }) => {
  const st = LEVEL_STYLE[w.level];
  return (
    <li className="flex items-start gap-2 text-xs">
      <span className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${st.chip}`}>
        {sv ? st.sv : st.en}
      </span>
      <span className="leading-snug">
        <span className="text-slate-100">{sv ? w.event : w.eventEn}</span>
        {w.area && <span className="text-slate-400"> · {w.area}</span>}
        {(w.start || w.end) && (
          <span className="text-slate-500"> · {fmt(w.start, sv)}{w.end ? `–${fmt(w.end, sv)}` : ''}</span>
        )}
      </span>
    </li>
  );
};

export const SmhiWarnings: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { warnings, loading, error } = useSmhiWarnings();
  const center = useMapCenter();
  const [open, setOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);

  // Dela varningarna i "Här" (område-polygon täcker kartans center) + "Övriga i landet".
  // Utan känt center (t.ex. ingen sökning) visas allt i en lista.
  const { here, rest } = useMemo(() => {
    const all = warnings ?? [];
    if (!center) return { here: [] as SmhiWarning[], rest: all };
    const h: SmhiWarning[] = [];
    const r: SmhiWarning[] = [];
    for (const w of all) (warningCoversPoint(w, center.lat, center.lng) ? h : r).push(w);
    return { here: h, rest: r };
  }, [warnings, center]);

  const counts: Record<SmhiLevel, number> = { RED: 0, ORANGE: 0, YELLOW: 0, MESSAGE: 0 };
  (warnings ?? []).forEach((w) => { counts[w.level]++; });
  const total = warnings?.length ?? 0;
  const filtered = !!center; // filtrerar vi geografiskt?

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left"
        aria-expanded={open}
      >
        <AlertTriangle className={`h-4 w-4 ${total ? 'text-amber-400' : 'text-slate-500'}`} />
        <span className="text-sm font-medium">{sv ? 'SMHI-varningar' : 'SMHI warnings'}</span>
        {loading && <span className="text-xs text-slate-500">{sv ? 'hämtar…' : 'loading…'}</span>}
        {!loading && !error && filtered && (
          <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${here.length ? 'bg-amber-400/20 text-amber-200' : 'bg-slate-700/60 text-slate-400'}`}>
            <MapPin className="h-3 w-3" />
            {here.length ? `${here.length} ${sv ? 'här' : 'here'}` : (sv ? 'inga här' : 'none here')}
          </span>
        )}
        {!loading && !error && (
          <span className="flex items-center gap-2 text-xs">
            {(['RED', 'ORANGE', 'YELLOW', 'MESSAGE'] as SmhiLevel[]).filter((l) => counts[l]).map((l) => (
              <span key={l} className="flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded-full ${LEVEL_STYLE[l].dot}`} />
                {counts[l]}
              </span>
            ))}
            {total === 0 && <span className="text-slate-500">{sv ? 'inga aktiva' : 'none active'}</span>}
          </span>
        )}
        <span className="ml-auto text-slate-400">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
      </button>

      {open && (
        <div className="px-4 pb-3 border-t border-slate-800">
          {error && (
            <p className="text-xs text-slate-400 pt-2">
              {sv ? 'Kunde inte hämta varningar från SMHI just nu.' : 'Could not fetch warnings from SMHI right now.'}
            </p>
          )}
          {!error && total === 0 && !loading && (
            <p className="text-xs text-slate-400 pt-2">{sv ? 'Inga aktiva vädervarningar.' : 'No active weather warnings.'}</p>
          )}

          {/* Filtrerat läge: "Här" först, sedan "Övriga i landet" (hopfällt). */}
          {!error && total > 0 && filtered && (
            <>
              <p className="pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">
                {sv ? 'Här (täcker vyn)' : 'Here (covers view)'}
              </p>
              {here.length > 0 ? (
                <ul className="space-y-1.5 max-h-56 overflow-y-auto">
                  {here.map((w) => <WarningRow key={w.id} w={w} sv={sv} />)}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 pb-1">
                  {sv ? 'Inga aktiva varningar för denna plats.' : 'No active warnings for this location.'}
                </p>
              )}

              {rest.length > 0 && (
                <div className="mt-2 border-t border-slate-800 pt-2">
                  <button
                    onClick={() => setRestOpen((o) => !o)}
                    className="flex w-full items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-200"
                    aria-expanded={restOpen}
                  >
                    {restOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {sv ? `Övriga i landet (${rest.length})` : `Elsewhere in the country (${rest.length})`}
                  </button>
                  {restOpen && (
                    <ul className="pt-1.5 space-y-1.5 max-h-56 overflow-y-auto">
                      {rest.map((w) => <WarningRow key={w.id} w={w} sv={sv} />)}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}

          {/* Ofiltrerat läge (inget känt center): enkel lista. */}
          {!error && total > 0 && !filtered && (
            <ul className="pt-2 space-y-1.5 max-h-72 overflow-y-auto">
              {rest.map((w) => <WarningRow key={w.id} w={w} sv={sv} />)}
            </ul>
          )}

          <p className="text-[10px] text-slate-500 pt-2">
            {sv
              ? 'Källa: SMHI öppna data (varningar, CC-BY). SMHI utfärdar per område/län, inte per kommun. Uppdateras var 10:e minut.'
              : 'Source: SMHI open data (warnings, CC-BY). Issued per area/county, not per municipality. Refreshed every 10 min.'}
          </p>
        </div>
      )}
    </div>
  );
};
