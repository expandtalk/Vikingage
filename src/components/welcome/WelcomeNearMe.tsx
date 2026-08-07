import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocateFixed, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useLanguage } from '@/contexts/LanguageContext';
import { openNearMe, setNearMePos, setNearMeLocating, setNearMeError } from '@/hooks/useNearMe';

// Mobil-startsidans PRIMÄRA handling: Near me. Mobil = fältverktyg (Daniel) → öppnar man sajten ska
// "vad finns runt mig" vara direkt tillgängligt, inte gömt inne på kartsidan. Flöde: tryck → lokalisera
// → öppna kartan CENTRERAD på dig (?center djuplänk läses av useMapInstance) + Near me-panelen öppen
// (delad useNearMe-store överlever route-bytet) med 200 m-zonen (justeras i panelen). Bara mobil.
export const WelcomeNearMe: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [busy, setBusy] = useState(false);
  if (!isMobile) return null;

  const go = () => {
    if (!('geolocation' in navigator)) { navigate('/explore'); return; }
    setBusy(true);
    openNearMe();
    setNearMeLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setNearMePos(p.coords.latitude, p.coords.longitude, p.coords.accuracy);
        navigate(`/explore?center=${p.coords.latitude},${p.coords.longitude}&zoom=15`);
      },
      () => {
        setNearMeError(sv ? 'Kunde inte hämta din position — tillåt plats.' : 'Could not get your location — allow location.');
        setBusy(false);
        navigate('/explore');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="px-4 pt-3">
      <button
        onClick={go}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-base font-semibold border-2 border-sky-300 shadow-lg px-5 py-4 disabled:opacity-60"
        style={{ minHeight: 56 }}
      >
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <LocateFixed className="h-6 w-6" />}
        {sv ? 'Near me — vad finns runt mig?' : 'Near me — what’s around me?'}
      </button>
      <p className="mt-1 text-center text-[11px] text-white/70">
        {sv ? 'Öppnar kartan vid dig (200 m). Din plats används bara här — vi följer dig inte.'
            : 'Opens the map at your location (200 m). Your location is used only here — we don’t track you.'}
      </p>
    </div>
  );
};
