import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, AlertTriangle, Coins, Anchor, Landmark } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCentralPlaceProfiles, type CentralPlaceProfile } from '@/hooks/useCentralPlaceProfiles';
import { useTradeGoods, type TradeGood } from '@/hooks/useTradeGoods';

// Ikon per varuklass — trälar (människa) markeras särskilt.
const CLASS_EMOJI: Record<string, string> = {
  'människa': '⛓️', 'päls': '🦫', 'järn': '⚒️', 'redskap': '⚔️', 'råvara': '🟡',
  'ädelmetall': '🪙', 'lyxvara': '✨',
};
const goodEmoji = (c: string | null) => (c ? CLASS_EMOJI[c] ?? '•' : '•');

// Export → Östvägen → silver. Förklarar tyngdpunktsförskjutningen: Nordens silver
// FÖRTJÄNADES (päls + trälar ut), till skillnad från solidus-guldet som kom som prestige.
const TradeFlowPanel: React.FC<{ sv: boolean }> = ({ sv }) => {
  const { data: goods = [], isLoading } = useTradeGoods();
  if (isLoading || goods.length === 0) return null;
  const vikingEra = (g: TradeGood) => (g.era_from ?? 0) < 1100 && (g.era_to ?? 9999) > 700;
  const exports = goods.filter((g) => g.direction === 'export' && vikingEra(g));
  const silver = goods.filter((g) => g.commodity_class === 'ädelmetall' && g.direction === 'import' && vikingEra(g));
  const otherImports = goods.filter((g) => g.direction === 'import' && g.commodity_class !== 'ädelmetall' && vikingEra(g));

  const Col: React.FC<{ title: string; items: TradeGood[]; hi?: string }> = ({ title, items, hi }) => (
    <div className="flex-1 min-w-[150px]">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">{title}</div>
      <ul className="space-y-1">
        {items.map((g) => (
          <li key={g.slug} title={g.evidence_note || undefined}
            className={`flex items-center gap-2 text-sm rounded px-2 py-1 ${g.slug === hi ? 'bg-amber-500/15 text-amber-200 font-medium' : 'text-slate-200'}`}>
            <span aria-hidden>{goodEmoji(g.commodity_class)}</span>
            <span className="truncate">{sv ? g.name : g.name_en ?? g.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Card className="viking-card mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold">
          <Coins className="h-5 w-5" /> {sv ? 'Varför Mälaren? Silvret förtjänades' : 'Why Mälaren? The silver was earned'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p>
          {sv
            ? 'Guldregionernas solidi kom som prestige (subsidier, sold). Vikingatidens silver var något helt annat: det FÖRTJÄNADES genom export österut via Östvägen — främst päls och trälar. Birka satt i kontrollnoden för den handeln, inte på guldet.'
            : 'The gold regions’ solidi arrived as prestige. Viking-Age silver was earned — via eastern exports (furs and slaves). Birka sat at the control node of that trade.'}
        </p>
        <div className="flex items-stretch gap-2 flex-wrap sm:flex-nowrap">
          <Col title={sv ? 'Ut (export)' : 'Out (export)'} items={exports} hi="tralar" />
          <div className="flex flex-col items-center justify-center px-1 text-slate-400 shrink-0">
            <ArrowRight className="h-5 w-5" />
            <span className="text-[10px] mt-1 text-center leading-tight">{sv ? 'Östvägen\n(Rus-floderna)' : 'Eastern route'}</span>
          </div>
          <Col title={sv ? 'In (silver)' : 'In (silver)'} items={silver} hi="islamiskt-silver-dirham" />
          {otherImports.length > 0 && <Col title={sv ? 'In (lyx)' : 'In (luxury)'} items={otherImports} />}
        </div>
        <p className="text-xs opacity-80">
          {sv
            ? '"Slav" av Slav — Rus sålde tillfångatagna söderut för dirham (Ibn Fadlan 922; Rimberts Vita Ansgarii nämner trälar i Birka). Källa: trade_goods + trade_routes (Östvägen).'
            : '"Slave" from Slav — the Rus sold captives south for dirhams (Ibn Fadlan 922; Rimbert names slaves at Birka).'}
        </p>
      </CardContent>
    </Card>
  );
};

// Centralplatser — jämför vikingatida noder KVANTITATIVT (fingerprint). "Vikingastad" är inte
// en sak: kult-centralplats → emporium → köping → hamn → decentraliserat nät.
const KIND: Record<string, { sv: string; color: string }> = {
  emporium: { sv: 'Emporium', color: '#b45309' },
  cult_central: { sv: 'Kult-centralplats', color: '#7c3aed' },
  koping: { sv: 'Köping', color: '#0369a1' },
  region_network: { sv: 'Decentraliserat nät', color: '#0e7490' },
  town: { sv: 'Stad', color: '#1c1917' },
  harbour: { sv: 'Hamn', color: '#0891b2' },
};
const kindInfo = (k: string) => KIND[k] ?? { sv: k, color: '#64748b' };
const yr = (n: number | null) => (n == null ? '?' : n < 0 ? `${-n} f.Kr` : `${n}`);
const bool = (b: boolean | null) => (b ? 'Ja' : b === false ? '–' : '?');

const CentralPlaces = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: rows = [], isLoading } = useCentralPlaceProfiles();
  const maxSolidi = Math.max(1, ...rows.map((r) => r.region_solidi ?? 0));

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Centralplatser — jämför vikingatida noder (Birka, Uppåkra, Köpingsvik, Hedeby, Gotland)"
        titleEn="Central places — comparing Viking-Age nodes"
        description="Kvantitativ jämförelse av vikingatida centralplatser som feature-vektor: gravar, undersökt andel, silverskatter, folkvandringstida solidi, mynt, hamn, import. Birka, Uppåkra, Köpingsvik, Hedeby, Gotland, Sigtuna, Söderköping."
        descriptionEn="Quantitative comparison of Viking-Age central places as a feature vector."
        keywords="Birka, Uppåkra, Köpingsvik, Hedeby, Gotland, Sigtuna, centralplats, emporium, vikingastad, solidus, silverskatt"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-gold" /> {sv ? 'Centralplatser' : 'Central places'}
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">
            {sv ? 'Jämför vikingatidens noder mot varandra' : 'Comparing the nodes of the Viking Age'}
          </p>
          <p className="text-muted-foreground text-lg">
            {sv
              ? '"Vikingastad" är inte en sak. Noderna spänner ett spektrum — kult-centralplats (Uppåkra) → emporium (Birka, Hedeby) → köping (Köpingsvik) → decentraliserat nät (Gotland). Här jämförs de som en feature-vektor, så typologin går att räkna på — inte bara beskriva.'
              : 'A "Viking town" is not one thing — the nodes span a spectrum from cult central place to emporium to trading köping to decentralised network.'}
          </p>
        </div>

        {/* Tyngdpunktsförskjutning: solidi (äldre guldlager) mot emporie-läget */}
        <Card className="viking-card mb-6 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300">
              <Coins className="h-5 w-5" /> {sv ? 'Guldets tyngdpunkt flyttade' : 'The centre of gold gravity shifted'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              {sv
                ? 'Folkvandringstida solidi (400–500-tal, SHM) samlades på Öland och Gotland — men det kungliga emporiet uppstod i det guldfattiga Mälaren (Birka). Guldregionerna blev inte huvudorten. Ett äldre rikedomslager, inte samtida med städerna.'
                : 'Migration-period solidi clustered on Öland and Gotland — yet the royal emporium arose in gold-poor Mälaren (Birka). An older wealth layer, not contemporary with the towns.'}
            </p>
            <ul className="space-y-1">
              {rows.filter((r) => (r.region_solidi ?? 0) > 0).sort((a, b) => (b.region_solidi ?? 0) - (a.region_solidi ?? 0)).map((r) => (
                <li key={r.id} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 truncate text-foreground">{r.name}</span>
                  <span className="flex-1 h-2 rounded bg-slate-800 overflow-hidden">
                    <span className="block h-full bg-amber-500" style={{ width: `${((r.region_solidi ?? 0) / maxSolidi) * 100}%` }} />
                  </span>
                  <span className="w-14 shrink-0 text-right tabular-nums text-amber-300">{r.region_solidi}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs opacity-80">{sv ? 'Solidi per landskap ur solidi-corpuset (SHM CC BY).' : 'Solidi per province from the SHM corpus.'}</p>
          </CardContent>
        </Card>

        <TradeFlowPanel sv={sv} />

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <>
            {/* Jämförelsetabell (scrollar horisontellt på mobil) */}
            <div className="overflow-x-auto rounded-lg border border-border mb-6">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60 text-slate-200">
                  <tr>
                    {[sv ? 'Nod' : 'Node', sv ? 'Typ' : 'Type', 'Period', sv ? 'Undersökt' : 'Excavated', sv ? 'Silverskatter' : 'Hoards', 'Solidi', sv ? 'Mynt' : 'Mint', sv ? 'Hamn' : 'Harbour', sv ? 'Efterträdare' : 'Successor'].map((h) => (
                      <th key={h} className="text-left font-medium px-3 py-2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const k = kindInfo(r.kind);
                    return (
                      <tr key={r.id} className="border-t border-border/60 hover:bg-slate-800/30">
                        <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{r.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: k.color }} />{k.sv}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{yr(r.period_start)}–{yr(r.period_end)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{r.sample_pct != null ? `${r.sample_pct}%` : '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap tabular-nums text-muted-foreground">{r.silver_hoards ?? '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap tabular-nums text-amber-300">{r.region_solidi ?? '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{bool(r.has_mint)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{bool(r.has_harbour)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{r.successor && r.successor !== '—' ? r.successor : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Per-nod-kort med tolkning + urvalsnot + källa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rows.map((r) => {
                const k = kindInfo(r.kind);
                return (
                  <Card key={r.id} className="viking-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-foreground flex items-center gap-2">
                        {r.has_harbour ? <Anchor className="h-4 w-4 text-cyan-400" /> : <Landmark className="h-4 w-4 text-gold" />}
                        {r.name}
                        <Badge variant="outline" className="text-xs" style={{ borderColor: k.color, color: k.color }}>{k.sv}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      {r.significance && <p className="text-foreground/90">{r.significance}</p>}
                      {r.imports && <p><span className="text-slate-400">{sv ? 'Import:' : 'Imports:'}</span> {r.imports}</p>}
                      {r.cult_evidence && <p><span className="text-slate-400">{sv ? 'Kult:' : 'Cult:'}</span> {r.cult_evidence}</p>}
                      {r.sample_note && (
                        <p className="flex items-start gap-1.5 text-xs bg-amber-950/20 border border-amber-700/30 rounded p-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-300 shrink-0 mt-0.5" />{r.sample_note}
                        </p>
                      )}
                      <p className="text-xs opacity-70">
                        {sv ? 'Källa:' : 'Source:'} {r.source}{r.confidence ? ` · ${sv ? 'säkerhet' : 'confidence'}: ${r.confidence}` : ''}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-6 opacity-80">
              {sv
                ? 'Förbehåll: siffror är litteraturvärden med redovisad säkerhet. "Undersökt" gör urvalsbegränsningen explicit — Birkas 37 % (Stolpe) är ett stickprov, inte en totalräkning. Solidi = folkvandringstida guld (äldre lager), inte städernas samtida ekonomi.'
                : 'Caveat: figures are literature values with stated confidence. "Excavated" makes the sampling limit explicit — Birka’s 37% is a sample, not a census. Solidi = Migration-period gold, not the towns’ contemporary economy.'}
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CentralPlaces;
