import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Marinarkeologi-admin. Läser shipwrecks_map (vy m. lat/lng ur ST_Y/ST_X — rå PostGIS-geom
// går ej att läsa i klienten). Skriver skalära fält till shipwrecks; geom sätts via RPC
// set_shipwreck_point (ST_MakePoint), så vi slipper EWKT-osäkerhet i PostgREST.

export interface Shipwreck {
  id: string;
  name: string;
  also_known_as?: string[] | null;
  survey_label?: string | null;
  vessel_type?: string | null;
  identification?: string | null;
  identification_confidence?: string | null;
  construction?: string | null;
  wood_species?: string | null;
  length_m?: number | null;
  beam_m?: number | null;
  water_depth_m?: number | null;
  dating_summary?: string | null;
  dating_earliest?: number | null;
  dating_latest?: number | null;
  dating_method?: string | null;
  dating_confidence?: string | null;
  sinking_year?: number | null;
  sinking_event?: string | null;
  raa_number?: string | null;
  fornreg_ref?: string | null;
  parish?: string | null;
  municipality?: string | null;
  landscape?: string | null;
  coord_source?: string | null;
  coord_precision_m?: number | null;
  source_ref?: string | null;
  source_license?: string | null;
  source_attribution?: string | null;
  notes?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export const useShipwrecks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shipwrecks, isLoading } = useQuery({
    queryKey: ['shipwrecks-admin'],
    queryFn: async (): Promise<Shipwreck[]> => {
      const { data, error } = await (supabase as any)
        .from('shipwrecks_map').select('*').order('survey_label', { nullsFirst: false });
      if (error) throw error;
      return (data as Shipwreck[]) || [];
    },
  });

  const saveWreck = async (id: string | null, payload: Record<string, unknown>, lat: number | null, lng: number | null) => {
    let wreckId = id;
    if (id) {
      const { error } = await (supabase as any).from('shipwrecks').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      const { data, error } = await (supabase as any).from('shipwrecks').insert([payload]).select('id').single();
      if (error) throw error;
      wreckId = data.id;
    }
    if (wreckId && lat != null && lng != null && isFinite(lat) && isFinite(lng)) {
      const { error: geomErr } = await (supabase as any).rpc('set_shipwreck_point', { p_id: wreckId, p_lat: lat, p_lng: lng });
      if (geomErr) throw geomErr;
    }
    return wreckId;
  };

  const createShipwreck = useMutation({
    mutationFn: ({ payload, lat, lng }: { payload: Record<string, unknown>; lat: number | null; lng: number | null }) => saveWreck(null, payload, lat, lng),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipwrecks-admin'] }); toast({ title: 'Vrak skapat' }); },
    onError: (e: any) => toast({ title: 'Fel', description: `Kunde inte skapa vrak: ${e.message}`, variant: 'destructive' }),
  });

  const updateShipwreck = useMutation({
    mutationFn: ({ id, payload, lat, lng }: { id: string; payload: Record<string, unknown>; lat: number | null; lng: number | null }) => saveWreck(id, payload, lat, lng),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipwrecks-admin'] }); toast({ title: 'Vrak uppdaterat' }); },
    onError: (e: any) => toast({ title: 'Fel', description: `Kunde inte uppdatera vrak: ${e.message}`, variant: 'destructive' }),
  });

  const deleteShipwreck = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('shipwrecks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipwrecks-admin'] }); toast({ title: 'Vrak borttaget' }); },
    onError: (e: any) => toast({ title: 'Fel', description: `Kunde inte ta bort vrak: ${e.message}`, variant: 'destructive' }),
  });

  return { shipwrecks, isLoading, createShipwreck, updateShipwreck, deleteShipwreck };
};
