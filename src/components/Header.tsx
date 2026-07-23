
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  LogIn,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Navigation, MobileNav } from './Navigation';
import { GlobalSearch } from './search/GlobalSearch';
import { BuildViewDialog } from './welcome/BuildViewDialog';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isHome = useLocation().pathname === '/';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const texts = {
    sv: { signOut: 'Logga ut', signIn: 'Logga in', admin: 'Admin', profile: 'Profil', account: 'Kontomeny' },
    en: { signOut: 'Sign out', signIn: 'Sign in', admin: 'Admin', profile: 'Profile', account: 'Account menu' }
  };
  
  const t = texts[language] || texts.en;

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-orange-500 flex items-center justify-center bg-orange-500/10">
              <div className="text-2xl text-orange-500 font-bold">ᚱ</div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white leading-tight">
                Viking Age
              </h1>
            </div>
          </Link>

          <Navigation />

          <div className="flex items-center space-x-3 shrink-0">
            <BuildViewDialog />
            {/* Liten förstoringsglas-ikon på övriga sidor; startsidan har den stora sökrutan före korten. */}
            {!isHome && <GlobalSearch variant="icon" />}
            <LanguageSwitcher />
            <MobileNav />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    aria-label={t.account}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700 text-slate-200">
                  <DropdownMenuLabel className="truncate font-normal text-slate-400">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  {isAdmin && (
                    <DropdownMenuItem onClick={handleAdminClick} className="cursor-pointer focus:bg-slate-800 focus:text-white">
                      <Settings className="h-4 w-4 mr-2" />
                      {t.admin}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer focus:bg-slate-800 focus:text-white">
                    <User className="h-4 w-4 mr-2" />
                    {t.profile}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer focus:bg-slate-800 focus:text-white">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleSignIn}
                variant="outline" 
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <LogIn className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t.signIn}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
