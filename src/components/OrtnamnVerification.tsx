import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, HelpCircle } from 'lucide-react';

// Verifierings-vy (Daniel/Agneta): varje namnträff per led, forskaren skiljer KULT från HOMONYM
// (get→Getingsta, ed→'näs'). Bara 'cult' räknas i en ren kvot. Skriv kräver editor/admin (RLS).

interface Hit {
  id: string; element_key: string; label: string | null; category: string | null; strength: string | null;
  interpretation: string | null; place_name: string; near_node: boolean; sol_note: string | null; verdict: string | null;
}
const V = { cult: { c: '#22c55e', t: 'kult' }, homonym: { c: '#ef4444', t: 'homonym' } } as const;

export const OrtnamnVerification: React.FC<{ region?: string }> = ({ region = 'Ångermanland' }) => {
  const { canEdit } = useUserRole();
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (supabase.from('v_ortnamn_hit_review') as any).select('*').eq('region', region)
      .then(({ data }: { data: Hit[] | null }) => setHits(data ?? []));
  }, [region]);

  const setVerdict = async (id: string, verdict: 'cult' | 'homonym' | null) => {
    if (!canEdit) return;
    setBusy(id);
    const { error } = await (supabase.from('ortnamn_element_hits') as any).update({ verdict }).eq('id', id);
    if (!error) setHits((prev) => prev.map((h) => (h.id === id ? { ...h, verdict } : h)));
    setBusy(null);
  };

  const groups = useMemo(() => {
    const m = new Map<string, Hit[]>();
    for (const h of hits) { if (!m.has(h.element_key)) m.set(h.element_key, []); m.get(h.element_key)!.push(h); }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [hits]);

  const tot = hits.length;
  const cult = hits.filter((h) => h.verdict === 'cult').length;
  const homo = hits.filter((h) => h.verdict === 'homonym').length;
  const open = tot - cult - homo;

  if (!hits.length) return null;

  return (
    <Card className="viking-card mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold">
          <HelpCircle className="h-5 w-5" /> Verifiera klusterorden ({tot} träffar)
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p className="text-xs opacity-80">
          Varje led matchas heuristiskt mot ortnamnen — men flera är <strong>homonymer</strong> (samma
          bokstäver, annan betydelse): <em>get</em> fångar Get<strong>ing</strong>sta (geting), <em>ed</em>
          tar Edsele (<em>ed</em> = näs). {canEdit
            ? 'Markera varje träff som kult eller homonym — bara kult räknas i den rena kvoten.'
            : 'Logga in som forskare (editor) för att markera kult/homonym.'}
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="text-emerald-300">Kult: {cult}</span>
          <span className="text-red-300">Homonym: {homo}</span>
          <span className="text-slate-400">Ogranskade: {open}</span>
          {cult + homo > 0 && <span className="text-foreground">Andel äkta kult av granskade: <strong>{Math.round((cult / (cult + homo)) * 100)}%</strong></span>}
        </div>

        {groups.map(([key, list]) => {
          const first = list[0];
          return (
            <div key={key} className="border-l-2 border-slate-700 pl-3 py-1">
              <div className="text-foreground font-medium text-sm flex items-center gap-2">
                {first.label ?? key}
                {first.strength && <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600">{first.strength === 'strong' ? 'stark' : 'svag'}</span>}
                <span className="text-xs text-muted-foreground">({list.length})</span>
              </div>
              {first.interpretation && <div className="text-xs italic mt-0.5">{first.interpretation}</div>}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {list.map((h) => {
                  const v = h.verdict ? V[h.verdict as keyof typeof V] : null;
                  return (
                    <span key={h.id} className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs"
                      style={{ borderColor: v ? v.c : '#475569', color: v ? v.c : '#cbd5e1' }} title={h.sol_note ?? ''}>
                      {h.place_name}{h.near_node ? ' ◉' : ''}
                      {canEdit && (
                        <>
                          <button type="button" disabled={busy === h.id} onClick={() => setVerdict(h.id, h.verdict === 'cult' ? null : 'cult')}
                            className="ml-0.5 text-emerald-400 hover:text-emerald-200" title="Kult"><Check className="h-3 w-3" /></button>
                          <button type="button" disabled={busy === h.id} onClick={() => setVerdict(h.id, h.verdict === 'homonym' ? null : 'homonym')}
                            className="text-red-400 hover:text-red-200" title="Homonym"><X className="h-3 w-3" /></button>
                        </>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
        <p className="text-[11px] opacity-70">◉ = inom 8 km från en centralort (räknas i anrikningen). Träffar med SOL-uppslag visar det vid hovring. När du granskat räknas den rena kvoten om.</p>
      </CardContent>
    </Card>
  );
};
