
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DatingRecord {
  datingid: string;
  objectid: string;
  dating: string;
  period_start: number | null;
  period_end: number | null;
  parsing_confidence: number | null;
  parsed_period: string | null;
  parsing_notes: string | null;
}

export const useDatingPeriods = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  // Hämtar HELA dating-tabellen (tungt) — därför lat: bara när anroparen begär det
  // (enabled). Default true (bakåtkompatibelt). DatingIntegration gatar på showDetails
  // så tidslinje-klick inte drar in hela datasetet + sync-beräkning = frös sajten.
  const enabled = options?.enabled ?? true;

  const { data: datingRecords = [], isLoading } = useQuery({
    queryKey: ['dating-periods'],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dating')
        .select('*')
        .order('dating');

      if (error) throw error;
      return data as DatingRecord[];
    }
  });

  // Update dating periods by running the parsing function
  const updateDatingPeriods = useMutation({
    mutationFn: async () => {
      console.log('🔄 Running dating period parser...');
      const { data, error } = await supabase.rpc('update_dating_periods');
      
      if (error) {
        console.error('❌ Error updating dating periods:', error);
        throw error;
      }
      
      console.log(`✅ Updated ${data} dating records`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dating-periods'] });
    }
  });

  // Get dating records within a specific period
  const getDatingInPeriod = (startYear: number, endYear: number) => {
    return datingRecords.filter(record => {
      if (!record.period_start || !record.period_end) return false;
      
      // Check if there's any overlap between the record period and query period
      return record.period_start <= endYear && record.period_end >= startYear;
    });
  };

  // Get object IDs for inscriptions within a time period
  const getObjectIdsInPeriod = (startYear: number, endYear: number) => {
    const recordsInPeriod = getDatingInPeriod(startYear, endYear);
    return recordsInPeriod.map(record => record.objectid);
  };

  // Get statistics about parsed vs unparsed records
  const getParsingStats = () => {
    const total = datingRecords.length;
    const parsed = datingRecords.filter(r => r.period_start !== null).length;
    const unparsed = total - parsed;
    
    const confidenceDistribution = datingRecords
      .filter(r => r.parsing_confidence !== null)
      .reduce((acc, r) => {
        const conf = r.parsing_confidence!;
        if (conf >= 0.8) acc.high++;
        else if (conf >= 0.6) acc.medium++;
        else acc.low++;
        return acc;
      }, { high: 0, medium: 0, low: 0 });

    return {
      total,
      parsed,
      unparsed,
      parseRate: total > 0 ? (parsed / total) * 100 : 0,
      confidenceDistribution
    };
  };

  return {
    datingRecords,
    isLoading,
    updateDatingPeriods,
    isUpdating: updateDatingPeriods.isPending,
    getDatingInPeriod,
    getObjectIdsInPeriod,
    getParsingStats
  };
};
