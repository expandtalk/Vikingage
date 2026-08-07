// src/components/overlay/FieldNavControl.tsx
import React from 'react';
import { Navigation2, LocateFixed, X, Compass } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useDrivingMode } from '@/hooks/useDrivingMode';
import { useFieldNav, startFieldNav, stopFieldNav, setFieldNavFollowing, clearFieldNavTarget } from '@/hooks/useFieldNav';
import { haversineKm, bearingDeg, compassPoint8 } from '@/utils/geoDistance';

// Fältläge steg 1 (bil): opt-in live-följning med riktningskägla. Bara mobil (Daniel: "mobilläge").
// Position/följning hanteras av useFieldNavGeolocation + useMapFieldNav; detta är på/av + status.
const sourceLabel = (s: string | null | undefined) =>
  s === 'gps' ? 'GPS-kurs' : s === 'compass' ? 'Kompass' : 'Söker riktning…';
const fmtDist = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);
const UNCERTAINTY_FALLBACK = 'Leder till markörens utsatta läge — kontrollera markörens egen källa/precision.';

// iOS 13+: enhetsorientering (kompass-fallback) kräver behörighet utlöst av en användargest.
const requestCompassPermission = async () => {
  const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
  if (D && typeof D.requestPermission === 'function') {
    try { await D.requestPermission(); } catch { /* nekad → GPS-kurs räcker i bil */ }
  }
};

export const FieldNavControl: React.FC = () => {
  const isMobile = useIsMobile();
  const driving = useDrivingMode();
  const { active, pos, following, error, target } = useFieldNav();
  if (!isMobile) return null; // fältläget är ett mobilläge
  // I billäget körs följningen av Near me ("Kör") och kartan visar riktningskäglan; den egna
  // Följ färd-kontrollen döljs så vi inte får två paneler över kartan (Near me = enda ytan).
  if (driving) return null;

  if (!active) {
    return (
      <button
        onClick={async () => { await requestCompassPermission(); startFieldNav(); }}
        title="Följ min färd — visa färdriktning"
        aria-label="Följ färd"
        className="absolute z-[1050] bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center p-2 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white border-2 border-emerald-400 shadow-lg backdrop-blur-md"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <Navigation2 className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      className="absolute bottom-20 right-4 z-[1055] w-[min(90%,320px)] bg-slate-900/90 backdrop-blur-md border border-slate-600 rounded-xl shadow-2xl p-3"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-semibold flex items-center gap-2">
          <Navigation2 className="h-4 w-4 text-emerald-400" />Följer färd
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
