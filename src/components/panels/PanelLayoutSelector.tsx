import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExploreProfiles } from "@/hooks/useExploreProfiles";
import { useActiveExploreRole, setActiveExploreRole } from "@/hooks/useActiveExploreRole";
import { PROFILE_ICONS } from "@/config/exploreCapabilities";

export const PanelLayoutSelector: React.FC = () => {
  const profiles = useExploreProfiles();
  const activeId = useActiveExploreRole();
  const { language } = useLanguage();
  const lang = language === "en" ? "en" : "sv";
  const activeProfile = profiles.find((p) => p.id === activeId) ?? profiles[0];
  // Kondenserad som standard — visar bara aktiv profil tills man fäller ut.
  const [expanded, setExpanded] = useState(false);
  const ActiveIcon = activeProfile ? PROFILE_ICONS[activeProfile.icon] : null;

  return (
    <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
      <CardContent className="p-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`flex w-full items-center justify-between text-left ${expanded ? "mb-3" : ""}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm font-medium text-slate-200 shrink-0">
              {lang === "en" ? "Interest profile" : "Intresseprofil"}
            </h3>
            {!expanded && ActiveIcon ? <ActiveIcon className="h-4 w-4 text-blue-400 shrink-0" /> : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs text-slate-300 border-slate-500">
              {activeProfile?.label[lang]}
            </Badge>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {expanded && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {profiles.map((profile) => {
            const IconComponent = PROFILE_ICONS[profile.icon];
            const isActive = activeId === profile.id;

            return (
              <Button
                key={profile.id}
                onClick={() => setActiveExploreRole(profile.id)}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`h-auto p-3 flex flex-col items-center gap-2 transition-all ${
                  isActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                    : "bg-slate-700/50 hover:bg-slate-600/60 text-slate-200 border-slate-500/50"
                }`}
              >
                {IconComponent ? <IconComponent className="h-4 w-4" /> : null}
                <div className="text-center">
                  <div className="text-xs font-medium">{profile.label[lang]}</div>
                  <div className="text-xs opacity-75 mt-1">{profile.description[lang]}</div>
                </div>
              </Button>
            );
          })}
        </div>
        )}
      </CardContent>
    </Card>
  );
};
