import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, RotateCcw, MessagesSquare, Loader2 } from 'lucide-react';

// Moderationsvy för discussion_posts. Admin ser alla (RLS discussion_admin) och sätter status.
// Bidrag publiceras först när status='approved' (RLS discussion_read_approved styr publik läsning).
interface Row {
  id: string; entity_type: string; entity_key: string;
  display_name: string | null; body: string; status: string; created_at: string;
}
const STATUSES: Array<{ key: 'pending' | 'approved' | 'rejected'; label: string }> = [
  { key: 'pending', label: 'Väntar' },
  { key: 'approved', label: 'Godkända' },
  { key: 'rejected', label: 'Avslagna' },
];

export const AdminDiscussion: React.FC = () => {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-discussion', status],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('discussion_posts')
        .select('id, entity_type, entity_key, display_name, body, status, created_at')
        .eq('status', status).order('created_at', { ascending: false }).limit(300);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ['admin-discussion-counts'],
    queryFn: async () => {
      const out: Record<string, number> = {};
      for (const s of STATUSES) {
        const { count } = await (supabase as any).from('discussion_posts')
          .select('id', { count: 'exact', head: true }).eq('status', s.key);
        out[s.key] = count ?? 0;
      }
      return out;
    },
  });

  const setPostStatus = async (id: string, s: string) => {
    setBusy(id);
    await (supabase as any).from('discussion_posts').update({ status: s }).eq('id', id);
    setBusy(null);
    refetch();
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border-white/10 rounded-lg p-6 text-white">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
        <MessagesSquare className="h-5 w-5" /> Diskussionsbidrag — moderation
      </h2>
      <p className="mb-4 text-sm text-white/60">Bidrag från besökare. Godkänn för att publicera på respektive sida; avslå för att dölja.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s.key} onClick={() => setStatus(s.key)}
            className={`rounded-full px-3 py-1 text-sm border ${status === s.key ? 'border-amber-400 bg-amber-400/15 text-amber-100' : 'border-white/20 text-white/70 hover:bg-white/10'}`}>
            {s.label}{counts ? ` · ${counts[s.key] ?? 0}` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-white/60"><Loader2 className="h-5 w-5 animate-spin" /> Laddar…</div>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="py-10 text-center text-white/50">Inga bidrag i denna kategori.</p>
      ) : (
        <ul className="space-y-3">
          {data!.map((r) => (
            <li key={r.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono">{r.entity_type}</span>
                <span className="font-medium text-amber-200/90">{r.entity_key}</span>
                <span>· {r.display_name || 'Anonym'}</span>
                <span className="tabular-nums">· {(r.created_at || '').slice(0, 16).replace('T', ' ')}</span>
              </div>
              <p className="mb-3 whitespace-pre-wrap text-sm text-white/90">{r.body}</p>
              <div className="flex flex-wrap gap-2">
                {r.status !== 'approved' && (
                  <button onClick={() => setPostStatus(r.id, 'approved')} disabled={busy === r.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-40">
                    <Check className="h-3.5 w-3.5" /> Godkänn
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => setPostStatus(r.id, 'rejected')} disabled={busy === r.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-xs text-rose-100 hover:bg-rose-400/20 disabled:opacity-40">
                    <X className="h-3.5 w-3.5" /> Avslå
                  </button>
                )}
                {r.status !== 'pending' && (
                  <button onClick={() => setPostStatus(r.id, 'pending')} disabled={busy === r.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1 text-xs text-white/70 hover:bg-white/10 disabled:opacity-40">
                    <RotateCcw className="h-3.5 w-3.5" /> Återställ
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
