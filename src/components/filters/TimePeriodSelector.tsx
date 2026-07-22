
import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTimePeriods } from '@/hooks/useTimePeriods';

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  className?: string;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
  const { data: ALL_HISTORICAL_PERIODS } = useTimePeriods(); // ur DB (time_periods), hårdkodad fallback
  const selectedPeriodData = ALL_HISTORICAL_PERIODS.find(p => p.id === selectedPeriod);

  const timelineLabel = language === 'sv' ? 'Historisk Tidslinje' : 'Historical Timeline';
  const selectPlaceholder = language === 'sv' ? 'Välj tidsperiod' : 'Select time period';
  const researchNote = language === 'sv' 
    ? 'Baserat på arkeologisk forskning och historiska källor'
    : 'Based on archaeological research and historical sources';

  return (
    <div className={`${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 p-2"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{timelineLabel}</span>
              {selectedPeriodData && (
                <span className="text-xs text-amber-400">
                  ({language === 'sv' ? selectedPeriodData.name : selectedPeriodData.nameEn})
                </span>
              )}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-3 pt-2">
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="bg-slate-700/60 border-amber-500/30 text-amber-100 hover:bg-slate-600/60">
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-amber-500/30 z-50 max-h-60">
              {ALL_HISTORICAL_PERIODS.map((period) => {
                // Ensure period.id is not empty before rendering SelectItem
                if (!period.id || period.id.trim() === '') {
                  console.log('Skipping empty period id:', period);
                  return null;
                }
                return (
                  <SelectItem 
                    key={period.id} 
                    value={period.id} 
                    className="text-amber-100 hover:bg-amber-600/20 focus:bg-amber-600/20"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {language === 'sv' ? period.name : period.nameEn}
                      </span>
                      <span className="text-xs text-amber-300">
                        {period.startYear < 0 ? `${Math.abs(period.startYear)} ${language === 'sv' ? 'f.Kr.' : 'BCE'}` : `${period.startYear} ${language === 'sv' ? 'e.Kr.' : 'CE'}`} - 
                        {period.endYear < 0 ? ` ${Math.abs(period.endYear)} ${language === 'sv' ? 'f.Kr.' : 'BCE'}` : ` ${period.endYear} ${language === 'sv' ? 'e.Kr.' : 'CE'}`}
                      </span>
                    </div>
                  </SelectItem>
                );
              }).filter(Boolean)}
            </SelectContent>
          </Select>

          {selectedPeriodData && (
            <div className="bg-slate-700/40 rounded-md p-3 border border-amber-500/20">
              <h4 className="font-medium text-amber-200 mb-2 text-sm">
                {language === 'sv' ? selectedPeriodData.name : selectedPeriodData.nameEn}
              </h4>
              <p className="text-xs text-amber-100 mb-2">
                {language === 'sv' ? selectedPeriodData.description : selectedPeriodData.descriptionEn}
              </p>
              
              <div className="pt-2 mt-2 border-t border-amber-500/20">
                <p className="text-xs text-amber-400 italic">
                  {researchNote}
                </p>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
