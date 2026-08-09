import React from 'react';
import { Ruler, Target, Undo2 } from 'lucide-react';
import { useRuler, toggleRuler, clearRuler, rulerKm, rulerPathKm, setRulerMode, undoRulerPoint } from '@/hooks/useRuler';
import { setProbe, setProbeRadiusKm, TRANSPORT_MODES } from '@/hooks/useProximityProbe';
import { useLanguage } from '@/contexts/LanguageContext';

// Linjalen som SIDCHROME (i breadcrumb-raden) i st.f. flytande kart-widget — samma typografi
// som resten av sidhuvudet (Daniel: "i linje med breadcrumb, inte annan typografi"). Mätningen
// sker fortfarande på kartan via useMapRuler (global state), oavsett var toggeln bor.
const rulerToProbe = (a: { lat: number; lng: number }, b: { lat: number; lng: number }, km: number) => {
  const mid = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
  setProbe(mid.lat, mid.lng, `Linjal-område (${km.toFixed(1)} km)`);
  setProbeRadiusKm(Math.max(1, Math.round(km / 2)));
};
const TRAVEL = ['foot', 'boat_row'] as const;

export const RulerBar: React.FC = () => {
  const { active, mode, pts } = useRuler();
  const { language } = useLanguage();
  const sv = language !== 'en';
  const pathKm = rulerPathKm(pts);
  const days = (kmPerDay: number) => pathKm / kmPerDay;

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={toggleRuler}
        title={sv ? 'Mät avstånd mellan två punkter, eller en sträcka längs leden' : 'Measure distance between points or along a route'}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium transition-colors ${
          active ? 'border-gold/60 bg-gold/15 text-foreground' : 'border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card'
        }`}
      >
        <Ruler className="h-3.5 w-3.5" />{active ? (sv ? 'Linjal på' : 'Ruler on') : (sv ? 'Linjal' : 'Ruler')}
      </button>

      {active && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Lägesväljare: Enkel (A→B) eller Sträcka (bana) */}
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            {([['simple', sv ? 'Enkel' : 'Simple'], ['path', sv ? 'Sträcka' : 'Path']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRulerMode(key)}
                className={`px-2 py-1 transition-colors ${mode === key ? 'bg-gold/20 text-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'simple' ? (
            pts.length === 2 ? (
              <>
                <span className="tabular-nums text-foreground"><strong className="text-gold">{rulerKm(pts[0], pts[1]).toFixed(1)} km</strong></span>
                <button
                  onClick={() => rulerToProbe(pts[0], pts[1], rulerKm(pts[0], pts[1]))}
                  title={sv ? 'Gör om sträckan till ett hypotes-område' : 'Turn into a hypothesis area'}
                  className="inline-flex items-center gap-1 rounded border border-gold/50 px-1.5 py-0.5 text-gold hover:bg-gold/15"
                >
                  <Target className="h-3 w-3" />{sv ? 'hypotes-område' : 'hypothesis area'}
                </button>
                <button onClick={clearRuler} className="text-muted-foreground underline hover:text-foreground">{sv ? 'rensa' : 'clear'}</button>
              </>
            ) : (
              <span className="text-muted-foreground">{sv ? `Klicka ${2 - pts.length} punkt${2 - pts.length === 1 ? '' : 'er'} till på kartan` : `Click ${2 - pts.length} more point(s) on the map`}</span>
            )
          ) : (
            pts.length >= 2 ? (
              <>
                <span className="tabular-nums"><strong className="text-gold">{pathKm.toFixed(1)} km</strong> <span className="text-muted-foreground">· {pts.length} {sv ? 'punkter' : 'points'}</span></span>
                {TRAVEL.map((k) => {
                  const m = TRANSPORT_MODES.find((t) => t.key === k)!;
                  return (
                    <span key={k} className="text-muted-foreground" title={m.note}>
                      {m.labelSv}: <span className="text-gold">{days(m.radiusKm).toFixed(1)} {sv ? 'dagsresor' : 'day-trips'}</span>
                    </span>
                  );
                })}
                <button onClick={undoRulerPoint} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><Undo2 className="h-3 w-3" />{sv ? 'ångra' : 'undo'}</button>
                <button onClick={clearRuler} className="text-muted-foreground underline hover:text-foreground">{sv ? 'rensa' : 'clear'}</button>
              </>
            ) : (
              <span className="text-muted-foreground">{sv ? 'Klicka punkter längs leden på kartan' : 'Click points along the route on the map'}</span>
            )
          )}
        </div>
      )}
    </div>
  );
};
