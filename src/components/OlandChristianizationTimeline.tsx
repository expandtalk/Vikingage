import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Ölands kristnande via RUNSTENARNA, daterade med Gräslunds stilgrupper (Pr-serien) — en relativ-
// kronologi (~±25 år), därför ritas grupperna som BAND över ett årsintervall, inte som punkter.
// Per band: antal stenar + andel med kristet kors + andel med kristen formel/helgonnamn.
// Datagrund: runic_inscriptions (signum 'Öl %'), fält style_group, has_cross, translation_sv.

interface Row { signum: string; style_group: string | null; has_cross: boolean | null; translation_sv: string | null; }

// Gräslund-stildatering (ungefärliga spann, e.Kr.). Övergångsgrupper spänner brett.
const STYLE_SPAN: Record<string, [number, number]> = {
  'RAK': [980, 1015], 'Rak': [980, 1015],
  'Pr 1': [1010, 1040], 'Pr 1/Pr 2': [1015, 1045],
  'Pr 2': [1020, 1050], 'Pr 2/Pr 3': [1035, 1065],
  'Pr 3': [1045, 1075], 'Pr 3/Pr 4': [1060, 1090],
  'Pr 4': [1070, 1100], 'Pr 4/Pr 5': [1085, 1115], 'Pr 5': [1100, 1130],
};
const AXIS_MIN = 960, AXIS_MAX = 1140;

// Kristna markörer i översättningen: bön, brobyggnad "för sin själ", explicit kristnande, helgonnamn.
const SAINTS = /\b(johannes|petrus|jakob|jacob|anna|birgitta|christoffer|kristoffer|knut|maria|nikolaus)\b/i;
const isChristianFormula = (t: string | null): boolean => {
  if (!t) return false;
  const s = t.toLowerCase();
  return /gud\s?hjälpe|hjälpe (hans|hennes) (ande|själ)|guds moder|helige ande|kristus|jesus|amen/.test(s)
    || /för (sin|hans|hennes) själ|själ|byggde bro|gjorde bro|lade bro/.test(s)
    || /lät.*kristna|kristnade|kristn/.test(s)
    || SAINTS.test(s);
};

interface Band { key: string; start: number; end: number; n: number; cross: number; formula: number; christian: number; }

export function OlandChristianizationTimeline() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await (supabase.from('runic_inscriptions') as any)
        .select('signum, style_group, has_cross, translation_sv')
        .like('signum', 'Öl %');
      if (!active) return;
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const bands = useMemo<Band[]>(() => {
    const byStyle = new Map<string, Band>();
    for (const r of rows) {
      const key = (r.style_group ?? '').trim();
      const span = STYLE_SPAN[key];
      if (!span) continue; // ostilklassade utelämnas ur tidsaxeln (redovisas separat)
      const b = byStyle.get(key) ?? { key, start: span[0], end: span[1], n: 0, cross: 0, formula: 0, christian: 0 };
      b.n += 1;
      const cross = r.has_cross === true;
      const formula = isChristianFormula(r.translation_sv);
      if (cross) b.cross += 1;
      if (formula) b.formula += 1;
      if (cross || formula) b.christian += 1;
      byStyle.set(key, b);
    }
    return [...byStyle.values()].sort((a, b) => (a.start + a.end) - (b.start + b.end));
  }, [rows]);

  const unclassified = useMemo(() => rows.filter(r => !STYLE_SPAN[(r.style_group ?? '').trim()]).length, [rows]);
  const pct = (a: number, b: number) => b ? Math.round((a / b) * 100) : 0;
  const x = (year: number) => ((year - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

  if (loading) return <p className="text-xs text-muted-foreground">Laddar stilgrupps-tidsaxel…</p>;
  if (!bands.length) return null;

  const ticks = [980, 1000, 1020, 1040, 1060, 1080, 1100, 1120];

  return (
    <div>
      <div className="text-sm font-semibold text-foreground mb-1">Runstenarnas kristnande — per stilgrupp (Gräslund)</div>
      <p className="text-[11px] text-muted-foreground mb-3">
        Varje band är en stilgrupp daterad med Gräslunds Pr-serie (relativ kronologi, ~±25 år — inte exakta år).
        Fyllnaden visar andel <span className="text-gold">kristna stenar</span> (kors och/eller kristen formel/helgonnamn) i gruppen.
      </p>

      {/* årsaxel */}
      <div className="relative h-5 mb-1">
        {ticks.map(t => (
          <div key={t} className="absolute -translate-x-1/2 text-[10px] text-muted-foreground" style={{ left: `${x(t)}%` }}>{t}</div>
        ))}
      </div>

      <div className="space-y-1.5">
        {bands.map(b => {
          const share = pct(b.christian, b.n);
          return (
            <div key={b.key} className="relative h-7" title={`${b.key}: ${b.n} stenar, ${b.cross} med kors, ${b.formula} med kristen formel`}>
              <div className="absolute inset-y-0 rounded border border-border overflow-hidden flex items-center"
                style={{ left: `${x(b.start)}%`, width: `${x(b.end) - x(b.start)}%`, background: 'rgba(120,120,120,0.12)' }}>
                {/* kristen andel som fylld del */}
                <div className="absolute inset-y-0 left-0" style={{ width: `${share}%`, background: 'rgba(212,175,55,0.35)' }} />
                <span className="relative z-10 px-2 text-[11px] whitespace-nowrap text-foreground">
                  {b.key} · {b.n} st · {share}% kristna
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground mt-3">
        Läsning: kristna markörer ökar från de äldre stilgrupperna (Rak/Pr 1–2) mot de yngre (Pr 3–4),
        vilket speglar övergången ~1000–1100. Kors är sällsynta i Öland-korpusen ({rows.filter(r => r.has_cross).length} stenar);
        den kristna signalen bärs mest av formler och namn. {unclassified} Öl-inskrifter saknar stilgrupp och ligger utanför axeln.
        Stildatering enligt A.-S. Gräslund; tolkning, inte exakt datering.
      </p>
    </div>
  );
}
