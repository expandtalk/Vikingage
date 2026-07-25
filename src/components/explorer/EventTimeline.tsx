import React, { useMemo, useState } from 'react';
import { useHistoricalEvents } from '@/hooks/useHistoricalEvents';
import { getEventTypeColor } from '@/hooks/useHistoricalEventMarkers';
import { GERMANIC_TIME_PERIODS } from '@/utils/germanicTimeline/timelineData';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin } from 'lucide-react';

// Eventlinjen: händelser hör hemma HÄR (kronologiskt), inte som kartnålar. Klick på en
// händelse panorerar kartan till centralorten (om koordinat finns). Kartan = platser,
// eventlinjen = skeenden i tid. Filtreras på vald period.

interface Props {
  selectedTimePeriod: string;
  mapNavigate: ((lat: number, lng: number, zoom: number) => void) | null;
}

const TYPE_LABEL: Record<string, { sv: string; en: string }> = {
  raid: { sv: 'Plundring', en: 'Raid' },
  settlement: { sv: 'Bosättning', en: 'Settlement' },
  political: { sv: 'Politik', en: 'Political' },
  military: { sv: 'Slag', en: 'Battle' },
  religious: { sv: 'Religion', en: 'Religious' },
  trade: { sv: 'Handel', en: 'Trade' },
  migration: { sv: 'Migration', en: 'Migration' },
  climate: { sv: 'Klimat', en: 'Climate' },
  epidemic: { sv: 'Epidemi', en: 'Epidemic' },
  catastrophe: { sv: 'Katastrof', en: 'Catastrophe' },
  exploration: { sv: 'Upptäckt', en: 'Exploration' },
};

const fmtYear = (y: number) => (y < 0 ? `${Math.abs(y)} f.Kr.` : `${y}`);

export const EventTimeline: React.FC<Props> = ({ selectedTimePeriod, mapNavigate }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: events = [] } = useHistoricalEvents();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { rows, rangeStart, rangeEnd, ticks } = useMemo(() => {
    const period = GERMANIC_TIME_PERIODS.find((p) => p.id === selectedTimePeriod);
    const rStart = period?.startYear ?? -1000;
    const rEnd = period?.endYear ?? 1100;
    // Händelser vars [start,end] överlappar periodintervallet.
    const inRange = events.filter((e) => {
      const s = e.year_start;
      const en = e.year_end ?? e.year_start;
      return s <= rEnd && en >= rStart;
    });
    inRange.sort((a, b) => a.year_start - b.year_start);
    // Stagga i 3 lanor så täta kluster inte överlappar helt.
    const rows = inRange.map((e, i) => ({ e, lane: i % 3 }));
    const ticks: number[] = [];
    const span = rEnd - rStart;
    const step = span > 2000 ? 1000 : span > 800 ? 200 : span > 300 ? 100 : 50;
    for (let y = Math.ceil(rStart / step) * step; y <= rEnd; y += step) ticks.push(y);
    return { rows, rangeStart: rStart, rangeEnd: rEnd, ticks };
  }, [events, selectedTimePeriod]);

  const pos = (y: number) => {
    const raw = ((y - rangeStart) / (rangeEnd - rangeStart)) * 100;
    return Math.max(1, Math.min(99, raw));
  };

  if (rows.length === 0) return null;

  const selected = rows.find((r) => r.e.id === selectedId)?.e ?? null;
  const coordOf = (e: any): { lat: number; lng: number } | null =>
    e && e.lat != null && e.lng != null ? { lat: e.lat, lng: e.lng } : null;

  const onPick = (e: any) => {
    setSelectedId(e.id);
    const c = coordOf(e);
    if (c && mapNavigate) mapNavigate(c.lat, c.lng, 7);
  };

  return (
    <div className="mt-4 viking-card rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-foreground font-semibold text-sm">
          {sv ? 'Händelser i tiden' : 'Events over time'}
        </h3>
        <span className="text-muted-foreground text-xs">
          {rows.length} {sv ? 'händelser' : 'events'}
        </span>
      </div>

      {/* Vald händelse — namn/år/typ + länk till kartan */}
      <div className="h-10 mb-1 text-xs">
        {selected ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-none"
              style={{ background: getEventTypeColor(selected.event_type) }}
            />
            <span className="font-semibold text-foreground">
              {sv ? selected.event_name : selected.event_name_en ?? selected.event_name}
            </span>
            <span className="text-muted-foreground">
              {selected.year_end && selected.year_end !== selected.year_start
                ? `${fmtYear(selected.year_start)}–${fmtYear(selected.year_end)}`
                : fmtYear(selected.year_start)}
            </span>
            <span className="text-muted-foreground">
              · {TYPE_LABEL[selected.event_type]?.[sv ? 'sv' : 'en'] ?? selected.event_type}
            </span>
            {coordOf(selected) && mapNavigate && (
              <button
                type="button"
                onClick={() => onPick(selected)}
                className="inline-flex items-center gap-1 text-gold hover:underline"
              >
                <MapPin className="h-3 w-3" />
                {sv ? 'Visa på karta' : 'Show on map'}
              </button>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">
            {sv ? 'Klicka på en prick för att se händelsen — och panorera kartan till platsen.'
                : 'Click a dot to see the event — and pan the map to its place.'}
          </span>
        )}
      </div>

      {/* Tidsaxel med staggade händelseprickar */}
      <div className="relative h-16">
        {[0, 1, 2].map((lane) => (
          <div
            key={lane}
            className="absolute left-0 right-0 border-t border-white/10"
            style={{ top: `${lane * 16 + 4}px` }}
          />
        ))}
        {rows.map(({ e, lane }) => {
          const hasCoord = coordOf(e) != null;
          const isSel = e.id === selectedId;
          return (
            <button
              key={e.id}
              type="button"
              title={`${fmtYear(e.year_start)} — ${sv ? e.event_name : e.event_name_en ?? e.event_name}`}
              onClick={() => onPick(e)}
              className="absolute -translate-x-1/2 rounded-full transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-gold"
              style={{
                left: `${pos(e.year_start)}%`,
                top: `${lane * 16 + 4 - 5}px`,
                width: isSel ? '14px' : '11px',
                height: isSel ? '14px' : '11px',
                background: getEventTypeColor(e.event_type),
                border: `2px solid ${isSel ? 'var(--gold, #d4a63c)' : hasCoord ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.35)'}`,
                cursor: 'pointer',
                opacity: hasCoord ? 1 : 0.7,
              }}
            />
          );
        })}
        {/* Ticks */}
        <div className="absolute left-0 right-0 bottom-0 h-4 border-t border-white/20">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 text-[10px] text-muted-foreground tabular-nums"
              style={{ left: `${pos(t)}%`, top: '2px' }}
            >
              {fmtYear(t)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
