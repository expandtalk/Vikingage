
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Building, ChevronDown, ChevronRight } from 'lucide-react';
import { LegendItemComponent } from './LegendItem';
import { LegendItem } from './types';

interface LegendCategoryProps {
  item: LegendItem;
  onToggleItem: (id: string) => void;
  expandedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

export const LegendCategory: React.FC<LegendCategoryProps> = ({
  item,
  onToggleItem,
  expandedCategories,
  onCategoryToggle
}) => {
  const isExpanded = expandedCategories.includes(item.id);
  // Rec #2 (tom-karta-fällan): visa summan av PÅSLAGNA barn, inte alla barn. En kategori
  // som är på men vars barn alla är av ritar inget på kartan — då ska ingen vilseledande
  // totalsiffra visas. Barnlösa kategorier faller tillbaka på item.count.
  const shownCount = item.children && item.children.length
    ? item.children.filter((c) => c.enabled).reduce((s, c) => s + (c.count || 0), 0)
    : (item.count || 0);
  return (
    <div className="mt-2">
      {/* Category header — hela raden fäller ut/in; bara switchen togglar på/av. */}
      <div className="flex items-center justify-between py-1.5 border-t border-slate-600/40 pt-2 bg-slate-800/85 rounded-md px-2 mb-1 hover:bg-slate-700/85 transition-colors">
        <button
          type="button"
          onClick={() => onCategoryToggle(item.id)}
          aria-expanded={isExpanded}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span className="flex items-center justify-center w-4 h-4 flex-shrink-0 text-slate-200">
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </span>

          <span className="flex items-center justify-center w-4 h-4 flex-shrink-0">
            <Building
              className="h-3 w-3"
              style={{ color: item.color, opacity: item.enabled ? 1 : 0.6 }}
            />
          </span>

          <span
            className={`text-xs flex-1 truncate leading-4 font-semibold transition-colors ${
              item.enabled ? 'text-white' : 'text-slate-200'
            }`}
            title={item.label}
          >
            {item.label}
          </span>

          {/* Summan visas bara när kategorin är på OCH minst ett barn är på, dämpat grått.
              Undviker både vilseledande siffra vid av-förälder och "på men karta tom". */}
          {item.enabled && shownCount > 0 && (
            <span
              className="text-[11px] tabular-nums text-slate-400 flex-shrink-0"
              title={`${shownCount} objekt`}
            >
              {shownCount.toLocaleString('sv-SE')}
            </span>
          )}
        </button>

        <Switch
          id={`legend-${item.id}`}
          checked={item.enabled}
          onCheckedChange={() => onToggleItem(item.id)}
          className="data-[state=checked]:bg-amber-600 scale-75 ml-2"
        />
      </div>

      {/* Children - only show if expanded and enabled. Barn som själva är kategorier
          renderas rekursivt (t.ex. Vägar under Vikingaleder). */}
      {isExpanded && item.enabled && item.children && (
        <div className="ml-2 mt-1 space-y-1 bg-slate-900/60 rounded-md p-2">
          {item.children.map((child) =>
            child.type === 'category' ? (
              <LegendCategory
                key={child.id}
                item={child}
                onToggleItem={onToggleItem}
                expandedCategories={expandedCategories}
                onCategoryToggle={onCategoryToggle}
              />
            ) : (
              <LegendItemComponent
                key={child.id}
                item={child}
                onToggleItem={onToggleItem}
                level={0}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};
