import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { ScrollText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// Runstenar med poesi & diktmått — kuraterat tema (has_theme → 'runstenar-poesi'). Hjältedikt,
// dróttkvätt/fornyrðislag och eddisk kosmologi (Rök, Karlevi, Skarpåker m.fl.). Diktmåttet visas
// per sten. Datan kommer från inscriptions_by_theme-RPC:n; sektionen döljer sig om temat är tomt.
interface Stone { id: string; signum: string; name: string; socken: string | null; landscape: string | null; meter: string | null }

export const RunestonePoetrySection: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data: stones } = useQuery({
    queryKey: ['inscriptions-theme', 'runstenar-poesi'],
    queryFn: async (): Promise<Stone[]> => {
      const { data, error } = await (supabase as any).rpc('inscriptions_by_theme', { p_slug: 'runstenar-poesi' });
      if (error) throw error;
      return (data ?? []) as Stone[];
    },
  });

  if (!stones?.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <ScrollText className="h-6 w-6 text-gold" />
        {sv ? 'Poesi & diktmått' : 'Poetry & verse'}
        <span className="text-base font-normal text-muted-foreground">· {stones.length}</span>
      </h2>
      <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
        {sv
          ? 'Runstenar vars text bär skaldisk eller eddisk vers — hjältedikt, diktmått (dróttkvätt, fornyrðislag) och kosmologi. Diktmåttet anges per sten.'
          : 'Runestones whose text carries skaldic or eddic verse — heroic lay, verse metre (dróttkvætt, fornyrðislag) and cosmology. The metre is noted per stone.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stones.map((s) => (
          <Link key={s.id} to={`/inscription/${encodeURIComponent(s.signum)}`}
            className="viking-card rounded-lg border border-border p-3 hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground">{s.name}</span>
              <Badge variant="outline" className="text-[10px]">{s.signum}</Badge>
            </div>
            {(s.socken || s.landscape) && (
              <p className="text-xs text-muted-foreground mt-0.5">{[s.socken, s.landscape].filter(Boolean).join(' · ')}</p>
            )}
            {s.meter && <p className="text-xs text-gold/90 italic mt-1">{s.meter}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
};
