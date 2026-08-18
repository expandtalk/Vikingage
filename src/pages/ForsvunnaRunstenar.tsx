import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Ghost, Images, ScrollText, FlaskConical, MapPin, ImageOff } from 'lucide-react';

// /sv/forsvunna-runstenar (+ /en/lost-runestones) — kurerat "spår" (retention/upptäckt): runstenar
// som överlever som 1600-/1700-talsteckning (Peringskiöld/Hadorph/Bautil). Källkritiskt märkt:
// 'lost' = BELAGT försvunnen; 'only_drawing' = finns i vårt arkiv bara som teckning (påstående om
// VÅR data, ej fysisk förlust). Data ur lost_runestones_trail() (migration 20260818280000).

interface Row { signum: string; province: string | null; socken: string | null; status: 'lost' | 'only_drawing'; thumb: string | null; full_url: string | null; artist: string | null; }

const useLostRunestones = () =>
  useQuery({
    queryKey: ['lost-runestones-trail'],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await (supabase as any).rpc('lost_runestones_trail', { p_limit: 200 });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

const ForsvunnaRunstenar = ({ forceLang }: { forceLang?: 'sv' | 'en' }) => {
  const { language } = useLanguage();
  const sv = (forceLang ?? language) === 'sv';
  const { data = [], isLoading } = useLostRunestones();
  const lost = data.filter((r) => r.status === 'lost');
  const onlyDrawing = data.filter((r) => r.status === 'only_drawing');

  const Card: React.FC<{ r: Row }> = ({ r }) => (
    <Link
      to={`/inscription/${encodeURIComponent(r.signum)}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {r.thumb ? (
        <img src={r.thumb} alt={r.signum} loading="lazy" decoding="async"
          className="aspect-square w-full bg-slate-900 object-cover motion-safe:transition-opacity group-hover:opacity-85"
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-slate-900"><ImageOff className="h-8 w-8 text-slate-700" /></div>
      )}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold text-gold">{r.signum}</span>
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${r.status === 'lost' ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-700/60 text-slate-300'}`}>
            {r.status === 'lost' ? (sv ? 'belagt försvunnen' : 'documented lost') : (sv ? 'bara teckning' : 'drawing only')}
          </span>
        </div>
        {(r.province || r.socken) && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 text-gold/70" /> {[r.socken, r.province].filter(Boolean).join(', ')}
          </span>
        )}
        {r.artist && <span className="text-[11px] leading-tight text-muted-foreground/80 line-clamp-1">{r.artist}</span>}
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="De försvunna stenarna"
        titleEn="The Lost Stones"
        path={sv ? '/sv/forsvunna-runstenar' : '/en/lost-runestones'}
        description="Runstenar som överlever som 1600- och 1700-talsteckningar av Johan Peringskiöld, Johan Hadorph och i Bautil (1750). Många stenar är sedan försvunna — teckningarna är ibland det enda som finns kvar. Källkritiskt märkt: belagt försvunnen eller finns bara som teckning i arkivet."
        descriptionEn="Runestones that survive as 17th- and 18th-century drawings by Johan Peringskiöld, Johan Hadorph and in Bautil (1750). Many stones are since lost — the drawings are sometimes all that remains. Source-critically marked: documented lost, or drawing-only in the archive."
        keywords="försvunna runstenar, Peringskiöld, Hadorph, Bautil, runstensteckningar, lost runestones, runologi"
      />
      <Header />
      <Breadcrumbs />
      <main id="main-content" className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-3 flex items-center gap-3 text-4xl font-bold text-foreground">
          <Ghost className="h-8 w-8 text-gold" />
          {sv ? 'De försvunna stenarna' : 'The Lost Stones'}
        </h1>
        <p className="mb-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {sv ? (
            <>På 1680-talet reste antikvarierna <strong>Johan Peringskiöld</strong> och <strong>Johan Hadorph</strong>
            genom landskapen och ritade av runstenarna; teckningarna trycktes senare som träsnitt i <em>Bautil</em> (1750).
            Många av stenarna har sedan <em>försvunnit</em> — förstörda, inmurade eller bortförda. Då är den gamla
            teckningen ibland det <strong>enda som finns kvar</strong>. Här är stenarna som lever vidare på pappret.</>
          ) : (
            <>In the 1680s the antiquaries <strong>Johan Peringskiöld</strong> and <strong>Johan Hadorph</strong> travelled
            the provinces drawing the runestones; the drawings were later printed as woodcuts in <em>Bautil</em> (1750).
            Many of the stones have since been <em>lost</em> — destroyed, built into walls or carried off. Then the old
            drawing is sometimes <strong>all that remains</strong>. Here are the stones that live on, on paper.</>
          )}
        </p>

        {/* Källkritik-banner: vad märkningen betyder. */}
        <div className="mb-6 rounded-lg border border-slate-700/70 bg-slate-900/40 p-3 text-xs leading-relaxed text-slate-400">
          {sv ? (
            <><strong className="text-amber-300">belagt försvunnen</strong> = stenen är dokumenterad som förlorad i källorna.
            {' '}<strong className="text-slate-300">bara teckning</strong> = i vårt arkiv finns ingen modern fotografi, bara den
            historiska teckningen — ett påstående om <em>vår data</em>, inte ett bevis på att stenen fysiskt gått förlorad.
            Ett fullständigt förlust-register är en känd lucka vi bygger vidare på.</>
          ) : (
            <><strong className="text-amber-300">documented lost</strong> = the stone is recorded as lost in the sources.
            {' '}<strong className="text-slate-300">drawing only</strong> = our archive holds no modern photograph, only the
            historical drawing — a statement about <em>our data</em>, not proof the stone is physically gone. A complete
            loss register is a known gap we keep building.</>
          )}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <>
            {lost.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold text-foreground">
                  <Ghost className="h-6 w-6 text-amber-400" />
                  {sv ? `Belagt försvunna · ${lost.length}` : `Documented lost · ${lost.length}`}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {lost.map((r) => <Card key={`l-${r.signum}`} r={r} />)}
                </div>
              </section>
            )}
            <section className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold text-foreground">
                <Images className="h-6 w-6 text-gold" />
                {sv ? `Finns bara som teckning · ${onlyDrawing.length}` : `Drawing only · ${onlyDrawing.length}`}
              </h2>
              <p className="mb-3 max-w-3xl text-sm text-muted-foreground">
                {sv
                  ? 'Dessa stenar har i vårt arkiv ingen modern fotografi — bara den historiska avbildningen. Klicka för att öppna stenen.'
                  : 'These stones have no modern photograph in our archive — only the historical depiction. Click to open the stone.'}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {onlyDrawing.map((r) => <Card key={`d-${r.signum}`} r={r} />)}
              </div>
            </section>
          </>
        )}

        {/* Se även / relaterade sidor — driver vidare-klick (retention). */}
        <section className="mt-10 border-t border-border/60 pt-6">
          <h2 className="mb-3 text-xl font-bold text-foreground">{sv ? 'Se även' : 'See also'}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { to: sv ? '/sv/bildarkiv' : '/en/image-archive', icon: Images, t: sv ? 'Bildarkivet — alla runstensteckningar' : 'Image archive — all runestone drawings', d: sv ? '332 historiska avbildningar (Peringskiöld, Hadorph, Bautil m.fl.)' : '332 historical drawings (Peringskiöld, Hadorph, Bautil et al.)' },
              { to: sv ? '/sv/vetenskapsmetodik' : '/en/scientific-methodology', icon: FlaskConical, t: sv ? 'Observation vs tolkning' : 'Observation vs. interpretation', d: sv ? 'Varför Peringskiölds teckning är en primärkälla — men hans tolkning inte' : "Why Peringskiöld's drawing is a primary source — but his reading is not" },
              { to: '/inscriptions', icon: ScrollText, t: sv ? 'Runstensbläddraren' : 'The runestone browser', d: sv ? 'Bläddra och filtrera hela runcorpusen på kartan' : 'Browse and filter the whole rune corpus on the map' },
            ].map((x) => (
              <Link key={x.to} to={x.to}
                className="viking-card flex flex-col gap-1 rounded-lg border border-border p-4 hover:border-gold/50">
                <span className="flex items-center gap-2 font-semibold text-gold"><x.icon className="h-4 w-4" /> {x.t}</span>
                <span className="text-xs text-muted-foreground">{x.d}</span>
              </Link>
            ))}
          </div>

          {/* Upptäck mer — bredare vidare-klick (Daniels retention-idéer). */}
          <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{sv ? 'Upptäck mer på Viking Age' : 'Discover more on Viking Age'}</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { to: sv ? '/sv/medeltidsbrev' : '/en/medieval-charters', t: sv ? 'Sök medeltidsbrev från din ort' : 'Search medieval charters from your town' },
              { to: sv ? '/sv/ortnamn' : '/sv/ortnamn', t: sv ? 'Sök din egen hembygd (ortnamn)' : 'Search your home parish (place names)' },
              { to: '/explore?focus=marine', t: sv ? 'Hitta skeppsvraken' : 'Find the shipwrecks' },
              { to: sv ? '/sv/utflykter' : '/excursions', t: sv ? 'Utflykter i trakten' : 'Excursions nearby' },
              { to: sv ? '/sv/gota-landsvag' : '/en/gota-landsvag', t: sv ? 'Gå färleder — Göta landsväg' : 'Walk the routes — Göta landsväg' },
              { to: '/kungsnave', t: sv ? 'Spela vikingaspel (kungsnäve)' : 'Play the Viking board game' },
            ].map((x) => (
              <Link key={x.to} to={x.to}
                className="rounded-full border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:border-gold/50 hover:text-amber-100">
                {x.t} →
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ForsvunnaRunstenar;
