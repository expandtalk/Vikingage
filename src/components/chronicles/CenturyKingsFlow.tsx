import React, { useMemo, useState } from 'react';
import { Landmark, Info, ChevronRight, ChevronDown } from 'lucide-react';
import { KingCard } from './KingCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHistoricalEvents, type HistoricalEvent } from '@/hooks/useHistoricalEvents';
import { useTimePeriods } from '@/hooks/useTimePeriods';
import type { HistoricalKing } from '@/hooks/chronicles/types';

// Hierarkisk tidsnavigering för kortvyn (Daniel 2026-07-22): EPOK → SEKEL → (utfällbart)
// DECENNIUM → regenter per rike. Adaptiv: decennienivån visas bara för epoker med
// årsprecision (vendeltid/vikingatid/medeltid). Djuptid/legendariska epoker stannar på
// sekelnivå med källkritisk not — decennier där vore falsk precision.
// Epokerna hämtas ur time_periods (DB). Tabellvyn (rikesjämförelsen) är orörd.

interface Props {
  kings: HistoricalKing[];
  onKingSelect: (kingId: string) => void;
}

const SIGNIFICANCE_ORDER: Record<string, number> = { critical: 0, high: 1, major: 1, medium: 2, low: 3 };

// Epoker där decennieuppdelning är meningsfull (årsprecision finns i källorna).
const DECADE_EPOCHS = new Set(['vendel_period', 'viking_age', 'medieval']);
// Epoker med tunt/legendariskt källäge → källkritisk not.
const THIN_SOURCE_EPOCHS = new Set(['migration_period', 'vendel_period', 'roman_iron', 'pre_roman_iron']);

const centuryLabel = (c: number, sv: boolean) => (sv ? `${c}-talet` : `The ${c}s`);
const decadeLabel = (d: number, sv: boolean) => (sv ? `${d}–${d + 9}` : `${d}s`);

interface Epoch { id: string; name: string; nameEn: string; startYear: number; endYear: number; }

