import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserRound } from 'lucide-react';
import { MobileDrawer } from '@/components/ui/mobile-drawer';
import { TimePeriodSelector } from '@/components/filters/TimePeriodSelector';
import { PanelLayoutSelector } from '@/components/panels/PanelLayoutSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// "Min sida" (mobil) — samlar intresseprofil + tidsperiod + konto på ETT ställe, öppnas via avatar-
// ikonen på kartan. Flyttar bort profil/tid-panelerna som annars sandwichade kartan på mobil (Daniel).
// Local-first: valen sparas redan lokalt (intresseprofil/legend/radie); inloggning = synk mellan enheter.
interface MobileProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTimePeriod: string;
  setSelectedTimePeriod: (value: string) => void;
}

export const MobileProfileSheet: React.FC<MobileProfileSheetProps> = ({
  isOpen,
  onClose,
  selectedTimePeriod,
  setSelectedTimePeriod,
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { user } = useAuth();

  return (
    <MobileDrawer isOpen={isOpen} onClose={onClose} title={sv ? 'ᚠ  Min sida' : 'ᚠ  My page'}>
      <div className="space-y-4">
        {/* Konto — inloggningen finns kvar, bara samlad här. */}
        <div className="rounded-lg border border-slate-600/60 bg-slate-800/50 p-3">
          {user ? (
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <UserRound className="h-4 w-4 text-amber-300 shrink-0" />
              <span className="min-w-0 truncate">
                {sv ? 'Inloggad som ' : 'Signed in as '}
                <span className="font-medium text-white">{user.email}</span>
              </span>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={onClose}
              className="flex items-center gap-2 text-sm font-medium text-amber-300 hover:text-amber-200"
            >
              <LogIn className="h-4 w-4" /> {sv ? 'Logga in / skapa konto' : 'Log in / create account'}
            </Link>
          )}
          <p className="mt-1.5 text-xs text-slate-400">
            {sv
              ? 'Dina val sparas på den här enheten. Logga in för att synka mellan enheter.'
              : 'Your choices are saved on this device. Log in to sync across devices.'}
          </p>
        </div>

        {/* Tidsperiod */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-200">{sv ? 'Tidsperiod' : 'Time period'}</h3>
          <TimePeriodSelector selectedPeriod={selectedTimePeriod} onPeriodChange={setSelectedTimePeriod} />
        </div>

        {/* Intresseprofil */}
        <div>
          <PanelLayoutSelector />
        </div>
      </div>
    </MobileDrawer>
  );
};
