import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cross, Info } from 'lucide-react';

// /sv/helgon — hubb för de nordiska/svenska helgonen. St Olof har egen sida; övriga faktarutor.
// Hederlighet: legenduppgifter (Erikslegenden, Sigfrids dop av Skötkonung) märks som legend.

interface Saint {
  name: string;
  life: string;
  note: string;
  place?: string;      // konkret plats vi HAR i datan
  href?: string;       // egen sida, eller djuplänk till kartan (?center=lat,lng&zoom=)
  linkLabel?: string;  // default "Läs mer →"
}
const SAINTS: Saint[] = [
  {
    name: 'Sankt Olof (Olav den helige)',
    life: 'Olav Haraldsson, † Stiklestad 1030',
    note: 'Norges kung och sjöfararnas skyddshelgon. En av Nordens starkaste kulter — kyrkor, offerkällor och pilgrimsvägar mot graven i Nidaros. Egen sida med kyrkoruin, Mälaren-seglingen och källkritik.',
    href: '/sv/sankt-olof',
  },
  {
    name: 'Sankt Erik (Erik den helige)',
    life: 'Erik Jedvardsson, kung, † enligt traditionen 1160',
    note: 'Sveriges skyddshelgon. Enligt Erikslegenden (nedtecknad senare) dräpt i Uppsala; hans reliker vilar i Uppsala domkyrka. Legendens historiska kärna är omdiskuterad — märks som legend.',
  },
  {
    name: 'Sankta Birgitta',
    life: 'Birgitta Birgersdotter, ca 1303–1373',
    note: 'Grundare av Birgittinorden och Vadstena kloster; kanoniserad 1391. Ett av Europas skyddshelgon. Hennes uppenbarelser (Revelationes) fick vidsträckt spridning. (Folkligt "S:t Britta".)',
    place: 'Birgittakyrkan i Kalmar (grundad 1440, numera historisk)',
    href: '/explore?center=56.6562,16.354&zoom=15',
    linkLabel: 'Visa på kartan →',
  },
  {
    name: 'Sankt Knut',
    life: 'Knut den helige (Knut IV av Danmark), † 1086',
    note: 'Danmarks skyddshelgon, populär vid Östersjön. Vid Gråborg på Öland ligger ruinen av det kapell som bar hans namn — en vallfarts- och marknadsplats invid en av öns stora fornborgar.',
    place: 'Sankt Knuts kapell vid Gråborg, Öland (ruin, 1100-tal–ca 1560)',
    href: '/explore?center=56.66792,16.60133&zoom=14',
    linkLabel: 'Visa på kartan →',
  },
  {
    name: 'Sankt Sigfrid',
    life: 'Missionsbiskop, 1000-tal',
    note: 'Knuten till Växjö och kristnandet av Småland/Värend. Enligt legenden döpte han Olof Skötkonung i Husaby — en legenduppgift, inte ett fast belägg.',
  },
  {
    name: 'Sankt Eskil',
    life: 'Engelsk missionsbiskop, martyr, 1000-tal',
    note: 'Verkade i Södermanland; enligt traditionen stenad vid Strängnäs/Tuna. Gav namn åt Eskilstuna.',
  },
  {
    name: 'Sankt David av Munktorp',
    life: 'Missionär, 1000-/1100-tal',
    note: 'Knuten till kristnandet av Västmanland; vördad vid Munktorp.',
  },
  {
    name: 'Sankt Botvid',
    life: 'Svensk lekmannamissionär, † ca 1120',
    note: 'Sörmländsk helgonkult; gav namn åt Botkyrka. Enligt legenden dräpt av en frigiven träl.',
  },
  {
    name: 'Sankta Helena (Elin) av Skövde',
    life: '1100-tal',
    note: 'Västgötsk helgonkvinna, vördad i Skövde; en av få inhemska kvinnliga helgon före Birgitta.',
  },
];

const Helgon = () => (
  <div className="min-h-screen viking-bg">
    <PageMeta
      title="Helgonen i Norden — Olof, Erik, Birgitta och de andra"
      titleEn="Saints of the North — Olav, Erik, Birgitta and the others"
      description="Översikt över de nordiska och svenska helgonen: Sankt Olof, Sankt Erik, Sankta Birgitta, Sankt Sigfrid, Sankt Eskil m.fl. Kult, legend och plats — med källkritik som skiljer belagg från legenduppgift."
      descriptionEn="An overview of the Nordic and Swedish saints: St Olav, St Erik, St Birgitta, St Sigfrid, St Eskil and more — cult, legend and place, with source criticism separating evidence from legend."
      keywords="helgon, Sankt Olof, Sankt Erik, Sankta Birgitta, Sankt Sigfrid, Sankt Eskil, Botvid, helgonkult, pilgrim, medeltid"
    />
    <Header />
    <Breadcrumbs />
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Cross className="h-8 w-8 text-gold" />
          Helgonen i Norden
        </h1>
        <p className="text-muted-foreground text-lg">
          De medeltida helgonen satte djupa spår i landskapet — kyrkor, källor, ortnamn och pilgrimsvägar.
          Här samlas de nordiska och svenska helgonen. <strong>Sankt Olof</strong> har en egen fördjupning;
          fler kan tillkomma. Legenduppgifter redovisas <em>som</em> legend, skilt från belagd historia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SAINTS.map((s) => (
          <Card key={s.name} className="viking-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gold">{s.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{s.life}</p>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p className="text-xs leading-relaxed">{s.note}</p>
              {s.place && <p className="text-[11px] text-gold/80">📍 {s.place}</p>}
              {s.href && (
                <Link to={s.href} className="text-gold hover:underline text-xs font-medium inline-block">
                  {s.linkLabel ?? 'Läs mer →'}
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          Faktauppgifter bygger på etablerad helgonforskning; legendmaterial (Erikslegenden, Sigfrids dop av
          Olof Skötkonung, Botvids död) redovisas som legend. Kung <strong>Olof Skötkonung</strong> är inte
          helgonet Olav — de hålls isär.
        </span>
      </p>
    </main>
    <Footer />
  </div>
);

export default Helgon;
