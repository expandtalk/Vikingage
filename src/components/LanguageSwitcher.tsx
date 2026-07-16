import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { getRouteByPath } from "@/config/routes";

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = (checked: boolean) => {
    const target = checked ? 'sv' : 'en';
    setLanguage(target);

    // For bilingual content pages, also move to the localized URL so the URL,
    // nav highlighting and language state stay in sync. Shared pages (home,
    // welcome, explore, auth, admin, profile, prices) have no localized route,
    // so we only switch the language for those.
    const current = getRouteByPath(location.pathname);
    if (current) {
      const dest = target === 'sv' ? current.pathSv : current.pathEn;
      if (dest !== location.pathname) {
        navigate(dest);
      }
    }
  };

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-600/50">
      <span className="text-xs text-slate-300">EN</span>
      <Switch
        checked={language === 'sv'}
        onCheckedChange={handleToggle}
        aria-label={language === 'sv' ? 'Byt språk till engelska' : 'Switch language to Swedish'}
        className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-slate-600 scale-75 mx-1"
      />
      <span className="text-xs text-slate-300">SV</span>
    </div>
  );
};
