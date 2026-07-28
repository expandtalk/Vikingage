import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CorpusThemePage, type ThemeRow } from '@/components/research/CorpusThemePage';

// Fasta ankarpunkter (nordiska sidan + resmål) som kompletterar de importerade kopparkällorna.
const ANCHORS: ThemeRow[] = [
  { label: 'Hågahögen — Skandinaviens guldrikaste bronsåldersgrav (~1000 f.Kr.)', lat: 59.8497, lng: 17.5878, note: 'Norden' },
  { label: 'Trundholm — solvagnen (~1400 f.Kr.), solkult-kosmologin', lat: 55.906, lng: 11.62, note: 'Danmark' },
  { label: 'Understed — 3,3 kg obearbetad bärnsten deponerad ~1400 f.Kr. (bärnstenens ursprung)', lat: 57.41, lng: 10.40, note: 'Nordjylland' },
  { label: 'Mykene — baltisk bärnsten i kungagravarna (Gravcirkel A, ~1600 f.Kr.)', lat: 37.731, lng: 22.756, note: 'Grekland (resmål)' },
];

export default function Bronsalder() {
  const [rows, setRows] = useState<ThemeRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('ore_sources') as any)
        .select('name, region, country, lat, lng, metals, period_text')
        .contains('metals', ['copper']);
      const ores: ThemeRow[] = (data ?? [])
        .filter((d: any) => d.lat != null && d.lng != null)
        .map((d: any) => ({ label: `${d.name} — koppar${d.period_text ? ` (${d.period_text})` : ''}`, lat: d.lat, lng: d.lng, note: `${d.region ?? ''}${d.country ? ', ' + d.country : ''}` }));
      setRows([...ANCHORS, ...ores]);
    })();
  }, []);
  return (
    <CorpusThemePage
      title="Bronsålderns fjärrkontakter" titleEn="Bronze Age distant connections"
      description="Nordens bronsålder byggd på importerad koppar och exporterad bärnsten — hela vägen till Mykene."
      center={[50, 13]} zoom={4}
      stats={[{ label: 'kopparkällor', value: rows.filter(r => r.note && !/Norden|Danmark|Grekland|Nordjylland/.test(r.note)).length }, { label: 'ankarpunkter', value: ANCHORS.length }]}
      intro={<>
        <p><strong className="text-foreground">Norden bröt ingen egen koppar under bronsåldern</strong> (först på medeltiden) — allt metall importerades, och betalades med <strong>bärnsten</strong> ("Nordens guld"). Betalningen nådde ända till <strong>Mykenes kungagravar (~1600 f.Kr.)</strong>. Det är den fysiska handelsvägen bakom likheterna mellan nordisk bronsålderskonst och den egeiska världen — kontakt, inte gemensamt ursprung.</p>
        <p><strong className="text-foreground">Kopparvägarna skiftade över tid:</strong> från SÖ-Europa (Serbien/Bulgarien, neolitikum) → Slovakien + Östalperna + Britannien (2100–1600) → Mitterberg + Great Orme (1600–1500) → Norditaliens Alper (AATV, dominant efter 1450). Varje skifte följde sociala omvälvningar i norr. Källa: Nørgaard, Pernicka &amp; Vandkilde 2021 (PLOS ONE, CC-BY) + Nationalmuseet Danmark.</p>
        <p className="text-[12px]">Den nordiska sidan (Hågahögen, solvagnen, hällristningarnas skepp/vagnar/solhjul) speglar samma sol-och-häst-kosmologi som Medelhavet. Kristiansen tolkar det som institutionaliserade fjärrkontakter; skeptiker som down-the-line-utbyte. Vi redovisar båda.</p>
      </>}
      footerNote="Kopparkällornas koordinater = gruvregioners centroider. Isotopsignaturer (Pb) i ore_sources.isotope_signature. Bärnstensvägen som händelse i historical_events. Attribuerat CC-BY."
      rows={rows}
    />
  );
}
