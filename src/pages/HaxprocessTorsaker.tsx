import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArticleProvenance } from '../components/ArticleProvenance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flame } from 'lucide-react';

// /sv/haxprocesserna-angermanland — berättelse-undersida om häxprocesserna i Ångermanland
// 1674–1675 ("det stora oväsendet", Torsåker). KÄLLKRITISK: varje påstående märks belagt/
// tradition/omdebatterat/kräver verifiering. Kärnvarning: den mest citerade dödssiffran (71)
// härrör ur Jöns Hornaeus 1771 — sen, andrahands, partisk källa. Koordinater DB-verifierade
// (ecclesiastical_sites/heritage_sites); Bålberget endast Wikipedia-koord → APPROXIMATIV.
// Underlag: historiker-agent 2026-08-16 (scratch-haxprocess-historiker.md), människa-i-loopen.

type StatusKind = 'belagt' | 'tradition' | 'omdebatterat' | 'overifierat';
const STAT: Record<StatusKind, { c: string; sv: string; en: string }> = {
  belagt: { c: '#22c55e', sv: 'Belagt', en: 'Attested' },
  tradition: { c: '#a855f7', sv: 'Tradition (Hornaeus 1771)', en: 'Tradition (Hornaeus 1771)' },
  omdebatterat: { c: '#f59e0b', sv: 'Omdebatterat', en: 'Disputed' },
  overifierat: { c: '#ef4444', sv: 'Kräver verifiering', en: 'Needs verification' },
};
const Stat: React.FC<{ k: StatusKind; sv: boolean }> = ({ k, sv }) => {
  const m = STAT[k];
  return (
    <Badge variant="secondary" className="text-[10px] align-middle"
      style={{ backgroundColor: m.c + '22', color: m.c, borderColor: m.c + '55' }}>
      {sv ? m.sv : m.en}
    </Badge>
  );
};

