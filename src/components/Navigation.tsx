import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Castle,
  Scroll,
  Hammer,
  Crown,
  User,
  BookOpen,
  Users,
  UsersRound,
  Landmark,
  Church,
  Waves,
  Sparkles,
  Dna,
  Coins,
  Menu,
  Map,
  Compass,
  Scale,
  BarChart3,
  Library,
  Tag,
  CalendarClock,
  Share2,
  Bot,
  Headphones,
  Cross,
  Microscope,
  Anchor,
  Mail,
  Boxes,
  MapPin,
  Mountain,
  Wrench,
  Ship,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { routes } from '@/config/routes';

// Megamenyns kolumner. En kategori = en kolumn med egen rubrik.
type Category = 'inscriptions' | 'places' | 'regions' | 'history' | 'science';

interface NavLink {
  pathEn: string;
  pathSv: string;
  labelSv: string;
  labelEn: string;
  descSv: string;
  descEn: string;
  icon: LucideIcon;
  category?: Category;
  /**
   * Renders as a prominent top-level direct link (like Game/Podcast/Tools) instead of
   * inside the Explore megamenu — while KEEPING its `category` for section-cluster membership.
   * Lets a link be surfaced up top without dropping out of its category's page-level section-nav.
   */
  topLevel?: boolean;
  /** Only shown to authenticated users. */
  authOnly?: boolean;
}

const CATEGORY_ORDER: Category[] = ['inscriptions', 'places', 'regions', 'history', 'science'];
const CATEGORY_LABELS: Record<Category, { sv: string; en: string }> = {
  inscriptions: { sv: 'Inskrifter & runor', en: 'Inscriptions & runes' },
  places: { sv: 'Platser & kartor', en: 'Places & maps' },
  regions: { sv: 'Regioner & teman', en: 'Regions & themes' },
  history: { sv: 'Historia & samhälle', en: 'History & society' },
  science: { sv: 'Vetenskap & metod', en: 'Science & method' },
};

// Icon per route component (routes.ts has no icon field).
const ICONS: Record<string, LucideIcon> = {
  Inscriptions: BookOpen,
  Carvers: Hammer,
  Artefacts: Scroll,
  VikingNames: Users,
  Hundreds: Landmark,
  Parishes: Church,
  FolkGroups: UsersRound,
  Rivers: Waves,
  Gods: Sparkles,
  GeneticEvents: Dna,
  RoyalChronicles: Crown,
  Fortresses: Castle,
  Coins: Coins,
};

// Which megamenu column each route belongs to.
const CATEGORY_OF: Record<string, Category> = {
  Inscriptions: 'inscriptions',
  Carvers: 'inscriptions',
  Artefacts: 'inscriptions',
  Coins: 'inscriptions',
  VikingNames: 'inscriptions',
  Fortresses: 'places',
  Hundreds: 'places',
  Parishes: 'places',
  Rivers: 'places',
  RoyalChronicles: 'history',
  FolkGroups: 'history',
  Gods: 'history',
  GeneticEvents: 'science',
};

// Datasets consolidated onto the Explore focus views (2026-07-16): link
// straight to /explore?focus=X instead of the old standalone routes.
const FOCUS_ROUTES: Record<string, string> = {
  VikingNames: 'names',
  Hundreds: 'hundreds',
  Parishes: 'parishes',
  FolkGroups: 'folkGroups',
  Rivers: 'rivers',
  Gods: 'gods',
  GeneticEvents: 'geneticEvents',
};

