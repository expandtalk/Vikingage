import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { HelmetViewer } from '../components/HelmetViewer';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldHalf, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/vendelhjalmar — källgranskad sida om vendelhjälmarna med SHM:s 3D-modeller (CC-BY 4.0,
// SweDigArch), cookie-fritt självhostade (GLB på FTP /models/). Korslänkad till platssidorna.

const HELMETS = [
  { slug: 'vendel-i',  name: 'Vendelhjälm I',  zen: 'https://doi.org/10.5281/zenodo.19732145',
    sketch: 'https://sketchfab.com/3d-models/the-vendel-i-helmet-5a810a3e22034e2e89f3fcfe519e0557',
    descSv: 'Prakthjälm av järn med ögonbågsbeslag ("glasögonhjälm"). Utställd i Guldrummet, Historiska museet.',
    descEn: 'Iron parade helmet with eyebrow fittings ("spectacle helmet"). Displayed in the Gold Room, Historiska museet.' },
  { slug: 'vendel-xii', name: 'Vendelhjälm XII', zen: 'https://doi.org/10.5281/zenodo.19730836',
    sketch: 'https://sketchfab.com/historiska',
    descSv: 'Prakthjälm av järn med öppning för ögonen, dekorerad med ett stiliserat ormhuvud.',
    descEn: 'Iron parade helmet with eye openings, decorated with a stylised serpent head.' },
  { slug: 'vendel-xiv', name: 'Vendelhjälm XIV', zen: 'https://doi.org/10.5281/zenodo.19731493',
    sketch: 'https://sketchfab.com/3d-models/the-vendel-xiv-helmet-be9b5be8d76642e6b54fcf2983c6275f',
    descSv: 'Prakthjälm av järn med näs- och halsskydd. Utställd i Forntider, Historiska museet.',
    descEn: 'Iron parade helmet with nasal and neck guard. Displayed in Forntider, Historiska museet.' },
];

const Vendelhjalmar: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Vendelhjälmar — prakthjälmar i 3D"
        titleEn="Vendel helmets — parade helmets in 3D"
        description="Vendelhjälmarna från båtgravarna i Vendel, Valsgärde och Ultuna — nordiska kamhjälmar med ögonbågsbeslag. Historiska museets 3D-skanningar (CC-BY 4.0, SweDigArch), cookie-fritt inbäddade."
        descriptionEn="The Vendel helmets from the boat graves at Vendel, Valsgärde and Ultuna — Nordic comb helmets with eyebrow fittings. Historiska museet's 3D scans (CC-BY 4.0, SweDigArch)."
        keywords="vendelhjälm, vendeltid, båtgrav, Vendel, Valsgärde, Ultuna, prakthjälm, kamhjälm, Sutton Hoo, 3D, SweDigArch"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
          <ShieldHalf className="h-8 w-8 text-gold" />{sv ? 'Vendelhjälmar' : 'Vendel helmets'}
        </h1>
        <div className="space-y-3 text-muted-foreground max-w-3xl mb-6">
          <p>
            {sv
              ? 'Mellan 1881 och 1893 upptäcktes ett omfattande båtgravfält från sen germansk järnålder vid Vendels kyrka i Uppland. Fynden var så anmärkningsvärda att platsen fick ge namn åt hela perioden 550–750 e.Kr. — vendeltiden.'
              : 'Between 1881 and 1893 a substantial boat-grave field from the late Germanic Iron Age was found at Vendel church in Uppland. The finds were so remarkable that the site gave its name to the whole period 550–750 CE — the Vendel Period.'}
          </p>
          <p>
            {sv
              ? <>De ikoniska hjälmarna från de rika båtgravarna i <strong className="text-foreground">Vendel, Valsgärde och Ultuna</strong> tillhör de nordiska <strong className="text-foreground">kamhjälmarna</strong> — samma grupp som prakthjälmen i Gamla Uppsalas västhög och den angelsaxiska hjälmen från Sutton Hoo. De kännetecknas av sina ögonbågsbeslag ("glasögonhjälm"), en hjälmkam som avslutas med djurhuvuden, nackskydd av järnplåt eller ringbrynja, och ytor dekorerade med pressbleck i brons.</>
              : <>The iconic helmets from the rich boat graves at <strong className="text-foreground">Vendel, Valsgärde and Ultuna</strong> belong to the Nordic <strong className="text-foreground">comb helmets</strong> — the same group as the parade helmet in the western mound at Gamla Uppsala and the Anglo-Saxon helmet from Sutton Hoo. They are marked by their eyebrow fittings ("spectacle helmet"), a crest ending in animal heads, a neck guard of iron plate or ring-mail, and surfaces decorated with pressed bronze foil.</>}
          </p>
          <p className="text-[13px] opacity-90">
            {sv
              ? 'Vendelhjälmar förväxlas ofta med vikingatida hjälmar — av vilka dock, med undantag för den norska hjälmen från Gjermundbu, ingen enda bevarats i sin helhet.'
              : 'Vendel helmets are often confused with Viking-age helmets — of which, apart from the Norwegian helmet from Gjermundbu, not a single one survives intact.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HELMETS.map((h) => (
            <Card key={h.slug} className="viking-card">
              <CardContent className="p-3">
                <HelmetViewer
                  src={`/models/${h.slug}.glb`}
                  alt={h.name}
                  heightClass="h-[300px]"
                  attribution={
                    <>3D: Historiska museet/SHM · CC-BY 4.0 · SweDigArch · <a href={h.zen} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Zenodo</a> · <a href={h.sketch} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Sketchfab</a></>
                  }
                />
                <h2 className="text-lg font-semibold text-foreground mt-2">{h.name}</h2>
                <p className="text-xs text-muted-foreground">{sv ? h.descSv : h.descEn}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/sv/plats/valsgarde" className="inline-flex items-center gap-1 text-gold hover:underline text-sm">
            <MapPin className="h-4 w-4" />{sv ? 'Platsen: Valsgärde båtgravfält' : 'The place: Valsgärde boat-grave field'}
          </a>
        </div>

        <div className="mt-8 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-sm text-muted-foreground max-w-3xl space-y-2">
          <p className="text-foreground font-medium">{sv ? 'Om 3D-modellerna' : 'About the 3D models'}</p>
          <p>
            {sv
              ? 'Skanningarna är gjorda av Statens historiska museer inom SweDigArch (nationell forskningsinfrastruktur för digital arkeologi, ledd av Uppsala universitet, Vetenskapsrådet 2022–2027) och ingår i den europeiska kulturarvskampanjen "Twin it!". Tekniken är fotogrammetri (Structure from Motion). Modellerna är fritt återanvändbara under CC-BY 4.0 med angiven källa.'
              : 'The scans were made by the National Historical Museums within SweDigArch (a national research infrastructure for digital archaeology led by Uppsala University, funded by the Swedish Research Council 2022–2027) and form part of the European heritage campaign "Twin it!". The technique is photogrammetry (Structure from Motion). The models are freely reusable under CC-BY 4.0 with attribution.'}{' '}
            <a href="https://historiska.se/utforska-historien/kunskapsbank/3d-vendelhjalmar/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">historiska.se →</a>
          </p>
          <p className="text-[11px] opacity-75">
            {sv
              ? 'Vi bäddar in modellerna cookie-fritt (självhostad visare, inga tredjeparts-skript). Ser du en tom ruta är GLB-filen ännu inte uppladdad till servern.'
              : 'We embed the models cookie-free (self-hosted viewer, no third-party scripts). An empty box means the GLB file has not yet been uploaded to the server.'}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Vendelhjalmar;
