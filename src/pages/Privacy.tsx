import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/integritetspolicy + /en/privacy — ärlig, faktabaserad integritetsnotis. Sajten är cookie-fri:
// inga tracking-cookies, ingen banner. Disclosuren listar de FUNKTIONELLA tredjeparter som tar emot
// besökarens IP (bilder från RAÄ/SHM/Wikimedia, karttiles från OSM, cookie-fri analys via CortIQ).
// Uppgifterna är verifierade mot koden/DB 2026-08-08 — uppdatera om tredjeparter tillkommer.

const Privacy = () => {
  const { language } = useLanguage();
  const sv = language !== 'en';

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Integritetspolicy — cookie-fri sajt"
        titleEn="Privacy policy — a cookie-free site"
        description="Viking Age är cookie-fri: inga spårningscookies, ingen cookie-banner. Så här hanterar vi data och vilka funktionella tredjeparter som förekommer."
        descriptionEn="Viking Age is cookie-free: no tracking cookies, no cookie banner. How we handle data and which functional third parties are involved."
        keywords="integritetspolicy, privacy, cookie-fri, GDPR, dataskydd"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-3xl text-foreground">
        <article className="prose prose-invert max-w-none">
          {sv ? (
            <>
              <h1 className="font-norse">Integritetspolicy</h1>
              <p className="text-lg">
                Viking Age är byggd för att vara <strong>cookie-fri</strong>. Vi sätter inga
                spårningscookies, bygger inga besökarprofiler och visar därför ingen cookie-banner.
              </p>

              <h2>Webbstatistik (cookie-fritt)</h2>
              <p>
                Vi mäter besök med <strong>CortIQ</strong> (cortiq.se) i cookie-fritt läge. Statistiken är
                aggregerad och anonym — inga cookies, IP-adresser anonymiseras (maskas), ingen korssajtsspårning.
                Aggregerad statistik raderas automatiskt efter högst 1 år. Tjänsten identifierar även AI-robotar
                (t.ex. GPTBot, ClaudeBot, PerplexityBot) som hämtar sidorna. <strong>Rättslig grund:</strong> berättigat
                intresse (GDPR art. 6.1.f) — cookie-fri publikmätning utan profilering kräver inte samtycke, därför ingen banner.
              </p>

              <h2>Vad som sparas i din webbläsare</h2>
              <p>
                Dina inställningar (språk, kartläge, "nära mig"-radie, färdsätt, teckenförklaring m.m.) sparas
                lokalt i din webbläsare (localStorage) — de är förstaparts och delas inte med någon. Skapar du
                ett konto lagras en inloggningssession lokalt; den är nödvändig för att hålla dig inloggad.
              </p>

              <h2>Funktionella tredjeparter</h2>
              <p>
                För att visa kartor och historiska bilder hämtar din webbläsare innehåll direkt från källorna
                nedan. De tar då emot din IP-adress (standard för allt innehåll på webben), men de sätter inga
                cookies via oss och används inte för annonsering eller spårning:
              </p>
              <ul>
                <li><strong>Historiska bilder</strong> från kulturarvsinstitutioner: Riksantikvarieämbetet
                  (pub.raa.se), Statens historiska museer (media.samlingar.shm.se), Wikimedia Commons,
                  Kulturarvsdata (kulturarvsdata.se) samt enstaka andra museer och arkiv.</li>
                <li><strong>Kartunderlag</strong> från OpenStreetMap.</li>
                <li><strong>Webbstatistik</strong> via CortIQ (cookie-fritt, se ovan).</li>
              </ul>
              <p>
                Typsnittet är self-hostat — inga typsnitt laddas från Google. Vi använder ingen annonsering och
                inga tredjeparts spårningscookies.
              </p>

              <h2>Konto och forskarprofil</h2>
              <p>
                Du kan använda hela sajten utan konto. Ett konto behövs bara för att <strong>bidra</strong> —
                skriva i diskussioner, betygsätta, ladda upp foton eller dokument, dela position. När du skapar
                konto lagrar vi din e-postadress (för inloggning) samt de profilfält du själv väljer att fylla i.
                <strong> Rättslig grund:</strong> avtal (GDPR art. 6.1.b) — behandlingen är nödvändig för den
                kontotjänst du själv begär. Inloggningssessionen som lagras lokalt är <em>strikt nödvändig</em> och
                kräver därför inget samtycke (ingen banner). Kontodata lagras så länge du har kontot och raderas när
                du raderar det. Kontot lagras säkert hos vår databasleverantör (Supabase) med radnivåsäkerhet (RLS).
                Din anonyma webbstatistik kopplas <strong>aldrig</strong> till ditt konto — de två systemen hålls åtskilda.
              </p>
              <p>
                Din <strong>publika forskarprofil</strong> (<code>/forskare/ditt-handle</code>) visar bara de
                uppgifter du valt att göra publika: namn, institution, specialitet, bio och länkar. Din
                <strong> adress är valfri och alltid privat</strong> — den lagras i en separat, åtkomstskyddad
                tabell och visas aldrig publikt; endast du och administratörer kan läsa den.
              </p>
              <p>
                <strong>Bidrag granskas.</strong> Inlägg och uppladdningar publiceras inte automatiskt utan går
                via en granskningskö. Källkritik är plattformens kärna: inget visas som fakta ogranskat. Det du
                väljer att skriva publikt (t.ex. ett godkänt diskussionsinlägg) blir synligt tillsammans med det
                namn du angett.
              </p>

              <h2>AI-genererat innehåll</h2>
              <p>
                Delar av innehållet skapas med AI som hjälpmedel — datering och analys av runinskrifter,
                källförda sök-svar och AI-översättningar av public domain-text. Sådant innehåll är{' '}
                <strong>märkt som AI-genererat</strong> och en människa granskar och ansvarar för det innan
                det blir bestående. Vi genererar inga syntetiska bilder eller deepfakes — alla foton är
                riktiga och attribuerade. Full redogörelse (i förhållande till EU:s AI-förordning art. 50)
                finns på <a href="/vetenskapsmetodik" className="text-gold hover:underline">Vetenskapsmetodik och AI</a>.
              </p>

              <h2>Dina rättigheter</h2>
              <p>
                Eftersom vi inte samlar personuppgifter om anonyma besökare finns inget besökarregister att
                begära ut. Har du ett konto har du enligt GDPR rätt till: <strong>tillgång</strong> till dina
                uppgifter, <strong>rättelse</strong>, <strong>radering</strong> ("rätten att bli glömd"),
                <strong> begränsning</strong>, <strong>dataportabilitet</strong> och rätt att <strong>invända</strong>
                mot behandling. Det mesta gör du direkt själv: redigera din profil, ta bort din adress eller radera
                hela kontot via din profilsida. Vill du att ett publicerat bidrag tas bort, eller vill utöva någon
                annan rättighet, kontakta oss (se nedan).
              </p>
              <p>
                Du har också rätt att lämna klagomål till tillsynsmyndigheten, <strong>Integritetsskyddsmyndigheten
                (IMY)</strong>, imy.se.
              </p>

              <h2>Personuppgiftsansvarig &amp; kontakt</h2>
              <p>
                Personuppgiftsansvarig är <strong>Expandtalk Corporation AB</strong>.{' '}
              </p>
              <p>
                {/* TODO: Daniel — bekräfta personuppgiftsansvarig + kontaktadress innან publicering */}
                Frågor om integritet eller för att utöva dina rättigheter: <em>[kontakt-e-post fylls i av redaktören]</em>.
              </p>
              <p className="text-sm text-muted-foreground">Senast uppdaterad: 2026-08-18.</p>
            </>
          ) : (
            <>
              <h1 className="font-norse">Privacy policy</h1>
              <p className="text-lg">
                Viking Age is built to be <strong>cookie-free</strong>. We set no tracking cookies, build no
                visitor profiles, and therefore show no cookie banner.
              </p>

              <h2>Web analytics (cookie-free)</h2>
              <p>
                We measure visits with <strong>CortIQ</strong> (cortiq.se) in cookie-free mode. The statistics
                are aggregated and anonymous — no cookies, IP addresses are anonymised (masked), no cross-site
                tracking. Aggregated statistics are deleted automatically after at most 1 year. The service also
                identifies AI bots (e.g. GPTBot, ClaudeBot, PerplexityBot) fetching the pages. <strong>Legal basis:</strong>
                legitimate interest (GDPR art. 6.1.f) — cookie-free audience measurement without profiling needs no
                consent, hence no banner.
              </p>

              <h2>What is stored in your browser</h2>
              <p>
                Your settings (language, map mode, "near me" radius, travel mode, legend, etc.) are stored
                locally in your browser (localStorage) — first-party, shared with no one. If you create an
                account, a login session is stored locally; it is necessary to keep you signed in.
              </p>

              <h2>Functional third parties</h2>
              <p>
                To show maps and historical images, your browser fetches content directly from the sources
                below. They receive your IP address (standard for any web content), but they set no cookies via
                us and are not used for advertising or tracking:
              </p>
              <ul>
                <li><strong>Historical images</strong> from heritage institutions: the Swedish National Heritage
                  Board (pub.raa.se), the Swedish History Museum (media.samlingar.shm.se), Wikimedia Commons,
                  Kulturarvsdata (kulturarvsdata.se), and a few other museums and archives.</li>
                <li><strong>Map tiles</strong> from OpenStreetMap.</li>
                <li><strong>Web analytics</strong> via CortIQ (cookie-free, see above).</li>
              </ul>
              <p>
                Fonts are self-hosted — no fonts are loaded from Google. We use no advertising and no
                third-party tracking cookies.
              </p>

              <h2>Account and researcher profile</h2>
              <p>
                You can use the entire site without an account. An account is only needed to
                <strong> contribute</strong> — post in discussions, rate, upload photos or documents, share a
                position. When you create an account we store your email address (for login) and the profile
                fields you choose to fill in. <strong>Legal basis:</strong> contract (GDPR art. 6.1.b) — the
                processing is necessary for the account service you request. The login session stored locally is
                <em> strictly necessary</em> and therefore needs no consent (no banner). Account data is kept for as
                long as you have the account and is deleted when you delete it. The account is stored securely with our
                database provider (Supabase) with row-level security (RLS). Your anonymous web analytics are
                <strong> never</strong> linked to your account — the two systems are kept separate.
              </p>
              <p>
                Your <strong>public researcher profile</strong> (<code>/forskare/your-handle</code>) shows only
                the details you chose to make public: name, institution, field of expertise, bio and links. Your
                <strong> address is optional and always private</strong> — it is stored in a separate,
                access-protected table and never shown publicly; only you and administrators can read it.
              </p>
              <p>
                <strong>Contributions are reviewed.</strong> Posts and uploads are not published automatically;
                they go through a moderation queue. Source criticism is the core of the platform: nothing is
                shown as fact unchecked. What you choose to post publicly (e.g. an approved discussion post)
                becomes visible together with the name you provided.
              </p>

              <h2>AI-generated content</h2>
              <p>
                Some content is created with AI as an aid — dating and analysis of runic inscriptions,
                sourced search answers and AI translations of public-domain text. Such content is{' '}
                <strong>labelled as AI-generated</strong>, and a human reviews and takes responsibility for
                it before it becomes permanent. We generate no synthetic images or deepfakes — all photos
                are real and attributed. A full account (relative to EU AI Act art. 50) is on the{' '}
                <a href="/methodology" className="text-gold hover:underline">Scientific Methodology and AI</a> page.
              </p>

              <h2>Your rights</h2>
              <p>
                Since we collect no personal data about anonymous visitors, there is no visitor record to
                request. If you have an account you have, under GDPR, the right to: <strong>access</strong> your
                data, <strong>rectification</strong>, <strong>erasure</strong> ("right to be forgotten"),
                <strong> restriction</strong>, <strong>data portability</strong> and the right to <strong>object</strong>.
                Most of it you do yourself: edit your profile, remove your address, or delete the whole account from
                your profile page. To have a published contribution removed, or to exercise any other right, contact
                us (below).
              </p>
              <p>
                You also have the right to lodge a complaint with the supervisory authority — in Sweden the
                <strong> Swedish Authority for Privacy Protection (IMY)</strong>, imy.se.
              </p>

              <h2>Data controller &amp; contact</h2>
              <p>
                The data controller is <strong>Expandtalk Corporation AB</strong>. Privacy questions or to exercise
                your rights: <em>[contact email to be filled in]</em>.
              </p>
              <p className="text-sm text-muted-foreground">Last updated: 2026-08-18.</p>
            </>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
