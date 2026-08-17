import { supabase } from '@/integrations/supabase/client';

// Klick-signal för sök (cortiq-stil). Loggar ANONYMT aggregat: (sökterm → klickad entitet).
// GDPR: ingen individdata skickas — bara term + entitetstyp + entitets-id. RPC:n UPSERTar en
// räknare; inga per-klick-rader, inget användar-id/IP. "Fire and forget" — får aldrig blockera
// navigeringen eller kasta upp fel till användaren.
//
// Dedup per (term, entity) i minnet så en enskild sökning inte råkar dubbelräkna vid re-renders.
const sent = new Set<string>();

export const logSearchClick = (term: string, entityType: string, entityId: string): void => {
  try {
    const t = (term ?? '').trim().toLowerCase();
    if (t.length < 2 || t.length > 60 || !entityType || !entityId) return;
    const key = `${t}|${entityType}|${entityId}`;
    if (sent.has(key)) return;
    sent.add(key);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('log_search_click', { p_term: term, p_entity_type: entityType, p_entity_id: entityId })
      .then(() => {}, () => {}); // tyst — signalen får aldrig störa UX
  } catch { /* noop */ }
};
