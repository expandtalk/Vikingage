import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Compass, Footprints } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAnswerContext } from '@/hooks/useAnswerContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Äventyr & motion: samma datakälla som svarspanelens kartlager (nearby_experiences + grottor ur
// heritage_sites) men listat i höger-railen så man ser "allting" utan att jaga kartlagret (Daniel).
type Adv = { feature_type: string; label: string; parish: string | null; season: string | null; bath_kind: string | null };
const ADV_KIND: Record<string, { dot: string; sv: string; en: string }> = {
  fiske:      { dot: '#3b82f6', sv: 'Fiske', en: 'Fishing' },
  utomhusbad: { dot: '#22c55e', sv: 'Utomhusbad', en: 'Outdoor bathing' },
  hundbad:    { dot: '#f97316', sv: 'Hundbad', en: 'Dog beach' },
  nakenbad:   { dot: '#ec4899', sv: 'Nakenbad', en: 'Nudist beach' },
  barnbad:    { dot: '#eab308', sv: 'Barnbad', en: 'Kids beach' },
  klippbad:   { dot: '#64748b', sv: 'Klippbad', en: 'Cliff bathing' },
  grotta:     { dot: '#a16207', sv: 'Grotta', en: 'Cave' },
  badplats:   { dot: '#22c55e', sv: 'Badplats', en: 'Bathing' },
};
const advKindOf = (a: Adv): string =>
  a.feature_type === 'fiske' ? 'fiske' : a.feature_type === 'grotta' ? 'grotta' : (a.bath_kind || 'badplats');