// KORT nav-beskrivning per route-komponent. routes.ts-descriptionerna är långa och
// dubbelanvänds som SEO/meta (PageMeta) — dem rör vi INTE. I megamenyns smala kort
// (line-clamp-2, ~5 kolumner) klipps långa texter; därför en kort override här.
// Håll ≤ ~48 tecken så inget klipps på den smalaste kolumnbredden.
const NAV_DESC: Record<string, { sv: string; en: string }> = {
  Inscriptions: { sv: 'Sök och analysera runinskrifter.', en: 'Search and analyze inscriptions.' },
  Carvers: { sv: 'Runristare och deras verkstäder.', en: 'Runic carvers and their workshops.' },
  Artefacts: { sv: 'Föremål kopplade till inskrifter.', en: 'Objects linked to inscriptions.' },
  Coins: { sv: 'Mynt, brakteater och skatter.', en: 'Coins, bracteates and hoards.' },
  VikingNames: { sv: 'Vikingatida namn och frekvens.', en: 'Viking-age names and frequency.' },
  Fortresses: { sv: 'Fornborgar och befästningar.', en: 'Hillforts and fortifications.' },
  Hundreds: { sv: 'Historiska härader på kartan.', en: 'Historical hundreds, mapped.' },
  Parishes: { sv: 'Socknar och deras inskrifter.', en: 'Parishes and their inscriptions.' },
  Rivers: { sv: 'Vattendrag och hydronymer.', en: 'Rivers and hydronyms.' },
  RoyalChronicles: { sv: 'Kungar, dynastier och krönikor.', en: 'Kings, dynasties and chronicles.' },
  FolkGroups: { sv: 'Folkstammar och migration.', en: 'Peoples and migration.' },
  Gods: { sv: 'Gudar och kultplatser.', en: 'Gods and cult sites.' },
  GeneticEvents: { sv: 'aDNA och genetiska händelser.', en: 'aDNA and genetic events.' },
};

// Explore-länken behövs även som direktlänk i inloggat läge.
const explore: NavLink = {
  pathEn: '/explore', pathSv: '/explore',
  labelSv: 'Utforska kartan', labelEn: 'Explore the map',
  descSv: 'Interaktiv karta med alla lager.', descEn: 'Interactive map, every layer.',
  icon: Map, category: 'places',
};

