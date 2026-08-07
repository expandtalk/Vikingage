import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveExploreRoles, setActiveExploreRoles } from './useActiveExploreRole';
import { useNearMe, setNearMeRadiusKm } from './useNearMe';
import { useTimePeriod, setTimePeriod } from './useTimePeriod';
import type { ProfileId } from '@/config/exploreProfiles';

// Kontosynk (steg 2): speglar användarens val (intresseprofil/persona + Near me-radie) mot
// public.user_preferences så de följer med mellan enheter. Local-first: utloggade rör inget här.
// Vid login LADDAS serverns val och appliceras (om de finns), annars pushas nuvarande lokala upp.
// Därefter SKRIVS ändringar tillbaka debouncat. Ordningsvakt (readyFor) hindrar att login råkar
// skriva över serverns val med lokala defaults innan laddningen hunnit klart.
interface Prefs { roles?: string[]; radiusKm?: number; timePeriod?: string }

export const useAccountSync = () => {
  const { user } = useAuth();
  const roles = useActiveExploreRoles();
  const { radiusKm } = useNearMe();
  const timePeriod = useTimePeriod();
  const loadedFor = useRef<string | null>(null);
  const readyFor = useRef<string | null>(null);
  const hydrating = useRef(false);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ladda serverns val vid login (en gång per användare).
  useEffect(() => {
    if (!user) { loadedFor.current = null; readyFor.current = null; return; }
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('user_preferences').select('prefs').eq('user_id', user.id).maybeSingle();
        if (cancelled) return;
        const prefs = (data?.prefs ?? null) as Prefs | null;
        if (prefs && Array.isArray(prefs.roles) && prefs.roles.length) {
          hydrating.current = true;
          setActiveExploreRoles(prefs.roles as ProfileId[]);
          if (typeof prefs.radiusKm === 'number' && prefs.radiusKm > 0) setNearMeRadiusKm(prefs.radiusKm);
          if (typeof prefs.timePeriod === 'string' && prefs.timePeriod) setTimePeriod(prefs.timePeriod);
          readyFor.current = user.id;
          setTimeout(() => { hydrating.current = false; }, 0);
        } else {
          // Inga serverval än → spara nuvarande lokala som kontots utgångsläge.
          await supabase.from('user_preferences').upsert({
            user_id: user.id, prefs: { roles, radiusKm, timePeriod: timePeriod ?? undefined }, updated_at: new Date().toISOString(),
          });
          readyFor.current = user.id;
        }
      } catch {
        // Nätfel/behörighet → förbli local-first, försök igen nästa session.
        readyFor.current = user.id;
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Skriv tillbaka ändringar (debouncat) när inloggad och laddningen är klar.
  useEffect(() => {
    if (!user || readyFor.current !== user.id || hydrating.current) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      void supabase.from('user_preferences').upsert({
        user_id: user.id, prefs: { roles, radiusKm, timePeriod: timePeriod ?? undefined }, updated_at: new Date().toISOString(),
      });
    }, 800);
    return () => { if (writeTimer.current) clearTimeout(writeTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, roles, radiusKm, timePeriod]);
};
