import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useMediaForTopic } from '@/hooks/useMediaForTopic';
import { TopicMedia } from '@/components/media/TopicMedia';
import { ExternalLink, Search, PenLine, Loader2 } from 'lucide-react';

// Sista-lagret dead-endade tidigare till "ingen träff/externt" även när det GENERELLA sök-indexet
// (search_v1) HAR träffar — svarspanelens entitets-resolvers (entity_node/get_search_related) och den
// trasiga hybrid-edge:n missar t.ex. "fornvännen"/"torekov"/"eskil". Nu körs search_v1 här som sista
// utväg och träffarna VISAS innan vi föreslår externt.
interface FbHit { entity_type: string; entity_id: string; label: string; sublabel?: string | null; signum?: string | null }
const TYPE_LABEL: Record<string, { sv: string; en: string }> = {
  source: { sv: 'Källa', en: 'Source' }, source_text: { sv: 'Källtext', en: 'Source text' },
  place_name: { sv: 'Ortnamn', en: 'Place name' }, place: { sv: 'Plats', en: 'Place' },
  parish: { sv: 'Socken', en: 'Parish' }, inscription: { sv: 'Runinskrift', en: 'Inscription' },
  hillfort: { sv: 'Fornborg', en: 'Hillfort' }, fortress: { sv: 'Borg', en: 'Fortress' },
  king: { sv: 'Kung', en: 'King' }, saint: { sv: 'Helgon', en: 'Saint' },
  viking_name: { sv: 'Namn', en: 'Name' }, excursion: { sv: 'Utflykt', en: 'Excursion' },
  ecclesiastical_site: { sv: 'Kyrka', en: 'Church' }, heritage_site: { sv: 'Fornlämning', en: 'Heritage' },
  experience: { sv: 'Upplevelse', en: 'Experience' },
  content_page: { sv: 'Sida', en: 'Page' },
};
const routeFor = (h: FbHit) =>
  h.entity_type === 'source' ? `/sources/${h.entity_id}`
  : h.entity_type === 'source_text' ? `/sources/text/${h.entity_id}`
  // content_page (t.ex. Fornvännen-samlingen, Höga kusten) bär sin URL i signum.
  : h.entity_type === 'content_page' && h.signum ? h.signum
  : `/explore?searchQuery=${encodeURIComponent(h.label)}`;

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

  // Sista utväg: generella sök-indexet (search_v1). Om det HAR träffar visar vi dem — då är det
  // ingen "ingen träff" längre. VIKTIGT (Daniel): förfina-/ingen-träff-panelen får INTE visas
  // medan sökningen fortfarande pågår (hits börjar tomt) — den ska komma SENT, först när sökningen
  // är klar och verkligen gav noll. `searching` gate:ar det; gap-loggning sker först då också.
  const [hits, setHits] = useState<FbHit[]>([]);
  const [searching, setSearching] = useState(true);
  useEffect(() => {
    let cancel = false;
    const q = query.trim();
    if (q.length < 2) { setHits([]); setSearching(false); return; }
    setSearching(true);
    (supabase as any).rpc('search_v1', { p_q: q, p_limit: 24 }).then(
      (r: { data?: FbHit[] }) => {
        if (cancel) return;
        const rows = (r.data ?? []) as FbHit[];
        setHits(rows); setSearching(false);
        // Logga innehållslucka BARA när sökningen är klar OCH gav noll (inte eagerly per tangent).
        const t = q.toLowerCase();
        if (rows.length === 0 && !logged.has(t)) {
          logged.add(t);
          (supabase as any).rpc('log_search_gap', { p_term: query, p_had_media: hadMedia }).then(() => {}, () => {});
        }
      },
      () => { if (!cancel) { setHits([]); setSearching(false); } },
    );
    return () => { cancel = true; };
  }, [query, hadMedia]);
  const hasHits = hits.length > 0;

  return (
    <section className="px-5 py-4 text-left">
      {/* Lager 2: media (returnerar null om inget finns) */}
      <TopicMedia query={query} />

      {/* Lager 3: generella träffar ur search_v1 (visas innan vi föreslår externt) */}
      {hasHits && (
        <div className="mt-4 rounded-xl border border-gold/40 bg-slate-900/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gold">
            <Search className="h-4 w-4" />
            {en ? `${hits.length} matches in Viking Age` : `${hits.length} träffar i Viking Age`}
          </div>
          <ul className="max-h-72 space-y-0.5 overflow-y-auto">
            {hits.map((h) => (
              <li key={`${h.entity_type}-${h.entity_id}`}>
                <Link to={routeFor(h)} className="flex flex-wrap items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-800">
                  <span className="text-slate-100">{h.signum && h.signum !== h.label ? `${h.signum} · ${h.label}` : h.label}</span>
                  <span className="ml-auto rounded border border-slate-600 px-1.5 py-0.5 text-[10px] text-slate-400">
                    {(TYPE_LABEL[h.entity_type] ? (en ? TYPE_LABEL[h.entity_type].en : TYPE_LABEL[h.entity_type].sv) : h.entity_type)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medan sökningen pågår: söker-indikator, INTE "ingen träff". Förfina-panelen kommer sent. */}
      {searching && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-gold" />
          {en ? 'Searching Viking Age…' : 'Söker i Viking Age…'}
        </div>
      )}

      {/* Lager 4: sök vidare externt + bidra — visas FÖRST när sökningen är klar (searching=false). */}
      {!searching && (
      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-300">
          <Search className="h-4 w-4" />
          {en ? (hasHits ? 'Search further afield' : 'Refine your search') : (hasHits ? 'Sök vidare externt' : 'Förfina din sökning')}
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          {hasHits
            ? (en
                ? <>Not what you meant? You can also search externally — links open in a new tab, so you stay here.</>
                : <>Inte det du menade? Du kan också söka vidare externt — länkarna öppnas i ny flik, så du är kvar här.</>)
            : (en
                ? <>No exact match for <span className="text-slate-200">“{query}”</span>{hadMedia ? ' — but see the podcasts & videos above.' : '.'} Try a different spelling, a place name or a runestone signum, or broaden the terms. You can also search on externally — links open in a new tab, so you stay here.</>
                : <>Ingen exakt träff för <span className="text-slate-200">”{query}”</span>{hadMedia ? ' — men se poddar & video ovan.' : '.'} Prova en annan stavning, ett ortnamn eller ett runsten-signum, eller bredda sökorden. Du kan också söka vidare externt — länkarna öppnas i ny flik, så du är kvar här.</>)}
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

        {/* Bidra: håll dem kvar + fånga innehållsluckan — bara när vi VERKLIGEN saknar träffar */}
        {!hasHits && (
        <div className="mt-3 flex items-start gap-2 border-t border-slate-700/70 pt-3">
          <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-xs leading-relaxed text-slate-400">
            {en
              ? <>Should this be on Viking Age? We build the platform with contributions — your search is noted so we know what to write about next.</>
              : <>Tycker du att detta borde finnas på Viking Age? Vi bygger plattformen med bidrag — din sökning noteras så vi vet vad vi ska skriva om härnäst.</>}
          </p>
        </div>
        )}
      </div>
      )}
    </section>
  );
};
