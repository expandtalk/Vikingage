import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExploreProfiles } from "@/hooks/useExploreProfiles";
import { useActiveExploreRoles, toggleExploreRole, setPrimaryExploreRole } from "@/hooks/useActiveExploreRole";
import { PROFILE_ICONS } from "@/config/exploreCapabilities";
import { CompactSearchBox } from "../search/CompactSearchBox";
import { supabase } from "@/integrations/supabase/client";

interface PanelLayoutSelectorProps {
  // Sök inbäddad i profilkortet (ersätter den stora fristående sökrutan).
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  handleSearch?: () => void;
  totalInscriptions?: number;
  showSearch?: boolean;
}

export const PanelLayoutSelector: React.FC<PanelLayoutSelectorProps> = ({
  searchQuery = "",
  setSearchQuery,
  handleSearch,
  totalInscriptions = 0,
  showSearch = false,
}) => {
  const profiles = useExploreProfiles();
  const activeIds = useActiveExploreRoles();
  const { language } = useLanguage();
  const lang = language === "en" ? "en" : "sv";
  const activeProfile = profiles.find((p) => p.id === activeIds[0]) ?? profiles[0];

  // Spara nuvarande urval (union av valda profiler) som en PERSONLIG profil (owner_id, private).
  const saveAsMine = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) { window.alert(lang === "en" ? "Log in to save your own profile." : "Logga in för att spara en egen profil."); return; }
    const name = window.prompt(lang === "en" ? "Name your profile:" : "Namnge din profil:");
    if (!name) return;
    const selected = profiles.filter((p) => activeIds.includes(p.id));
    const primary = selected[0] ?? profiles[0];
    const layers: Record<string, boolean> = {};
    for (const p of selected) for (const k of Object.keys(p.layers)) if (p.layers[k]) layers[k] = true;
    const config = {
      icon: primary.icon, theme: primary.theme, basemap: primary.basemap,
      showTimeline: primary.showTimeline, defaultPeriod: primary.defaultPeriod,
      layers, primaryLayers: primary.primaryLayers, panels: primary.panels,
    };
    const id = `u-${crypto.randomUUID()}`;
    const { error } = await (supabase.from("explore_profiles") as any).insert({
      id, sort_order: 100, is_active: true, owner_id: uid, visibility: "private",
      label: { sv: name, en: name }, description: { sv: "Egen profil", en: "Personal profile" }, config,
    });
    window.alert(error
      ? (lang === "en" ? "Could not save (permission?)." : "Kunde inte spara (behörighet?).")
      : (lang === "en" ? "Saved as your profile." : "Sparad som din profil."));
  };
  // Kondenserad som standard — visar bara aktiv profil tills man fäller ut.
  const [expanded, setExpanded] = useState(false);
  const ActiveIcon = activeProfile ? PROFILE_ICONS[activeProfile.icon] : null;

  const canSearch = showSearch && !!setSearchQuery && !!handleSearch;
  const runSearch = (query: string) => {
    setSearchQuery?.(query);
    handleSearch?.();
  };

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

        {/* Sök + profilval visas BARA utfällt — kondenserat läge ska ta minimal yta. */}
        {expanded && canSearch && (
          <div className="mb-3">
            <CompactSearchBox
              onSearch={runSearch}
              onResultSelect={(result: any) => runSearch(result.signum)}
              placeholder={
                lang === "en"
                  ? `Search ${totalInscriptions.toLocaleString()} runestones...`
                  : `Sök bland ${totalInscriptions.toLocaleString()} runstenar...`
              }
              currentQuery={searchQuery}
            />
          </div>
        )}

        {expanded && (
        <>
        <p className="text-xs text-slate-400 mb-2">
          {lang === "en" ? "Pick several — layers combine. Click an active one twice to make it primary (basemap/time)."
                         : "Välj flera — lagren kombineras. Klicka en aktiv igen för att göra den primär (baskarta/tid)."}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {profiles.map((profile) => {
            const IconComponent = PROFILE_ICONS[profile.icon];
            const isActive = activeIds.includes(profile.id);
            const isPrimary = activeIds[0] === profile.id;

            return (
              <Button
                key={profile.id}
                onClick={() => (isActive && !isPrimary ? setPrimaryExploreRole(profile.id) : toggleExploreRole(profile.id))}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`relative h-auto min-h-[76px] w-full p-3 flex flex-col items-center gap-2 whitespace-normal break-words transition-all ${
                  isActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                    : "bg-slate-700/50 hover:bg-slate-600/60 text-slate-200 border-slate-500/50"
                }`}
              >
                {isPrimary && (
                  <span className="absolute top-1 right-1 text-[9px] px-1 rounded bg-amber-400 text-slate-900 font-semibold">
                    {lang === "en" ? "primary" : "primär"}
                  </span>
                )}
                {IconComponent ? <IconComponent className="h-4 w-4 shrink-0" /> : null}
                <div className="text-center w-full">
                  <div className="text-xs font-medium leading-tight">{profile.label[lang]}</div>
                  <div className="text-[11px] opacity-75 mt-1 leading-snug">{profile.description[lang]}</div>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={saveAsMine}
            className="text-xs bg-slate-700/50 hover:bg-slate-600/60 text-slate-200 border-slate-500/50">
            {lang === "en" ? "Save as my profile" : "Spara som min profil"}
          </Button>
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
};
