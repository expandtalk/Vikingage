import React, { useEffect, useState } from 'react';
import { Clock, CalendarDays, Globe2 } from 'lucide-react';
import type { UtilityIntent } from '@/utils/search/utilityIntent';
import { isoWeek, nextHoliday, tzOffsetMinutes, ymdInZone } from '@/utils/datetime/swedishCalendar';

// Verktygssvar: klockan/datum/vecka besvaras DIREKT i klienten ur webbläsarens Date/Intl.
// Fakta, ingen gissning, ingen nätrunda, ingen spårning — och vi differentierar oss från en
// naken klocka genom att ge veckodag, veckonummer, nästa helgdag och en världsklocka.

const WORLD_CITIES: { zone: string; sv: string; en: string }[] = [
  { zone: 'Europe/Stockholm', sv: 'Stockholm', en: 'Stockholm' },
  { zone: 'Europe/London', sv: 'London, Storbritannien', en: 'London, UK' },
  { zone: 'America/New_York', sv: 'New York, USA', en: 'New York, USA' },
  { zone: 'America/Toronto', sv: 'Toronto, Kanada', en: 'Toronto, Canada' },
  { zone: 'Europe/Berlin', sv: 'Berlin, Tyskland', en: 'Berlin, Germany' },
  { zone: 'Europe/Moscow', sv: 'Moskva, Ryssland', en: 'Moscow, Russia' },
  { zone: 'Asia/Dubai', sv: 'Dubai, F. Arabemiraten', en: 'Dubai, UAE' },
  { zone: 'Asia/Shanghai', sv: 'Beijing, Kina', en: 'Beijing, China' },
  { zone: 'Asia/Tokyo', sv: 'Tokyo, Japan', en: 'Tokyo, Japan' },
  { zone: 'Australia/Sydney', sv: 'Sydney, Australien', en: 'Sydney, Australia' },
];

const BASE = 'Europe/Stockholm'; // världsklockornas offset räknas relativt svensk tid (+0)

// Webbläsarens egen tidszon (t.ex. "Europe/Stockholm") → visningsnamn (sista ledet, "_"→" ").
const localZoneCity = (): string => {
  try {
    const z = Intl.DateTimeFormat().resolvedOptions().timeZone || BASE;
    const seg = z.split('/').pop() || z;
    return seg.replace(/_/g, ' ');
  } catch { return 'Stockholm'; }
};

const fmtTime = (now: Date, zone?: string) =>
  new Intl.DateTimeFormat('sv-SE', { ...(zone ? { timeZone: zone } : {}), hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);

const fmtHM = (now: Date, zone: string) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);

const dayDiff = (a: string, b: string): number =>
  Math.round((Date.parse(a) - Date.parse(b)) / 86400000);

const offsetLabel = (h: number): string => {
  const s = h > 0 ? '+' : h < 0 ? '−' : '±';
  const v = Math.abs(h);
  return `${s}${Number.isInteger(v) ? v : v.toFixed(1)} T`;
};

export const UtilityAnswer: React.FC<{ intent: UtilityIntent; sv: boolean }> = ({ intent, sv }) => {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!intent || intent.kind !== 'clock') return null;

  const week = isoWeek(now);
  const dateRaw = new Intl.DateTimeFormat(sv ? 'sv-SE' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(now);
  // Bara FÖRSTA bokstaven versal (svenska månader/veckodagar är gemena: "fredag 21 augusti").
  const dateLine = dateRaw.charAt(0).toUpperCase() + dateRaw.slice(1);
  const tzShort = (() => {
    try {
      const parts = new Intl.DateTimeFormat(sv ? 'sv-SE' : 'en-GB', { timeZoneName: 'short' }).formatToParts(now);
      return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    } catch { return ''; }
  })();
  const nh = nextHoliday(now);
  const baseYmd = ymdInZone(now, BASE);
  const baseOff = tzOffsetMinutes(now, BASE);

  const relDay = (zone: string): string => {
    const d = dayDiff(ymdInZone(now, zone), baseYmd);
    if (d === 0) return sv ? 'Idag' : 'Today';
    if (d === -1) return sv ? 'Igår' : 'Yesterday';
    if (d === 1) return sv ? 'Imorgon' : 'Tomorrow';
    return sv ? `${d > 0 ? '+' : ''}${d} dygn` : `${d > 0 ? '+' : ''}${d} d`;
  };

  return (
    <div className="text-left">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
        <Clock className="h-3 w-3" />{sv ? 'Tid & datum' : 'Time & date'}
      </div>

      {/* Primär: lokal tid (din webbläsare) — stor, levande */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-4xl font-semibold tabular-nums leading-none text-slate-50" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtTime(now)}
        </span>
        <span className="text-sm text-slate-300">{localZoneCity()}{tzShort ? ` · ${tzShort}` : ''}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[15px] text-slate-100">
        <CalendarDays className="h-4 w-4 shrink-0 text-amber-300/80" />
        <span>{dateLine}</span>
      </div>

      {/* Chips: veckonummer + nästa helgdag */}
      <div className="mt-2.5 flex flex-wrap gap-2">
        <span className="rounded-full border border-slate-600 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-200">
          {sv ? `Vecka ${week}` : `Week ${week}`}
        </span>
        {nh && (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-100">
            {sv ? 'Nästa helgdag' : 'Next holiday'}: {sv ? nh.holiday.name_sv : nh.holiday.name_en}
            {' · '}
            {nh.daysUntil === 0 ? (sv ? 'idag' : 'today') : nh.daysUntil === 1 ? (sv ? 'imorgon' : 'tomorrow') : (sv ? `om ${nh.daysUntil} dagar` : `in ${nh.daysUntil} days`)}
            {!nh.holiday.statutory && <span className="ml-1 text-amber-300/60">{sv ? '(afton)' : '(eve)'}</span>}
          </span>
        )}
      </div>

      {/* Världsklockor */}
      <div className="mt-3.5">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <Globe2 className="h-3 w-3" />{sv ? 'Världen just nu' : 'World clocks'}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {WORLD_CITIES.map((c) => {
            const offH = (tzOffsetMinutes(now, c.zone) - baseOff) / 60;
            return (
              <div key={c.zone} className="flex items-baseline justify-between gap-2 border-b border-slate-800/70 pb-1">
                <span className="min-w-0 truncate text-xs text-slate-300">{sv ? c.sv : c.en}</span>
                <span className="shrink-0 text-right">
                  <span className="font-mono text-sm tabular-nums text-slate-100">{fmtHM(now, c.zone)}</span>
                  <span className="ml-1.5 text-[10px] text-slate-500">{relDay(c.zone)}, {offsetLabel(offH)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ärlighet: hur svaret räknas fram + medveten datalucka (namnsdag) */}
      <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] leading-relaxed text-slate-500">
        {sv
          ? 'Beräknat lokalt i din webbläsare — ingen data lämnar enheten. Helgdagar följer lag (1989:253); påsk beräknas med gregoriansk algoritm. Namnsdag visas inte ännu (kräver verifierad namnsdagslista — vi hittar inte på den).'
          : 'Computed locally in your browser — no data leaves your device. Public holidays per Swedish law (1989:253); Easter via the Gregorian algorithm. Name-day not shown yet (needs a verified dataset — we don’t guess it).'}
      </p>
    </div>
  );
};
