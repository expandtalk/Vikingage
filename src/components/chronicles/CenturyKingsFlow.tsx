import React, { useMemo } from 'react';
import { Landmark, Info } from 'lucide-react';
import { KingCard } from './KingCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHistoricalEvents, type HistoricalEvent } from '@/hooks/useHistoricalEvents';
import type { HistoricalKing } from '@/hooks/chronicles/types';

// Sekelflöde för kortvyn (Daniels förslag 2026-07-20): en sektion per århundrade
// med seklets historiska händelser som banner överst och regenterna därunder,
// grupperade per rike. Tabellvyn (rikesjämförelsen) är orörd.
// Regler: sekel = reign_start (regenter som korsar sekelgränsen ligger under
// startseklet); regenter utan regeringsår hamnar sist under "Odaterade".

interface Props {
  kings: HistoricalKing[];
  onKingSelect: (kingId: string) => void;
}

const SIGNIFICANCE_ORDER: Record<string, number> = { critical: 0, high: 1, major: 1, medium: 2, low: 3 };

const centuryLabel = (c: number, sv: boolean) =>
  sv ? `${c}-talet` : `The ${c}s`;

export const CenturyKingsFlow: React.FC<Props> = ({ kings, onKingSelect }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: events } = useHistoricalEvents();

  const sections = useMemo(() => {
    const byCentury = new Map<number, HistoricalKing[]>();
    const undated: HistoricalKing[] = [];
    for (const k of kings) {
      const y = k.reign_start ?? k.birth_year;
      if (y == null) { undated.push(k); continue; }
      const c = Math.floor(y / 100) * 100;
      if (!byCentury.has(c)) byCentury.set(c, []);
      byCentury.get(c)!.push(k);
    }
    const ordered = [...byCentury.entries()].sort((a, b) => a[0] - b[0]);
    return { ordered, undated };
  }, [kings]);

  const eventsForCentury = (c: number): HistoricalEvent[] => {
    if (!events) return [];
    return events
      .filter((e) => e.year_start <= c + 99 && (e.year_end ?? e.year_start) >= c)
      .sort((a, b) =>
        (SIGNIFICANCE_ORDER[a.significance_level] ?? 9) - (SIGNIFICANCE_ORDER[b.significance_level] ?? 9)
        || a.year_start - b.year_start)
      .slice(0, 6);
  };

  const renderKings = (list: HistoricalKing[]) => {
    // Per rike inom seklet, riken i bokstavsordning, regenter i regeringsordning.
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

  return (
    <div className="space-y-10">
      {sections.ordered.map(([century, centuryKings]) => {
        const evs = eventsForCentury(century);
        return (
          <section key={century}>
            <div className="flex items-baseline gap-3 mb-1">
              <h3 className="text-2xl font-bold text-amber-100">{centuryLabel(century, sv)}</h3>
              <span className="text-sm text-slate-500">
                {centuryKings.length} {sv ? 'regenter' : 'rulers'}
              </span>
            </div>
            <div className="h-0.5 w-16 bg-amber-500/50 rounded mb-3" />

            {century <= 700 && (
              <p className="mb-3 flex items-start gap-1.5 text-xs text-slate-400">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500/70" />
                {sv
                  ? 'Källäget är tunt före 800-talet — flera regenter vilar på senare traditioner och sagor snarare än samtida belägg.'
                  : 'Sources are thin before the 800s — several rulers rest on later traditions and sagas rather than contemporary evidence.'}
              </p>
            )}

            {evs.length > 0 && (
              <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <Landmark className="h-3 w-3" />
                  {sv ? 'Händelser under seklet' : 'Events of the century'}
                </div>
                <ul className="flex flex-wrap gap-x-5 gap-y-1">
                  {evs.map((e) => (
                    <li key={e.id} className="text-xs text-slate-300" title={sv ? e.description ?? undefined : e.description_en ?? e.description ?? undefined}>
                      <span className="font-mono text-amber-400/90">{e.year_start}{e.year_end && e.year_end !== e.year_start ? `–${e.year_end}` : ''}</span>{' '}
                      {sv ? e.event_name : (e.event_name_en || e.event_name)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {renderKings(centuryKings)}
          </section>
        );
      })}

      {sections.undated.length > 0 && (
        <section>
          <div className="flex items-baseline gap-3 mb-1">
            <h3 className="text-2xl font-bold text-amber-100">{sv ? 'Odaterade' : 'Undated'}</h3>
            <span className="text-sm text-slate-500">{sections.undated.length}</span>
          </div>
          <div className="h-0.5 w-16 bg-amber-500/50 rounded mb-3" />
          {renderKings(sections.undated)}
        </section>
      )}
    </div>
  );
};
