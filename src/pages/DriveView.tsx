import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DriveView3D } from '@/components/map/DriveView3D';
import { useFieldNav, startFieldNav, stopFieldNav, setFieldNavFollowing } from '@/hooks/useFieldNav';
import { useFieldNavGeolocation } from '@/hooks/map/useFieldNavGeolocation';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, LocateFixed, Navigation2, Map } from 'lucide-react';

// /3D-bil (en: /3D-drive) — MapLibre Fas 2: tiltat 3D-förarperspektiv. Helskärm, mobil-först.
// Startar fältlägets GPS-följning; river den vid unmount. HUD: fart + recenter + stäng.

// Demoläge utan GPS (t.ex. desktop där platsåtkomst nekas): starta vid Anundshög/Badelunda
// (koord verifierad, jfr vägarbetet) så 3D-vyn syns och kan utforskas fritt.
const DEMO_CENTER = { lat: 59.63056, lng: 16.64472 };

const DriveView: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pos, following, error } = useFieldNav();
  useFieldNavGeolocation(); // matar setFieldNavPos medan aktiv
  const [nearbyN, setNearbyN] = useState<number | null>(null); // # objekt hämtade (diagnostik + UX)

  // Valfritt demo-center via ?lat&lng (t.ex. "3D-vy" från en utflykt → Gåseborg-terrängpiloten).
  const qLat = parseFloat(params.get('lat') ?? '');
  const qLng = parseFloat(params.get('lng') ?? '');
  const demoCenter = Number.isFinite(qLat) && Number.isFinite(qLng) ? { lat: qLat, lng: qLng } : DEMO_CENTER;

  useEffect(() => {
    startFieldNav();
    return () => stopFieldNav();
  }, []);

  const kmh = pos?.speed != null && pos.speed >= 0 ? Math.round(pos.speed * 3.6) : null;

  return (
    <div className="fixed inset-0 bg-slate-950">
      <DriveView3D demoCenter={demoCenter} onNearby={setNearbyN} />

      {/* Topbar: Explore → Stäng (Daniel) + status. Explore öppnar den platta kartan på SAMMA
          position/zoom så man inte tappar orienteringen (i st.f. utzoomad Sverigekarta). */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => { const c = pos ?? demoCenter; navigate(`/explore?center=${c.lat},${c.lng}&zoom=15`); }}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-900/85 px-3 py-1.5 text-sm text-slate-100 backdrop-blur-sm"
        >
          <Map className="h-4 w-4" />{sv ? 'Utforska' : 'Explore'}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-900/85 px-3 py-1.5 text-sm text-slate-100 backdrop-blur-sm"
        >
          <X className="h-4 w-4" />{sv ? 'Stäng' : 'Close'}
        </button>
        <span className="rounded-lg border border-slate-600 bg-slate-900/85 px-2.5 py-1.5 text-[11px] text-slate-300 backdrop-blur-sm">
          {sv ? '3D-förarperspektiv (beta)' : '3D drive view (beta)'}
        </span>
        {nearbyN != null && (
          <span className={`rounded-lg border px-2.5 py-1.5 text-[11px] backdrop-blur-sm ${nearbyN === 0 ? 'border-amber-600/60 bg-amber-950/70 text-amber-200' : 'border-slate-600 bg-slate-900/85 text-slate-300'}`}>
            {nearbyN === 0 ? (sv ? 'inga objekt hämtade' : 'no objects loaded') : (sv ? `${nearbyN} objekt nära` : `${nearbyN} nearby`)}
          </span>
        )}
        {!following && (
          <button
            type="button"
            onClick={() => setFieldNavFollowing(true)}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gold/50 bg-gold/15 px-3 py-1.5 text-sm text-amber-100 backdrop-blur-sm"
          >
            <LocateFixed className="h-4 w-4" />{sv ? 'Centrera' : 'Recenter'}
          </button>
        )}
      </div>

      {/* Fart-HUD nere */}
      {kmh != null && (
        <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-900/85 px-5 py-2 text-center backdrop-blur-sm">
          <div className="text-3xl font-bold tabular-nums text-white leading-none">{kmh}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">km/h</div>
        </div>
      )}

      {/* GPS-status. Nekad/otillgänglig plats (desktop) → vänlig DEMO-not i st.f. blockerande fel:
          kartan visas ändå (demoCenter) och kan panoreras/lutas fritt. */}
      {!pos && (
        <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 flex max-w-[92vw] items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/85 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm">
          <Navigation2 className="h-4 w-4 shrink-0 animate-pulse text-gold" />
          <span>
            {error
              ? (sv
                  ? 'Demoläge (ingen GPS) — startar vid Anundshög. Panorera och luta kartan fritt; öppna på mobil eller tillåt plats för live 3D-förarperspektiv.'
                  : 'Demo mode (no GPS) — starting at Anundshög. Pan and tilt freely; open on mobile or allow location for the live 3D drive view.')
              : (sv ? 'Väntar på GPS-position…' : 'Waiting for GPS…')}
          </span>
        </div>
      )}
    </div>
  );
};

export default DriveView;
