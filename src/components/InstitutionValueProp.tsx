import React from 'react';
import { Building2, Landmark, MapPinned, ShieldCheck, ScrollText } from 'lucide-react';

// "Vad har vi för nytta av det?" — värdeförslag för OFFENTLIG SEKTOR (kommun/region/museum).
// Svaret på museichefens "what's in it for me?". Framing: RISKREDUCERING + BESTÄLLARKOMPETENS +
// SYNLIGHET, inte automatisering. Vi kompletterar RAÄ Fornsök/K-samsök, konkurrerar inte.

const ACTORS = [
  {
    icon: Building2,
    sv: { role: 'Kommun', head: 'Beställarkompetens i planprocessen',
      body: 'En kommun ska beakta kulturvärden i detaljplan, bygglov och MKB — men saknar ofta egen antikvarie. Alva (arkeolog) + Kåre (datakvalitet) ger ett förstadium: vad finns i Fornsök inom planområdet, vad är lämning kontra observation, vad saknar koordinat, vad behöver faktiskt utredas. Det ersätter inte konsulten — men skillnaden mellan att beställa rätt och fel utredning är hela kostnaden för en omtagning. Att kunna granska en rapport = förhandlingsläge.' },
    en: { role: 'Municipality', head: 'Commissioning competence in planning',
      body: 'Municipalities must weigh heritage in zoning, permits and EIA — but rarely have an in-house antiquarian. Alva + Kåre give a pre-stage: what is registered in Fornsök within the plan area, find vs observation, what lacks coordinates, what actually needs investigation. It does not replace the consultant — but ordering the right survey instead of the wrong one is the whole cost of a redo.' },
  },
  {
    icon: MapPinned,
    sv: { role: 'Region', head: 'Regional kulturmiljö & infrastruktur',
      body: 'Regionerna äger länsmuseerna och har kulturplaner att revidera. Värdet är analys man idag inte gör alls: mönster över hela länet, kopplingar mellan ortnamn, fornlämningar och dagens tätortsstruktur, underlag till infrastrukturplaner. Vera (vägar) + Gudrun (kulturgeograf) gör least-cost-path över gamla färdvägar — precis den regionala analys ingen enskild kommun beställer.' },
    en: { role: 'Region', head: 'Regional heritage & infrastructure',
      body: 'Regions own the county museums and revise cultural plans. The value is analysis no one does today: patterns across the whole county, links between place names, monuments and today’s settlement structure. Vera + Gudrun model least-cost paths over ancient routes — regional analysis no single municipality commissions.' },
  },
  {
    icon: Landmark,
    sv: { role: 'Museum', head: 'Datakvalitet, förmedling & synlighet',
      body: 'Tre saker: (1) Datakvalitet — Kåre pekar systematiskt ut vilken verifierad källa som skulle fylla en lucka (koordinat, proveniens, datering); han föreslår, skriver aldrig själv. (2) Förmedling — Saga/Ragna sänker kostnaden för utställningstext och skyltar; att texten är märkt AI-tolkning och länkar till källan är själva säljargumentet för en institution vars valuta är trovärdighet. (3) Synlighet — Unn ger WCAG 2.2 AA + maskinläsbar markup med samma medel: både DOS-lagens plikt OCH synlighet i AI-genererade svar. Budgeten finns redan.' },
    en: { role: 'Museum', head: 'Data quality, outreach & visibility',
      body: 'Three things: (1) Data quality — Kåre pinpoints which verified source would fill a gap (coordinate, provenance, dating); it proposes, never writes on its own. (2) Outreach — Saga/Ragna cut the cost of exhibition text; the AI-labelled, source-linked text is itself the selling point for an institution whose currency is trust. (3) Visibility — Unn delivers WCAG 2.2 AA + machine-readable markup at once: both accessibility-law duty and visibility in AI-generated answers.' },
  },
];

export const InstitutionValueProp: React.FC<{ sv: boolean }> = ({ sv }) => (
  <section className="mb-12 rounded-xl border border-gold/40 bg-gold/5 p-5">
    <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-foreground">
      <ShieldCheck className="h-6 w-6 text-gold" />
      {sv ? 'För kommuner, regioner & museer' : 'For municipalities, regions & museums'}
    </h2>
    <p className="mb-4 max-w-3xl text-muted-foreground leading-relaxed">
      {sv
        ? 'Vad har ni för nytta av Viking Age? Kort: riskreducering och beställarkompetens — inte automatisering. Varje påstående bär källa och konfidens, claims befordras till kanon först efter mänsklig granskning, och en drift-vakt stämmer av. Det är det som gör att en offentlig aktör — där myndighetsutövning kräver spårbarhet — vågar använda AI alls.'
        : 'What’s in it for you? In short: risk reduction and commissioning competence — not automation. Every claim carries a source and confidence, claims reach canon only after human review, and a drift-guard reconciles daily. That is what lets a public actor — where decisions require traceability — use AI at all.'}
    </p>
    <div className="grid gap-3 md:grid-cols-3">
      {ACTORS.map((a) => {
        const t = sv ? a.sv : a.en;
        return (
          <div key={t.role} className="viking-card rounded-lg border border-border p-4">
            <div className="mb-1 flex items-center gap-2">
              <a.icon className="h-5 w-5 text-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-300/80">{t.role}</span>
            </div>
            <h3 className="mb-1 font-semibold text-foreground">{t.head}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{t.body}</p>
          </div>
        );
      })}
    </div>
    <div className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
      <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
      <p>
        {sv
          ? <>Vi <strong>kompletterar</strong> RAÄ:s Fornsök och K-samsök — vi gör deras data användbar i en lokal beslutsprocess, vi konkurrerar inte. Vi kan leverera källkritiska agenter (utredning &amp; förslag, människa-i-loopen) och <strong>inbäddade kartor som följer WCAG 2</strong>. Ärligt: upphandlingsreglerna avgör (kolla direktupphandlingsgränsen), och första frågan på mötet — var data ligger och vem som ser den — har vi svaret på (cookiefri drift, se integritetssidan.)</>
          : <>We <strong>complement</strong> the National Heritage Board’s Fornsök and K-samsök — we make their data usable in a local decision process, we don’t compete. We can deliver source-critical agents (investigation &amp; proposals, human-in-the-loop) and <strong>embedded maps that meet WCAG 2</strong>. Honestly: procurement rules decide, and the first meeting question — where the data sits and who can see it — we have an answer for.</>}
      </p>
    </div>
  </section>
);