// De 11 anhalterna. Koordinater lat,lng. status: koordinatens/rollens belägg.
interface WP { n: number; sv: string; en: string; lat: number; lng: number; kind: 'church' | 'execution' | 'balberg'; role: StatusKind; note?: { sv: string; en: string } }
const WAYPOINTS: WP[] = [
  { n: 1, sv: 'Torsåkers kyrka', en: 'Torsåker church', lat: 63.0798, lng: 17.7416, kind: 'church', role: 'belagt', note: { sv: 'Samling och predikan 1 juni 1675.', en: 'Gathering and sermon, 1 June 1675.' } },
  { n: 2, sv: 'Sollefteå kyrka', en: 'Sollefteå church', lat: 63.1623, lng: 17.2845, kind: 'church', role: 'belagt', note: { sv: 'Kommissionen rannsakade här (konceptprotokoll bevarade).', en: 'The commission investigated here (concept protocols survive).' } },
  { n: 3, sv: 'Härnösands domkyrka', en: 'Härnösand cathedral', lat: 62.6311, lng: 17.9417, kind: 'church', role: 'belagt', note: { sv: 'Rättegångsnod i stiftsstaden.', en: 'Trial node in the cathedral town.' } },
  { n: 4, sv: 'Avrättningsplats, Härnösand', en: 'Execution site, Härnösand', lat: 62.6217, lng: 17.8142, kind: 'execution', role: 'belagt', note: { sv: 'RAÄ-registrerad avrättningsplats. Antal/datum för avrättningarna omdebatterade.', en: 'RAÄ-registered execution site. Numbers/dates disputed.' } },
  { n: 5, sv: 'Boteå kyrka', en: 'Boteå church', lat: 63.1354, lng: 17.7154, kind: 'church', role: 'belagt', note: { sv: 'Berörd av kommissionen; datumet 18 jan 1675 ej belagt.', en: 'Involved; the date 18 Jan 1675 is unattested.' } },
  { n: 6, sv: 'Nordingrå kyrka', en: 'Nordingrå church', lat: 62.9281, lng: 18.2886, kind: 'church', role: 'belagt', note: { sv: '113 personer undersöktes (undersökta ≠ avrättade); tidpunkten feb 1675 obelagd.', en: '113 people examined (examined ≠ executed); the date Feb 1675 is unattested.' } },
  { n: 7, sv: 'Ytterlännäs gamla kyrka', en: 'Ytterlännäs old church', lat: 63.0064, lng: 17.7074, kind: 'church', role: 'belagt', note: { sv: 'En av de tre socknar (Torsåker, Dal, Ytterlännäs) vars dömda brändes.', en: 'One of the three parishes whose condemned were burned.' } },
  { n: 8, sv: 'Bjärtrå kyrka', en: 'Bjärtrå church', lat: 62.9750, lng: 17.8806, kind: 'church', role: 'overifierat', note: { sv: 'Koordinat verifierad; att socknen drogs in i rannsakningarna är ej belagt.', en: 'Coordinate verified; parish involvement is unattested.' } },
  { n: 9, sv: 'Skogs kyrka', en: 'Skog church', lat: 62.9201, lng: 18.0509, kind: 'church', role: 'overifierat', note: { sv: 'Koordinat verifierad; sockenroll ej belagd.', en: 'Coordinate verified; parish role unattested.' } },
  { n: 10, sv: 'Nora kyrka', en: 'Nora church', lat: 62.8727, lng: 18.0844, kind: 'church', role: 'overifierat', note: { sv: 'Koordinat verifierad; sockenroll ej belagd.', en: 'Coordinate verified; parish role unattested.' } },
  { n: 11, sv: 'Bålberget (Häxberget)', en: 'Bålberget (Häxberget)', lat: 63.0498, lng: 17.6851, kind: 'balberg', role: 'omdebatterat', note: { sv: 'Massavrättningen 1 juni 1675. Koordinat endast ur Wikipedia (ej RAÄ/Wikidata) — APPROXIMATIV, kräver verifiering.', en: 'The mass execution of 1 June 1675. Coordinate from Wikipedia only — approximate, needs verification.' } },
];

const HaxMap: React.FC<{ sv: boolean }> = ({ sv }) => {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { preferCanvas: true, scrollWheelZoom: true });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 18,
    }).addTo(map);
    const pts: [number, number][] = [];
    WAYPOINTS.forEach((w) => {
      pts.push([w.lat, w.lng]);
      const isBal = w.kind === 'balberg';
      const isExec = w.kind === 'execution';
      const bg = isBal ? '#dc2626' : isExec ? '#991b1b' : '#f59e0b';
      const glyph = isBal ? '🔥' : isExec ? '†' : String(w.n);
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:${isBal ? 26 : 22}px;height:${isBal ? 26 : 22}px;border-radius:50%;background:${bg};border:2px solid ${isBal ? '#450a0a' : '#78350f'};display:flex;align-items:center;justify-content:center;font-size:${isBal ? 13 : 11}px;color:#fff;font-weight:700">${glyph}</div>`,
        iconSize: [isBal ? 26 : 22, isBal ? 26 : 22], iconAnchor: [isBal ? 13 : 11, isBal ? 13 : 11],
      });
      const status = STAT[w.role];
      L.marker([w.lat, w.lng], { icon, title: sv ? w.sv : w.en })
        .bindPopup(
          `<div style="max-width:250px"><b>${w.n}. ${sv ? w.sv : w.en}</b>` +
          `<br/><span style="font-size:10px;color:${status.c}">${sv ? status.sv : status.en}</span>` +
          (w.note ? `<div style="font-size:12px;color:#334155;margin-top:4px;line-height:1.35">${sv ? w.note.sv : w.note.en}</div>` : '') +
          '</div>')
        .addTo(map);
    });
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [34, 34] });
    return () => { map.remove(); mapRef.current = null; };
  }, [sv]);
  return (
    <div ref={elRef} role="region"
      aria-label={sv ? 'Karta över häxprocessernas platser i Ångermanland' : 'Map of witch-trial sites in Ångermanland'}
      className="w-full h-[520px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 520 }} />
  );
};

