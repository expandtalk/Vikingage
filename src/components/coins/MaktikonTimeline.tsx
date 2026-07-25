import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Coin } from '@/hooks/useCoins';

// Maktikon-tidslinje: när uppträder olika auktoritetssymboler på mynt/sigill?
// Klassificerar live-mynten i sju maktikon-kategorier (tolkande gruppering ovanpå
// coins.category + ikonografi) och ritar ett Gantt-spår över tid.

type MaktikonKey = 'emperor' | 'runic' | 'eastern' | 'royal' | 'heraldic' | 'civic' | 'national';

const CATS: { key: MaktikonKey; sv: string; en: string; color: string }[] = [
  { key: 'emperor',  sv: 'Kejsarporträtt',           en: 'Imperial portrait',   color: '#d3a63f' },
  { key: 'runic',    sv: 'Runlegend',                en: 'Runic legend',        color: '#cf9350' },
  { key: 'eastern',  sv: 'Österländsk / kufisk',     en: 'Eastern / Kufic',     color: '#4fb0a0' },
  { key: 'royal',    sv: 'Kungaporträtt & kors',     en: 'Royal portrait & cross', color: '#8aa6d4' },
  { key: 'heraldic', sv: 'Bjälkar & lejon (Bjälbo)', en: 'Bars & lion (Bjälbo)', color: '#5f86e6' },
  { key: 'civic',    sv: 'Stadssigill',              en: 'Civic seals',         color: '#a6a9b1' },
  { key: 'national', sv: 'Nationell prägling',       en: 'National coinage',    color: '#79a17d' },
];
const COLOR: Record<MaktikonKey, string> = Object.fromEntries(CATS.map((c) => [c.key, c.color])) as Record<MaktikonKey, string>;

// Härled maktikon-kategori ur myntets fält (ordningen är prioriterad).
const classify = (c: Coin): MaktikonKey => {
  const text = `${c.name} ${c.issuer ?? ''} ${c.obverse ?? ''} ${c.reverse ?? ''}`.toLowerCase();
  const start = c.period_start ?? 0;
  if (/riksdaler|klipping|gustav vasa|kristian ii/.test(text) || start >= 1500) return 'national';
  if (/bjälk|sträng|knut lång/.test(text)) return 'heraldic';
  if (c.category === 'seal') return /stad|kalmar|stockholm/.test(text) ? 'civic' : 'heraldic';
  if (c.category === 'runmynt' || /runsk|runinskrift|runskrift/.test(text)) return 'runic';
  if (c.category === 'islamic' || /dirham|tabaristan|spilling|abbasid|kufisk/.test(text)) return 'eastern';
  if (/birka|dorestad/.test(text)) return 'eastern';
  if (c.category === 'roman_solidus' || /solidus|denar|didius|kejsar|leo/.test(text)) return 'emperor';
  return 'royal';
};

export const MaktikonTimeline: React.FC<{ coins: Coin[] }> = ({ coins }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { lanes, axisMin, axisMax, ticks } = useMemo(() => {
    const withPeriod = coins.filter((c) => c.period_start != null);
    const byCat = new Map<MaktikonKey, Coin[]>();
    for (const c of withPeriod) {
      const k = classify(c);
      if (!byCat.has(k)) byCat.set(k, []);
      byCat.get(k)!.push(c);
    }
    const starts = withPeriod.map((c) => c.period_start!);
    const ends = withPeriod.map((c) => c.period_end ?? c.period_start!);
    const min = Math.min(...starts, 150);
    const max = Math.max(...ends, 1560);
    const lanes = CATS.filter((cat) => byCat.has(cat.key)).map((cat) => {
      const cs = byCat.get(cat.key)!.sort((a, b) => a.period_start! - b.period_start!);
      return {
        ...cat,
        coins: cs,
        start: Math.min(...cs.map((c) => c.period_start!)),
        end: Math.max(...cs.map((c) => c.period_end ?? c.period_start!)),
      };
    });
    // Jämna sekel-ticks inom spannet.
    const ticks: number[] = [];
    for (let y = Math.ceil(min / 200) * 200; y <= max; y += 200) ticks.push(y);
    return { lanes, axisMin: min, axisMax: max, ticks };
  }, [coins]);

  const pos = (y: number) => ((y - axisMin) / (axisMax - axisMin)) * 100;
  const yr = (n: number) => (n < 0 ? `${Math.abs(n)} f.Kr.` : `${n}`);

  if (!lanes.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold text-foreground mb-1">
        {sv ? 'Maktikoner över tid' : 'Power icons over time'}
      </h2>
      <p className="text-muted-foreground text-sm mb-4 max-w-3xl">
        {sv
          ? 'När uppträder olika auktoritetssymboler? Från romerskt kejsarporträtt och kufiskt silver till kristen kungamakt och Bjälboättens bjälkar och lejon — motivet som lever kvar i Sveriges riksvapen.'
          : 'When do different symbols of authority appear? From Roman imperial portraits and Kufic silver to Christian royal power and the bars and lion of the House of Bjälbo — the motif still in Sweden’s national arms.'}
      </p>

      <div className="viking-card rounded-lg p-4 overflow-x-auto">
        <div className="min-w-[560px]">
          {lanes.map((lane) => (
            <div key={lane.key} className="grid grid-cols-[170px_1fr] items-center gap-3 py-1.5 border-t border-white/10 first:border-t-0">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="w-3 h-3 rounded-sm flex-none" style={{ background: lane.color }} />
                <span>{sv ? lane.sv : lane.en}</span>
              </div>
              <div className="relative h-6">
                <span
                  className="absolute top-1.5 h-3 rounded-full"
                  style={{ left: `${pos(lane.start)}%`, width: `${Math.max(pos(lane.end) - pos(lane.start), 0.5)}%`, background: lane.color, opacity: 0.45 }}
                />
                {lane.coins.map((c) => (
                  <span
                    key={c.id}
                    title={`${sv ? c.name : c.name_en ?? c.name} (${yr(c.period_start!)})`}
                    className="absolute top-0.5 w-4 h-4 rounded-full border-2 -translate-x-1/2"
                    style={{ left: `${pos(c.period_start!)}%`, background: lane.color, borderColor: 'hsl(var(--card))' }}
                  />
                ))}
              </div>
            </div>
          ))}
          {/* Tidsaxel */}
          <div className="grid grid-cols-[170px_1fr] gap-3 mt-2">
            <div />
            <div className="relative h-5 border-t border-white/20">
              {ticks.map((t) => (
                <span key={t} className="absolute top-1 -translate-x-1/2 text-[11px] text-muted-foreground tabular-nums" style={{ left: `${pos(t)}%` }}>
                  {yr(t)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/80 mt-3 border-l-2 pl-3" style={{ borderColor: COLOR.heraldic }}>
        {sv
          ? 'Bjälbo-tråden: tre smala bjälkar dyker upp redan på Knut Långes penning (1229–1234) och blir strängarna bakom lejonet i Birger jarls vapen — heraldisk föregångare till riksvapnet.'
          : 'The Bjälbo thread: three narrow bars appear already on Knut the Tall’s penny (1229–1234) and become the bars behind the lion in Birger Jarl’s arms — heraldic precursor to the national arms.'}
      </p>
    </section>
  );
};
