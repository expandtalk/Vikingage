import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ScrollText, AlertTriangle, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/kungakronikor → kurerad sektion "Birka-kungarna". FAKTA hämtas ur databasen (historical_kings
// filtrerat på Rimbert-källa, U 11 ur runic_inscriptions, Alsnö stadga ur historical_sources) —
// endast den källkritiska inramningen är redaktionell. Källhederligt: skiljer belägg (Rimbert) från
// sägen ("Alsnö-kungarna", Peringskölds felläsning av U 11). Ingen hårdkodad kungdata.

interface BirkaKing {
  name: string;
  reign_start: number | null;
  reign_end: number | null;
  description: string | null;
  sources: string | null;
}
interface U11 { signum: string; name: string | null; translation_sv: string | null; translation_en: string | null; }
interface AlsnoSource { title: string; written_year: number | null; description: string | null; repository_ref: string | null; }

const reign = (a: number | null, b: number | null) =>
  a && b ? `ca ${a}–${b}` : a ? `ca ${a}` : '';

export const BirkaKungarnaSection: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data } = useQuery({
    queryKey: ['birka-kungarna-section'],
    queryFn: async () => {
      const kingsP = (supabase.from('historical_kings') as any)
        .select('name,reign_start,reign_end,description,sources,region')
        .eq('region', 'Sweden')
        .ilike('sources', '%Rimbert%')
        .order('reign_start', { ascending: true });
      const u11P = (supabase.from('runic_inscriptions') as any)
        .select('signum,name,translation_sv,translation_en')
        .eq('signum', 'U 11')
        .limit(1);
      const alsnoP = (supabase.from('historical_sources') as any)
        .select('title,written_year,description,repository_ref')
        .eq('title', 'Alsnö stadga')
        .limit(1);
      const [kings, u11, alsno] = await Promise.all([kingsP, u11P, alsnoP]);
      return {
        kings: (kings.data ?? []) as BirkaKing[],
        u11: (u11.data?.[0] ?? null) as U11 | null,
        alsno: (alsno.data?.[0] ?? null) as AlsnoSource | null,
      };
    },
  });

  const kings = data?.kings ?? [];
  const u11 = data?.u11 ?? null;
  const alsno = data?.alsno ?? null;
  if (kings.length === 0) return null;

  const u11Text = u11?.translation_sv || u11?.translation_en || '';

  return (
    <section className="mb-8 rounded-lg border border-slate-700 bg-slate-900/40 p-5" aria-labelledby="birka-kungarna-rubrik">
      <div className="mb-4">
        <h2 id="birka-kungarna-rubrik" className="text-2xl font-bold text-gold flex items-center gap-2">
          <Crown className="h-6 w-6" />
          {sv ? 'Birka-kungarna' : 'The Kings of Birka'}
        </h2>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
          {sv
            ? 'De första namngivna sveakungar vi har historiskt belägg för — genom Rimberts Vita Ansgarii (~865–875), en samtida frankisk källa knuten till Ansgars missionsresor till Birka. Ingen samtida källa anger deras ätt.'
            : 'The first named kings of the Svear for whom we have historical evidence — through Rimbert’s Vita Ansgarii (~865–875), a near-contemporary Frankish source tied to Ansgar’s missions to Birka. No contemporary source records their dynasty.'}
        </p>
      </div>

      {/* Kungarna — ur databasen */}
      <div className="grid gap-3 sm:grid-cols-3">
        {kings.map((k) => (
          <Card key={k.name} className="viking-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gold flex items-center justify-between gap-2">
                <span>{k.name}</span>
                {reign(k.reign_start, k.reign_end) && (
                  <span className="text-[11px] font-normal text-slate-400 whitespace-nowrap">{reign(k.reign_start, k.reign_end)}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              {k.description && <p className="text-xs leading-relaxed">{k.description}</p>}
              {k.sources && (
                <p className="text-[11px] text-gold/80 flex items-start gap-1">
                  <ScrollText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{k.sources}</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sätet: Adelsö/Hovgården — kontinuitetsnod (U 11 + Alsnö stadga) */}
      <div className="mt-4 rounded-md border border-slate-700 bg-slate-800/40 p-4">
        <h3 className="text-sm font-semibold text-gold flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4" />
          {sv ? 'Sätet: Adelsö / Hovgården' : 'The seat: Adelsö / Hovgården'}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {sv
            ? 'Kungsgården Hovgården på Adelsö låg mitt emot handelsstaden Birka — sveakungens säte (Uppsala öd). Platsen förblev kunglig långt in i medeltiden: samma ö gav namn åt Alsnö hus och Alsnö stadga.'
            : 'The royal manor of Hovgården on Adelsö lay directly opposite the trading town of Birka — the seat of the Svea king. The place remained royal well into the Middle Ages: the same island gave its name to Alsnö hus and the Ordinance of Alsnö.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 mt-3">
          {u11Text && (
            <div className="text-xs text-slate-300 border-l-2 border-gold/40 pl-3">
              <span className="text-gold/90 font-medium">{u11?.name || 'Hovgårdsstenen'} ({u11?.signum})</span>
              <p className="mt-1 leading-relaxed italic">”{u11Text}”</p>
              <p className="mt-1 text-slate-400">
                {sv
                  ? 'Kungens bryte (fogde) Tolir över Roden — belägg för kunglig förvaltning vid Hovgården redan under vikingatiden.'
                  : 'The king’s steward Tólir of Roðr — evidence of royal administration at Hovgården already in the Viking Age.'}
              </p>
            </div>
          )}
          {alsno && (
            <div className="text-xs text-slate-300 border-l-2 border-gold/40 pl-3">
              <span className="text-gold/90 font-medium">
                {alsno.title}{alsno.written_year ? ` (~${alsno.written_year})` : ''}
                {alsno.repository_ref ? ` · ${alsno.repository_ref}` : ''}
              </span>
              {alsno.description && (
                <p className="mt-1 leading-relaxed">
                  {alsno.description.length > 260 ? alsno.description.slice(0, 260) + '…' : alsno.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Källkritik: "Alsnö-kungarna" är INTE en historisk kategori */}
      <div className="mt-4 rounded-md border border-amber-700/50 bg-amber-950/20 p-4">
        <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4" />
          {sv ? 'Källkritik: ”Alsnö-kungarna”' : 'Source criticism: the “Alsnö kings”'}
        </h3>
        <p className="text-xs text-amber-100/90 leading-relaxed">
          {sv
            ? 'Äldre litteratur talar om ”Alsnö-kungarna” och knöt dem till Hovgården. Redan 1800-talets antikvarier noterade att dessa var sago-kungar som senare historieskrivare ”inpassat i Uppsalakonungarnas släktlista eftersom tomma rum där erfordrat” — alltså en konstruktion för att fylla luckor, inte belagda regenter. Vi redovisar dem som sägen, inte som historia. På samma sätt lästes U 11 förr fantasifullt (Peringsköld: Bråvalla slag, ”kung Heröd”); den moderna runologiska läsningen ovan är en helt annan — och källbelagd.'
            : 'Older literature speaks of the “Alsnö kings” tied to Hovgården. Even 19th-century antiquarians noted these were saga kings later inserted into the Uppsala king-lists “because empty slots required it” — a construct to fill gaps, not attested rulers. We present them as legend, not history. Likewise U 11 was once read fancifully (Peringsköld: the Battle of Bråvalla, “King Heröd”); the modern runological reading above is entirely different — and source-based.'}
        </p>
      </div>
    </section>
  );
};