// Links that aren't in routes.ts but belong in the megamenu.
// descSv/descEn hålls korta (≤ ~48 tecken) så korten inte klipper texten.
const EXTRA_LINKS: NavLink[] = [
  explore,
  {
    pathEn: '/en/runes', pathSv: '/sv/runor',
    labelSv: 'Runor & futharken', labelEn: 'Runes & the futhark',
    descSv: 'Vad runor är och hur man läser dem.', descEn: 'What runes are and how to read them.',
    icon: Scroll, category: 'inscriptions',
  },
  {
    pathEn: '/inscriptions', pathSv: '/sv/runinskrifter',
    labelSv: 'Runstenar', labelEn: 'Runestones',
    descSv: 'Hela runstenskorpusen på karta.', descEn: 'The whole runestone corpus, mapped.',
    icon: Map, category: 'inscriptions',
  },
  {
    pathEn: '/en/danish-runestones', pathSv: '/sv/danska-runstenar',
    labelSv: 'Danska runstenar', labelEn: 'Danish runestones',
    descSv: 'Danmarks runeindskrifter + signum.', descEn: "Denmark's runic inscriptions + signa.",
    icon: Landmark, category: 'inscriptions',
  },
  {
    pathEn: '/explore?focus=marine', pathSv: '/explore?focus=marine',
    labelSv: 'Marinarkeologi', labelEn: 'Marine archaeology',
    descSv: 'Vrak, farleder och hamnar.', descEn: 'Wrecks, fairways and harbours.',
    icon: Anchor, category: 'places',
  },
  {
    pathEn: '/excursions', pathSv: '/excursions',
    labelSv: 'Utflykter', labelEn: 'Excursions',
    descSv: 'Platser att besöka på riktigt.', descEn: 'Places to visit for real.',
    icon: Compass, category: 'places',
  },
  {
    pathEn: '/explore?focus=churches', pathSv: '/explore?focus=churches',
    labelSv: 'Kyrkor & stift', labelEn: 'Churches & dioceses',
    descSv: 'Medeltidskyrkor och stift över tid.', descEn: 'Medieval churches and dioceses.',
    icon: Church, category: 'places',
  },
  {
    pathEn: '/place-names', pathSv: '/sv/ortnamn',
    labelSv: 'Ortnamn', labelEn: 'Place names',
    descSv: 'Ortnamnsled och metod, med källor.', descEn: 'Place-name elements and method.',
    icon: Tag, category: 'places',
  },
  {
    pathEn: '/3d', pathSv: '/sv/3d',
    labelSv: '3D-modeller', labelEn: '3D models',
    descSv: 'Föremål ur forntiden i 3D.', descEn: 'Ancient objects in 3D.',
    icon: Boxes, category: 'places',
  },
  {
    pathEn: '/en/place', pathSv: '/sv/plats',
    labelSv: 'Platser', labelEn: 'Places',
    descSv: 'Källgranskade platssidor.', descEn: 'Source-critical place pages.',
    icon: MapPin, category: 'places',
  },
  {
    pathEn: '/en/genealogy', pathSv: '/sv/slaktforskning',
    labelSv: 'Släktforskning', labelEn: 'Genealogy',
    descSv: 'Släpp din GEDCOM — anor i landskapet.', descEn: 'Drop your GEDCOM — ancestors mapped.',
    icon: Users, category: 'places',
  },
  {
    pathEn: '/caves', pathSv: '/grottor',
    labelSv: 'Grottor', labelEn: 'Caves',
    descSv: 'Alla grottor på kartan — nära dig.', descEn: 'Every cave mapped — near you.',
    icon: Mountain, category: 'places',
  },
  {
    pathEn: '/ontology', pathSv: '/ontologi',
    labelSv: 'Ontologi', labelEn: 'Ontology',
    descSv: 'Det agent-läsbara datakontraktet.', descEn: 'The agent-readable data contract.',
    icon: Share2, category: 'science',
  },
  {
    pathEn: '/researchers', pathSv: '/forskare',
    labelSv: 'Forskare', labelEn: 'Researchers',
    descSv: 'Forskarna och källorna bakom.', descEn: 'The researchers and sources behind.',
    icon: BookOpen, category: 'science',
  },
  {
    pathEn: '/methodology', pathSv: '/sv/vetenskapsmetodik',
    labelSv: 'Vetenskapsmetodik', labelEn: 'Methodology',
    descSv: 'Metoden att hålla dålig data ute.', descEn: 'How we keep bad data out.',
    icon: Microscope, category: 'science',
  },
  {
    pathEn: '/statistics', pathSv: '/sv/statistik',
    labelSv: 'Statistik', labelEn: 'Statistics',
    descSv: 'Antal per landskap, socken, ristare.', descEn: 'Counts by province, parish, carver.',
    icon: BarChart3, category: 'science',
  },
  {
    pathEn: '/en/viking-age', pathSv: '/sv/vikingatid',
    labelSv: 'Vikingatid', labelEn: 'The Viking Age',
    descSv: 'Vad begreppet betyder — källkritiskt.', descEn: 'What the term means — source-critical.',
    icon: Ship, category: 'history',
  },
  {
    pathEn: '/texts', pathSv: '/texter',
    labelSv: 'Texter & källor', labelEn: 'Texts & sources',
    descSv: 'Eddan, lagar och krönikor i fulltext.', descEn: 'Edda, laws and chronicles in full.',
    icon: Library, category: 'history',
  },
  {
    pathEn: '/historical-events', pathSv: '/sv/historiska-handelser',
    labelSv: 'Tidslinje', labelEn: 'Timeline',
    descSv: 'Händelser och arter på en tidsaxel.', descEn: 'Events and species on one timeline.',
    icon: CalendarClock, category: 'history',
  },
  {
    pathEn: '/economic-history', pathSv: '/sv/ekonomisk-historia',
    labelSv: 'Ekonomisk historia', labelEn: 'Economic history',
    descSv: 'Ledungen och första skattesystemet.', descEn: 'The levy and first tax system.',
    icon: Coins, category: 'history',
  },
  {
    pathEn: '/en/medieval-charters', pathSv: '/sv/medeltidsbrev',
    labelSv: 'Medeltidsbrev', labelEn: 'Medieval charters',
    descSv: '44 264 medeltidsbrev ur SDHK.', descEn: '44,264 medieval charters from SDHK.',
    icon: Mail, category: 'history',
  },
  {
    pathEn: '/en/eriksgata', pathSv: '/sv/eriksgatan',
    labelSv: 'Eriksgatan', labelEn: 'The Eriksgata',
    descSv: 'Kungavalets riksrunda genom landskapen.', descEn: "The royal election progress through the provinces.",
    icon: Crown, category: 'history',
  },
  {
    pathEn: '/en/execution-sites', pathSv: '/sv/avrattningsplatser',
    labelSv: 'Avrättningsplatser', labelEn: 'Execution sites',
    descSv: 'Galg- och avrättningsplatser.', descEn: 'Gallows and execution sites.',
    icon: Landmark, category: 'history',
  },
  {
    pathEn: '/prices', pathSv: '/prices',
    labelSv: 'Priskalkylator', labelEn: 'Price calculator',
    descSv: 'Diocletianus prisedikt (301 e.Kr.).', descEn: "Diocletian's Price Edict (301 AD).",
    icon: Scale, category: 'history',
  },
  // Regioner & teman — de tvåspråkiga forsknings-/regionsidorna + helgon-hubben.
  {
    pathEn: '/kalmar', pathSv: '/sv/kalmar',
    labelSv: 'Kalmar', labelEn: 'Kalmar',
    descSv: 'Centralorter, slott och sund.', descEn: 'Central places, castle and sound.',
    icon: Castle, category: 'regions',
  },
  {
    pathEn: '/oland', pathSv: '/sv/oland',
    labelSv: 'Öland', labelEn: 'Öland',
    descSv: 'Vägnät, centralplatser och kyrkor.', descEn: 'Roads, central places, churches.',
    icon: Landmark, category: 'regions',
  },
  {
    pathEn: '/angermanland', pathSv: '/sv/angermanland',
    labelSv: 'Ångermanland', labelEn: 'Ångermanland',
    descSv: 'Centralorter och kolonisation.', descEn: 'Central places and colonisation.',
    icon: Compass, category: 'regions',
  },
  {
    pathEn: '/staket', pathSv: '/sv/staket',
    labelSv: 'Stäket & Mälaren', labelEn: 'Stäket & Lake Mälaren',
    descSv: 'Mälaren som havsvik — Olav 1007.', descEn: 'Mälaren as a sea bay — Olav 1007.',
    icon: Waves, category: 'regions',
  },
  {
    pathEn: '/en/gota-landsvag', pathSv: '/sv/gota-landsvag',
    labelSv: 'Göta landsväg', labelEn: 'Göta landsväg',
    descSv: 'Medeltida landsvägen över Södertörn.', descEn: 'Medieval highroad across Södertörn.',
    icon: Compass, category: 'regions',
  },
  {
    pathEn: '/en/sandby-borg', pathSv: '/sv/sandby-borg',
    labelSv: 'Sandby borg', labelEn: 'Sandby borg',
    descSv: 'Ölandsborgen med massakern ~480.', descEn: 'The Öland fort massacre, c. 480.',
    icon: Castle, category: 'regions',
  },
  {
    // Sankt Olof är EJ egen toppnav-post längre — den bor som undersida under Helgon (/sv/helgon,
    // /en/saints). Routen /sv/sankt-olof finns kvar; länkas från Helgon-sidan (Daniel).
    pathEn: '/en/saints', pathSv: '/sv/helgon',
    labelSv: 'Helgon', labelEn: 'Saints',
    descSv: 'Nordens helgon, med källkritik.', descEn: 'The saints of the North.',
    icon: Cross, category: 'regions',
  },
];

