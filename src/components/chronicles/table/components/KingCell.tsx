
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, MapPin, Calendar } from 'lucide-react';
import { useKingSourceMentions } from '@/hooks/useRoyalChronicles';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStatusBadge, isJarl } from '../utils/badgeUtils';
import { getDialogLabels } from '../utils/labelUtils';
import type { HistoricalKing } from '@/hooks/useRoyalChronicles';

interface KingCellProps {
  king: HistoricalKing;
  onSelectItem: (item: any) => void;
}

export const KingCell: React.FC<KingCellProps> = ({ king, onSelectItem }) => {
  const { language } = useLanguage();
  const { data: sourceMentions } = useKingSourceMentions(king.id);
  const dialogLabels = getDialogLabels(language);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-2 text-left justify-start w-full"
          onClick={() => onSelectItem({ type: 'king', data: king })}
        >
          <div className="space-y-1">
            <div className="font-medium text-white text-sm">{king.name}</div>
            <div className="flex flex-wrap gap-1">
              {getStatusBadge(king.status, language)}
              {isJarl(king) && (
                <Badge className="bg-purple-600 text-white text-xs">Jarl</Badge>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {king.reign_start}–{king.reign_end}
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            {king.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {king.image_url && (
            <figure className="float-right ml-4 mb-2 w-36 sm:w-44">
              <img
                src={king.image_url}
                alt={king.image_caption ?? king.name}
                loading="lazy"
                className="w-full rounded-md border border-slate-600 bg-slate-800 object-contain"
              />
              {(king.image_caption || king.image_credit) && (
                <figcaption className="mt-1 text-[10px] leading-tight text-slate-400">
                  {king.image_caption}
                  {king.image_credit && <span className="block italic">{king.image_credit}</span>}
                </figcaption>
              )}
            </figure>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-400">{dialogLabels.region}</div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {king.region}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">{dialogLabels.reignPeriod}</div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {king.reign_start}–{king.reign_end}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-slate-400">{dialogLabels.statusAndEvidence}</div>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(king.status, language)}
              {king.archaeological_evidence && (
                <Badge className="bg-green-600 text-white">{dialogLabels.archaeologicalEvidence}</Badge>
              )}
              {king.runestone_mentions && (
                <Badge className="bg-blue-600 text-white">{dialogLabels.runestoneNotations}</Badge>
              )}
              {isJarl(king) && (
                <Badge className="bg-purple-600 text-white">Jarl</Badge>
              )}
            </div>
          </div>

          {king.name_variations && king.name_variations.length > 0 && (
            <div>
              <div className="text-sm text-slate-400">{dialogLabels.nameVariations}</div>
              <div className="text-sm">{king.name_variations.join(', ')}</div>
            </div>
          )}

          {king.dynasty && (
            <div>
              <div className="text-sm text-slate-400">{dialogLabels.dynasty}</div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSelectItem({ type: 'dynasty', data: king.dynasty! })}
              >
                {king.dynasty.name}
              </Button>
            </div>
          )}

          {king.description && (
            <div>
              <div className="text-sm text-slate-400">{dialogLabels.description}</div>
              <div className="text-sm">{king.description}</div>
            </div>
          )}

          {sourceMentions && sourceMentions.length > 0 && (
            <div>
              <div className="text-sm text-slate-400">{dialogLabels.sourceMentions}</div>
              <div className="space-y-2">
                {sourceMentions.map((mention) => (
                  <div key={mention.id} className="bg-slate-800/40 p-2 rounded">
                    <div className="font-medium">{mention.source?.title}</div>
                    <div className="text-sm text-slate-300">{dialogLabels.mentionedAs}: {mention.mentioned_name}</div>
                    {mention.reliability_note && (
                      <div className="text-xs text-slate-400">{mention.reliability_note}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
