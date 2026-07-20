import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Landmark, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// Namngivna stenar som ingång till /inscriptions (Daniel 2026-07-20):
// stenar med populärnamn (Wikipedia-kuraterade, name_source bär nivån) grupperade
// per landskap — utländska grupperas per land. Stenar med egen Wikipedia-artikel
// ('wikipedia-artikel') visas först i varje sektion. Långsvansen (sök/filter)
// ligger kvar under — den här sektionen är en ingång, inte en ersättning.

interface NamedStone {
  id: string;
  signum: string;
  name: string;
  name_source: string | null;
  landscape: string | null;
  country: string | null;
  socken: string | null;
  translation_sv: string | null;
  translation_en: string | null;
  image_url: string | null;
  image_credit: string | null;
}

const sb = supabase as unknown as { rpc: (fn: string) => any };

const COUNTRY_SV: Record<string, string> = {
  Sweden: 'Sverige', Denmark: 'Danmark', Norway: 'Norge', Iceland: 'Island',
  Germany: 'Tyskland', Ukraine: 'Ukraina', England: 'England', Scotland: 'Skottland',
};

const COLLAPSED_COUNT = 8;

export const NamedStonesSection: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data: stones } = useQuery({
    queryKey: ['named-stones-v1'],
    queryFn: async () => {
      const { data, error } = await sb.rpc('named_stones_v1');
      if (error) throw error;
      return (data ?? []) as NamedStone[];
    },
  });

  const groups = useMemo(() => {
    if (!stones) return [];
    const byGroup = new Map<string, NamedStone[]>();
    for (const s of stones) {
      const key = s.landscape
        || (s.country ? (sv ? (COUNTRY_SV[s.country] ?? s.country) : s.country) : (sv ? 'Övriga' : 'Other'));
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key)!.push(s);
    }
    return [...byGroup.entries()]
      .map(([title, items]) => ({
        title,
        items: items.sort((a, b) =>
          Number(b.name_source === 'wikipedia-artikel') - Number(a.name_source === 'wikipedia-artikel')
          || Number(!!b.image_url) - Number(!!a.image_url)
          || a.name.localeCompare(b.name, 'sv')),
      }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [stones, sv]);

  if (!stones?.length) return null;

  const renderCard = (s: NamedStone) => {
    const translation = sv ? s.translation_sv : (s.translation_en || s.translation_sv);
    return (
      <Link
        key={s.id}
        to={`/explore?searchQuery=${encodeURIComponent(s.signum)}`}
        className="viking-card rounded-lg border border-border overflow-hidden hover:bg-card/80 transition-colors group flex flex-col"
      >
        {s.image_url && (
          <div className="relative h-32 w-full overflow-hidden">
            <img
              src={s.image_url}
              alt={s.name}
              title={s.image_credit ? `${sv ? 'Foto' : 'Photo'}: ${s.image_credit}` : undefined}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {s.image_credit && (
              <span className="absolute bottom-0.5 right-1.5 text-[8px] text-white/60 bg-black/30 px-1 rounded">
                {s.image_credit}
              </span>
            )}
          </div>
        )}
        <div className="p-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{s.name}</span>
            <Badge variant="outline" className="text-[10px]">{s.signum}</Badge>
          </div>
          {s.socken && <p className="text-xs text-muted-foreground mt-0.5">{s.socken}</p>}
          {translation && (
            <p className="text-xs text-muted-foreground/80 italic line-clamp-2 mt-1">"{translation}"</p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Landmark className="h-6 w-6 text-gold" />
        {sv ? 'Namngivna stenar' : 'Named stones'}
        <span className="text-base font-normal text-muted-foreground">· {stones.length}</span>
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        {sv
          ? 'Runstenar med etablerade namn — de med egen Wikipedia-artikel visas först i varje landskap.'
          : 'Runestones with established names — those with their own Wikipedia article are shown first per province.'}
      </p>
      <div className="space-y-8">
        {groups.map((g) => {
          const isOpen = !!expanded[g.title];
          const visible = isOpen ? g.items : g.items.slice(0, COLLAPSED_COUNT);
          return (
            <div key={g.title}>
              <h3 className="text-xl font-bold text-foreground mb-1">
                {g.title} <span className="text-sm font-normal text-muted-foreground">· {g.items.length}</span>
              </h3>
              <div className="h-0.5 w-16 bg-accent/60 rounded mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {visible.map(renderCard)}
              </div>
              {g.items.length > COLLAPSED_COUNT && (
                <button
                  onClick={() => setExpanded((e) => ({ ...e, [g.title]: !isOpen }))}
                  className="mt-3 inline-flex items-center gap-1 text-sm text-gold hover:underline"
                >
                  {isOpen
                    ? <><ChevronUp className="h-4 w-4" />{sv ? 'Visa färre' : 'Show fewer'}</>
                    : <><ChevronDown className="h-4 w-4" />{sv ? `Visa alla ${g.items.length}` : `Show all ${g.items.length}`}</>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