const profile: NavLink = {
  pathEn: '/profile', pathSv: '/profile',
  labelSv: 'Profil', labelEn: 'Profile',
  descSv: 'Din profil', descEn: 'Your profile',
  icon: User, authOnly: true,
};

// Spel (Kungsnäve) bor nu i verktygskatalogen (/verktyg), inte som topplänk.
// Podcast ligger i Utforska-megamenyn (kategori 'history') i st.f. som topplänk.
const podcast: NavLink = {
  pathEn: '/podcast', pathSv: '/podcast',
  labelSv: 'Podcast', labelEn: 'Podcast',
  descSv: 'Ljudberättelser om runor och myter.', descEn: 'Audio stories of runes and myths.',
  icon: Headphones, category: 'history',
};

const tools: NavLink = {
  pathEn: '/tools', pathSv: '/verktyg',
  labelSv: 'Verktyg', labelEn: 'Tools',
  descSv: 'Alla plattformens verktyg samlade.', descEn: 'All the platform tools in one place.',
  icon: Wrench,
};

// AI lyfts till topplänk (hett begrepp — ska inte begravas i submenyn), men behåller
// category:'science' så sidornas sektionsnavigering (Science & method) fortfarande får med den.
const aiAgents: NavLink = {
  pathEn: '/ai-agents', pathSv: '/ai-agenter',
  labelSv: 'AI', labelEn: 'AI',
  descSv: 'Hur plattformen använder AI.', descEn: 'How the platform uses AI.',
  icon: Bot, category: 'science', topLevel: true,
};

