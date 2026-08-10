import React, { useState } from 'react';
import { Waves, X, AlertTriangle } from 'lucide-react';

// Periodväljare för dåtida strandlinje (landhöjning) på forskningskartorna. null = av.
// Åren matchar SGU-skivorna (get_paleo_shorelines_nearest/_dem snappar till närmaste).
// variant='inline' (desktop) = raden ovanför kartan. variant='floating' (mobil) = kompakt
// vågknapp som fäller ut en liten popover → tar inte ~20 % av kartytan (Daniel).
//
// Djuptidsgrupp (Task 3, 2026-08-11): Littorina/Ancylus/Yoldia — SGU-modellens strandförskjutning
// utökad bakåt (Task 2). Baltiska issjön (~-12600) är MEDVETET utelämnad — data saknas
// (se coordinate-gap-status/paleo-brief); en knapp för den skulle bara trigga guarden nedan.

type PeriodGroup = 'ce' | 'deep';

interface Period {
  label: string;
  year: number | null;
  group?: PeriodGroup;
  /** Hover-caption (title-attr) — specifik brasklapp per djuptidsstadium. */
  caption?: string;
}

const PERIODS: Period[] = [
  { label: 'Av', year: null },
  { label: 'Rom. järnålder ~250', year: 250, group: 'ce' },
  { label: 'Folkvandring ~450', year: 450, group: 'ce' },
  { label: 'Vendel ~750', year: 750, group: 'ce' },
  { label: 'Vikingatid ~950', year: 950, group: 'ce' },
  {
    label: 'Littorinahavet ~−6500', year: -6500, group: 'deep',
    caption: 'SGU strandförskjutningsmodell — kustlinjens modellerade läge. Littorinahavet: brackvattenhav, föregångare till dagens Östersjön.',
  },
  {
    label: 'Ancylussjön ~−8500', year: -8500, group: 'deep',
    caption: 'SGU strandförskjutningsmodell — endast kustlinjens läge. Insjöhydrologin (avrinning/tröskelnivå mot Atlanten) är INTE modellerad.',
  },
  {
    label: 'Yoldiahavet ~−9500', year: -9500, group: 'deep',
    caption: 'SGU strandförskjutningsmodell — endast kustlinjens läge. Insjö-/brackvattenhydrologin är INTE modellerad.',
  },
];

const CE_PERIODS = PERIODS.filter((p) => p.group === 'ce');
const DEEP_PERIODS = PERIODS.filter((p) => p.group === 'deep');
const OFF = PERIODS.find((p) => p.year === null)!;

const CAPTION = 'SGU strandförskjutningsmodell (CC-BY) — märkbar i Mälardalen/Norrland, försumbar i söder';
const DEEP_CAPTION = 'Djuptid — SGU-modell (CC-BY): kustlinjens läge, INTE insjöhydrologin (avrinning/trösklar) i Ancylus/Yoldia';
const NO_DATA_NOTE = 'Ingen modellerad strandlinje för perioden';

interface Props {
  value: number | null;
  onChange: (y: number | null) => void;
  variant?: 'inline' | 'floating';
  /** Sant när RPC:n bara hittade en skiva för långt bort (>tolerans) — se useShorelineOverlay. */
  noData?: boolean;
}

const PeriodButton: React.FC<{ p: Period; active: boolean; onChange: (y: number | null) => void }> = ({ p, active, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(p.year)}
    title={p.caption}
    className={`rounded border px-2 py-0.5 transition-colors ${active ? 'border-sky-400 text-sky-200 bg-sky-500/10' : 'border-slate-700 text-muted-foreground'}`}
  >
    {p.label}
  </button>
);

const PeriodButtons: React.FC<Pick<Props, 'value' | 'onChange'>> = ({ value, onChange }) => (
  <>
    <PeriodButton p={OFF} active={value === null} onChange={onChange} />
    {CE_PERIODS.map((p) => <PeriodButton key={p.label} p={p} active={value === p.year} onChange={onChange} />)}
    <span className="mx-0.5 h-4 w-px self-stretch bg-slate-700" aria-hidden="true" />
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground opacity-70">Djuptid</span>
    {DEEP_PERIODS.map((p) => <PeriodButton key={p.label} p={p} active={value === p.year} onChange={onChange} />)}
  </>
);

const NoDataNote: React.FC<{ show?: boolean }> = ({ show }) => {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-300">
      <AlertTriangle className="h-3 w-3" /> {NO_DATA_NOTE}
    </span>
  );
};

export const ShorelinePeriodControl: React.FC<Props> = ({ value, onChange, variant = 'inline', noData }) => {
  const [open, setOpen] = useState(false);
  const showNoData = Boolean(noData) && value != null;

  if (variant === 'floating') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Dåtida strandlinje"
          aria-expanded={open}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-sky-500/70 bg-slate-900/70 text-sky-200 shadow-lg backdrop-blur hover:bg-slate-800"
        >
          <Waves className="h-5 w-5" />
          {value != null && (
            <span className={`absolute -top-1 -right-1 rounded-full px-1 text-[9px] font-semibold text-white ${showNoData ? 'bg-amber-500' : 'bg-sky-500'}`}>{value}</span>
          )}
        </button>
        {open && (
          <div className="absolute left-0 top-12 z-[1110] w-[min(80vw,300px)] rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between gap-1 text-xs font-medium text-sky-300">
              <span className="flex items-center gap-1"><Waves className="h-3.5 w-3.5" /> Dåtida strandlinje</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Stäng" className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <PeriodButtons value={value} onChange={(y) => { onChange(y); }} />
            </div>
            {showNoData
              ? <p className="mt-2"><NoDataNote show /></p>
              : <p className="mt-2 text-[10px] leading-snug text-muted-foreground opacity-80">{value != null && DEEP_PERIODS.some((p) => p.year === value) ? DEEP_CAPTION : CAPTION}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-2 text-xs">
      <span className="inline-flex items-center gap-1 text-sky-300 font-medium"><Waves className="h-3.5 w-3.5" /> Dåtida strandlinje:</span>
      <PeriodButtons value={value} onChange={onChange} />
      {showNoData
        ? <NoDataNote show />
        : <span className="text-[10px] text-muted-foreground opacity-70">{value != null && DEEP_PERIODS.some((p) => p.year === value) ? DEEP_CAPTION : CAPTION}</span>}
    </div>
  );
};