// En narrativsektion med statusmärkning.
const Part: React.FC<{ title: string; k?: StatusKind; sv: boolean; children: React.ReactNode }> = ({ title, k, sv, children }) => (
  <section className="mb-5">
    <h2 className="text-lg font-semibold text-foreground mb-1.5 flex flex-wrap items-center gap-2">
      {title}{k && <Stat k={k} sv={sv} />}
    </h2>
    <div className="text-sm leading-relaxed text-muted-foreground space-y-2">{children}</div>
  </section>
);

const HaxprocessTorsaker: React.FC = () => {
  const sv = !useLocation().pathname.toLowerCase().includes('witch-trials');

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Häxprocesserna i Ångermanland 1674–1675 — Torsåker"
        titleEn="The Ångermanland witch trials 1674–1675 — Torsåker"
        description="Det stora oväsendet i Ångermanland: trolldomskommissionen 1674, rannsakningarna i Sollefteå, Härnösand, Boteå och Nordingrå, och massavrättningen på Bålberget 1 juni 1675 — källkritiskt granskad."
        descriptionEn="Sweden's great witch-hunt in Ångermanland: the 1674 commission, the trials in Sollefteå, Härnösand, Boteå and Nordingrå, and the mass execution at Bålberget on 1 June 1675 — source-critically reviewed."
        keywords="häxprocesser, Torsåker, Bålberget, Häxberget, Ångermanland, det stora oväsendet, trolldom, 1675, Hornaeus, häxprocess"
        path={sv ? '/sv/haxprocesserna-angermanland' : '/en/witch-trials-angermanland'}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Flame className="h-8 w-8 text-gold" aria-hidden="true" />
            {sv ? 'Häxprocesserna i Ångermanland' : 'The Ångermanland witch trials'}
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">
            {sv ? '"Det stora oväsendet" · Torsåker 1674–1675' : '"The great commotion" · Torsåker 1674–1675'}
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {sv
              ? 'Häxjakten som vandrade norrut genom Sverige nådde Ångermanland 1674. Den kulminerade den 1 juni 1675 med en massavrättning på Bålberget vid Torsåker — beskriven som Sveriges mest omfattande häxprocess. Den här sidan följer processen plats för plats, och skiljer noga det belagda från det traderade.'
              : 'The witch-hunt that moved north through Sweden reached Ångermanland in 1674. It culminated on 1 June 1675 in a mass execution at Bålberget near Torsåker — described as Sweden’s largest witch trial. This page follows the process place by place, carefully separating the attested from the handed-down.'}
          </p>
        </div>

        {/* Källkritisk kärnvarning */}
        <div className="mb-6 rounded-lg border border-amber-600/40 bg-amber-950/20 p-4">
          <p className="text-sm text-foreground font-medium mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
            {sv ? 'Källkritisk varning om siffrorna' : 'A source-critical warning about the figures'}
          </p>
          <p className="text-sm text-muted-foreground">
            {sv
              ? 'Den mest citerade dödssiffran — 71 avrättade (65 kvinnor, 2 män, 4 pojkar) — och mycket av dramatiken härrör ytterst från Jöns Hornaeus "En sannfärdig berättelse" (tryckt 1771), skriven av sonsonen till en av processens drivande präster, omkring 96 år efter händelsen. Det är en sen, andrahands och partisk källa. Att siffran återkommer så enhetligt i moderna framställningar beror delvis på att de lånar av samma källa. De primära beläggen är rannsakningsprotokollen/domböckerna. Vi anger därför spann och attribution, aldrig en enskild siffra som fakta.'
              : 'The most-cited death toll — 71 executed (65 women, 2 men, 4 boys) — and much of the drama derive ultimately from Jöns Hornaeus’s account (printed 1771), written by the grandson of one of the driving priests, some 96 years after the event. It is a late, second-hand, partisan source. The primary evidence is the court records. We therefore give ranges and attribution, never a single figure as fact.'}
          </p>
        </div>

        <HaxMap sv={sv} />
        <p className="text-xs text-muted-foreground mt-2 mb-6 opacity-90">
          {sv
            ? 'Kartan visar elva anhalter. Kyrkorna och avrättningsplatsen i Härnösand har DB-verifierade koordinater (ecclesiastical_sites/heritage_sites, RAÄ). Bålberget (🔥) har endast en Wikipedia-koordinat och är därför approximativ. Bjärtrå, Skog och Nora har verifierade lägen men deras roll i just dessa rannsakningar är obelagd. Ingen linje ritas — detta är inte en färdväg utan platser i en historia.'
            : 'The map shows eleven stops. The churches and the Härnösand execution site have DB-verified coordinates (RAÄ). Bålberget (🔥) has only a Wikipedia coordinate and is therefore approximate. Bjärtrå, Skog and Nora have verified locations but their role in these particular trials is unattested. No line is drawn — these are places in a story, not a route.'}
        </p>

        <Part title={sv ? '1. Torsåkers kyrka, 1 juni 1675' : '1. Torsåker church, 1 June 1675'} k="tradition" sv={sv}>
          <p>{sv
            ? 'De dömda samlades i Torsåkers kyrka; kyrkoherden Johannes Erici Wattrangius höll predikan och nattvard gavs. Därefter fördes de till avrättningsberget Bålberget, där de halshöggs och brändes. Enligt traditionen restes tre bål — ett för var socken (Torsåker, Dal, Ytterlännäs). Själva massavrättningen är väl belagd; de färgstarka detaljerna (predikotext, gråtande mödrar) kommer från Hornaeus 1771.'
            : 'The condemned gathered in Torsåker church; the vicar Johannes Erici Wattrangius preached and communion was given. They were then taken to the execution hill Bålberget, beheaded and burned. Tradition says three pyres were raised — one per parish (Torsåker, Dal, Ytterlännäs). The mass execution itself is well attested; the vivid detail comes from Hornaeus 1771.'}</p>
        </Part>

        <Part title={sv ? '2. Europeisk bakgrund' : '2. European context'} k="belagt" sv={sv}>
          <p>{sv
            ? 'De europeiska häxförföljelserna kulminerade ca 1560–1660; det totala antalet avrättade i Europa är omdebatterat och anges inte här som en fast siffra. I Sverige dömdes uppskattningsvis ca 400 personer för trolldom ca 1492–1704, varav en stor del under "det stora oväsendet" 1668–1676. Den svenska särarten var Blåkulla-föreställningen och barnvittnena ("visgossar") — kringvandrande, ofta pojkar, som pekade ut vuxna.'
            : 'The European witch persecutions peaked c. 1560–1660; the total number executed in Europe is disputed and is not given here as a fixed figure. In Sweden roughly 400 people were tried for witchcraft c. 1492–1704, a large share during "the great commotion" 1668–1676. The Swedish hallmark was the Blåkulla belief and the child witnesses ("visgossar").'}</p>
        </Part>

        <Part title={sv ? '3. Hur jakten nådde Ångermanland' : '3. How the hunt reached Ångermanland'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Häxjakten spreds norrut: från Härjedalen och Dalarna (1668–1672) via Hälsingland upp till Ångermanland (1674–1675). Anklagelsemönstret — Blåkulla och barnvittnen — vandrade från bygd till bygd. Exakt vilket enskilt utpekande som startade processen i Torsåker bör beläggas i rannsakningsprotokollen.'
            : 'The hunt spread north: from Härjedalen and Dalarna (1668–1672) via Hälsingland up to Ångermanland (1674–1675). The accusation pattern — Blåkulla and child witnesses — travelled from district to district. Exactly which accusation started the Torsåker process should be verified in the court records.'}</p>
        </Part>

        <Part title={sv ? '4. Trolldomskommissionen (våren 1674)' : '4. The witchcraft commission (spring 1674)'} k="belagt" sv={sv}>
          <p>{sv
            ? 'En kommission för Ångermanland utsågs våren 1674, i litteraturen beskriven som den största under häxjakten. Konceptprotokoll finns bevarade för bl.a. Sollefteå, Boteå, Härnösand och Säbrå (KB/ARKEN). '
            : 'A commission for Ångermanland was appointed in spring 1674, described as the largest of the witch-hunt. Concept protocols survive for Sollefteå, Boteå, Härnösand and Säbrå (KB/ARKEN). '}
            <Stat k="overifierat" sv={sv} /> {sv ? 'Det ofta angivna datumet 19–20 september 1674 för ankomsten till Sollefteå har vi inte kunnat belägga.' : 'The often-cited date of 19–20 September 1674 for the arrival in Sollefteå could not be verified.'}</p>
        </Part>

        <Part title={sv ? '5. Härnösand — rätt och bål' : '5. Härnösand — court and pyre'} k="omdebatterat" sv={sv}>
          <p>{sv
            ? 'Stiftsstaden Härnösand var en central nod; kommissionen rannsakade där och i Säbrå. Antalet avrättade och de exakta datumen är osäkra: en sekundärkälla anger ca 40 avrättade den 18 november 1674, men det motsägs delvis av andra. Datumen 21 december 1674 och 15 januari 1675 har vi inte kunnat belägga. Kartan skiljer rättegångsnoden (domkyrkan) från den RAÄ-registrerade avrättningsplatsen.'
            : 'The cathedral town of Härnösand was a central node; the commission tried cases there and in Säbrå. The number executed and the exact dates are uncertain: one secondary source says c. 40 executed on 18 November 1674, but others disagree. The dates 21 December 1674 and 15 January 1675 could not be verified. The map separates the trial node (cathedral) from the RAÄ-registered execution site.'}</p>
        </Part>

        <Part title={sv ? '6. Boteå' : '6. Boteå'} k="overifierat" sv={sv}>
          <p>{sv
            ? 'Boteå ingick i kommissionens rannsakningar (konceptprotokoll bevarade); en process nämns för september 1674 (13 anklagade, åtta fällda, två dödsdömda). Det specifika datumet 18 januari 1675 för Boteå har vi inte kunnat belägga och kan vara en sammanblandning.'
            : 'Boteå was part of the commission’s investigations (protocols survive); a trial is noted for September 1674 (13 accused, eight convicted, two sentenced to death). The specific date 18 January 1675 for Boteå could not be verified and may be a conflation.'}</p>
        </Part>

        <Part title={sv ? '7. Nordingrå — 113 undersökta' : '7. Nordingrå — 113 examined'} k="belagt" sv={sv}>
          <p>{sv
            ? 'Nordingrå beskrivs som platsen för den största enskilda trolldomsrannsakningen i svensk historia, där 113 personer undersöktes under ca två veckor. Observera: "undersökta" är inte detsamma som "avrättade". Månaden februari 1675 är obelagd. För hela Ångermanland uppges ca 119 avrättningar under processerna.'
            : 'Nordingrå is described as the site of the largest single witchcraft investigation in Swedish history, with 113 people examined over about two weeks. Note: "examined" is not "executed". The month February 1675 is unattested. For all of Ångermanland, about 119 executions are cited.'}</p>
        </Part>

        <Part title={sv ? '8. 28 mars 1675 — nio avrättade?' : '8. 28 March 1675 — nine executed?'} k="overifierat" sv={sv}>
          <p>{sv
            ? 'Uppgiften att nio personer avrättades den 28 mars 1675 förekommer "enligt vissa källor" men är svagt belagd och saknar entydig primärkällehänvisning. Könsfördelningen ("nio kvinnor") kunde inte bekräftas. Redovisas här endast med tydlig reservation.'
            : 'The claim that nine people were executed on 28 March 1675 appears "according to some sources" but is weakly attested and lacks a clear primary reference. Reported here only with explicit reservation.'}</p>
        </Part>

        <Part title={sv ? '9. Bålberget 1 juni 1675 — och slutet' : '9. Bålberget 1 June 1675 — and the end'} k="omdebatterat" sv={sv}>
          <p>{sv
            ? 'Massavrättningen skedde på Häxberget (Bålberget) öster om Lesjön, där socknarna Torsåker, Dal och Ytterlännäs möts. Den mest citerade siffran är 71 avrättade (65 kvinnor, 2 män, 4 pojkar); andra källor skriver "ett sjuttiotal" eller "fler än 60". Logiken 60 (häradsrätten) + 11 (kommissionen) = 71 återkommer men vilar på samma tradering (Hornaeus 1771). En minnessten restes 1975.'
            : 'The mass execution took place at Häxberget (Bålberget) east of lake Lesjön, where Torsåker, Dal and Ytterlännäs parishes meet. The most-cited figure is 71 executed (65 women, 2 men, 4 boys); others say "about seventy" or "more than 60". A memorial stone was raised in 1975.'}</p>
          <p>{sv
            ? 'Om landshövding Carl (Larsson) Sparre är källorna motstridiga: en framställning gör honom till kommissionens ordförande, en annan till dess kritiker som fick processerna stoppade. Möjlig personförväxling — vi drar därför ingen entydig hjälte- eller bovroll. '
            : 'On the governor Carl (Larsson) Sparre the sources conflict: one makes him the commission’s chairman, another its critic who had the trials stopped. Possibly a confusion of persons — so we assign no clear hero/villain role. '}
            <Stat k="overifierat" sv={sv} /></p>
          <p>{sv
            ? 'Vändningen kom när barnvittnena ("visgossarna") avslöjades som ljugande; i Stockholm erkände vittnen att de hade ljugit. Kommissionsverksamheten stoppades och omprövades 1675–1676, och Uppsala-kommissionen upplöstes 1676 varefter trolldomsmål började avvisas.'
            : 'The turning point came when the child witnesses were exposed as liars; in Stockholm witnesses confessed they had lied. The commissions were halted and reviewed 1675–1676, and the Uppsala commission was dissolved in 1676, after which witchcraft cases began to be dismissed.'}</p>
        </Part>

        <ArticleProvenance
          sv={sv}
          reviewedDate="2026-08-16"
          sources={[
            'Rannsakningsprotokoll/domböcker, trolldomskommissionen i Ångermanland 1674 (KB/ARKEN) — primärkälla',
            'Jöns Hornaeus, En sannfärdig berättelse … (tryckt 1771) — sen, partisk traditionskälla',
            'Emanuel Linderholm, De stora häxprocesserna i Sverige (1918)',
            'Bengt Ankarloo, Trolldomsprocesserna i Sverige (1971)',
            'Alf Åberg, Häxorna (1989)',
            'Koordinat Bålberget: sv. Wikipedia "Häxberget" (approximativ, ej RAÄ/Wikidata)',
            'Koordinater kyrkor/avrättningsplats: ecclesiastical_sites & heritage_sites (RAÄ, CC0)',
          ]}
        />
        <p className="text-[12px] text-slate-500 mt-3 max-w-3xl">
          {sv
            ? 'Detaljsiffror (Härnösand, Boteå, 28 mars, 1 juni) och landshövding Sparres roll bör kollationeras mot Linderholm 1918, Ankarloo 1971 och domböckerna innan de befästs. Standardverken har ännu inte lästs i original för denna sida.'
            : 'Detailed figures and Sparre’s role should be collated against Linderholm 1918, Ankarloo 1971 and the court records before being fixed. The standard works have not yet been read in the original for this page.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default HaxprocessTorsaker;
