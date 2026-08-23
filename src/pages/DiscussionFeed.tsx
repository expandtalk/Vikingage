import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { PageMeta } from '@/components/PageMeta';
import { Loader2, MessageSquare } from 'lucide-react';

interface FeedPost {
  id: string; entity_type: string; entity_key: string;
  display_name: string | null; body: string; created_at: string;
}

const fmtDate = (s: string) => {
  try { return new Date(s).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return ''; }
};

// Länk till trådens hemvist. V1: research_area + excursion får djuplänk; övriga typer visas som etikett.
const anchorLink = (type: string, key: string): string | null => {
  if (type === 'research_area') return `/omraden/${key}`;
  if (type === 'excursion') return `/utflykter/${key}`;
  return null;
};

const DiscussionFeed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from('discussion_posts')
        .select('id, entity_type, entity_key, display_name, body, created_at')
        .is('parent_id', null).eq('status', 'published')
        .order('created_at', { ascending: false }).limit(50);
      setPosts((data ?? []) as FeedPost[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Diskussioner" titleEn="Discussions"
        description="Senaste diskussionerna på Viking Age — frågor, tolkningar och lokal kännedom kring platser, personer och forskningsområden. Öppet samtal, källkritisk grund."
        path="/diskussioner"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-gold" /> Diskussioner
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Öppet samtal kring platser, personer och forskningsområden. Detta är diskussion — inte verifierade
          fakta; belagda uppgifter finns på respektive faktasida.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Hämtar…</div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">Inga diskussioner än.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => {
              const to = anchorLink(p.entity_type, p.entity_key);
              return (
                <li key={p.id} className="viking-card rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span className="font-medium text-slate-200">{p.display_name || 'Anonym'}</span>
                    <span>· {fmtDate(p.created_at)}</span>
                    <span>· {p.entity_type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-slate-200 line-clamp-3 whitespace-pre-wrap">{p.body}</p>
                  {to && <Link to={to} className="text-xs text-gold hover:underline mt-1 inline-block">Öppna tråden →</Link>}
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DiscussionFeed;
