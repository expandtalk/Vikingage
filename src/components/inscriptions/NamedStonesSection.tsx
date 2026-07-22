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

// Ikoniska stenar överst (Daniel). Rökstenen, Sparlösastenen, Jarlabanke först, sedan
// övriga mest kända. Saknas ett signum i named_stones_v1 hoppas det bara över (safe).
const FEATURED_SIGNUMS = ['Ög 136', 'Vg 119', 'U 164', 'Öl 1', 'Sö 101'];
// Rök, Sparlösa, Jarlabanke (Täby), Karlevi, Sigurdsristningen
// Ordning för utländska grupper (efter alla svenska landskap).
const FOREIGN_ORDER = ['Norway', 'Denmark', 'England', 'Scotland', 'Ireland', 'Isle of Man',
  'Germany', 'Latvia', 'Ukraine', 'Russia', 'Turkey', 'Greece', 'Iceland', 'Greenland'];

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

  const { featured, groups } = useMemo(() => {
    if (!stones) return { featured: [] as NamedStone[], groups: [] as { title: string; foreign: boolean; country: string | null; items: NamedStone[] }[] };
    const featured = FEATURED_SIGNUMS.map((sig) => stones.find((s) => s.signum === sig)).filter(Boolean) as NamedStone[];
    const featuredSet = new Set(FEATURED_SIGNUMS);
    const itemSort = (a: NamedStone, b: NamedStone) =>
      Number(b.name_source === 'wikipedia-artikel') - Number(a.name_source === 'wikipedia-artikel')
      || Number(!!b.image_url) - Number(!!a.image_url)
      || a.name.localeCompare(b.name, 'sv');

    const byGroup = new Map<string, { items: NamedStone[]; country: string | null; foreign: boolean }>();
    for (const s of stones) {
      if (featuredSet.has(s.signum)) continue; // ikonerna visas i egen rad
      const foreign = !!s.country && s.country !== 'Sweden';
      const key = (!foreign && s.landscape)
        ? s.landscape
        : (s.country ? (sv ? (COUNTRY_SV[s.country] ?? s.country) : s.country) : (sv ? 'Övriga' : 'Other'));
      if (!byGroup.has(key)) byGroup.set(key, { items: [], country: s.country ?? null, foreign });
      byGroup.get(key)!.items.push(s);
    }
    const groups = [...byGroup.entries()]
      .map(([title, g]) => ({ title, foreign: g.foreign, country: g.country, items: g.items.sort(itemSort) }))
      // Svenska landskap först (störst först), utländska sist (i FOREIGN_ORDER, sedan storlek).
      .sort((a, b) => {
        if (a.foreign !== b.foreign) return a.foreign ? 1 : -1;
        if (!a.foreign) return b.items.length - a.items.length;
        const ia = FOREIGN_ORDER.indexOf(a.country ?? ''); const ib = FOREIGN_ORDER.indexOf(b.country ?? '');
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || b.items.length - a.items.length;
      });
    return { featured, groups };
  }, [stones, sv]);

  if (!stones?.length) return null;

  const renderCard = (s: NamedStone) => {
    const translation = sv ? s.translation_sv : (s.translation_en || s.translation_sv);
    return (
      <Link
        key={s.id}
        to={`/inscription/${encodeURIComponent(s.signum)}`}
        className="viking-card rounded-lg border border-border overflow-hidden hover:bg-card/80 transition-colors group flex flex-col"
      >
        {s.image_url && (
          {/* Porträtt-format (aspect 3/4) + object-contain så höga stenar (Rök, Sparlösa,
              Tjängvide…) syns i sin helhet utan beskärning. Mörk bakgrund bakom eventuell
              letterbox. Landskaps-bilder får då lite marginal upp/ner — acceptabelt. */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900/40">
            <img
              src={s.image_url}
              alt={s.name}
              title={s.image_credit ? `${sv ? 'Foto' : 'Photo'}: ${s.image_credit}` : undefined}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
