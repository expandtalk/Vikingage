import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Users, Check, X } from 'lucide-react';

// "Kopplingar" (profil) — dubbel opt-in-inkorg. Inkommande förfrågningar accepteras/avböjs;
// accepterade listas. Inget om motparten delas förrän status='accepted'.
const sb = supabase as unknown as { from: (t: string) => any };
interface Conn { id: string; requester_id: string; addressee_id: string; basis: string; status: string; created_at: string }

export const MyConnections: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Conn[]>([]);
  const [names, setNames] = useState<Record<string, { display_name?: string; handle?: string }>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await sb.from('connections')
      .select('id,requester_id,addressee_id,basis,status,created_at')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    const cs = (data ?? []) as Conn[];
    setRows(cs);
    const ids = [...new Set(cs.flatMap((c) => [c.requester_id, c.addressee_id]))].filter((id) => id !== user.id);
    if (ids.length) {
      const { data: p } = await sb.from('researcher_profiles').select('user_id,display_name,handle').in('user_id', ids);
      setNames(Object.fromEntries((p ?? []).map((x: any) => [x.user_id, x])));
    }
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const decide = async (id: string, status: 'accepted' | 'declined') => {
    const { error } = await sb.from('connections').update({ status, decided_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast({ title: 'Fel', description: error.message, variant: 'destructive' }); return; }
    load();
  };

  if (!user) return null;
  const incoming = rows.filter((c) => c.addressee_id === user.id && c.status === 'pending');
  const accepted = rows.filter((c) => c.status === 'accepted');
  const other = (c: Conn) => (c.requester_id === user.id ? c.addressee_id : c.requester_id);
  const nm = (uid: string) => names[uid]?.display_name || names[uid]?.handle || 'Medlem';

  return (
    <div className="text-white">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold"><Users className="h-5 w-5 text-amber-300" /> Kopplingar</h3>
      <p className="mb-4 text-xs text-slate-400">Dubbel opt-in — inget delas förrän båda accepterat.</p>
      {loading && <p className="text-sm text-slate-400">Laddar…</p>}
      {!loading && (
        <>
          <div className="mb-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-300/70">Inkommande förfrågningar</div>
            {incoming.length === 0 ? <p className="text-sm text-slate-400">Inga.</p> : (
              <ul className="space-y-1.5">
                {incoming.map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
                    <span>{nm(other(c))} <span className="text-xs text-slate-400">· {c.basis === 'shared_place' ? 'delad plats' : 'delat intresse'}</span></span>
                    <span className="flex gap-1">
                      <button onClick={() => decide(c.id, 'accepted')} className="inline-flex items-center gap-1 rounded bg-emerald-700/40 px-2 py-1 text-xs text-emerald-100 hover:bg-emerald-700/60"><Check className="h-3.5 w-3.5" />Acceptera</button>
                      <button onClick={() => decide(c.id, 'declined')} className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"><X className="h-3.5 w-3.5" />Avböj</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-300/70">Mina kopplingar</div>
            {accepted.length === 0 ? <p className="text-sm text-slate-400">Inga än.</p> : (
              <ul className="space-y-1.5">
                {accepted.map((c) => (
                  <li key={c.id} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
                    {names[other(c)]?.handle
                      ? <a href={`/forskare/${names[other(c)]!.handle}`} className="hover:text-amber-300">{nm(other(c))}</a>
                      : nm(other(c))}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyConnections;