// "Utforska & upplev"-railen — region + utflykter + svamp (säsong). BOR i den YTTRE höger-kolumnen
// (GlobalSearch, ovanför runverktyget), INTE i svarspanelens mittkolumn (Daniel: "Svampkartan ska
// inte ligga i main överhuvudtaget"). Självförsörjande: återanvänder useAnswerContext(query):s
// cachade center (react-query dedupar) → pages_near för regionsidor.
export const ExploreRail: React.FC<{ query: string; onGo: (route: string) => void }> = ({ query, onGo }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data } = useAnswerContext(query);
  const center = data?.center;

  const { data: regionPages = [] } = useQuery({
    queryKey: ['rail-region-pages', center?.lat, center?.lng],
    enabled: !!(center && center.lat != null && center.lng != null),
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<{ title: string; url: string }[]> => {
      const { data: rows } = await (supabase as any).rpc('pages_near', { p_lat: center!.lat, p_lng: center!.lng, radius_m: 60000 });
      return ((rows ?? []) as any[]).map((r) => ({ title: r.title_sv, url: r.url })).slice(0, 5);
    },
  });

  // Utflykter i NÄRHETEN (Daniel: railen visade alla utflykter utan närhet). excursions_near → ≤80 km.
  const { data: nearbyExc = [] } = useQuery({
    queryKey: ['rail-exc-near', center?.lat, center?.lng],
    enabled: !!(center && center.lat != null && center.lng != null),
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<{ id: string; name: string; region: string; dist_km: number }[]> => {
      const { data } = await (supabase as any).rpc('excursions_near', { p_lat: center!.lat, p_lng: center!.lng, p_radius_km: 80, p_limit: 6 });
      return (data ?? []) as { id: string; name: string; region: string; dist_km: number }[];
    },
  });

  const { data: adventures = [] } = useQuery({
    queryKey: ['rail-adventures', center?.lat, center?.lng],
    enabled: !!(center && center.lat != null && center.lng != null),
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Adv[]> => {
      const lat = center!.lat, lng = center!.lng;
      const [expRes, grottRes] = await Promise.all([
        (supabase as any).rpc('nearby_experiences', { p_lat: lat, p_lng: lng, p_radius_km: 25, p_limit: 80, p_ignore_season: true }),
        (supabase as any).from('heritage_sites').select('name, raa_type, lat, lng')
          .gte('lat', lat - 0.28).lte('lat', lat + 0.28).gte('lng', lng - 0.45).lte('lng', lng + 0.45)
          .ilike('raa_type', '%grott%').not('lat', 'is', null).limit(60),
      ]);
      const bad = ((expRes.data ?? []) as any[]).map((a) => ({ feature_type: (a.feature_type ?? 'badplats') as string, label: a.label as string, parish: (a.parish ?? null) as string | null, season: (a.season ?? null) as string | null, bath_kind: (a.bath_kind ?? null) as string | null }));
      const grott = ((grottRes.data ?? []) as any[]).map((g) => ({ feature_type: 'grotta', label: g.name as string, parish: null, season: null, bath_kind: null }));
      return [...bad, ...grott].filter((a) => a.label);
    },
  });

  if (query.trim().length < 2) return null;
  const m = new Date().getMonth() + 1; const inSeason = m >= 8 && m <= 11;

  // Gruppera äventyren per typ (fiske/bad/grotta) för räknare + färgprick; behåll namnen listade.
  const advByKind = adventures.reduce<Record<string, Adv[]>>((acc, a) => { const k = advKindOf(a); (acc[k] ||= []).push(a); return acc; }, {});
  const advKinds = Object.keys(advByKind).sort((a, b) => advByKind[b].length - advByKind[a].length);

  return (
    <div className="space-y-4 px-3 pt-3 text-left">
      {regionPages.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-gold">
            <BookOpen className="h-3.5 w-3.5" /> {sv ? 'Utforska regionen' : 'Explore the region'}
          </h3>
          <div className="flex flex-col gap-1.5">
            {regionPages.map((p) => (
              <button key={p.url} onClick={() => onGo(p.url)}
                className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-left text-sm font-medium text-amber-100 hover:bg-gold/20">
                {p.title} →
              </button>
            ))}
          </div>
        </section>
      )}
      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-emerald-300">
          <Compass className="h-3.5 w-3.5" /> {sv ? 'Utforska & upplev' : 'Explore & experience'}
        </h3>
        <div className="flex flex-col gap-1.5 text-sm">
          {nearbyExc.length > 0 ? (
            <>
              {nearbyExc.map((e) => (
                <button key={e.id} onClick={() => onGo(`/excursions/${e.id}`)}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-left font-medium text-slate-100 hover:border-emerald-500/50 hover:text-emerald-100">
                  <span className="min-w-0 truncate">{e.name}</span>
                  <span className="shrink-0 text-[11px] text-emerald-300/80">{e.dist_km} km</span>
                </button>
              ))}
              <button onClick={() => onGo(sv ? '/sv/utflykter' : '/excursions')}
                className="text-left text-xs font-medium text-emerald-300/80 hover:text-emerald-100">
                {sv ? 'Se alla utflykter' : 'See all excursions'} →
              </button>
            </>
          ) : (
            <button onClick={() => onGo(sv ? '/sv/utflykter' : '/excursions')}
              className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-left font-medium text-slate-100 hover:border-emerald-500/50 hover:text-emerald-100">
              {sv ? 'Utflykter' : 'Excursions'} →
            </button>
          )}
          <button onClick={() => onGo(center ? `/sv/svamp?lat=${center.lat}&lng=${center.lng}&plats=${encodeURIComponent(query)}` : '/sv/svamp')}
            className={`rounded-lg border px-3 py-1.5 text-left font-medium ${inSeason ? 'border-amber-500/50 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20' : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-amber-500/40'}`}>
            🍄 {sv ? 'Svampkarta' : 'Mushroom map'}{center ? (sv ? ' · härnära' : ' · near here') : ''} {inSeason ? (sv ? '· i säsong' : '· in season') : ''} →
          </button>
        </div>
      </section>
      {adventures.length > 0 && (
        <details className="group">
          <summary className="mb-2 flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-sky-300 [&::-webkit-details-marker]:hidden">
            <Footprints className="h-3.5 w-3.5" /> {sv ? 'Äventyr & motion' : 'Adventure & recreation'}
            <span className="rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-medium text-sky-200">{adventures.length}</span>
            <span className="ml-auto text-[11px] font-normal text-slate-500 transition group-open:rotate-180">▾</span>
          </summary>
          {/* Typräknare (fiske/bad/grotta) med färgprick — speglar kartlagrets legend. */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {advKinds.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: (ADV_KIND[k] || ADV_KIND.badplats).dot }} />
                {(sv ? (ADV_KIND[k] || ADV_KIND.badplats).sv : (ADV_KIND[k] || ADV_KIND.badplats).en)} · {advByKind[k].length}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1 text-sm">
            {adventures.slice(0, 14).map((a, i) => {
              const st = ADV_KIND[advKindOf(a)] || ADV_KIND.badplats;
              return (
                <button key={`${a.label}-${i}`} onClick={() => onGo(`/explore?searchQuery=${encodeURIComponent(a.label)}`)}
                  className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-left text-slate-200 hover:border-sky-500/40 hover:bg-sky-500/10">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: st.dot }} />
                  <span className="min-w-0 flex-1 truncate">{a.label}{a.parish ? <span className="text-slate-500"> · {a.parish}</span> : null}</span>
                  {a.season && <span className="shrink-0 text-[10px] text-slate-500">{a.season}</span>}
                </button>
              );
            })}
          </div>
          {adventures.length > 14 && (
            <p className="mt-1.5 text-center text-[11px] text-slate-500">
              {sv ? `+ ${adventures.length - 14} till — se kartlagret` : `+ ${adventures.length - 14} more — see the map layer`}
            </p>
          )}
        </details>
      )}
    </div>
  );
};
