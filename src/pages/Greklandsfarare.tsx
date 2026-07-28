import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CorpusThemePage, type ThemeRow } from '@/components/research/CorpusThemePage';

const parsePt = (v: unknown): [number, number] | null => {
  if (!v) return null;
  if (typeof v === 'object' && v !== null && 'x' in v && 'y' in v) { const o = v as { x: number; y: number }; return [o.y, o.x]; }
  const m = String(v).match(/\(?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)?/); return m ? [+m[2], +m[1]] : null;
};

export default function Greklandsfarare() {
  const [rows, setRows] = useState<ThemeRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('runic_inscriptions') as any)
        .select('signum, translation_sv, coordinates, landscape, province')
        .or('translation_sv.ilike.%grikk%,translation_sv.ilike.%grekland%,translation_en.ilike.%greece%,normalization.ilike.%grikk%');
      const rs: ThemeRow[] = (data ?? []).map((d: any) => {
        const pt = parsePt(d.coordinates);
        return { signum: d.signum, label: (d.translation_sv ?? '').slice(0, 120) || '(otolkad)', lat: pt?.[0] ?? null, lng: pt?.[1] ?? null, note: d.landscape ?? d.province ?? null };
      });
      setRows(rs.sort((a, b) => (a.signum ?? '').localeCompare(b.signum ?? '')));
    })();
  }, []);
  const withCoord = rows.filter(r => r.lat != null).length;
  return (
    <CorpusThemePage
      title="Greklandsfararna" titleEn="The Greece-travellers"
      description="Runstenar som minner om män som for till Grikkland (Östrom/Bysans) — väringarna."
      center={[59.6, 17.2]} zoom={6}
      stats={[{ label: 'Grekland-stenar', value: rows.length }, { label: 'med koordinat', value: withCoord }]}
      intro={<>
        <p><strong className="text-foreground">Grikkland</strong> = det (öst)romerska riket, Bysans, med huvudstaden <em>Miklagård</em> (Konstantinopel). Ett trettiotal runstenar minner om män som for dit — många i kejsarens livvakt, <strong>väringagardet</strong>. Kartan visar var stenarna står, alltså var männen kom <em>ifrån</em>: överväldigande <strong>Mälardalen</strong> (Uppland + Södermanland). Bland dem Jarlabanke-släktens U 140 ("han ändade i Grekland").</p>
      </>}
      footerNote="Källa: Samnordisk runtextdatabas (Rundata). Urval: inskrifter vars översättning/normalisering nämner Grikkland/Grekland. Punkterna = stenens nuvarande/kända plats (hembygden), inte resmålet."
      rows={rows}
    />
  );
}
