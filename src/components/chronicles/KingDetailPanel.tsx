import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Link2, ScrollText, Users, Crown, Coins as CoinsIcon, Bone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useKingRelations } from '@/hooks/chronicles/useKingRelations';
import { useCoins } from '@/hooks/useCoins';
import { useRoyalDynasties } from '@/hooks/chronicles/useRoyalDynasties';
import { useKingOsteology } from '@/hooks/chronicles/useKingOsteology';
import { KingSourceMentions } from './KingSourceMentions';
import { KingInscriptionLinks } from './KingInscriptionLinks';
import { DynastyArms } from './DynastyArms';
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
  const { data: dynasties } = useRoyalDynasties();
  const { data: coins } = useCoins();
  const { data: osteo } = useKingOsteology(king.id);

  const attest = (king.external_attestation ?? []).filter(Boolean);
  const rels = relations ?? [];
  const dynasty = dynasties?.find((d) => d.id === king.dynasty_id) ?? null;
  const kingCoins = (coins ?? []).filter((co) => co.issuer_king_id === king.id);
  const dynPeriod = dynasty && (dynasty.period_start || dynasty.period_end)
    ? `${dynasty.period_start ?? '?'}–${dynasty.period_end ?? ''}` : null;

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
        {king.image_url && (
          <figure className="float-right ml-3 mb-2 w-32 sm:w-40">
            <img
              src={king.image_url}
              alt={king.image_caption ?? king.name}
              loading="lazy"
              className="w-full rounded-md border border-amber-500/30 bg-slate-900/60 object-contain"
            />
            {(king.image_caption || king.image_credit) && (
              <figcaption className="mt-1 text-[10px] leading-tight text-slate-400">
                {king.image_caption}
                {king.image_credit && <span className="block italic">{king.image_credit}</span>}
              </figcaption>
            )}
          </figure>
        )}
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

        {dynasty && (
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <Crown className="h-3 w-3" /> {sv ? 'Dynasti' : 'Dynasty'}
            </div>
            <div className="text-white font-medium">
              {sv ? dynasty.name : (dynasty.name_en ?? dynasty.name)}
              {(dynasty.region || dynPeriod) && (
                <span className="text-xs font-normal text-slate-400"> · {[dynasty.region, dynPeriod].filter(Boolean).join(', ')}</span>
              )}
            </div>
            {dynasty.description && <p className="text-slate-300 text-xs mt-1 leading-relaxed">{dynasty.description}</p>}
          </div>
        )}

        <DynastyArms dynastyId={king.dynasty_id} compact />

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

        {kingCoins.length > 0 && (
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
              <CoinsIcon className="h-3 w-3" /> {sv ? 'Mynt & symboler' : 'Coins & symbols'} ({kingCoins.length})
            </div>
            <ul className="space-y-2">
              {kingCoins.map((co) => (
                <li key={co.id} className="flex gap-2">
                  {co.image_url && (
                    <img src={co.image_url} alt={co.name} loading="lazy"
                      className="w-12 h-12 rounded object-contain border border-amber-500/30 bg-slate-900/60 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-white">
                      {(sv ? co.name : (co.name_en ?? co.name))}
                      {co.denomination && <span className="text-slate-400"> · {co.denomination}</span>}
                    </div>
                    {(co.mint || co.metal) && (
                      <div className="text-[11px] text-slate-400">{[co.mint, co.metal].filter(Boolean).join(' · ')}</div>
                    )}
                    {(co.obverse || co.reverse) && (
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {co.obverse && <span>{sv ? 'Åtsida' : 'Obverse'}: {co.obverse}</span>}
                        {co.obverse && co.reverse && <span> · </span>}
                        {co.reverse && <span>{sv ? 'Frånsida' : 'Reverse'}: {co.reverse}</span>}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/sv/mynt" className="text-xs text-amber-300 hover:underline mt-1 inline-block">
              {sv ? 'Se alla mynt →' : 'See all coins →'}
            </Link>
          </div>
        )}

        {osteo && osteo.length > 0 && (
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
              <Bone className="h-3 w-3" /> {sv ? 'Osteologi & grav' : 'Osteology & grave'}
            </div>
            <div className="space-y-2">
              {osteo.map((o) => (
                <div key={o.id} className="rounded-md border border-slate-600/40 bg-slate-900/40 p-2 text-[13px]">
                  {o.site_name && (
                    <div className="flex items-center gap-1 text-slate-200 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" />{o.site_name}
                      {o.grave_number && <span className="text-slate-400 font-normal"> · {o.grave_number}</span>}
                    </div>
                  )}
                  <div className="text-slate-300 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {o.stature_cm != null && <span><span className="text-slate-500">{sv ? 'Längd' : 'Height'}:</span> {o.stature_cm} cm</span>}
                    {o.age && <span><span className="text-slate-500">{sv ? 'Ålder' : 'Age'}:</span> {o.age}</span>}
                    {o.archaeological_sex && <span><span className="text-slate-500">{sv ? 'Kön' : 'Sex'}:</span> {o.archaeological_sex === 'male' ? (sv ? 'man' : 'male') : o.archaeological_sex === 'female' ? (sv ? 'kvinna' : 'female') : o.archaeological_sex}</span>}
                  </div>
                  {o.pathology && <div className="text-slate-300 mt-1"><span className="text-slate-500">{sv ? 'Patologi' : 'Pathology'}:</span> {o.pathology}</div>}
                  {o.dental_status && <div className="text-slate-300 mt-1"><span className="text-slate-500">{sv ? 'Tandstatus' : 'Dental'}:</span> {o.dental_status}</div>}
                  {o.burial_context && <div className="text-slate-400 mt-1 text-[12px] leading-relaxed">{o.burial_context}</div>}
                  {o.source && <div className="text-slate-500 mt-1 text-[11px] italic">{o.source}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <KingInscriptionLinks kingId={king.id} />

        {sourceMentions && sourceMentions.length > 0 && <KingSourceMentions sourceMentions={sourceMentions} />}
      </CardContent>
    </Card>
  );
};
