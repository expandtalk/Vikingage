import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Users, Star, UserPlus, Check } from 'lucide-react';

// /sv/liksinnade — Fas 3 intresse-matchning. Hittar andra som följer samma begrepp/tema
// (user_interests), men BARA de som gjort sina intressen synliga för medlemmar/publikt (RLS).
// Koppling = dubbel opt-in (basis 'shared_interest'); inget delas förrän mottagaren accepterat.
const sb = supabase as unknown as { from: (t: string) => any };
interface Interest { entity_type: string; entity_id: string }
interface Match { user_id: string; shared: Interest[]; prof?: { display_name?: string; handle?: string } }

export default function Liksinnade() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mine, setMine] = useState<Interest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data: my } = await sb.from('user_interests').select('entity_type,entity_id').eq('user_id', user.id);
    const mineList = (my ?? []) as Interest[];
    setMine(mineList);
    if (!mineList.length) { setMatches([]); setLoading(false); return; }
    const ids = [...new Set(mineList.map((i) => i.entity_id))];
    const { data: others } = await sb.from('user_interests')
      .select('user_id,entity_type,entity_id,visibility')
      .in('entity_id', ids).in('visibility', ['members', 'public']).neq('user_id', user.id);
    const mineKey = new Set(mineList.map((i) => `${i.entity_type}:${i.entity_id}`));
    const byUser: Record<string, Match> = {};
    for (const o of (others ?? []) as any[]) {
      if (!mineKey.has(`${o.entity_type}:${o.entity_id}`)) continue; // matcha på typ + id
      (byUser[o.user_id] ??= { user_id: o.user_id, shared: [] }).shared.push({ entity_type: o.entity_type, entity_id: o.entity_id });
    }
    const uids = Object.keys(byUser);
    if (uids.length) {
      const { data: p } = await sb.from('researcher_profiles').select('user_id,display_name,handle').in('user_id', uids);
      for (const x of (p ?? []) as any[]) if (byUser[x.user_id]) byUser[x.user_id].prof = x;
    }
    setMatches(Object.values(byUser));
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const connect = async (m: Match) => {
    if (!user) return;
    const ref = m.shared[0] ? `${m.shared[0].entity_type}:${m.shared[0].entity_id}` : null;
    const { error } = await sb.from('connections')
      .insert({ requester_id: user.id, addressee_id: m.user_id, basis: 'shared_interest', basis_ref: ref, status: 'pending' });
    if (error) { toast({ title: 'Kunde inte skicka', description: error.message, variant: 'destructive' }); return; }
    setSent((s) => new Set(s).add(m.user_id));
    toast({ title: 'Kopplingsförfrågan skickad', description: 'Syns för mottagaren i deras profil.' });
  };

  const label = (i: Interest) => i.entity_type === 'glossary_term'
    ? <Link to={`/sv/ordlista/${i.entity_id}`} className="text-gold hover:underline">{i.entity_id.replace(/-/g, ' ')}</Link>
    : <span>{i.entity_type.replace('_', ' ')}</span>;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta title="Liksinnade" description="Hitta andra som delar dina intressen." />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold text-foreground"><Users className="h-6 w-6 text-gold" /> Liksinnade</h1>
        {!user && <p className="text-muted-foreground">Logga in för att hitta andra som delar dina intressen. <Link to="/auth" className="text-gold hover:underline">Logga in</Link></p>}
        {user && loading && <p className="text-muted-foreground">Laddar…</p>}
        {user && !loading && (
          <>
            <section className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold/80">Mina intressen</h2>
              {mine.length === 0
                ? <p className="text-sm text-muted-foreground">Du följer inga begrepp/teman än. Tryck "Följ" på en <Link to="/sv/ordlista" className="text-gold hover:underline">begreppssida</Link> eller ett tema.</p>
                : <div className="flex flex-wrap gap-2 text-sm">{mine.map((i) => (
                    <span key={`${i.entity_type}:${i.entity_id}`} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1"><Star className="h-3 w-3 text-amber-300" />{label(i)}</span>
                  ))}</div>}
            </section>
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold/80">Andra som delar dina intressen</h2>
              {matches.length === 0
                ? <p className="text-sm text-muted-foreground">Inga liksinnade hittade än — bara de som gjort sina intressen synliga för medlemmar visas här.</p>
                : <ul className="space-y-2">{matches.map((m) => (
                    <li key={m.user_id} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
                      <span>
                        {m.prof?.handle ? <Link to={`/forskare/${m.prof.handle}`} className="text-foreground hover:text-gold">{m.prof.display_name || m.prof.handle}</Link> : (m.prof?.display_name || 'Medlem')}
                        <span className="ml-2 text-xs text-muted-foreground">delar {m.shared.length} intresse{m.shared.length > 1 ? 'n' : ''}</span>
                      </span>
                      {sent.has(m.user_id)
                        ? <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Check className="h-3.5 w-3.5" />skickad</span>
                        : <button onClick={() => connect(m)} className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2 py-1 text-xs text-amber-100 hover:bg-gold/20"><UserPlus className="h-3.5 w-3.5" />Koppla</button>}
                    </li>
                  ))}</ul>}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