export const CenturyKingsFlow: React.FC<Props> = ({ kings, onKingSelect }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: events } = useHistoricalEvents();
  const { data: periods } = useTimePeriods();
  // Vilka sekel som är utfällda till decennievy (nyckel: epochId|century).
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Epok-skala: time_periods + syntetisk "Medeltid och senare" för allt efter vikingatiden.
  const epochs: Epoch[] = useMemo(() => {
    const base = periods.map((p) => ({ id: p.id, name: p.name, nameEn: p.nameEn, startYear: p.startYear, endYear: p.endYear }));
    const lastEnd = base.length ? Math.max(...base.map((e) => e.endYear)) : 1066;
    base.push({ id: 'medieval', name: 'Medeltid och senare', nameEn: 'Medieval and later', startYear: lastEnd, endYear: 1600 });
    return base.sort((a, b) => a.startYear - b.startYear);
  }, [periods]);

  const epochForYear = (y: number): Epoch =>
    epochs.find((e) => y >= e.startYear && y < e.endYear)
    ?? epochs[epochs.length - 1];

  // EPOK → SEKEL → regenter. Odaterade separat.
  const tree = useMemo(() => {
    const byEpoch = new Map<string, { epoch: Epoch; byCentury: Map<number, HistoricalKing[]> }>();
    const undated: HistoricalKing[] = [];
    for (const k of kings) {
      const y = k.reign_start ?? k.birth_year;
      if (y == null) { undated.push(k); continue; }
      const epoch = epochForYear(y);
      const century = Math.floor(y / 100) * 100;
      if (!byEpoch.has(epoch.id)) byEpoch.set(epoch.id, { epoch, byCentury: new Map() });
      const bucket = byEpoch.get(epoch.id)!.byCentury;
      if (!bucket.has(century)) bucket.set(century, []);
      bucket.get(century)!.push(k);
    }
    const ordered = [...byEpoch.values()]
      .sort((a, b) => a.epoch.startYear - b.epoch.startYear)
      .map(({ epoch, byCentury }) => ({
        epoch,
        centuries: [...byCentury.entries()].sort((a, b) => a[0] - b[0]),
      }));
    return { ordered, undated };
  }, [kings, epochs]);

  const eventsInRange = (from: number, to: number): HistoricalEvent[] => {
    if (!events) return [];
    return events
      .filter((e) => e.year_start <= to && (e.year_end ?? e.year_start) >= from)
      .sort((a, b) =>
        (SIGNIFICANCE_ORDER[a.significance_level] ?? 9) - (SIGNIFICANCE_ORDER[b.significance_level] ?? 9)
        || a.year_start - b.year_start);
  };

  const EventsBanner: React.FC<{ evs: HistoricalEvent[]; title: string; max?: number }> = ({ evs, title, max = 6 }) => {
    if (evs.length === 0) return null;
    return (
      <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <Landmark className="h-3 w-3" />
          {title}
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {evs.slice(0, max).map((e) => (
            <li key={e.id} className="text-xs text-slate-300" title={sv ? e.description ?? undefined : e.description_en ?? e.description ?? undefined}>
              <span className="font-mono text-amber-400/90">{e.year_start}{e.year_end && e.year_end !== e.year_start ? `–${e.year_end}` : ''}</span>{' '}
              {sv ? e.event_name : (e.event_name_en || e.event_name)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderKings = (list: HistoricalKing[]) => {
    const byRegion = new Map<string, HistoricalKing[]>();
    for (const k of list) {
      const r = k.region || (sv ? 'Okänt rike' : 'Unknown realm');
      if (!byRegion.has(r)) byRegion.set(r, []);
      byRegion.get(r)!.push(k);
    }
    const regions = [...byRegion.entries()].sort((a, b) => a[0].localeCompare(b[0], 'sv'));
    return regions.map(([region, regionKings]) => (
      <div key={region} className="mb-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">
          {region} <span className="text-slate-600">· {regionKings.length}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionKings
            .sort((a, b) => (a.reign_start ?? a.birth_year ?? 9999) - (b.reign_start ?? b.birth_year ?? 9999))
            .map((king) => (
              <KingCard key={king.id} king={king} onClick={() => onKingSelect(king.id)} />
            ))}
        </div>
      </div>
    ));
  };

  // Decennievy inom ett sekel: en block per decennium med decenniets händelser + regenter.
  const renderDecades = (centuryKings: HistoricalKing[], century: number) => {
    const byDecade = new Map<number, HistoricalKing[]>();
    for (const k of centuryKings) {
      const y = k.reign_start ?? k.birth_year ?? century;
      const d = Math.floor(y / 10) * 10;
      if (!byDecade.has(d)) byDecade.set(d, []);
      byDecade.get(d)!.push(k);
    }
    const decades = [...byDecade.entries()].sort((a, b) => a[0] - b[0]);
    return (
      <div className="space-y-5 border-l border-slate-700/60 pl-4 ml-1">
        {decades.map(([decade, decadeKings]) => (
          <div key={decade}>
            <h4 className="text-base font-semibold text-amber-200/90 mb-1">
              {decadeLabel(decade, sv)}
              <span className="text-slate-600 text-sm"> · {decadeKings.length}</span>
            </h4>
            <EventsBanner evs={eventsInRange(decade, decade + 9)} title={sv ? 'Händelser under decenniet' : 'Events of the decade'} max={4} />
            {renderKings(decadeKings)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {tree.ordered.map(({ epoch, centuries }) => {
        const totalKings = centuries.reduce((s, [, ks]) => s + ks.length, 0);
        const decadeCapable = DECADE_EPOCHS.has(epoch.id);
        return (
          <section key={epoch.id}>
            {/* Epok-rubrik */}
            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mb-1">
              <h2 className="text-3xl font-bold text-amber-100">{sv ? epoch.name : epoch.nameEn}</h2>
              <span className="text-sm text-slate-500 font-mono">
                {epoch.startYear < 0 ? `${-epoch.startYear} f.Kr.` : `${epoch.startYear}`}
                {'–'}
                {epoch.endYear < 0 ? `${-epoch.endYear} f.Kr.` : `${epoch.endYear} e.Kr.`}
              </span>
              <span className="text-sm text-slate-500">· {totalKings} {sv ? 'regenter' : 'rulers'}</span>
            </div>
            <div className="h-1 w-24 bg-amber-500/60 rounded mb-3" />

            {THIN_SOURCE_EPOCHS.has(epoch.id) && (
              <p className="mb-4 flex items-start gap-1.5 text-xs text-slate-400">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500/70" />
                {sv
                  ? 'Källäget är tunt här — flera regenter vilar på senare traditioner och sagor snarare än samtida belägg. Årtal är ungefärliga.'
                  : 'Sources are thin here — several rulers rest on later traditions and sagas rather than contemporary evidence. Dates are approximate.'}
              </p>
            )}

            <div className="space-y-8">
              {centuries.map(([century, centuryKings]) => {
                const key = `${epoch.id}|${century}`;
                const isOpen = expanded.has(key);
                return (
                  <div key={century}>
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="text-xl font-bold text-amber-100/90">{centuryLabel(century, sv)}</h3>
                      <span className="text-sm text-slate-500">{centuryKings.length} {sv ? 'regenter' : 'rulers'}</span>
                      {decadeCapable && (
                        <button
                          onClick={() => toggle(key)}
                          className="ml-1 inline-flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-300 transition-colors"
                        >
                          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          {isOpen ? (sv ? 'Sekelvy' : 'Century view') : (sv ? 'Visa decennier' : 'Show decades')}
                        </button>
                      )}
                    </div>
                    <div className="h-0.5 w-16 bg-amber-500/40 rounded mb-3" />

                    {!isOpen && (
                      <EventsBanner evs={eventsInRange(century, century + 99)} title={sv ? 'Händelser under seklet' : 'Events of the century'} />
                    )}

                    {isOpen ? renderDecades(centuryKings, century) : renderKings(centuryKings)}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {tree.undated.length > 0 && (
        <section>
          <div className="flex items-baseline gap-3 mb-1">
            <h2 className="text-3xl font-bold text-amber-100">{sv ? 'Odaterade' : 'Undated'}</h2>
            <span className="text-sm text-slate-500">{tree.undated.length}</span>
          </div>
          <div className="h-1 w-24 bg-amber-500/60 rounded mb-3" />
          {renderKings(tree.undated)}
        </section>
      )}
    </div>
  );
};
