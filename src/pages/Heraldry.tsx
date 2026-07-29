import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Bird, Coins as CoinsIcon, ScrollText, AlertTriangle } from 'lucide-react';
import { useHeraldryMotifs, useHeraldryArms, useTownArms, useHeraldryAttestations } from '@/hooks/useHeraldry';

// Heraldik & maktikonografi — forskningssida. Skiljer SYSTEM (ärftliga vapen, ca 1120–1150, importerat)
// från MOTIV (lejon/örn/krona med djup mediterran biografi; korp/Oden = förkristet, ärvdes EJ in = brottet).
// Data ur heraldik-domänen (iconographic_motifs / coats_of_arms / armorial_bearers / heraldic_attestations).

// Förkristna motiv (brott-exemplen) — visas skilt från de heraldiska.
const PRE_HERALDIC = new Set(['Korp', 'Valknut', 'Spjut (Gungner)', 'Åttabent häst (Sleipner)']);

const EVIDENCE_STYLE: Record<string, string> = {
  belagd: 'bg-green-800/70 text-green-100',
  omtvistad: 'bg-amber-700/70 text-amber-100',
  rekonstruerad: 'bg-blue-800/70 text-blue-100',
  tillskriven: 'bg-slate-700/70 text-slate-200',
};

const Heraldry: React.FC = () => {
  const { data: motifs } = useHeraldryMotifs();
  const { data: arms } = useHeraldryArms();
  const { data: townBearers } = useTownArms();
  const { data: attest } = useHeraldryAttestations();

  const allMotifs = motifs ?? [];
  const heraldicMotifs = allMotifs.filter((m) => !PRE_HERALDIC.has(m.name));
  const breakMotifs = allMotifs.filter((m) => PRE_HERALDIC.has(m.name));

  const allArms = arms ?? [];
  const folkung = allArms.find((a) => a.name.startsWith('Folkungavapnet'));
  const stora = allArms.find((a) => a.name.includes('stora riksvapen'));
  const lilla = allArms.find((a) => a.name.includes('lilla riksvapen'));
  const towns = (townBearers ?? []).slice();

  const attestations = attest ?? [];
  const coinAttest = attestations.filter((a) => a.target === 'coin');
  const breakAttest = attestations.filter(
    (a) => a.target === 'external' && a.iconographic_motifs && PRE_HERALDIC.has(a.iconographic_motifs.name),
  );

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Heraldik & maktikonografi — motiv, ätter, mynt och sigill"
        titleEn="Heraldry & power iconography — charges, dynasties, coins and seals"
        description="Forskningssida: svensk heraldik som ikoniskt teckensystem. Skiljer motivets djupa biografi (lejon, örn, krona) från heraldiken som system (ca 1120–1150, importerat). Bjälbolejonet, tre kronor, stadssigillen från Kalmar 1247, och mynt-beläggen. Källkritisk, med den nordiska symbolvärldens brott mot heraldiken."
        descriptionEn="Research page: Swedish heraldry as an iconographic sign system — charges, dynasties, coins and town seals from Kalmar 1247."
        keywords="heraldik, vapensköld, Bjälboätten, Folkungalejonet, tre kronor, stadssigill, Kalmar, mynt, Klackenberg, korpfana, Torslundaplåtarna"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-gold" /> Heraldik &amp; maktikonografi
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Motiv, ätter, mynt och sigill</p>
          <p className="text-muted-foreground text-lg">
            Heraldiken som <em>system</em> — ärftliga, regelstyrda sköldemärken — uppstår i nordvästra Europa
            ca 1120–1150 och når Norden färdig, som del av samma kulturpaket som riddarväsen, sigillbruk och
            kansli. Men <em>motiven</em> är årtusenden äldre: lejonet, örnen och kronan bär mediterrant och
            främreorientaliskt symbolkapital in i de nya vapnen. Sidan skiljer de två — och visar var det
            nordiska bröts av.
          </p>
        </div>

        {/* MOTIVEN */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold">
              <Crown className="h-5 w-5" /> Motiven — mediterran biografi
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            {heraldicMotifs.map((m) => (
              <div key={m.motif_id}>
                <div className="text-foreground font-medium">
                  {m.name}
                  {m.heraldic_term && <span className="text-muted-foreground font-normal"> · {m.heraldic_term}</span>}
                </div>
                {m.origin_note && <p className="text-xs leading-relaxed">{m.origin_note}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* BJÄLBOLEJONET */}
        {folkung && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold">
                <Shield className="h-5 w-5" /> Bjälbolejonet → riksvapnet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {folkung.blazon && <p><strong className="text-foreground">Blasonering:</strong> {folkung.blazon}</p>}
              <p>
                Ätten heter <strong className="text-foreground">Bjälboätten</strong> efter godset Bjälbo i
                Östergötland. Namnet <em>Folkungaätten</em> undviks: i medeltida källor är &quot;folkungar&quot; ett
                upprorriskt högfrälseparti i opposition mot Bjälbo-kungamakten — att döpa dynastin efter dess
                motståndare är bakvänt. Själva vapnet behåller dock det inarbetade namnet
                <em> Folkungalejonet</em>.
              </p>
              {stora && (
                <p>
                  Lejonet lever kvar i <strong className="text-foreground">stora riksvapnet</strong>
                  {stora.marshalling ? ` (${stora.marshalling})` : ''}. Obs: lilla riksvapnet är
                  <em> tre kronor</em>, inte lejonet — en vanlig förväxling.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* TRE KRONOR */}
        {lilla && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold">
                <Crown className="h-5 w-5" /> Tre kronor — omtvistat ursprung
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {lilla.blazon && <p><strong className="text-foreground">Blasonering:</strong> {lilla.blazon}</p>}
              {lilla.notes && <p>{lilla.notes}</p>}
              {lilla.origin_theories && lilla.origin_theories.length > 0 && (
                <div>
                  <div className="text-foreground text-xs uppercase tracking-wide mb-1">Ursprungsteorier (samexisterar)</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {lilla.origin_theories.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STADSSIGILLEN */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold">
              <ScrollText className="h-5 w-5" /> Stadssigillen — offentlig heraldik från 1200-talet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Sveriges offentliga heraldik går tillbaka till 1200-talet. <strong className="text-foreground">Kalmar</strong> är
              äldst — sigillet sitter på en handling sänd till Lübeck 1247–1269 och räknas som Nordens äldsta
              säkert daterbara stadsvapen (torn/kastal omgivet av vågor). Stockholms och Skaras sigill är kända
              först från 1280-talet.
            </p>
            {towns.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {towns.map((t) => (
                  <span key={t.id} className="inline-flex items-center gap-1 rounded border border-gold/25 bg-gold/5 px-1.5 py-0.5 text-xs">
                    <span className="text-foreground">{t.bearer_name}</span>
                    {t.period_start != null && <span className="text-muted-foreground">{t.period_start}</span>}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs opacity-80 pt-1">
              {towns.length} stadssigill i databasen. Dateringarna kommer ur en onlinesammanställning och ska
              verifieras mot Nevéus &amp; Kälde, <em>Ny svensk vapenbok</em> (1992).
            </p>
          </CardContent>
        </Card>

        {/* PÅ MYNTEN */}
        {coinAttest.length > 0 && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold">
                <CoinsIcon className="h-5 w-5" /> På mynten &amp; sigillen
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p className="text-xs opacity-80">Vapen och motiv belagda i metall — myntningen var statsheraldikern Henrik Klackenbergs forskningsfält (<em>Moneta nostra</em>, 1992).</p>
              <ul className="space-y-1.5">
                {coinAttest.map((a) => (
                  <li key={a.attestation_id} className="flex items-start gap-2">
                    <Badge className={`${EVIDENCE_STYLE[a.evidence_class] ?? 'bg-slate-700'} shrink-0 mt-0.5`}>{a.evidence_class}</Badge>
                    <span>
                      <span className="text-foreground">{a.coats_of_arms?.name ?? a.iconographic_motifs?.name}</span>
                      {(a.start_year != null) && <span className="text-muted-foreground"> · {a.start_year}{a.end_year && a.end_year !== a.start_year ? `–${a.end_year}` : ''}</span>}
                      {a.notes && <span className="block text-xs leading-relaxed">{a.notes}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* BROTTET */}
        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300">
              <Bird className="h-5 w-5" /> Brottet — den nordiska symbolvärlden ärvdes inte in
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Vikingatidens teckenvärld — korpfana, Odenssymbolik, djurornamentik — fördes <strong>inte</strong> över
              i heraldiken. Riddarmärkena importerades i stort sett färdiga söderifrån med kristnandet och
              1200-talets stormannaklass. Korp och &quot;valknut&quot; saknas i praktiken helt i det nordiska heraldiska
              materialet. Dessa motiv finns i databasen som förkristna belägg — aldrig länkade som anfäder till
              heraldiska vapen.
            </p>
            {breakMotifs.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {breakMotifs.map((m) => (
                  <Badge key={m.motif_id} variant="outline" className="border-amber-500/40 text-amber-200">{m.name}</Badge>
                ))}
              </div>
            )}
            {breakAttest.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {breakAttest.map((a) => (
                  <li key={a.attestation_id} className="flex items-start gap-2">
                    <Badge className={`${EVIDENCE_STYLE[a.evidence_class] ?? 'bg-slate-700'} shrink-0 mt-0.5`}>{a.evidence_class}</Badge>
                    <span>
                      <span className="text-foreground">{a.iconographic_motifs?.name}</span>
                      {a.target_ref && <span className="text-muted-foreground"> · {a.target_ref}</span>}
                      {a.notes && <span className="block text-xs leading-relaxed">{a.notes}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Källvärdering</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Belagd</strong> = fysiskt dokumenterat på objektet; <strong>omtvistad</strong> = tolkning (t.ex. Torslundaplåtens enögdhet är laserverifierad, men gudsidentifikationen är en — dominerande — tolkning).</li>
              <li>Tinkturregler följdes ej i nordisk 1400-talsheraldik; färger valideras aldrig mot regel.</li>
              <li>Svensk heraldik är i grunden <em>antagen</em>, inte beviljad — vem som helst fick ta sig ett vapen.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Heraldry;
