import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Link2, ScrollText, Users } from 'lucide-react';
import { useKingRelations } from '@/hooks/chronicles/useKingRelations';
import { KingSourceMentions } from './KingSourceMentions';
import { KingInscriptionLinks } from './KingInscriptionLinks';
import { useLanguage } from '@/contexts/LanguageContext';
import type { HistoricalKing, KingSourceMention } from '@/hooks/useRoyalChronicles';

interface KingDetailPanelProps {
  king: HistoricalKing;
  sourceMentions?: KingSourceMention[];
}

const ATTEST_LABEL: Record<string, { sv: string; en: string }> = {
  frankisk: { sv: 'Frankisk', en: 'Frankish' },
  anglosaxisk: { sv: 'Anglosaxisk', en: 'Anglo-Saxon' },
  irisk: { sv: 'Irisk', en: 'Irish' },
  bysantinsk: { sv: 'Bysantinsk', en: 'Byzantine' },
  arabisk: { sv: 'Arabisk', en: 'Arabic' },
  rysk: { sv: 'Rysk', en: 'Rus' },
  påvlig: { sv: 'Påvlig', en: 'Papal' },
  tysk: { sv: 'Tysk', en: 'German' },
};

const REL_LABEL: Record<string, { sv: string; en: string }> = {
  äktenskap: { sv: 'gift med', en: 'married to' },
  förälder: { sv: 'förälder/barn', en: 'parent/child' },
  fostran: { sv: 'fostrad hos', en: 'fostered by' },
  exil_hos: { sv: 'i exil hos', en: 'in exile with' },
  tjänst_hos: { sv: 'i tjänst hos', en: 'in service of' },
  fadderskap: { sv: 'fadderskap', en: 'godparent' },
  'dråp/strid': { sv: 'dråp/strid', en: 'killing/battle' },
  skald: { sv: 'skald', en: 'skald (court poet)' },
  hovskald: { sv: 'hovskald', en: 'court skald' },
};

export const KingDetailPanel: React.FC<KingDetailPanelProps> = ({ king, sourceMentions }) => {
  const { language } = useLanguage();
  const sv = language !== 'en';
  const { data: relations } = useKingRelations(king.name);

  const attest = (king.external_attestation ?? []).filter(Boolean);
  const rels = relations ?? [];

  return (
    <Card className="bg-slate-800/70 backdrop-blur-md border-amber-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-amber-400" />
          {king.name}
        </CardTitle>
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {king.role && <span>{king.role}</span>}
          <span>· {king.region}</span>
          {king.reign_start && <span>· {king.reign_start}{king.reign_end ? `–${king.reign_end}` : ''}</span>}
          {king.de_facto_ruler && <span>· {sv ? 'de facto-härskare' : 'de facto ruler'}</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {king.description && <p className="text-slate-200 leading-relaxed">{king.description}</p>}

        <div className="flex flex-wrap gap-2">
          {king.runestone_mentions && (
            <Badge className="bg-blue-700 text-white">✓ {sv ? 'Runstensbelagd' : 'Runestone-attested'}</Badge>
          )}
          {king.archaeological_evidence && (
            <Badge className="bg-green-700 text-white">✓ {sv ? 'Arkeologiskt belägg' : 'Archaeological evidence'}</Badge>
          )}
          {attest.map((a) => (
            <Badge key={a} variant="outline" className="border-amber-500/50 text-amber-200">
              {(ATTEST_LABEL[a]?.[sv ? 'sv' : 'en']) ?? a}
            </Badge>
          ))}
        </div>

        {king.sources && (
          <div className="flex items-start gap-2 text-slate-300">
            <BookOpen className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
            <span><span className="text-slate-400">{sv ? 'Källor:' : 'Sources:'}</span> {king.sources}</span>
          </div>
        )}

        {rels.length > 0 && (
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
              <Users className="h-3 w-3" /> {sv ? 'Relationer' : 'Relations'}
            </div>
            <ul className="space-y-1">
              {rels.map((r) => {
                const other = r.person_a.toLowerCase() === king.name.toLowerCase() ? r.person_b : r.person_a;
                const rel = REL_LABEL[r.relation_type]?.[sv ? 'sv' : 'en'] ?? r.relation_type;
                return (
                  <li key={r.id} className="text-slate-300">
                    <Link2 className="inline h-3 w-3 text-slate-500 mr-1" />
                    {rel} <span className="text-white">{other}</span>
                    {r.period ? <span className="text-slate-500"> ({r.period})</span> : null}
                    {r.comment ? <span className="text-slate-400"> — {r.comment}</span> : null}
                    {r.source ? <span className="text-slate-500 italic"> · {r.source}</span> : null}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <KingInscriptionLinks kingId={king.id} />

        {sourceMentions && sourceMentions.length > 0 && <KingSourceMentions sourceMentions={sourceMentions} />}
      </CardContent>
    </Card>
  );
};
