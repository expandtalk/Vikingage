import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, FlaskConical, Info, Compass } from 'lucide-react';
import { useCentralPlaces, type CentralPlaceName } from '@/hooks/useCentralPlaces';

// Centralortsprojektet Ångermanland — delbar forskningssida. Läser central_places
// + central_place_names live. Medvetet tydlig med vad som saknas (koordinater/
// geokodning) och hur kollegor kan testa materialet (räckvidds-sonden på kartan).

const CAT = {
  sacral: { label: 'Sakralt', color: '#c084fc' },
  power: { label: 'Makt', color: '#3b82f6' },
} as const;
const catMeta = (c: string | null) => CAT[(c ?? '') as keyof typeof CAT] ?? { label: c ?? '—', color: '#94a3b8' };

const NameRow: React.FC<{ n: CentralPlaceName }> = ({ n }) => {
  const cat = catMeta(n.category);
  return (
    <div className="py-2 border-b border-slate-800/60 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-foreground font-medium text-sm">{n.name}</span>
        {n.attested_form && (
          <span className="text-xs text-muted-foreground italic">
            {n.attested_form}{n.attested_year ? ` (${n.attested_year})` : ''}
          </span>
        )}
        <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: cat.color + '22', color: cat.color }}>
          {cat.label}
        </Badge>
        {(n.element_keys ?? []).map((k) => (
          <span key={k} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-300">{k}</span>
        ))}
      </div>
      {n.interpretation && <p className="text-xs text-muted-foreground mt-1">{n.interpretation}</p>}
    </div>
  );
};

const Angermanland = () => {
  const { data: groups = [], isLoading } = useCentralPlaces();
  const totalNames = groups.reduce((s, g) => s + g.names.length, 0);

  const tierNames = (names: CentralPlaceName[], tier: string) =>
    names.filter((n) => n.evidence_tier === tier).sort((a, b) => a.name.localeCompare(b.name, 'sv'));

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Centralortsprojektet Ångermanland"
        titleEn="The Ångermanland central-places project"
        description="Forskningssida: ortnamnskluster kring maktens och kultens noder i Ångermanland (Nora, Torsåker, Härnösand–Säbrå). Reproducerbar metod, källförd, med redovisade osäkerheter."
        descriptionEn="Research page: place-name clusters around the nodes of power and cult in Ångermanland."
        keywords="Ångermanland, centralort, ortnamn, ortnamnskluster, Nora, Torsåker, Säbrå, sakrala ortnamn, vikingatid"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-gold" />
            Centralortsprojektet Ångermanland
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Ortnamnskluster kring maktens och kultens noder</p>
          <p className="text-muted-foreground text-lg">
            Tre centralorter i Ångermanland — <strong>Nora</strong>, <strong>Torsåker</strong> och{' '}
            <strong>Härnösand–Säbrå</strong> — där sakrala och maktrelaterade ortnamn tätnar kring en nod
            (en sockenkyrka på tidigare hovplats, en kungsgård). Hypotesen: kyrkorna restes vid maktens och
            kultens redan etablerade centrum. Materialet är en <em>hypotes</em> — en reproducerbar,
            källförd metod, inte en färdig slutsats.
          </p>
        </div>

        {/* STATUS — vad som finns och vad som saknas (tydligt, medvetet) */}
        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300">
              <AlertTriangle className="h-5 w-5" /> Status: vad som finns och vad som saknas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Finns:</strong> {groups.length} centralorter och {totalNames} kluster-namn, var och en klassad efter namnled (sakralt/makt), evidensnivå (kärna/utvidgad) och en tolkning. Allt är läsbart nedan.</p>
            <p><strong className="text-foreground">Saknas (nästa steg):</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Koordinater.</strong> Varken centralorterna eller namnen är geokodade ännu (koordinat = tom). Därför finns inga kartnålar — det ligger som textmaterial. Geokodningen ska göras mot <em>auktoritativ källa</em> (Lantmäteriets ortnamn / RAÄ), inte gissas.</li>
              <li><strong>Baslinje per landskap.</strong> För att pröva att klustren är verkliga (och inte en artefakt av urvalet) behöver namnen mätas mot en baslinje av vanliga bebyggelsenamn i samma område.</li>
              <li><strong>Belägg-år</strong> saknas för många namn (äldsta skriftliga formen är ifylld bara där den är känd).</li>
            </ul>
            <p className="text-xs opacity-80">Konfidens är satt till <em>hypotes</em> på hela datasetet — behandla tolkningarna (⚠ i texten markerar de osäkraste) som uppslag att pröva, inte som fastställda.</p>
          </CardContent>
        </Card>

        {/* SÅ TESTAR DU — hur kollegor jobbar med materialet */}
        <Card className="viking-card mb-4 border-sky-700/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-sky-300">
              <FlaskConical className="h-5 w-5" /> Så testar du materialet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Materialet går att pröva rumsligt redan nu, utan att namnen är geokodade:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Öppna <Link to="/explore" className="text-gold hover:underline">kartan (Utforska)</Link> och navigera till centralorten.</li>
              <li><strong>Högerklicka</strong> på platsen (eller klicka på ett objekt) → välj <em>“Mät räckvidd härifrån”</em>.</li>
              <li>Välj <strong>form</strong> (cirkel/fyrkant/hexagon) och <strong>radie</strong> — t.ex. knappen <em>“Daglig maskvidd 9 km”</em> (gångavstånd från ett centrum).</li>
              <li>Läs antalet objekt inuti formen, och <strong>exportera</strong> resultatet till GeoJSON (QGIS) eller CSV för att jobba vidare i egna verktyg.</li>
            </ol>
            <p>Vill du bidra med data? En komplett, geokodad ortnamnslista (Lantmäteriet via Geotorget, CC0) låter oss placera alla namn på kartan och köra baslinjetest per landskap.</p>
            <p className="flex items-start gap-2 text-xs bg-slate-800/40 rounded p-2 mt-1">
              <Info className="h-4 w-4 text-sky-300 shrink-0 mt-0.5" />
              <span><strong className="text-foreground">Åtkomst:</strong> sidan och kartan är öppna — ingen inloggning behövs för att läsa, mäta räckvidd eller exportera. Inloggning krävs bara om du vill <em>spara</em> dina egna hypotes-ytor till ett konto.</span>
            </p>
            <div className="pt-1">
              <Link to="/explore" className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">
                <Compass className="h-4 w-4" /> Öppna kartan
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* CENTRALORTERNA */}
        {isLoading ? (
          <p className="text-muted-foreground">Laddar…</p>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => {
              const core = tierNames(g.names, 'core');
              const extended = tierNames(g.names, 'extended');
              return (
                <Card key={g.id} className="viking-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gold" /> {g.name}
                      <Badge variant="secondary" className="text-xs ml-1">{g.names.length} namn</Badge>
                    </CardTitle>
                    {g.description && <p className="text-sm text-muted-foreground mt-1">{g.description}</p>}
                  </CardHeader>
                  <CardContent>
                    {core.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-foreground mb-1">Kärna (starkast belägg)</div>
                        {core.map((n) => <NameRow key={n.id} n={n} />)}
                      </div>
                    )}
                    {extended.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-foreground mb-1">Utvidgad hypotes {`(⚠ = mest osäker)`}</div>
                        {extended.map((n) => <NameRow key={n.id} n={n} />)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6 opacity-75">
          Källa: Forskningsdokument (Daniel 2026). Metoden delar namnledskatalog och hypotestestare med{' '}
          <Link to="/sv/ortnamn" className="text-gold hover:underline">ortnamnssidan</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Angermanland;
