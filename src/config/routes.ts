// Route configuration with Swedish and English paths
export interface RouteConfig {
  pathEn: string;
  pathSv: string;
  component: string;
  titleSv: string;
  titleEn: string;
  descriptionSv: string;
  descriptionEn: string;
}

export const routes: RouteConfig[] = [
  {
    pathEn: '/inscriptions',
    pathSv: '/sv/runinskrifter',
    component: 'Inscriptions',
    titleSv: 'Runinskrifter',
    titleEn: 'Runic Inscriptions',
    descriptionSv: 'Utforska tusentals runinskrifter från vikingatiden. Sök, filtrera och analysera runstenar med interaktiva kartor.',
    descriptionEn: 'Explore thousands of runic inscriptions from the Viking Age. Search, filter and analyze runestones with interactive maps.'
  },
  {
    pathEn: '/carvers',
    pathSv: '/sv/ristare',
    component: 'Carvers',
    titleSv: 'Ristare',
    titleEn: 'Carvers',
    descriptionSv: 'Utforska runristare och mästare från vikingatiden. Se deras inskrifter, verkstäder och geografiska spridning.',
    descriptionEn: 'Explore runic carvers and masters from the Viking Age. View their inscriptions, workshops and geographical distribution.'
  },
  {
    pathEn: '/artefacts',
    pathSv: '/sv/artefakter',
    component: 'Artefacts',
    titleSv: 'Artefakter',
    titleEn: 'Artefacts',
    descriptionSv: 'Utforska arkeologiska artefakter kopplade till runinskrifter. Sök och filtrera efter olika kategorier av fornnordiska föremål.',
    descriptionEn: 'Explore archaeological artefacts linked to runic inscriptions. Search and filter by different categories of Old Norse objects.'
  },
  {
    pathEn: '/viking-names',
    pathSv: '/sv/vikinganamn',
    component: 'VikingNames',
    titleSv: 'Vikinganamn',
    titleEn: 'Viking Names',
    descriptionSv: 'Utforska vikingatida namn och deras frekvens i runinskrifter. Analysera namnens geografiska spridning och betydelse.',
    descriptionEn: 'Explore Viking Age names and their frequency in runic inscriptions. Analyze the geographical distribution and meaning of names.'
  },
  {
    pathEn: '/hundreds',
    pathSv: '/sv/harader',
    component: 'Hundreds',
    titleSv: 'Härader',
    titleEn: 'Hundreds',
    descriptionSv: 'Utforska historiska härader i Skandinavien. Se runinskrifter och platser kopplade till varje härad.',
    descriptionEn: 'Explore historical hundreds in Scandinavia. View runic inscriptions and locations linked to each hundred.'
  },
  {
    pathEn: '/parishes',
    pathSv: '/sv/socknar',
    component: 'Parishes',
    titleSv: 'Socknar',
    titleEn: 'Parishes',
    descriptionSv: 'Utforska svenska socknar och deras runinskrifter. Se geografisk spridning och historisk kontext.',
    descriptionEn: 'Explore Swedish parishes and their runic inscriptions. View geographical distribution and historical context.'
  },
  {
    pathEn: '/folk-groups',
    pathSv: '/sv/folkgrupper',
    component: 'FolkGroups',
    titleSv: 'Folkgrupper',
    titleEn: 'Folk Groups',
    descriptionSv: 'Utforska fornnordiska folkgrupper och deras kulturella och genetiska spår i runinskrifter.',
    descriptionEn: 'Explore Old Norse folk groups and their cultural and genetic traces in runic inscriptions.'
  },
  {
    pathEn: '/rivers',
    pathSv: '/sv/floder',
    component: 'Rivers',
    titleSv: 'Floder',
    titleEn: 'Rivers',
    descriptionSv: 'Utforska vikingatida flodplatser och vattenvägar. Se runinskrifter längs historiska flodsträckor.',
    descriptionEn: 'Explore Viking Age river locations and waterways. View runic inscriptions along historical river routes.'
  },
  {
    pathEn: '/gods',
    pathSv: '/sv/gudar',
    component: 'Gods',
    titleSv: 'Gudar',
    titleEn: 'Gods',
    descriptionSv: 'Utforska fornnordiska gudar och kultplatser. Se runinskrifter och arkeologiska fynd kopplade till olika gudar.',
    descriptionEn: 'Explore Old Norse gods and cult sites. View runic inscriptions and archaeological finds linked to different gods.'
  },
  {
    pathEn: '/genetic-events',
    pathSv: '/sv/genetiska-handelser',
    component: 'GeneticEvents',
    titleSv: 'Genetiska Händelser',
    titleEn: 'Genetic Events',
    descriptionSv: 'Utforska genetiska händelser och evolution från arkeologiska fynd. Se DNA-analys och haplogrupper.',
    descriptionEn: 'Explore genetic events and evolution from archaeological finds. View DNA analysis and haplogroups.'
  },
  {
    pathEn: '/royal-chronicles',
    pathSv: '/sv/kungakronikor',
    component: 'RoyalChronicles',
    titleSv: 'Kungakrönikor',
    titleEn: 'Royal Chronicles',
    descriptionSv: 'Utforska medeltida och vikingatida härskare i Skandinavien och Östeuropa. Dynastier, källor och historiska kungar.',
    descriptionEn: 'Explore medieval and Viking Age rulers of Scandinavia and Eastern Europe. Dynasties, sources and historical kings.'
  },
  {
    pathEn: '/fortresses',
    pathSv: '/sv/borgar',
    component: 'Fortresses',
    titleSv: 'Vikingaborgar',
    titleEn: 'Viking Fortresses',
    descriptionSv: 'Utforska vikingatida borgar, städer och fornborgar i Skandinavien. Interaktiva kartor med detaljerad information.',
    descriptionEn: 'Explore Viking Age fortresses, cities and hillforts in Scandinavia. Interactive maps with detailed information.'
  },
  {
    pathEn: '/coins',
    pathSv: '/sv/mynt',
    component: 'Coins',
    titleSv: 'Mynt',
    titleEn: 'Coins',
    descriptionSv: 'Mynt från nordisk historia: vikingatidens första svenska mynt, runmynt och romerska solidusskatter, kopplade till härskare och fyndplatser.',
    descriptionEn: 'Coins from Nordic history: the first Swedish Viking-Age coins, rune coins and Roman solidus hoards, linked to rulers and find sites.'
  }
];

// Helper function to get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find(
    route => route.pathEn === path || route.pathSv === path
  );
};

// Helper function to get all paths (both languages)
export const getAllPaths = (): string[] => {
  return routes.flatMap(route => [route.pathEn, route.pathSv]);
};


