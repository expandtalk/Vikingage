import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';

// Kuraterad grupp: exceptionella elit-monument (Daniels tes) — avviker från massan av minnesstenar
// genom genre (skaldevers/hjältediktning/urnordisk förbannelse) eller roll (central-/politisk plats).
interface EM { id: string; name: string; kind: string; signum: string | null; dating: string | null; landscape: string | null; note: string | null; influence: string | null; link: string | null }

const KIND: Record<string, { sv: string; icon: string }> = {
  'hjältediktning': { sv: 'Hjältediktning', icon: '⚔' },
  'skaldevers': { sv: 'Skaldevers', icon: '📜' },
  'förbannelse': { sv: 'Urnordisk förbannelse', icon: 'ᚦ' },
  'centralplats': { sv: 'Central-/kultplats', icon: '✦' },
  'politisk plats': { sv: 'Politisk plats', icon: '♔' },
};

export function EliteMonumentsCard({ sv }: { sv: boolean }) {
  const [rows, setRows] = useState<EM[]>([]);
  useEffect(() => {
    let a = true;
    (supabase.from('elite_monuments') as any).select('*').then(({ data }: { data: EM[] }) => { if (a) setRows(data ?? []); });
    return () => { a = false; };
  }, []);
  if (!rows.length) return null;
  const order = ['hjältediktning', 'skaldevers', 'förbannelse', 'centralplats', 'politisk plats'];
  const groups = order.map(k => ({ k, items: rows.filter(r => r.kind === k) })).filter(g => g.items.length);

  return (
    <Card className="viking-card mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /> {sv ? 'Exceptionella elit-monument' : 'Exceptional elite monuments'}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p className="text-xs">{sv ? 'Stenar och platser som avviker från massan av formelartade minnesstenar — den yttersta elitens kommunikation: skaldevers, hjältediktning, urnordiska förbannelser, och maktens central-/tingsplatser. Ofta knutna till gravhögar och centralorter.' : 'Monuments that deviate from the mass of formulaic memorials — elite communication: skaldic verse, heroic lore, Proto-Norse curses, and central/assembly places.'}</p>
        {groups.map(({ k, items }) => (
          <div key={k}>
            <div className="text-foreground font-medium mb-0.5 text-xs">{KIND[k]?.icon} {KIND[k]?.sv ?? k}</div>
            <div className="space-y-1">
              {items.map(m => (
                <div key={m.id} className="text-xs border-l-2 border-gold/40 pl-2">
                  <div>
                    {m.link ? <Link to={m.link} className="text-gold hover:underline font-medium">{m.name}</Link> : <span className="text-foreground font-medium">{m.name}</span>}
                    {m.signum ? <span className="opacity-60"> · {m.signum}</span> : ''}
                    {m.dating ? <span className="opacity-60"> · {m.dating}</span> : ''}
                    {m.landscape ? <span className="opacity-50"> · {m.landscape}</span> : ''}
                  </div>
                  {m.note && <div className="opacity-80">{m.note}{m.influence && m.influence !== '—' ? ` · influens: ${m.influence}` : ''}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-[11px] opacity-70">{sv ? 'Kuraterad grupp (koordinater ur vår runsten-/heritage-data resp. verifierade mot Wikidata). Rök ligger vid vattenleden Vättern→Söderköping; Karlevi är dansk-influerad skaldik; Blekinge-gruppen (Björketorp/Stentoften/Istaby/Gummarp) är urnordisk; Västra Vång + Uppåkra är central-/kultplatser.' : 'Curated group; coordinates from our runic/heritage data or verified via Wikidata.'}</p>
      </CardContent>
    </Card>
  );
}