/** Single source of truth for the app's navigation links, in both languages. */
const useNavLinks = (): NavLink[] => {
  const routeLinks: NavLink[] = routes.map((route) => {
    const focus = FOCUS_ROUTES[route.component];
    const explorePath = focus ? `/explore?focus=${focus}` : null;
    // Kort nav-beskrivning om vi har en; annars route.description (SEO-texten).
    const navDesc = NAV_DESC[route.component];
    return {
      pathEn: explorePath ?? route.pathEn,
      pathSv: explorePath ?? route.pathSv,
      labelSv: route.titleSv,
      labelEn: route.titleEn,
      descSv: navDesc?.sv ?? route.descriptionSv,
      descEn: navDesc?.en ?? route.descriptionEn,
      icon: ICONS[route.component] ?? BookOpen,
      category: CATEGORY_OF[route.component],
    };
  });

  // 'home' borttagen ur navet — loggan (ᚱ) i Header länkar redan till startsidan.
  return [aiAgents, tools, podcast, ...routeLinks, ...EXTRA_LINKS, profile];
};

const useResolveLink = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const isActive = (link: NavLink) =>
    location.pathname === link.pathEn.split('?')[0] ||
    location.pathname === link.pathSv.split('?')[0];
  const pathOf = (link: NavLink) => (language === 'sv' ? link.pathSv : link.pathEn);
  const labelOf = (link: NavLink) => (language === 'sv' ? link.labelSv : link.labelEn);
  const descOf = (link: NavLink) => (language === 'sv' ? link.descSv : link.descEn);
  return { isActive, pathOf, labelOf, descOf };
};

// Delad fokus-ring: synligt tangentbordsfokus i guld mot den mörka panelen (WCAG 2.4.7).
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900';

