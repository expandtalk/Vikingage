import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { PageMeta } from '@/components/PageMeta';
import { Button } from '@/components/ui/button';
import { DiscussionThread } from '@/components/discussion/DiscussionThread';
import { Loader2, FolderOpen, UserCog } from 'lucide-react';

interface Area {
  id: string; slug: string; title: string; description: string | null; status: string;
  owner_id: string | null; owner_last_active_at: string;
}

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 182;

const ResearchArea = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [area, setArea] = useState<Area | null>(null);
  const [ownerName, setOwnerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchArea = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('research_areas')
      .select('id, slug, title, description, status, owner_id, owner_last_active_at')
      .eq('slug', slug).maybeSingle();
    setArea((data ?? null) as Area | null);
    if (data?.owner_id) {
      const { data: o } = await (supabase as any).from('researcher_profiles')
        .select('display_name, handle').eq('user_id', data.owner_id).maybeSingle();
      setOwnerName(o?.display_name || '');
    } else setOwnerName('');
    setLoading(false);
  };

  useEffect(() => { fetchArea(); /* eslint-disable-next-line */ }, [slug]);

  const reclaimable = !!area && (
    !area.owner_id || area.status === 'orphaned' ||
    (Date.now() - new Date(area.owner_last_active_at).getTime() > SIX_MONTHS_MS)
  );

  const claim = async () => {
    if (!area) return;
    setClaiming(true);
    const { error } = await (supabase as any).rpc('claim_research_area', { p_area_id: area.id });
    setClaiming(false);
    if (error) { toast({ title: 'Kunde inte ta över', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Du är nu kurator', description: `"${area.title}" är ditt.` });
    fetchArea();
  };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={area ? `${area.title} — forskningsområde` : 'Forskningsområde'}
        titleEn={area ? `${area.title} — research area` : 'Research area'}
        description={area?.description ?? 'Ett kuraterat forskningsområde på Viking Age — öppen diskussion, källkritisk grund.'}
        path={slug ? `/omraden/${slug}` : undefined}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Hämtar…</div>
        ) : !area ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Forskningsområdet hittades inte.</p>
            <Link to="/diskussioner" className="text-gold hover:underline mt-3 inline-block">← Alla diskussioner</Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <FolderOpen className="h-7 w-7 text-gold" /> {area.title}
              </h1>
              {area.description && <p className="text-slate-300 mt-2 leading-relaxed">{area.description}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><UserCog className="h-4 w-4" />
                  Kurator: {ownerName || (area.owner_id ? '—' : 'föräldralöst')}</span>
                {reclaimable && user && (
                  <Button size="sm" variant="outline" onClick={claim} disabled={claiming}
                    className="border-gold/40 text-gold hover:bg-gold/10">
                    {claiming ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                    Ta över som kurator
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground/70 mt-3 border-l-2 border-gold/40 pl-3">
                Kuratorn styr områdets beskrivning och diskussion — men faktapåståenden prövas alltid
                källkritiskt (staging → verifierare) innan de blir kanon. Ägarskap är inte auktoritet över fakta.
              </p>
            </div>

            <DiscussionThread entityType="research_area" entityKey={area.slug} heading="Diskussion i området" />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ResearchArea;
