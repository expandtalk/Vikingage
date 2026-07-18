
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useDynastyMembers } from '@/hooks/chronicles/useDynastyMembers';
import { useLanguage } from '@/contexts/LanguageContext';
import type { RoyalDynasty } from '@/hooks/useRoyalChronicles';

interface DynastyCardProps {
  dynasty: RoyalDynasty;
  onMemberSelect?: (kingId: string) => void;
}

const statusColor: Record<string, string> = {
  historical: 'text-green-400',
  semi_legendary: 'text-yellow-400',
  legendary: 'text-purple-400',
  disputed: 'text-red-400',
};

export const DynastyCard: React.FC<DynastyCardProps> = ({ dynasty, onMemberSelect }) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const { data: members, isLoading } = useDynastyMembers(open ? dynasty.id : undefined);

  const reign = (s: number | null, e: number | null) =>
    s && e ? `${s}–${e}` : s ? `${language === 'en' ? 'from' : 'från'} ${s}` : '';

  return (
    <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
      <CardContent className="p-4">
        <button
          className="w-full text-left"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-white font-semibold text-lg">{dynasty.name}</h3>
            <div className="flex items-center gap-1 text-purple-400">
              <Users className="h-5 w-5" />
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>

          <div className="text-slate-400 text-sm space-y-1 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {dynasty.region}
            </div>
            {dynasty.period_start && dynasty.period_end && (
              <div>Period: {dynasty.period_start}–{dynasty.period_end}</div>
            )}
          </div>

          {dynasty.description && <p className="text-slate-300 text-sm">{dynasty.description}</p>}
        </button>

        {open && (
          <div className="mt-3 pt-3 border-t border-slate-600/40 space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
              {language === 'en' ? 'Members' : 'Medlemmar'}
              {members ? ` (${members.length})` : ''}
            </div>
            {isLoading && <div className="text-slate-500 text-sm">{language === 'en' ? 'Loading…' : 'Laddar…'}</div>}
            {members && members.length === 0 && (
              <div className="text-slate-500 text-sm">{language === 'en' ? 'No members recorded' : 'Inga medlemmar registrerade'}</div>
            )}
            {members?.map((m) => (
              <button
                key={m.id}
                onClick={() => onMemberSelect?.(m.id)}
                disabled={!onMemberSelect}
                className={`w-full flex items-center justify-between gap-2 text-left px-2 py-1 rounded ${
                  onMemberSelect ? 'hover:bg-slate-700/60 cursor-pointer' : 'cursor-default'
                }`}
              >
                <span className="text-slate-200 text-sm truncate">
                  {m.name}
                  {m.reign_start ? <span className="text-slate-500 ml-1">· {reign(m.reign_start, m.reign_end)}</span> : null}
                </span>
                <span className={`text-xs shrink-0 ${statusColor[m.status] ?? 'text-slate-400'}`}>●</span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
