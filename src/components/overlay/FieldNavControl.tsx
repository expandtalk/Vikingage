// src/components/overlay/FieldNavControl.tsx
import React from 'react';
import { Navigation2, LocateFixed, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useFieldNav, startFieldNav, stopFieldNav, setFieldNavFollowing } from '@/hooks/useFieldNav';

// Fältläge steg 1 (bil): opt-in live-följning med riktningskägla. Bara mobil (Daniel: "mobilläge").
// Position/följning hanteras av useFieldNavGeolocation + useMapFieldNav; detta är på/av + status.
const sourceLabel = (s: string | null | undefined) =>
  s === 'gps' ? 'GPS-kurs' : s === 'compass' ? 'Kompass' : 'Söker riktning…';

// iOS 13+: enhetsorientering (kompass-fallback) kräver behörighet utlöst av en användargest.
const requestCompassPermission = async () => {
  const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
  if (D && typeof D.requestPermission === 'function') {
    try { await D.requestPermission(); } catch { /* nekad → GPS-kurs räcker i bil */ }
  }
};

export const FieldNavControl: React.FC = () => {
  const isMobile = useIsMobile();
  const { active, pos, following, error } = useFieldNav();
  if (!isMobile) return null; // fältläget är ett mobilläge

  if (!active) {
    return (
      <button
        onClick={async () => { await requestCompassPermission(); startFieldNav(); }}
        title="Följ min färd — visa färdriktning"
        className="absolute bottom-20 right-4 z-[1050] flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600/95 hover:bg-emerald-600 text-white text-sm font-medium border-2 border-emerald-400 shadow-lg backdrop-blur-md"
        style={{ minHeight: 44 }}
      >
        <Navigation2 className="h-5 w-5" />Följ färd
      </button>
    );
  }

  return (
    <div
      className="absolute bottom-20 right-4 z-[1055] w-[min(90%,320px)] bg-slate-900 border border-slate-600 rounded-xl shadow-2xl p-3"
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
