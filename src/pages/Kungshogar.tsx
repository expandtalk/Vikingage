import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CorpusThemePage, type ThemeRow } from '@/components/research/CorpusThemePage';

export default function Kungshogar() {
  const [rows, setRows] = useState<ThemeRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('heritage_sites') as any)
        .select('name, raa_type, landscape, period, lat, lng')
        .or('raa_type.ilike.%hög%,name.ilike.%hög%')
        .not('lat', 'is', null);
      const rs: ThemeRow[] = (data ?? [])
        .filter((d: any) => !/^(Hög|Gravfält)?,?\s*(Gravfält)?$/i.test((d.name ?? '').trim()) && (d.name ?? '').length > 3)
        .map((d: any) => ({ signum: undefined, label: d.name, lat: d.lat, lng: d.lng, note: [d.period, d.landscape].filter(Boolean).join(' · ') }))
        .sort((a: ThemeRow, b: ThemeRow) => a.label.localeCompare(b.label));
      setRows(rs);
    })();
  }, []);
  return (
    <CorpusThemePage
      title="Kungshögar & storhögar" titleEn="Royal mounds"
      description="Namngivna storhögar och kungshögar i Sverige — ofta knutna till sagokungar i folktradition."
      center={[59.0, 16.5]} zoom={5}
      stats={[{ label: 'namngivna högar', value: rows.length }]}
      intro={<>
        <p>Sveriges stora gravhögar — <strong className="text-foreground">Anundshög</strong>, <strong>Hågahögen</strong> (Skandinaviens guldrikaste bronsåldersgrav), <strong>Gamla Uppsalas kungshögar</strong>, <strong>Mysinge</strong>, <strong>Östens hög</strong>, <strong>Dagshög</strong> (Skånes största), <strong>Skalunda</strong> — knyts i folktradition ofta till sagokungar. Traditionerna är <em>inte tillförlitliga</em>: en bronsåldershög kan inte gömma en järnålderskung, men namnet lever kvar.</p>
      </>}
      footerNote="Källa: RAÄ Fornsök + Wikipedia (kurerade koordinater där FMIS saknar folknamn). Kunga-attributioner är folktradition, ej belägg. Anundshög och Hågahögen låg tidigare hårdkodade som utflykter; nu i heritage_sites."
      rows={rows}
    />
  );
}
