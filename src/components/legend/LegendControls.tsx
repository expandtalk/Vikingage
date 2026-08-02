import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, RotateCcw, Check } from "lucide-react";
import { SAVED_VIEW_KEY } from '@/hooks/useLegendManager';

// Din vy sparas automatiskt (useLegendManager, samma nyckel — importerad, inte duplicerad,
// så de aldrig kan driva isär). "Återställ" rensar den sparade överstyrningen och läser om
// profilens standard — självständigt, utan prop-drilling genom kedjan.
const resetToProfileDefault = () => {
  try { localStorage.removeItem(SAVED_VIEW_KEY); } catch { /* privat läge */ }
  window.location.reload();
};

interface LegendControlsProps {
  onShowAll: () => void;
  onHideAll: () => void;
  hasVisibleItems: boolean;
  totalItems: number;
}

export const LegendControls: React.FC<LegendControlsProps> = ({
  onShowAll,
  onHideAll,
  hasVisibleItems,
  totalItems
}) => {
  return (
    <>
    <div className="flex gap-2 p-2 border-b border-white/10">
      <Button
        size="sm"
        variant="outline"
        onClick={onShowAll}
        className="flex-1 text-xs bg-blue-600/20 border-blue-400/60 text-blue-100 hover:bg-blue-500/30 hover:border-blue-300/80 font-medium"
        disabled={false}
      >
        <Eye className="h-3 w-3 mr-1" />
        Visa alla
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onHideAll}
        className="flex-1 text-xs bg-red-600/20 border-red-400/60 text-red-100 hover:bg-red-500/30 hover:border-red-300/80 font-medium"
        disabled={false}
      >
        <EyeOff className="h-3 w-3 mr-1" />
        Dölj alla
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={resetToProfileDefault}
        title="Återställ till profilens standard (rensar din sparade vy)"
        className="text-xs bg-slate-600/20 border-slate-400/60 text-slate-100 hover:bg-slate-500/30 font-medium"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Återställ
      </Button>
    </div>
    <p className="flex items-center gap-1 px-2 py-1 text-[10px] text-emerald-300/80 border-b border-white/10">
      <Check className="h-3 w-3" /> Din vy sparas automatiskt
    </p>
    </>
  );
};