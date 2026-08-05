import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Den långa bågen (200→1400 e.Kr.): förkristet gravlandskap → runstensfönstret → kyrkoera.
// Gravarna 200–1000 är ODATERADE per objekt → ritas som kvalitativ bakgrundsepok med inventarie-
// siffror, INTE som årskurva. Kyrkoeran är daterbar (byggnadsår) → daterade händelse-pins.

const AXIS_MIN = 200, AXIS_MAX = 1400;
const x = (y: number) => ((y - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

interface Counts { graves: number; forts: number; church1100: number; church1200: number; moved: number; }
interface CurvePt { bin_mid: number; n_effective: number; christian_share: number; }

export function OlandChristianizationEpochs() {
  const [c, setC] = useState<Counts | null>(null);
  const [curve, setCurve] = useState<CurvePt[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const sb = supabase as any;
      const [g, f, ch, mv, cv] = await Promise.all([
        sb.from('heritage_sites').select('id', { count: 'exact', head: true }).ilike('landscape', '%öland%').or('raa_type.ilike.%grav%,raa_type.ilike.%hög%,raa_type.ilike.%rös%,raa_type.ilike.%stensätt%,raa_type.ilike.%domarring%,raa_type.ilike.%kammargrav%'),
        sb.from('swedish_hillforts').select('id', { count: 'exact', head: true }).ilike('landscape', '%öland%'),
        sb.from('ecclesiastical_sites').select('built_from').ilike('landscape', '%öland%'),
        sb.from('inscription_locations').select('signum').eq('role', 'current').ilike('place_name', '%kyrk%').like('signum', 'Öl %'),
        sb.rpc('get_christianization_curve', { p_regions: ['Öland'] }),
      ]);
      if (!active) return;
      const chr = (ch.data ?? []) as Array<{ built_from: number | null }>;
      setC({
        graves: g.count ?? 1244,
        forts: f.count ?? 21,
        church1100: chr.filter(r => r.built_from != null && r.built_from <= 1100).length,
        church1200: chr.filter(r => r.built_from != null && r.built_from <= 1200).length,
        moved: (mv.data ?? []).length,
      });
      setCurve(((cv.data ?? []) as CurvePt[]).filter(p => p.n_effective >= 1 && p.christian_share != null));
    })();
    return () => { active = false; };
  }, []);

  const ticks = [200, 400, 600, 800, 1000, 1200, 1400];
  const epochs = [
    { label: 'Förkristet gravlandskap', a: 200, b: 1000, bg: 'rgba(150,120,70,0.16)',
      note: c ? `${c.graves} gravar + ${c.forts} fornborgar · Vaner-kult (Skedemosse) · solidus-guldskatter (Björnhovda, Åby)` : '' },
    { label: 'Runstensfönstret', a: 980, b: 1130, bg: 'rgba(80,140,90,0.18)',
      note: '~190 runstenar; kristna markörer från ~1020 (se banden nedan)' },
    { label: 'Kyrkoera (konsolidering)', a: 1100, b: 1400, bg: 'rgba(212,175,55,0.16)',
      note: c ? `${c.church1100} stenkyrkor ~1100 → ${c.church1200} vid 1200 — institutionell konsolidering, EJ kristnandet (det skedde ~950–1100); ${c.moved} runstenar inflyttade i kyrkan` : '' },
  ];
  const pins = [
    { y: 1000, t: 'Kristna mynt (crux-penning)' },
    { y: 1100, t: 'Första stenkyrkorna' },
    { y: 1200, t: 'S:ta Brita kapell' },
    { y: 1374, t: 'Birgittas likfärd' },
  ];

  return (
    <div>
      <div className="text-sm font-semibold text-foreground mb-1">Kristnandets långa båge på Öland (200–1400 e.Kr.)</div>
      {/* årsaxel */}
      <div className="relative h-4 mb-1">
        {ticks.map(t => (
          <div key={t} className="absolute -translate-x-1/2 text-[10px] text-muted-foreground" style={{ left: `${x(t)}%` }}>{t}</div>
        ))}
      </div>
      {/* epok-band */}
      <div className="space-y-1.5">
        {epochs.map(e => (
          <div key={e.label} className="relative h-8">
            <div className="absolute inset-y-0 rounded border border-border flex items-center px-2 overflow-hidden"
              style={{ left: `${x(e.a)}%`, width: `${x(e.b) - x(e.a)}%`, background: e.bg }}>
              <span className="text-[11px] text-foreground whitespace-nowrap font-medium">{e.label}</span>
            </div>
            <div className="absolute inset-y-0 flex items-center text-[10px] text-muted-foreground pl-2"
              style={{ left: `${x(e.b)}%`, maxWidth: `${100 - x(e.b)}%` }}>
              <span className="truncate">{e.note}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Aoristisk kristen-markör-kurva (runstenar, Öland) — konversionsförloppet, före stenkyrkorna */}
      {curve.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] text-muted-foreground mb-0.5">Kristen markör-andel på runstenar (aoristisk, Öland) — <span className="text-amber-300">crux-band 995–1035</span>; staplarnas höjd = andel, blekhet = få stenar (litet n)</div>
          <div className="relative h-14 border-b border-border/60">
            <div className="absolute inset-y-0 bg-amber-400/10 border-x border-amber-400/40" style={{ left: `${x(995)}%`, width: `${x(1035) - x(995)}%` }} />
            {curve.map(p => (
              <div key={p.bin_mid} className="absolute bottom-0 bg-emerald-500 rounded-t"
                title={`~${p.bin_mid}: ${Math.round(p.christian_share * 100)}% kristet (n≈${p.n_effective})`}
                style={{ left: `${x(p.bin_mid) - 0.35}%`, width: '0.7%', height: `${Math.max(3, p.christian_share * 100)}%`, opacity: 0.25 + 0.75 * Math.min(1, p.n_effective / 10) }} />
            ))}
          </div>
        </div>
      )}
      {/* daterade händelse-pins */}
      <div className="relative h-8 mt-1">
        {pins.map(p => (
          <div key={p.y} className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${x(p.y)}%` }}>
            <div className="w-px h-3 bg-gold" />
            <span className="text-[9px] text-gold whitespace-nowrap">{p.y} {p.t}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">
        De förkristna gravarna saknar datering per objekt och visas som bakgrundsepok, inte som kurva.
        (Ölands allra äldsta gravar — dös och gånggrifter, ~3500 f.Kr. — ligger före axeln.)
        Solidus-skatterna är folkvandringstidens hedniska prestige-guld — inte en kristen markör;
        den kristna mynt-signalen är crux-penningen (Olof Skötkonungs Sigtuna-mynt, ~995–1035, kors + CRUX).
        <br /><strong className="text-foreground">Metod &amp; proxy-stafett:</strong> stenkyrkorna (1100+) mäter <em>konsolidering</em>, inte kristnandet — kyrkodata är vänstertrunkerat (träkyrkor/gårdskyrkor osynliga). Konversionen (~950–1100) fångas i stället av runstenarnas kristna markörer (aoristisk kurva ovan: varje stildaterad sten spridd över sitt Gräslund-fönster) och crux-mynten. Kurvan vilar på <strong className="text-foreground">85 av ~190</strong> Öland-stenar (de stildaterade) — brusig pga litet underlag (blekare staplar = färre stenar). För säkrare svar krävs gravskicksövergången + logistisk kurva (jfr Uppland, där n är stort).
      </p>
    </div>
  );
}
