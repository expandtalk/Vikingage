import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Check } from 'lucide-react';

// "Människor knutna hit" — Fas 2 upptäcktsyta. Aggregat via place_tie_summary (k-anonymt, k=5)
// + de som satt visibility 'members'/'public' listas för kontakt (RLS släpper bara dessa rader).
// Koppling = dubbel opt-in (skapar pending connection; mottagaren accepterar i sin profil).
// Självdöljande om inget att visa. place_ref = place_names.id; kan resolvas från namn.
const sb = supabase as unknown as { from: (t: string) => any; rpc: (f: string, a?: any) => Promise<{ data: any; error: any }> };

const TIE_LABEL: Record<string, string> = {
  born: 'födda här', raised: 'uppvuxna här', school: 'gått i skola här', university: 'studerat här',
  work: 'arbetat här', friend: 'vänner härifrån', interest: 'intresserade av platsen',
};

interface Person { user_id: string; ties: string[]; prof?: { display_name?: string; handle?: string } }

export const PlaceTiesSummary: React.FC<{ placeRef?: string; placeName?: string }> = ({ placeRef, placeName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ref, setRef] = useState<string | null>(placeRef ?? null);
  const [counts, setCounts] = useState<{ tie_type: string; n: number }[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [sent, setSent] = useState<Set<string>>(new Set());

  // Resolva place_names.id från namn om inget ref givet.
  useEffect(() => {
    if (placeRef) { setRef(placeRef); return; }
    if (!placeName) return;
    let alive = true;
    (async () => {
      const { data } = await sb.from('place_names').select('id').ilike('name', placeName)
        .eq('exclude_from_search', false).order('wikidata_sitelinks', { ascending: false, nullsFirst: false }).limit(1);
      if (alive) setRef(data?.[0]?.id ?? null);
    })();
    return () => { alive = false; };
  }, [placeRef, placeName]);

  useEffect(() => {
    if (!ref) return;
    let alive = true;
    (async () => {
      const { data: sum } = await sb.rpc('place_tie_summary', { p_place_ref: ref });
      if (alive) setCounts((sum ?? []) as { tie_type: string; n: number }[]);
      const { data: rows } = await sb.from('user_place_ties')
        .select('user_id,tie_type,visibility').eq('place_ref', ref).in('visibility', ['members', 'public']);
      const list = (rows ?? []) as { user_id: string; tie_type: string }[];
      const ids = [...new Set(list.map((r) => r.user_id))].filter((id) => id !== user?.id);
      let profs: Record<string, any> = {};
      if (ids.length) {
        const { data: p } = await sb.from('researcher_profiles').select('user_id,display_name,handle').in('user_id', ids);
        profs = Object.fromEntries((p ?? []).map((x: any) => [x.user_id, x]));
      }
      const byUser: Record<string, Person> = {};
      for (const r of list) {
        if (r.user_id === user?.id) continue;
        (byUser[r.user_id] ??= { user_id: r.user_id, ties: [], prof: profs[r.user_id] }).ties.push(r.tie_type);
      }
      if (alive) setPeople(Object.values(byUser));
    })();
    return () => { alive = false; };
  }, [ref, user]);

  const connect = async (addressee: string) => {
    if (!user || !ref) return;
    const { error } = await sb.from('connections')
      .insert({ requester_id: user.id, addressee_id: addressee, basis: 'shared_place', basis_ref: ref, status: 'pending' });
    if (error) { toast({ title: 'Kunde inte skicka', description: error.message, variant: 'destructive' }); return; }
    setSent((s) => new Set(s).add(addressee));
    toast({ title: 'Kopplingsförfrågan skickad', description: 'Syns för mottagaren i deras profil.' });
  };

  if (!ref || (counts.length === 0 && people.length === 0)) return null;
  return (
    <section className="mt-10 rounded-lg border border-border bg-muted/20 p-4">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground"><Users className="h-5 w-5 text-gold" /> Människor knutna hit</h2>
      {counts.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2 text-sm">
          {counts.map((c) => (
            <span key={c.tie_type} className="rounded-full border border-border px-3 py-1"><b className="text-gold">{c.n}</b> {TIE_LABEL[c.tie_type] ?? c.tie_type}</span>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-sm text-muted-foreground">Anonyma räknare visas när minst 5 personer knutit sig hit.</p>
      )}
      {people.length > 0 && (
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300/80">Öppna för kontakt</h3>
          <ul className="space-y-1.5">
            {people.map((p) => (
              <li key={p.user_id} className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-1.5 text-sm">
                <span>
                  {p.prof?.handle
                    ? <a href={`/forskare/${p.prof.handle}`} className="text-foreground hover:text-gold">{p.prof.display_name || p.prof.handle}</a>
                    : (p.prof?.display_name || 'Medlem')}
                  <span className="ml-2 text-xs text-muted-foreground">{p.ties.map((t) => TIE_LABEL[t] ?? t).join(', ')}</span>
                </span>
                {user && (sent.has(p.user_id)
                  ? <span className="inline-flex items-center gap-1 text-xs text-emerald-300"><Check className="h-3.5 w-3.5" />skickad</span>
                  : <button onClick={() => connect(p.user_id)} className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2 py-1 text-xs text-amber-100 hover:bg-gold/20"><UserPlus className="h-3.5 w-3.5" />Koppla</button>)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default PlaceTiesSummary;
