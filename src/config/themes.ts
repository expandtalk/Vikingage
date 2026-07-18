import {
  Cross, Sparkles, Skull, Compass, Swords, Shield, Heart, Coins, Ship, PawPrint,
  type LucideIcon,
} from 'lucide-react';

// Begreppslager / tematisk graf. Varje tema knyter en uppsättning nyckelord
// (svenska + engelska + fornnordiska former) till de entiteter där temat bor.
// Används av det globala söket för att söka tematiskt tvärs över tabeller —
// steget från fältsök mot kunskapsgraf. Utöka fritt: lägg till tema eller nyckelord.
export interface Theme {
  id: string;
  labelSv: string;
  labelEn: string;
  icon: LucideIcon;
  keywords: string[];        // matchas (ILIKE) i inskriftstext + relevanta entiteters textfält
  entities: string[];        // vilka federerade grupper temat spänner över ('inscriptions' + Source.type)
}

export const THEMES: Theme[] = [
  {
    id: 'faith', labelSv: 'Tro', labelEn: 'Faith', icon: Cross,
    keywords: ['guð', 'guþ', 'kristr', 'krist', 'kors', 'ængil', 'ande', 'själ', 'god', 'christ', 'cross', 'soul', 'angel', 'bön', 'prayer', 'helga'],
    entities: ['inscriptions', 'holy'],
  },
  {
    id: 'cult', labelSv: 'Kult', labelEn: 'Cult', icon: Sparkles,
    keywords: ['vi', 'lund', 'hov', 'offer', 'þórr', 'óðinn', 'freyr', 'freyja', 'tor', 'oden', 'frej', 'sacred', 'heathen', 'hednisk'],
    entities: ['inscriptions', 'places', 'holy'],
  },
  {
    id: 'death', labelSv: 'Död & minne', labelEn: 'Death & memory', icon: Skull,
    keywords: ['dó', 'andaðis', 'död', 'minne', 'grav', 'died', 'death', 'memory', 'grave', 'buried', 'begravd', 'eptir', 'reisti stein'],
    entities: ['inscriptions'],
  },
  {
    id: 'voyage', labelSv: 'Resa & färd', labelEn: 'Voyage', icon: Compass,
    keywords: ['fóru', 'færd', 'austr', 'öster', 'grikk', 'grekland', 'england', 'serkland', 'voyage', 'travelled', 'east', 'expedition', 'ingvar', 'vittfarne'],
    entities: ['inscriptions', 'cities', 'fortresses'],
  },
  {
    id: 'weapons', labelSv: 'Vapen & krig', labelEn: 'Weapons & war', icon: Swords,
    keywords: ['sverð', 'svärd', 'sword', 'spjut', 'spear', 'sköld', 'shield', 'øx', 'yxa', 'axe', 'strid', 'orrusta', 'battle', 'war', 'hær', 'army', 'fell', 'stupade'],
    entities: ['inscriptions', 'fortresses'],
  },
  {
    id: 'protection', labelSv: 'Skydd & säkerhet', labelEn: 'Protection', icon: Shield,
    keywords: ['mund', 'skydd', 'värn', 'borg', 'fort', 'protect', 'defence', 'guard', 'þegn', 'dræng', 'dräng', 'värja', 'befästning'],
    entities: ['inscriptions', 'fortresses', 'cities'],
  },
  {
    id: 'love', labelSv: 'Kärlek & familj', labelEn: 'Love & family', icon: Heart,
    keywords: ['hustru', 'kona', 'wife', 'dóttir', 'dotter', 'daughter', 'son', 'moðir', 'moder', 'mother', 'faðir', 'fader', 'father', 'bróðir', 'broder', 'brother', 'kär', 'beloved', 'husband', 'make'],
    entities: ['inscriptions', 'names'],
  },
  {
    id: 'trade', labelSv: 'Handel & rikedom', labelEn: 'Trade & wealth', icon: Coins,
    keywords: ['silfr', 'silver', 'gull', 'guld', 'gold', 'mynt', 'coin', 'penning', 'köpman', 'merchant', 'skatt', 'treasure', 'dirham', 'handel', 'gæld'],
    entities: ['inscriptions', 'coins', 'cities'],
  },
  {
    id: 'ships', labelSv: 'Skepp & hav', labelEn: 'Ships & sea', icon: Ship,
    keywords: ['skip', 'skepp', 'ship', 'boat', 'båt', 'knörr', 'knärr', 'hamn', 'harbour', 'sjó', 'sea', 'styrimaðr', 'skipari', 'roþr', 'segel'],
    entities: ['inscriptions', 'cities'],
  },
  {
    id: 'horse', labelSv: 'Häst', labelEn: 'Horse', icon: PawPrint,
    keywords: ['hross', 'häst', 'jór', 'hestr', 'horse', 'mare', 'stóð', 'hingst', 'sto'],
    entities: ['inscriptions'],
  },
];
