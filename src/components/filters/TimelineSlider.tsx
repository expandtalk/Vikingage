import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GERMANIC_TIME_PERIODS, getGroupsByPeriod } from '@/utils/germanicTimeline/timelineData';
import { VikingEvents } from './timeline/VikingEvents';
import { TimelineInfo } from './timeline/TimelineInfo';
import { TimelinePeriodSelector } from './timeline/TimelinePeriodSelector';
import { DatingIntegration } from '../timeline/DatingIntegration';

interface TimelineSliderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onMapNavigate?: (lat: number, lng: number, zoom: number) => void;
  className?: string;
}

// Timeline ranges from 45000 BCE to 1066 CE
const TIMELINE_START = -45000;
const TIMELINE_END = 1066;
const TIMELINE_RANGE = TIMELINE_END - TIMELINE_START;

// Key Viking events with navigation coordinates
const VIKING_EVENTS = [
  {
    year: 793,
    nameEn: "Lindisfarne",
    nameSv: "Lindisfarne",
    descriptionEn: "Norwegian Vikings attacked the monastery, shocking the Christian world and marking the traditional beginning of the Viking Age.",
    descriptionSv: "Norska vikingar attackerade klostret på Holy Island, vilket chockade den kristna världen och markerar traditionellt början på vikingatiden.",
    coordinates: { lat: 55.67, lng: -1.79, zoom: 8 }
  },
  {
    year: 845,
    nameEn: "Paris",
    nameSv: "Paris",
    descriptionEn: "Ragnar Lodbrok led a massive Viking fleet to besiege Paris. The Frankish king paid a huge ransom to make the Vikings leave.",
    descriptionSv: "Ragnar Lodbrok ledde en massiv vikingaflotta för att belägra Paris. Den frankiske kungen betalade en enorm lösensumma för att få vikingarna att dra sig tillbaka.",
    coordinates: { lat: 48.8566, lng: 2.3522, zoom: 8 }
  },
  {
    year: 862,
    nameEn: "Rurik",
    nameSv: "Rurik",
    descriptionEn: "Swedish Viking chieftain Rurik established the first Russian dynasty in Novgorod, laying the foundation for what would become Russia.",
    descriptionSv: "Den svenske vikingahövdingen Rurik etablerade den första ryska dynastin i Novgorod, vilket lade grunden för det som skulle bli Ryssland.",
    coordinates: { lat: 58.5, lng: 31.3, zoom: 7 }
  },
  {
    year: 1000,
    nameEn: "America",
    nameSv: "Amerika",
    descriptionEn: "Leif Erikson reached America 500 years before Columbus, establishing a settlement in Newfoundland.",
    descriptionSv: "Leif Eriksson nådde Amerika 500 år före Columbus och etablerade en bosättning på Newfoundland.",
    coordinates: { lat: 51.6, lng: -55.5, zoom: 6 }
  },
  {
    year: 1066,
    nameEn: "Hastings",
    nameSv: "Hastings",
    descriptionEn: "William the Conqueror's victory changed England forever and marks the end of the Viking Age.",
    descriptionSv: "William Erörarens seger förändrade England för alltid och markerar slutet på vikingatiden.",
    coordinates: { lat: 50.9, lng: 0.6, zoom: 8 }
  }
];

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  selectedPeriod,
  onPeriodChange,
  onMapNavigate,
  className = ""
}) => {
  const { language } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<typeof VIKING_EVENTS[0] | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPeriodDetails, setSelectedPeriodDetails] = useState<any>(null);
  
  // Find current period data
  const currentPeriod = GERMANIC_TIME_PERIODS.find(p => p.id === selectedPeriod);
  
  // Utility functions
  const yearToSliderValue = (year: number): number => {
    return ((year - TIMELINE_START) / TIMELINE_RANGE) * 100;
  };

  const sliderValueToYear = (value: number): number => {
    return Math.round(TIMELINE_START + (value / 100) * TIMELINE_RANGE);
  };

  const formatYear = (year: number): string => {
    if (year === 0) {
      return language === 'sv' ? 'Kristus födelse år 0' : 'Birth of Christ year 0';
    }
    if (year < 0) {
      return `${Math.abs(year)} ${language === 'sv' ? 'f.Kr.' : 'BCE'}`;
    }
    return `${year} ${language === 'sv' ? 'e.Kr.' : 'CE'}`;
  };

  // Get slider range - show full timeline by default
  const getSliderRange = (): [number, number] => {
    if (!currentPeriod) return [0, 100]; // Full timeline if no period selected
    return [
      yearToSliderValue(currentPeriod.startYear),
      yearToSliderValue(currentPeriod.endYear)
    ];
  };

  const [sliderValues, setSliderValues] = useState<[number, number]>(getSliderRange());

  // Handle slider change with real-time updates
  const handleSliderChange = (values: number[]) => {
    const newValues: [number, number] = [values[0], values[1]];
    setSliderValues(newValues);
    
    // Find the best matching period for the selected range
    const startYear = sliderValueToYear(newValues[0]);
    const endYear = sliderValueToYear(newValues[1]);
    
    const matchingPeriod = GERMANIC_TIME_PERIODS.find(period => {
      const periodRange = period.endYear - period.startYear;
      const selectedRange = endYear - startYear;
      const startDiff = Math.abs(period.startYear - startYear);
      const endDiff = Math.abs(period.endYear - endYear);
      
      return startDiff <= 100 && endDiff <= 100 && Math.abs(periodRange - selectedRange) <= 200;
    });

    if (matchingPeriod && matchingPeriod.id !== selectedPeriod) {
      onPeriodChange(matchingPeriod.id);
    }
  };

  // Handle period selection
  const handlePeriodSelect = (period: any) => {
    setSelectedPeriodDetails(period);
    setIsExpanded(true);
  };

  // Handle event click with map navigation
  const handleEventClick = (event: typeof VIKING_EVENTS[0]) => {
    if (selectedEvent?.year === event.year) {
      setSelectedEvent(null);
    } else {
      setSelectedEvent(event);
      if (onMapNavigate) {
        onMapNavigate(event.coordinates.lat, event.coordinates.lng, event.coordinates.zoom);
      }
    }
  };

  // Update slider when period changes externally
  useEffect(() => {
    const newRange = getSliderRange();
    setSliderValues(newRange);
  }, [selectedPeriod]);

  // Get relevant groups for current period
  const relevantGroups = currentPeriod ? getGroupsByPeriod(currentPeriod.id) : [];

  // Show current period if selected, otherwise show full timeline info
  const displayPeriod = selectedPeriodDetails || currentPeriod;

  // Get current period years for dating integration
  const currentStartYear = currentPeriod ? currentPeriod.startYear : sliderValueToYear(sliderValues[0]);
  const currentEndYear = currentPeriod ? currentPeriod.endYear : sliderValueToYear(sliderValues[1]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Compact header with expand/collapse */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-medium text-sm">
            {language === 'sv' ? 'Historisk tidslinje' : 'Historical Timeline'}
          </h3>
          {displayPeriod ? (
            <span className="text-white/80 text-xs bg-amber-900/30 px-2 py-1 rounded">
              {language === 'sv' ? displayPeriod.name : (displayPeriod.nameEn || displayPeriod.name)}
            </span>
          ) : (
            <span className="text-white/80 text-xs bg-blue-900/30 px-2 py-1 rounded">
              {language === 'sv' ? 'Hela tidslinjen' : 'Full timeline'}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white hover:text-white/80 text-xs px-2 py-1 rounded hover:bg-amber-900/20 transition-colors"
        >
          {isExpanded ? '− Mindre' : '+ Mer'}
        </button>
      </div>

      {/* Always visible: Interactive period selector */}
      <TimelinePeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        onPeriodSelect={handlePeriodSelect}
        language={language}
      />

      {/* Skjutreglaget borttaget (Daniel): det fungerade inte och gjorde modulen
          otydlig. Perioden väljs med knappar (TimelinePeriodSelector) ovan. */}

      {/* Expandable content */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-amber-500/20">
          <TimelineInfo
            currentPeriod={displayPeriod}
            relevantGroupsCount={relevantGroups.length}
            language={language}
          />

          {/* Dating Integration */}
          <DatingIntegration
            selectedPeriod={selectedPeriod}
            startYear={currentStartYear}
            endYear={currentEndYear}
          />

          <VikingEvents
            events={VIKING_EVENTS}
            selectedEvent={selectedEvent}
            onEventClick={handleEventClick}
            language={language}
            isVisible={selectedPeriod === 'viking_age'}
          />
        </div>
      )}
    </div>
  );
};
