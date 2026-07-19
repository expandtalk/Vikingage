
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '@/contexts/LanguageContext';
import { KingCell } from './KingCell';
import { HistoricalEventBadge } from './HistoricalEventBadge';
import { HistoricalEventModal } from './HistoricalEventModal';
import { getTableHeaders } from '../utils/labelUtils';
import type { HistoricalKing } from '@/hooks/useRoyalChronicles';
import type { HistoricalEvent } from '@/hooks/useHistoricalEvents';

interface TimelineEntry {
  period: string;
  periodStart: number;
  periodEnd: number;
  sweden?: HistoricalKing[];
  denmark?: HistoricalKing[];
  norway?: HistoricalKing[];
  kievrus?: HistoricalKing[];
  historicalEvents?: HistoricalEvent[];
}

interface TimelineTableProps {
  timelineData: TimelineEntry[];
  onSelectItem: (item: any) => void;
}

export const TimelineTable: React.FC<TimelineTableProps> = ({ timelineData, onSelectItem }) => {
  const { language } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const tableHeaders = getTableHeaders(language);

  // Update table headers for period-based view
  const periodHeaders = {
    ...tableHeaders,
    year: language === 'en' ? 'Period' : 'Period',
    events: language === 'en' ? 'Historical Events' : 'Historiska händelser'
  };

  const handleEventClick = (event: HistoricalEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      {/* Rubriken ägs av TableModeView (ovanför togglen) — dubblerades tidigare här. */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left p-3 text-white font-medium whitespace-nowrap">{periodHeaders.year}</th>
                  <th className="text-left p-3 text-white font-medium">{periodHeaders.sweden}</th>
                  <th className="text-left p-3 text-white font-medium">{periodHeaders.denmark}</th>
                  <th className="text-left p-3 text-white font-medium">{periodHeaders.norway}</th>
                  <th className="text-left p-3 text-white font-medium">{periodHeaders.kievrus}</th>
                </tr>
              </thead>
              <tbody>
                {timelineData.map((entry, index) => (
                  <React.Fragment key={entry.period}>
                    <tr className={`border-b border-slate-700/50 ${index % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                      <td className="p-3 text-slate-300 font-mono whitespace-nowrap align-top">
                        {entry.periodStart}–{entry.periodEnd}
                      </td>
                      <td className="p-3 align-top">
                        {entry.sweden && entry.sweden.map((king, kingIndex) => (
                          <div key={king.id} className={kingIndex > 0 ? "mt-2" : ""}>
                            <KingCell king={king} onSelectItem={onSelectItem} />
                          </div>
                        ))}
                      </td>
                      <td className="p-3 align-top">
                        {entry.denmark && entry.denmark.map((king, kingIndex) => (
                          <div key={king.id} className={kingIndex > 0 ? "mt-2" : ""}>
                            <KingCell king={king} onSelectItem={onSelectItem} />
                          </div>
                        ))}
                      </td>
                      <td className="p-3 align-top">
                        {entry.norway && entry.norway.map((king, kingIndex) => (
                          <div key={king.id} className={kingIndex > 0 ? "mt-2" : ""}>
                            <KingCell king={king} onSelectItem={onSelectItem} />
                          </div>
                        ))}
                      </td>
                      <td className="p-3 align-top">
                        {entry.kievrus && entry.kievrus.map((king, kingIndex) => (
                          <div key={king.id} className={kingIndex > 0 ? "mt-2" : ""}>
                            <KingCell king={king} onSelectItem={onSelectItem} />
                          </div>
                        ))}
                      </td>
                    </tr>
                    {/* Historical Events Row - Visas under periodradenen för bättre läsbarhet */}
                    {entry.historicalEvents && entry.historicalEvents.length > 0 && (
                      <tr className={`${index % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                        <td colSpan={5} className="px-3 pb-3">
                          <div className="border-t border-slate-700/30 pt-2">
                            <div className="text-xs text-slate-400 mb-1">{periodHeaders.events}:</div>
                            <div className="flex flex-wrap gap-1">
                              {entry.historicalEvents.map((event) => (
                                <HistoricalEventBadge 
                                  key={event.id} 
                                  event={event} 
                                  onClick={handleEventClick}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <HistoricalEventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
