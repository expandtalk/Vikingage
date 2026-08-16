// src/components/overlay/FieldModeHud.tsx
import React from 'react';
import { Navigation2, LocateFixed, X, Compass } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useDrivingMode } from '@/hooks/useDrivingMode';
import { useFieldNav, stopFieldNav, setFieldNavFollowing, clearFieldNavTarget } from '@/hooks/useFieldNav';
import { haversineKm, bearingDeg, compassPoint8 } from '@/utils/geoDistance';

// Aktiv-läge-HUD för fältläget (gå/cykel). ENDA framdörren är Near me — den här komponenten
// STARTAR aldrig läget; den visas bara MEDAN följning är aktiv (status + Centrera + kompass
// till punkt + Avsluta). Bil-läget äger sin egen NavigatorHud (driving) → då döljs denna.
// (Ersätter tidigare FieldNavControl, som också var en andra startknapp.)
const sourceLabel = (s: string | null | undefined) =>
  s === 'gps' ? 'GPS-kurs' : s === 'compass' ? 'Kompass' : 'Söker riktning…';
const fmtDist = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);
const UNCERTAINTY_FALLBACK = 'Leder till markörens utsatta läge — kontrollera markörens egen källa/precision.';

export const FieldModeHud: React.FC = () => {
  const isMobile = useIsMobile();
  const driving = useDrivingMode();
  const { active, pos, following, error, target } = useFieldNav();
  if (!isMobile) return null;      // fältläget är ett mobilläge
  if (driving) return null;        // bil-läge → NavigatorHud äger nedre zonen
  if (!active) return null;        // ingen startknapp längre — Near me är enda framdörren

  return (
    <div
      className="absolute bottom-20 right-4 z-[1055] w-[min(90%,320px)] bg-slate-900/90 backdrop-blur-md border border-slate-600 rounded-xl shadow-2xl p-3"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-semibold flex items-center gap-2">
          <Navigation2 className="h-4 w-4 text-emerald-400" />{target ? 'Kompass till punkt' : 'Fältläge'}
        </span>
        <button onClick={stopFieldNav} aria-label="Avsluta fältläge"
          className="flex items-center justify-center text-slate-300 hover:text-white" style={{ minWidth: 44, minHeight: 44 }}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {error ? (
        <p className="mt-1 text-rose-300 text-sm">{error}</p>
      ) : (
        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
          <span className="text-emerald-300">{sourceLabel(pos?.headingSource)}</span>
          <span className="text-slate-400 tabular-nums">
            {pos?.accuracy != null ? `±${Math.round(pos.accuracy)} m` : '…'}
          </span>
        </div>
      )}

      {target && (
        <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 text-sm text-amber-200 flex items-center gap-1">
              <Compass className="h-4 w-4 shrink-0" /><span className="truncate">{target.label}</span>
            </span>
            <button onClick={clearFieldNavTarget}
              className="shrink-0 text-[11px] text-slate-300 hover:text-white underline underline-offset-2"
              style={{ minHeight: 40, paddingInline: 6 }}>Rensa mål</button>
          </div>
          {pos ? (() => {
            const brg = bearingDeg(pos, target);
            return (
              <div className="mt-1 text-xs text-amber-100 tabular-nums">
                ≈ {fmtDist(haversineKm(pos, target))} · {compassPoint8(brg)} ({Math.round(brg)}°)
              </div>
            );
          })() : (
            <div className="mt-1 text-xs text-slate-400">Söker din position…</div>
          )}
          <div className="mt-1 text-[11px] text-slate-400">{target.uncertaintyNote ?? UNCERTAINTY_FALLBACK}</div>
        </div>
      )}

      {!following && (
        <button onClick={() => setFieldNavFollowing(true)}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-sm font-medium"
          style={{ minHeight: 44 }}>
          <LocateFixed className="h-4 w-4" />Centrera på mig
        </button>
      )}
    </div>
  );
};
