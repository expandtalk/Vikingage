
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Carver {
  id: string;
  name: string;
  description: string | null;
  period_active_start: number | null;
  period_active_end: number | null;
  region: string | null;
  country: string | null;
}

interface CarverStats {
  carver_name: string;
  total_inscriptions: number;
  signed_count: number;
  attributed_count: number;
  certain_count: number;
  uncertain_count: number;
}

interface CarverInscription {
  carverid: string;
  inscriptionid: string;
  attribution: 'signed' | 'attributed';
  certainty: boolean;
  notes?: string;
  inscription: {
    id: string;
    signum: string;
    location: string | null;
    coordinates: { lat: number; lng: number } | null;
    period_start?: number | null;
    period_end?: number | null;
    dating_text?: string | null;
  };
}

// Härled ristarens aktiva period ur inskrifternas datering när carvers.period_active_*
// saknas (vanligt) — min(period_start)…max(period_end) över de daterade stenarna.
const derivePeriod = (inscs: CarverInscription[]): { start: number | null; end: number | null } => {
  const starts = inscs.map((ci) => ci.inscription?.period_start).filter((n): n is number => typeof n === 'number');
  const ends = inscs.map((ci) => ci.inscription?.period_end).filter((n): n is number => typeof n === 'number');
  return {
    start: starts.length ? Math.min(...starts) : null,
    end: ends.length ? Math.max(...ends) : null,
  };
};

// Import-artefakter i description-kolumnen (t.ex. "Importerad från MySQL data")
// ska INTE visas. Vi hittar-på inga forskningsnoteringar (det vore påhittad
// vetenskap på en forskningsplattform) — tom description → ingen not renderas.
const cleanCarverDescription = (description: string | null): string | null => {
  if (!description) return null;
  const d = description.trim();
  if (!d) return null;
  if (/mysql/i.test(d)) return null;
  if (/^importerad\s+från/i.test(d)) return null;
  return description;
};

// Många "ristare" i tabellen är inte namn utan stilattribueringar ("Samma som
// gjort DR 155", "Troligen samma ristare som gjort Sö 324") — ingen identifierad
// ristare. De ska visas separat, efter de namngivna. Heuristik på namnet.
export const isAttributionName = (name: string | null): boolean => {
  if (!name) return true;
  const n = name.trim();
  if (!n) return true;
  return /^(samma|samme|eventuellt|troligen|visar)\b/i.test(n)
    || /(gjort|ristare som|liknar|ornamentik som|likheter med)/i.test(n);
};

export const useCarverData = () => {
  const { data: carvers = [], isLoading: carversLoading } = useQuery({
    queryKey: ['carvers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carvers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Carver[];
    }
  });

  // Get real carver statistics from the database
  const { data: carverStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['carver-stats-real'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_carver_statistics');
      
      if (error) throw error;
      return data as CarverStats[];
    },
    enabled: carvers.length > 0
  });

  // Get real inscription data for carvers
  const { data: carverInscriptions = [], isLoading: inscriptionsLoading } = useQuery({
    queryKey: ['carver-inscriptions-real'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_carver_inscriptions');
      
      if (error) throw error;
      return data as CarverInscription[];
    },
    enabled: carvers.length > 0
  });

  // Process data to group inscriptions by carver with enhanced statistics
  const carversWithInscriptions = carvers.map(carver => {
    const inscriptions = carverInscriptions.filter(ci => ci.carverid === carver.id);
    const stats = carverStats.find(s => s.carver_name === carver.name) || {
      carver_name: carver.name,
      total_inscriptions: 0,
      signed_count: 0,
      attributed_count: 0,
      certain_count: 0,
      uncertain_count: 0,
    };
    
    const derived = derivePeriod(inscriptions);
    return {
      ...carver,
      // Namngiven ristare eller bara en stilattribuering ("samma som gjort X")?
      isAttribution: isAttributionName(carver.name),
      // Rensa bort import-artefakter ("Importerad från MySQL data" m.fl.).
      description: cleanCarverDescription(carver.description),
      // Härledd aktiv period ur inskrifternas datering när kolumnen saknas.
      period_active_start: carver.period_active_start ?? derived.start,
      period_active_end: carver.period_active_end ?? derived.end,
      periodDerived: carver.period_active_start == null && derived.start != null,
      inscriptions: inscriptions.map(ci => ci.inscription),
      inscriptionCount: Number(stats.total_inscriptions),
      signedCount: Number(stats.signed_count),
      attributedCount: Number(stats.attributed_count),
      certainCount: Number(stats.certain_count),
      uncertainCount: Number(stats.uncertain_count),
      carverInscriptions: inscriptions,
      stats
    };
  }).sort((a, b) => {
    // Namngivna ristare först, därefter stilattribueringar; inom varje grupp flest stenar först.
    if (a.isAttribution !== b.isAttribution) return a.isAttribution ? 1 : -1;
    return b.inscriptionCount - a.inscriptionCount;
  });

  const namedCount = carversWithInscriptions.filter((c) => !c.isAttribution).length;

  return {
    carvers: carversWithInscriptions,
    namedCarvers: carversWithInscriptions.filter((c) => !c.isAttribution),
    attributionCarvers: carversWithInscriptions.filter((c) => c.isAttribution),
    // Blockera bara listan på carvers+stats (behövs för antal/sortering).
    // Inskrifts-RPC:n laddas i bakgrunden — behövs först när detaljpanelen öppnas.
    isLoading: carversLoading || statsLoading,
    inscriptionsLoading,
    totalCarvers: carvers.length,
    namedCount,
  };
};