/** One link inside a megamenu panel: icon + label + short description. */
const MegaCard: React.FC<{ link: NavLink }> = ({ link }) => {
  const { isActive, pathOf, labelOf, descOf } = useResolveLink();
  const Icon = link.icon;
  const active = isActive(link);
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={pathOf(link)}
          aria-current={active ? 'page' : undefined}
          className={`group/card flex gap-3 rounded-md p-2.5 transition-colors ${FOCUS_RING} ${
            active ? 'bg-slate-800' : 'hover:bg-slate-800/70'
          }`}
        >
          <Icon
            className={`h-5 w-5 mt-0.5 shrink-0 transition-colors ${
              active ? 'text-gold' : 'text-gold/80 group-hover/card:text-gold'
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="text-sm font-medium text-white">{labelOf(link)}</div>
            <p className="text-xs leading-snug text-slate-400 line-clamp-2">{descOf(link)}</p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

/**
 * Desktop navigation. En bred "Utforska"-megameny grupperad i kategori-kolumner
 * med rubriker; AI och Verktyg som direktlänkar. Inget publikt nav i inloggat läge.
 */
export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isActive, pathOf, labelOf } = useResolveLink();

  const links = useNavLinks().filter((l) => !l.authOnly || user);
  // topLevel-länkar visas som direktlänkar (nedan) och ska INTE dubbleras i megamenyn.
  const byCategory = (cat: Category) => links.filter((l) => l.category === cat && !l.topLevel);

  const triggerClass =
    'bg-transparent text-slate-200 hover:bg-slate-800/60 hover:text-white ' +
    'focus:bg-slate-800/60 focus:text-white data-[state=open]:bg-slate-800/60 ' +
    `data-[state=open]:text-white ${FOCUS_RING}`;

  const directLink = (link: NavLink) => {
    const Icon = link.icon;
    return (
      <NavigationMenuItem key={link.pathEn}>
        <NavigationMenuLink asChild>
          <Link
            to={pathOf(link)}
            aria-current={isActive(link) ? 'page' : undefined}
            className={`${navigationMenuTriggerStyle()} bg-transparent text-slate-200 hover:bg-slate-800/60 hover:text-white ${FOCUS_RING} ${
              isActive(link) ? 'bg-slate-800 text-white' : ''
            }`}
          >
            <Icon className="h-4 w-4 mr-1.5 text-gold" aria-hidden="true" />
            {labelOf(link)}
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  };

  // Inloggat läge: inget publikt toppnav alls — rent arbetsläge. All navigation
  // (Admin, Profil, Logga ut) ligger i kontomenyn i Header; startsidan nås via loggan.
  if (user) {
    return null;
  }

  const megaLabel = language === 'sv' ? 'Utforska' : 'Explore';

  // Utloggat läge: full publik megameny — en trigger, fem kategori-kolumner.
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={triggerClass}>{megaLabel}</NavigationMenuTrigger>
          <NavigationMenuContent>
            {/* max-h + scroll: på låga skärmar är kolumnerna (t.ex. "Platser & kartor")
                högre än fönstret; radix-viewporten är fixed top-[65px] + overflow-hidden,
                så utan höjdtak klipptes de nedersta länkarna (bl.a. Släktforskning) bort
                helt oåtkomligt. Nu mäter radix den kapade höjden → panelen ryms alltid
                och innehållet scrollar i stället för att försvinna. */}
            <div className="max-h-[calc(100vh-96px)] w-[min(1080px,92vw)] overflow-y-auto overscroll-contain bg-slate-900 p-4">
              <ul className="grid list-none grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-3 xl:grid-cols-5">
                {CATEGORY_ORDER.map((cat) => {
                  const catLinks = byCategory(cat);
                  if (catLinks.length === 0) return null;
                  const label =
                    language === 'sv' ? CATEGORY_LABELS[cat].sv : CATEGORY_LABELS[cat].en;
                  return (
                    <li key={cat} className="min-w-0">
                      <div
                        className="mb-1.5 border-b border-slate-700/70 px-2 pb-1.5 text-xs font-semibold uppercase tracking-wider text-gold"
                        aria-hidden="true"
                      >
                        {label}
                      </div>
                      <ul className="list-none space-y-0.5" aria-label={label}>
                        {catLinks.map((link) => (
                          <MegaCard key={link.pathEn + link.labelEn} link={link} />
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {directLink(aiAgents)}
        {directLink(tools)}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

/** Mobile navigation: a hamburger button opening a Sheet, grouped by category. */
export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isActive, pathOf, labelOf, descOf } = useResolveLink();
  const [open, setOpen] = useState(false);

  const links = useNavLinks().filter((l) => !l.authOnly || user);
  // Direktlänkar överst: kategorilösa (Verktyg) + topLevel (AI, som ändå
  // behåller sin category för sektionsnavigeringen på sidorna).
  const standalone = links.filter((l) => (!l.category || l.topLevel) && !l.authOnly);
  const profileLink = links.find((l) => l.authOnly);

  const linkRow = (link: NavLink, withDesc = false) => {
    const Icon = link.icon;
    const active = isActive(link);
    return (
      <SheetClose asChild key={link.pathEn + link.labelEn}>
        <Link
          to={pathOf(link)}
          aria-current={active ? 'page' : undefined}
          className={`flex items-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${FOCUS_RING} ${
            active ? 'bg-slate-800 text-white' : 'text-slate-200 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block">{labelOf(link)}</span>
            {withDesc && (
              <span className="mt-0.5 block text-xs font-normal text-slate-400 line-clamp-1">
                {descOf(link)}
              </span>
            )}
          </span>
        </Link>
      </SheetClose>
    );
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`border-slate-600 text-slate-200 hover:bg-slate-800 ${FOCUS_RING}`}
            aria-label={language === 'sv' ? 'Öppna meny' : 'Open menu'}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto border-slate-700 bg-slate-900">
          <SheetHeader>
            <SheetTitle className="text-left text-white">
              {language === 'sv' ? 'Meny' : 'Menu'}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {language === 'sv' ? 'Sidnavigering' : 'Site navigation'}
            </SheetDescription>
          </SheetHeader>
          <nav
            className="mt-6 flex flex-col space-y-1"
            aria-label={language === 'sv' ? 'Huvudnavigering' : 'Main navigation'}
          >
            {standalone.map((l) => linkRow(l))}
            {CATEGORY_ORDER.map((cat) => {
              const catLinks = links.filter((l) => l.category === cat && !l.topLevel);
              if (catLinks.length === 0) return null;
              const label =
                language === 'sv' ? CATEGORY_LABELS[cat].sv : CATEGORY_LABELS[cat].en;
              return (
                <section key={cat} className="pt-3" aria-label={label}>
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gold">
                    {label}
                  </p>
                  {catLinks.map((l) => linkRow(l))}
                </section>
              );
            })}
            {profileLink && <div className="pt-3">{linkRow(profileLink)}</div>}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
