import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Map,
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
  Menu,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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

interface NavLink {
  pathEn: string;
  pathSv: string;
  labelSv: string;
  labelEn: string;
  icon: LucideIcon;
  /** Primary links show inline on desktop; the rest go in the "More" menu. */
  primary?: boolean;
  /** Only shown to authenticated users. */
  authOnly?: boolean;
}

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
};

// Which routes stay inline on desktop (the rest fall into "More").
const PRIMARY = new Set(['Inscriptions', 'Carvers', 'Artefacts', 'Fortresses', 'RoyalChronicles']);

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

/** Single source of truth for the app's navigation links, in both languages. */
const useNavLinks = (): NavLink[] => {
  const explore: NavLink = {
    pathEn: '/explore',
    pathSv: '/explore',
    labelSv: 'Utforska',
    labelEn: 'Explore',
    icon: Map,
    primary: true,
  };

  const routeLinks: NavLink[] = routes.map((route) => {
    const focus = FOCUS_ROUTES[route.component];
    const explorePath = focus ? `/explore?focus=${focus}` : null;
    return {
      pathEn: explorePath ?? route.pathEn,
      pathSv: explorePath ?? route.pathSv,
      labelSv: route.titleSv,
      labelEn: route.titleEn,
      icon: ICONS[route.component] ?? BookOpen,
      primary: PRIMARY.has(route.component),
    };
  });

  const profile: NavLink = {
    pathEn: '/profile',
    pathSv: '/profile',
    labelSv: 'Profil',
    labelEn: 'Profile',
    icon: User,
    authOnly: true,
  };

  return [explore, ...routeLinks, profile];
};

const useResolveLink = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const isActive = (link: NavLink) =>
    location.pathname === link.pathEn || location.pathname === link.pathSv;
  const pathOf = (link: NavLink) => (language === 'sv' ? link.pathSv : link.pathEn);
  const labelOf = (link: NavLink) => (language === 'sv' ? link.labelSv : link.labelEn);
  return { isActive, pathOf, labelOf };
};

/** Desktop navigation: primary links inline + a "More" dropdown for the rest. */
export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isActive, pathOf, labelOf } = useResolveLink();

  const links = useNavLinks().filter((l) => !l.authOnly || user);
  const primary = links.filter((l) => l.primary);
  const secondary = links.filter((l) => !l.primary);

  const linkClass = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
    }`;

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {primary.map((link) => {
        const Icon = link.icon;
        return (
          <Link key={link.pathEn} to={pathOf(link)} className={linkClass(isActive(link))}>
            <Icon className="h-4 w-4" />
            {labelOf(link)}
          </Link>
        );
      })}

      {secondary.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`${linkClass(secondary.some(isActive))} cursor-pointer outline-none`}
          >
            {language === 'sv' ? 'Mer' : 'More'}
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
            {secondary.map((link) => {
              const Icon = link.icon;
              return (
                <DropdownMenuItem key={link.pathEn} asChild>
                  <Link
                    to={pathOf(link)}
                    className={`flex items-center gap-2 text-sm ${
                      isActive(link) ? 'text-white' : 'text-slate-300'
                    } focus:text-white`}
                  >
                    <Icon className="h-4 w-4" />
                    {labelOf(link)}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
};

/** Mobile navigation: a hamburger button opening a Sheet with every link. */
export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isActive, pathOf, labelOf } = useResolveLink();
  const [open, setOpen] = useState(false);

  const links = useNavLinks().filter((l) => !l.authOnly || user);

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
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link);
              return (
                <SheetClose asChild key={link.pathEn}>
                  <Link
                    to={pathOf(link)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {labelOf(link)}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
