import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
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
  Swords,
  BarChart3,
  Library,
  Tag,
  CalendarClock,
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

type Category = 'inscriptions' | 'places' | 'history' | 'science';

interface NavLink {
  pathEn: string;
  pathSv: string;
  labelSv: string;
  labelEn: string;
  descSv: string;
  descEn: string;
  icon: LucideIcon;
  category?: Category;
  /** Only shown to authenticated users. */
  authOnly?: boolean;
}

const CATEGORY_ORDER: Category[] = ['inscriptions', 'places', 'history', 'science'];
const CATEGORY_LABELS: Record<Category, { sv: string; en: string }> = {
  inscriptions: { sv: 'Runinskrifter', en: 'Inscriptions' },
  places: { sv: 'Platser & kartor', en: 'Places & maps' },
  history: { sv: 'Historia', en: 'History' },
  science: { sv: 'Vetenskap', en: 'Science' },
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

// Explore-länken behövs även som direktlänk i inloggat läge.
const explore: NavLink = {
  pathEn: '/explore', pathSv: '/explore',
  labelSv: 'Utforska', labelEn: 'Explore',
  descSv: 'Interaktiv karta med alla lager — runinskrifter, platser och intresseprofiler.',
  descEn: 'Interactive map with every layer — inscriptions, places and interest profiles.',
  icon: Map, category: 'places',
};

// Links that aren't in routes.ts but belong in the megamenu.
const EXTRA_LINKS: NavLink[] = [
  explore,
  {
    pathEn: '/excursions', pathSv: '/excursions',
    labelSv: 'Utflykter', labelEn: 'Excursions',
    descSv: 'Platser att besöka på riktigt — hällristningar, gravhögar och fornborgar.',
    descEn: 'Places to visit in real life — rock carvings, burial mounds and hillforts.',
    icon: Compass, category: 'places',
  },
  {
    pathEn: '/explore?focus=churches', pathSv: '/explore?focus=churches',
    labelSv: 'Kyrkor & stift', labelEn: 'Churches & dioceses',
    descSv: 'Medeltidskyrkor med byggår, stift över tid och bild — samt ruiner. Zooma in på kartan.',
    descEn: 'Medieval churches with build year, diocese over time and photo — plus ruins. Zoom in.',
    icon: Church, category: 'places',
  },
  {
    pathEn: '/place-names', pathSv: '/sv/ortnamn',
    labelSv: 'Ortnamn', labelEn: 'Place names',
    descSv: 'Ortnamnsleden vi söker (sakrala, makt, natur) — reproducerbar metod, källor och osäkerheter.',
    descEn: 'The place-name elements we search (sacral, power, nature) — reproducible method, sources, caveats.',
    icon: Tag, category: 'places',
  },
  {
    pathEn: '/texts', pathSv: '/texter',
    labelSv: 'Texter & källor', labelEn: 'Texts & sources',
    descSv: 'Läs källorna i fulltext — Poetiska Eddan, lagar, krönikor och sagor, efter typ.',
    descEn: 'Read the sources in full — the Poetic Edda, laws, chronicles and sagas, by type.',
    icon: Library, category: 'history',
  },
  {
    pathEn: '/historical-events', pathSv: '/sv/historiska-handelser',
    labelSv: 'Tidslinje', labelEn: 'Timeline',
    descSv: 'Händelser, klimatchocker och pestutbrott + introduktioner av arter/innovationer (hund, katt, häst) på samma tidsaxel — med proxy, osäkerhet och källor.',
    descEn: 'Events, climate shocks and plague plus introductions of species/innovations on one time axis — with proxy, uncertainty and sources.',
    icon: CalendarClock, category: 'history',
  },
  {
    pathEn: '/explore?focus=eriksgatan', pathSv: '/explore?focus=eriksgatan',
    labelSv: 'Eriksgatan', labelEn: 'Eriksgatan',
    descSv: 'Kungavalets riksrunda genom landskapen — den medeltida Eriksgatan på kartan.',
    descEn: 'The medieval royal election progress through the provinces, drawn on the map.',
    icon: Crown, category: 'history',
  },
  {
    pathEn: '/prices', pathSv: '/prices',
    labelSv: 'Priser', labelEn: 'Prices',
    descSv: 'Diocletianus prisedikt (301 e.Kr.) — romerska priser omräknade.',
    descEn: "Diocletian's Price Edict (301 AD) — Roman prices converted.",
    icon: Scale, category: 'history',
  },
  {
    pathEn: '/statistics', pathSv: '/sv/statistik',
    labelSv: 'Statistik', labelEn: 'Statistics',
    descSv: 'Bläddra materialet — antal per landskap, socken, härad och ristare.',
    descEn: 'Browse the material — counts per province, parish, hundred and carver.',
    icon: BarChart3, category: 'science',
  },
];

const home: NavLink = {
  pathEn: '/', pathSv: '/',
  labelSv: 'Hem', labelEn: 'Home',
  descSv: 'Startsida', descEn: 'Home',
  icon: Home,
};

const profile: NavLink = {
  pathEn: '/profile', pathSv: '/profile',
  labelSv: 'Profil', labelEn: 'Profile',
  descSv: 'Din profil', descEn: 'Your profile',
  icon: User, authOnly: true,
};

const game: NavLink = {
  pathEn: '/kungsnave', pathSv: '/kungsnave',
  labelSv: 'Spel', labelEn: 'Game',
  descSv: 'Spela Hnefatafl (Kungsnäve)', descEn: "Play Hnefatafl (the king's game)",
  icon: Swords,
};

/** Single source of truth for the app's navigation links, in both languages. */
const useNavLinks = (): NavLink[] => {
  const routeLinks: NavLink[] = routes.map((route) => {
    const focus = FOCUS_ROUTES[route.component];
    const explorePath = focus ? `/explore?focus=${focus}` : null;
    return {
      pathEn: explorePath ?? route.pathEn,
      pathSv: explorePath ?? route.pathSv,
      labelSv: route.titleSv,
      labelEn: route.titleEn,
      descSv: route.descriptionSv,
      descEn: route.descriptionEn,
      icon: ICONS[route.component] ?? BookOpen,
      category: CATEGORY_OF[route.component],
    };
  });

  return [home, game, ...routeLinks, ...EXTRA_LINKS, profile];
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
          className={`flex gap-3 rounded-md p-2.5 transition-colors ${
            active ? 'bg-slate-800' : 'hover:bg-slate-800/60'
          }`}
        >
          <Icon className="h-5 w-5 mt-0.5 shrink-0 text-orange-400" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-white">{labelOf(link)}</div>
            <p className="text-xs text-slate-400 line-clamp-2">{descOf(link)}</p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

/** Desktop navigation. Publik megameny utloggad; enklare arbetsmeny inloggad. */
export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isActive, pathOf, labelOf } = useResolveLink();

  const links = useNavLinks().filter((l) => !l.authOnly || user);
  const byCategory = (cat: Category) => links.filter((l) => l.category === cat);

  const triggerClass =
    'bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white ' +
    'focus:bg-slate-800/50 focus:text-white data-[state=open]:bg-slate-800/50 ' +
    'data-[state=open]:text-white';

  const directLink = (link: NavLink) => {
    const Icon = link.icon;
    return (
      <NavigationMenuItem key={link.pathEn}>
        <NavigationMenuLink asChild>
          <Link
            to={pathOf(link)}
            className={`${navigationMenuTriggerStyle()} bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white ${
              isActive(link) ? 'bg-slate-800 text-white' : ''
            }`}
          >
            <Icon className="h-4 w-4 mr-1.5" />
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

  // Utloggat läge: full publik megameny.
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {directLink(home)}

        {CATEGORY_ORDER.map((cat) => {
          const catLinks = byCategory(cat);
          if (catLinks.length === 0) return null;
          const label = language === 'sv' ? CATEGORY_LABELS[cat].sv : CATEGORY_LABELS[cat].en;
          return (
            <NavigationMenuItem key={cat}>
              <NavigationMenuTrigger className={triggerClass}>{label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[520px] grid-cols-2 gap-1 bg-slate-900 p-3">
                  {catLinks.map((link) => (
                    <MegaCard key={link.pathEn} link={link} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}

        {directLink(game)}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

/** Mobile navigation: a hamburger button opening a Sheet, grouped by category. */
export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isActive, pathOf, labelOf } = useResolveLink();
  const [open, setOpen] = useState(false);

  const links = useNavLinks().filter((l) => !l.authOnly || user);
  const standalone = links.filter((l) => !l.category && !l.authOnly);
  const profileLink = links.find((l) => l.authOnly);

  const linkRow = (link: NavLink) => {
    const Icon = link.icon;
    const active = isActive(link);
    return (
      <SheetClose asChild key={link.pathEn}>
        <Link
          to={pathOf(link)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <Icon className="h-4 w-4" />
          {labelOf(link)}
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
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            aria-label={language === 'sv' ? 'Öppna meny' : 'Open menu'}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-slate-900 border-slate-700 w-72 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white text-left">
              {language === 'sv' ? 'Meny' : 'Menu'}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {language === 'sv' ? 'Sidnavigering' : 'Site navigation'}
            </SheetDescription>
          </SheetHeader>
          <nav className="mt-6 flex flex-col space-y-1">
            {standalone.map(linkRow)}
            {CATEGORY_ORDER.map((cat) => {
              const catLinks = links.filter((l) => l.category === cat);
              if (catLinks.length === 0) return null;
              return (
                <div key={cat} className="pt-3">
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {language === 'sv' ? CATEGORY_LABELS[cat].sv : CATEGORY_LABELS[cat].en}
                  </p>
                  {catLinks.map(linkRow)}
                </div>
              );
            })}
            {profileLink && <div className="pt-3">{linkRow(profileLink)}</div>}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
