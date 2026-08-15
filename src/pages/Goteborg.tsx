import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { PlacePage } from '../components/place/PlacePage';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/goteborg — PILOT för den återanvändbara platssidan. Basen = PlaceMap (place_features_near):
// LOKALA lager runt Göteborg/Göta älvs mynning. Center verifierat mot DB (57.7072/11.9670).
// SKRÄDDARSYTT ovanpå basen: stadens FÖREGÅNGARE — källbelagda årtal (Vårt Göteborg, Wikipedia,
// Götaälvdalen), inga påhittade (INGEN GISSNING). En predecessor_of-KG-relation kan formaliseras senare.
const PREDECESSORS: { name: string; whenSv: string; whenEn: string; noteSv: string; noteEn: string; q: string }[] = [
  { name: 'Gamla Lödöse', whenSv: 'medeltid', whenEn: 'Middle Ages',
    noteSv: 'Handelsstad vid Göta älv uppströms — en av Sveriges äldsta städer och Göteborgs äldsta föregångare.',
    noteEn: 'Trading town upriver on the Göta River — one of Sweden’s oldest towns and Gothenburg’s earliest predecessor.', q: 'Lödöse' },
  { name: 'Gullbergs fäste', whenSv: 'ca 1303', whenEn: 'c. 1303',
    noteSv: 'Befästning nära Säveån vid älvmynningen.', noteEn: 'Fortress near the Säve River at the river mouth.', q: 'Gullberg' },
  { name: 'Lindholmens borg', whenSv: '1333', whenEn: '1333',
    noteSv: 'Borg på Hisingen.', noteEn: 'Castle on Hisingen.', q: 'Lindholmen' },
  { name: 'Älvsborg', whenSv: 'ca 1364–1389', whenEn: 'c. 1364–1389',
    noteSv: 'Slott som vaktade Göta älvs mynning (jfr Älvsborgs lösen).', noteEn: 'Castle guarding the mouth of the Göta River.', q: 'Älvsborg' },
  { name: 'Nya Lödöse', whenSv: '1473 – 1624', whenEn: '1473 – 1624',
    noteSv: 'Grundad 17 aug 1473 (ursprungligen Götaholm) vid Säveåns utlopp, nuvarande Gamlestaden. Invånarna flyttade till Göteborg 1624.',
    noteEn: 'Founded 17 Aug 1473 (originally Götaholm) at the Säve River outlet, present-day Gamlestaden. Residents moved to Gothenburg in 1624.', q: 'Nya Lödöse' },
];

const Goteborg = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  return (
    <PlacePage
      titleSv="Göteborg"
      titleEn="Gothenburg"
      center={{ lat: 57.7072, lng: 11.9670 }}
      zoom={12}
      progressiveAdmin
      keywords="Göteborg, Göta älv, Lödöse, Nya Lödöse, Älvsborg, fornlämningar, hällristningar, runstenar"
      metaDescriptionSv="Fornlämningar, hällristningar, runstenar och kyrkor kring Göteborg och Göta älvs mynning — samt stadens föregångare Lödöse, Nya Lödöse, Gullberg och Älvsborg."
      metaDescriptionEn="Ancient remains, rock art, runestones and churches around Gothenburg and the mouth of the Göta River — plus the city’s predecessors Lödöse, Nya Lödöse, Gullberg and Älvsborg."
      introSv={<p>Kartan visar fornlämningar, hällristningar, runstenar, myntfynd och kyrkor kring Göteborg och Göta älvs mynning. Zooma och tänd/släck lager i legenden; klicka på ett objekt för att se vad det är.</p>}
      introEn={<p>The map shows ancient remains, rock art, runestones, coin finds and churches around Gothenburg and the mouth of the Göta River. Zoom and toggle layers in the legend; click an object to see what it is.</p>}
    >
      <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
        <h2 className="text-lg font-bold text-gold mb-1">{sv ? 'Stadens föregångare' : 'The city’s predecessors'}</h2>
        <p className="text-xs text-slate-400 mb-3 max-w-3xl">
          {sv
            ? 'Göteborg grundades 1621. Vid Göta älvs mynning fanns dessförinnan flera handelsstäder och befästningar — stadens föregångare i landskapet.'
            : 'Gothenburg was founded in 1621. Before it, the mouth of the Göta River held several trading towns and fortresses — the city’s predecessors in the landscape.'}
        </p>
        <ul className="space-y-2">
          {PREDECESSORS.map((p) => (
            <li key={p.name} className="border-l-2 border-slate-700 pl-3">
              <Link to={`/explore?searchQuery=${encodeURIComponent(p.q)}`}
                className="text-sm font-medium text-amber-100 hover:text-gold inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />{p.name}
                <span className="text-xs font-normal text-slate-400">· {sv ? p.whenSv : p.whenEn}</span>
              </Link>
              <p className="text-xs text-slate-400 leading-snug">{sv ? p.noteSv : p.noteEn}</p>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-slate-500 mt-3">
          {sv ? 'Källor: ' : 'Sources: '}Vårt Göteborg (vartgoteborg.se); sv.wikipedia.org (Nya Lödöse); Götaälvdalen (gotaalvdalen.se).
        </p>
      </section>
    </PlacePage>
  );
};

export default Goteborg;
