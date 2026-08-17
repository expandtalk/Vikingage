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

// Logga ALLA sökningar (aggregat) så vi ser vad folk söker på + om det gav träff — systemet lär
// sig vad vi bör bygga (Daniel). GDPR: ingen individdata, bara term→antal. Dedup per term i minnet
// per sidladdning så en enskild sökning (många tangenttryck) inte dubbelräknas.
const termsSent = new Set<string>();
export const logSearchTerm = (term: string, hadHits: boolean): void => {
  try {
    const t = (term ?? '').trim().toLowerCase();
    if (t.length < 2 || t.length > 60) return;
    // Nyckel inkl. hadHits så en term som först missar och sen träffar loggas rätt en gång vardera.
    const key = `${t}|${hadHits ? 1 : 0}`;
    if (termsSent.has(key)) return;
    termsSent.add(key);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('log_search_term', { p_term: term, p_had_hits: hadHits }).then(() => {}, () => {});
  } catch { /* noop */ }
};
