import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hämtar bekräftade sameAs-URI:er (Wikidata/RAÄ m.fl.) för en entitet ur external_ids.
// external_ids innehåller bara kurerade/recon:ade poster → alla uri:er räknas som belagda länkar.
// Matar EntityJsonLd.sameAs. entity_id är TEXT i external_ids (blandade id-typer).
export function useSameAs(entityTable: string | null | undefined, entityId: string | number | null | undefined): string[] {
  const idStr = entityId == null ? null : String(entityId);
  const { data } = useQuery({
    queryKey: ['sameas', entityTable, idStr],
    enabled: !!entityTable && !!idStr,
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<string[]> => {
      const { data } = await (supabase as unknown as { from: (t: string) => any })
        .from('external_ids')
        .select('uri')
        .eq('entity_table', entityTable)
        .eq('entity_id', idStr)
        .not('uri', 'is', null);
      return ((data ?? []) as { uri: string }[]).map((r) => r.uri).filter(Boolean);
    },
  });
  return data ?? [];
}
