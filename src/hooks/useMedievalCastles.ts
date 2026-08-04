import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Medeltidsborgar ur det enade befästningslagret v_fortifications_all (fort_class='medeltidsborg').
// Skild borgtyp från förhistoriska fornborgar och vikingatida forten.
export interface MedievalCastle {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  period?: string;
}

export const useMedievalCastles = (enabled: boolean = false) => {
  const [castles, setCastles] = useState<MedievalCastle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) { setCastles([]); return; }
    const run = async () => {
      setIsLoading(true);
      try {
        // v_fortifications_all finns ännu ej i types.ts → casta klienten.
        const { data, error } = await (supabase as any)
          .from('v_fortifications_all')
          .select('id, name, lng, lat, period, fort_class')
          .eq('fort_class', 'medeltidsborg');
        if (error) { console.error('Error fetching medieval castles:', error); return; }
        setCastles(
          (data || [])
            .filter((r: any) => r.lat != null && r.lng != null)
            .map((r: any) => ({ id: r.id, name: r.name, period: r.period, coordinates: { lat: r.lat, lng: r.lng } }))
        );
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [enabled]);

  return { castles, isLoading };
};
