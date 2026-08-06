import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// "Vanliga frågor om [gud]" ur god_common_questions (Ahrefs-sökvolym, on-topic Folklore).
export const useGodQuestions = (godId?: string) =>
  useQuery({
    queryKey: ['god-questions', godId],
    enabled: !!godId,
    queryFn: async (): Promise<{ question: string; volume: number }[]> => {
      const { data, error } = await (supabase as any)
        .from('god_common_questions')
        .select('question, volume')
        .eq('god_id', godId)
        .order('volume', { ascending: false })
        .limit(18);
      if (error) throw error;
      return (data ?? []) as { question: string; volume: number }[];
    },
    staleTime: 60 * 60 * 1000,
  });
