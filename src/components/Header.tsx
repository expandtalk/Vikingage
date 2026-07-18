
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

export const Header = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { language } = useLanguage();
  const navigate = useNavigate();

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

  const texts = {
    sv: { signOut: 'Logga ut', signIn: 'Logga in', admin: 'Admin' },
    en: { signOut: 'Sign out', signIn: 'Sign in', admin: 'Admin' }
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
              <p className="text-xs text-slate-400 leading-tight">
                Archaeological & Linguistic Database
              </p>
            </div>
          </Link>

          <Navigation />

          <div className="flex items-center space-x-3 shrink-0">
            <GlobalSearch />
            <LanguageSwitcher />
            <MobileNav />
            
            {user ? (
              <>
                <div className="hidden lg:flex items-center space-x-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-300">{user.email}</span>
                </div>
                {isAdmin && (
                  <Button 
                    onClick={handleAdminClick}
                    variant="outline" 
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t.admin}</span>
                  </Button>
                )}
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.signOut}</span>
                </Button>
              </>
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
