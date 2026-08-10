import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useMediaForTopic } from '@/hooks/useMediaForTopic';
import { TopicMedia } from '@/components/media/TopicMedia';
import { ExternalLink, Search, PenLine } from 'lucide-react';

// Sök-kaskadens sista lager: när ingen kärnentitet (plats/runsten/…) matchar visar vi ändå media
// (poddar/video) OCH ett ärligt "sök vidare externt"-block + bidra-CTA. Externt = BARA länk ut
// (ny flik, vår flik lever kvar), tydligt märkt "utanför vår täckning · ej granskat av oss" — vi
// skrapar/hostar aldrig. Sökordet loggas i search_gaps så vi ser vad vi bör skriva innehåll om.
const logged = new Set<string>();

const externalLinks = (q: string) => {
  const e = encodeURIComponent(q);
  return [
    { label: 'Wikipedia', url: `https://sv.wikipedia.org/w/index.php?search=${e}` },
    { label: 'Wikidata', url: `https://www.wikidata.org/w/index.php?search=${e}` },
    { label: 'Google Scholar', url: `https://scholar.google.com/scholar?q=${e}` },
    { label: 'DiVA', url: `https://www.diva-portal.org/smash/resultList.jsf?query=${e}&language=sv&searchType=SIMPLE` },
  ];
};

export const SearchFallback: React.FC<{ query: string }> = ({ query }) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const { data } = useMediaForTopic(query, 30);
  const hadMedia = !!(data && ((data.podcasts?.length ?? 0) + (data.videos?.length ?? 0) > 0));

  useEffect(() => {
    const t = query.trim().toLowerCase();
    if (t.length < 2 || logged.has(t)) return;
    logged.add(t);
    (supabase as any).rpc('log_search_gap', { p_term: query, p_had_media: hadMedia }).then(() => {}, () => {});
  }, [query, hadMedia]);

  return (
    <section className="px-5 py-4 text-left">
      {/* Lager 2: media (returnerar null om inget finns) */}
      <TopicMedia query={query} />

      {/* Lager 4: utanför vår täckning → sök vidare externt + bidra */}
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-300">
          <Search className="h-4 w-4" />
          {en ? 'Refine your search' : 'Förfina din sökning'}
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          {en
            ? <>No exact match for <span className="text-slate-200">“{query}”</span>{hadMedia ? ' — but see the podcasts & videos above.' : '.'} Try a different spelling, a place name or a runestone signum, or broaden the terms. You can also search on externally — links open in a new tab, so you stay here.</>
            : <>Ingen exakt träff för <span className="text-slate-200">”{query}”</span>{hadMedia ? ' — men se poddar & video ovan.' : '.'} Prova en annan stavning, ett ortnamn eller ett runsten-signum, eller bredda sökorden. Du kan också söka vidare externt — länkarna öppnas i ny flik, så du är kvar här.</>}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {externalLinks(query).map((l) => (
            <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:border-amber-500/50 hover:text-amber-100">
              {l.label} <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
        <p className="mt-2.5 text-[10px] text-slate-500">
          {en ? 'External sources — not vetted by us.' : 'Externa källor — ej granskade av oss.'}
        </p>

        {/* Bidra: håll dem kvar + fånga innehållsluckan */}
        <div className="mt-3 flex items-start gap-2 border-t border-slate-700/70 pt-3">
          <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-xs leading-relaxed text-slate-400">
            {en
              ? <>Should this be on Viking Age? We build the platform with contributions — your search is noted so we know what to write about next.</>
              : <>Tycker du att detta borde finnas på Viking Age? Vi bygger plattformen med bidrag — din sökning noteras så vi vet vad vi ska skriva om härnäst.</>}
          </p>
        </div>
      </div>
    </section>
  );
};
