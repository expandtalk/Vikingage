import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';

// Kuraterad grupp: exceptionella elit-monument (Daniels tes) — avviker från massan av minnesstenar
// genom genre (medium) eller roll. Klustren på kartan = separata samtida maktsfärer (sphere).
interface EM { id: string; name: string; kind: string; signum: string | null; dating: string | null; landscape: string | null; note: string | null; influence: string | null; link: string | null; sphere: string | null }

const KIND: Record<string, { sv: string; icon: string }> = {
  'hjältediktning': { sv: 'Hjältediktning', icon: '⚔' },
  'hjältebild': { sv: 'Hjältebild', icon: '🐉' },
  'skaldevers': { sv: 'Skaldevers', icon: '📜' },
  'förbannelse': { sv: 'Urnordisk förbannelse', icon: 'ᚦ' },
  'bildsten': { sv: 'Bildsten', icon: '🖼' },
  'centralplats': { sv: 'Central-/kultplats', icon: '✦' },
  'elitgrav': { sv: 'Elitgrav / båtgravfält', icon: '⚱' },
  'kristet maktcentrum': { sv: 'Kristet maktcentrum', icon: '✝' },
  'politisk plats': { sv: 'Politisk plats', icon: '♔' },
};
const SPHERE: Record<string, { sv: string; icon: string }> = {
  'syd': { sv: 'Sydskandinavisk / dansk sfär', icon: '🔵' },
  'ostergotland': { sv: 'Östergötland (Folkungar/Bjälbo)', icon: '🟢' },
  'svealand': { sv: 'Svealand – Mälardalen (Uppsala-kungarna)', icon: '🟡' },
  'vastergotland': { sv: 'Västergötland (kristet kungacentrum)', icon: '🟠' },
  'gotland': { sv: 'Gotland (autonom bondearistokrati)', icon: '🟣' },
};
const KIND_ORDER = ['hjältediktning', 'hjältebild', 'skaldevers', 'förbannelse', 'bildsten', 'centralplats', 'elitgrav', 'kristet maktcentrum', 'politisk plats'];
const SPHERE_ORDER = ['syd', 'ostergotland', 'svealand', 'vastergotland', 'gotland'];

export function EliteMonumentsCard({ sv }: { sv: boolean }) {
  const [rows, setRows] = useState<EM[]>([]);
  const [by, setBy] = useState<'sphere' | 'kind'>('sphere');
  useEffect(() => {
    let a = true;
    (supabase.from('elite_monuments') as any).select('*').then(({ data }: { data: EM[] }) => { if (a) setRows(data ?? []); });
    return () => { a = false; };
  }, []);
  if (!rows.length) return null;

  const dims = by === 'sphere'
    ? { order: SPHERE_ORDER, map: SPHERE, key: (r: EM) => r.sphere, tag: (r: EM) => KIND[r.kind] }
    : { order: KIND_ORDER, map: KIND, key: (r: EM) => r.kind, tag: (r: EM) => (r.sphere ? SPHERE[r.sphere] : undefined) };
  const groups = dims.order.map(k => ({ k, items: rows.filter(r => dims.key(r) === k) })).filter(g => g.items.length);

  return (
    <Card className="viking-card mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /> {sv ? 'Exceptionella elit-monument' : 'Exceptional elite monuments'}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p className="text-xs">{sv ? 'Monument som avviker från massan av formelartade minnesstenar — den yttersta elitens kommunikation. På kartan bildar de flera kluster som motsvarar samtida maktsfärer (varav den södra är dansk och Gotland en autonom bondearistokrati), inte ett enat Sverige. Uttrycksformen skiftar med sfär och tid: urnordisk förbannelse → båtgravar → hjältevers/-bild → kristet kungacentrum.' : 'Monuments that deviate from the mass of formulaic memorials — elite communication. On the map they form clusters matching contemporaneous power spheres, not one unified Sweden.'}</p>

        <div className="flex gap-1 text-xs">
          {(['sphere', 'kind'] as const).map(m => (
            <button key={m} onClick={() => setBy(m)}
              className={`px-2 py-0.5 rounded border ${by === m ? 'bg-gold/20 border-gold text-gold' : 'border-border opacity-70 hover:opacity-100'}`}>
              {m === 'sphere' ? (sv ? 'Gruppera: maktsfär' : 'By power sphere') : (sv ? 'Gruppera: medium' : 'By medium')}
            </button>
          ))}
        </div>

        {groups.map(({ k, items }) => (
          <div key={k}>
            <div className="text-foreground font-medium mb-0.5 text-xs">{dims.map[k]?.icon} {dims.map[k]?.sv ?? k}</div>
            <div className="space-y-1">
              {items.map(m => {
                const tag = dims.tag(m);
                return (
                  <div key={m.id} className="text-xs border-l-2 border-gold/40 pl-2">
                    <div>
                      {m.link ? <Link to={m.link} className="text-gold hover:underline font-medium">{m.name}</Link> : <span className="text-foreground font-medium">{m.name}</span>}
                      {m.signum ? <span className="opacity-60"> · {m.signum}</span> : ''}
                      {m.dating ? <span className="opacity-60"> · {m.dating}</span> : ''}
                      {tag ? <span className="opacity-50"> · {tag.icon} {tag.sv}</span> : ''}
                    </div>
                    {m.note && <div className="opacity-80">{m.note}{m.influence && m.influence !== '—' ? ` · influens: ${m.influence}` : ''}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <p className="text-[11px] opacity-70">{sv ? 'Kuraterad grupp; koordinater ur vår runsten-/heritage-data resp. verifierade mot Wikidata. Birger Jarls val av Varnhem binder Östergötlands Folkungamakt till Västergötlands kristna landskap. Sigurdsristningen + de gotländska bildstenarna visar att den heroiska bilden föregår runsten-texten.' : 'Curated group; coordinates from our runic/heritage data or verified via Wikidata.'}</p>
      </CardContent>
    </Card>
  );
}
