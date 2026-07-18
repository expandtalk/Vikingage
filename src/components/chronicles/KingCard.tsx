
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, CheckCircle, AlertTriangle, Users, MapPin, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { HistoricalKing } from '@/hooks/useRoyalChronicles';

interface KingCardProps {
  king: HistoricalKing;
  onClick: () => void;
}

export const KingCard: React.FC<KingCardProps> = ({ king, onClick }) => {
  const { language } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'historical':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'semi_legendary':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'legendary':
        return <Crown className="h-4 w-4 text-purple-400" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    const colors = {
      'historical': 'bg-green-600',
      'semi_legendary': 'bg-yellow-600',
      'legendary': 'bg-purple-600',
      'disputed': 'bg-red-600'
    };
    
    const labels = language === 'en' ? {
      'historical': 'Historical',
      'semi_legendary': 'Semi-legendary',
      'legendary': 'Legendary',
      'disputed': 'Disputed'
    } : {
      'historical': 'Historisk',
      'semi_legendary': 'Halvlegendarisk',
      'legendary': 'Legendarisk',
      'disputed': 'Omtvistad'
    };
    
    return (
      <Badge className={`${colors[status as keyof typeof colors]} text-white`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getGenderBadge = (gender: string) => {
    // "unknown" visas inte — det förvirrar (Daniel 2026-07-18).
    if (gender !== 'male' && gender !== 'female') return null;
    const colors = { male: 'bg-blue-600', female: 'bg-pink-600' };
    const labels = language === 'en'
      ? { male: 'King', female: 'Queen' }
      : { male: 'Kung', female: 'Drottning' };
    return (
      <Badge className={`${colors[gender as keyof typeof colors]} text-white`}>
        {labels[gender as keyof typeof labels]}
      </Badge>
    );
  };

  const isJarl = (ruler: HistoricalKing) => {
    // Only consider someone a jarl if their name explicitly contains "jarl" 
    // or if they are explicitly described as a jarl in their description
    // But exclude those who are described as both jarl and king (like "Jarl, senare kung")
    const nameContainsJarl = ruler.name.toLowerCase().includes('jarl');
    const descriptionContainsJarl = ruler.description?.toLowerCase().includes('jarl') || false;
    const descriptionContainsKung = ruler.description?.toLowerCase().includes('kung') || false;
    
    // If they're described as both jarl and king, prioritize king
    if (descriptionContainsJarl && descriptionContainsKung) {
      return false;
    }
    
    // Only return true if they are explicitly called a jarl and not described as a king
    return nameContainsJarl || (descriptionContainsJarl && !descriptionContainsKung);
  };

  return (
    <Card 
      className="bg-slate-800/60 backdrop-blur-md border-slate-600/30 cursor-pointer hover:bg-slate-700/60"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg">{king.name}</h3>
          <div className="flex items-center gap-1">
            {getStatusIcon(king.status)}
            {isJarl(king) && <Users className="h-4 w-4 text-purple-400" />}
            <User className="h-4 w-4 text-slate-400" />
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          {getStatusBadge(king.status)}
          {getGenderBadge(king.gender)}
          {isJarl(king) && (
            <Badge className="bg-purple-600 text-white">
              Jarl
            </Badge>
          )}
          {king.dynasty && (
            <Badge variant="outline" className="border-slate-500 text-slate-300">
              {king.dynasty.name}
            </Badge>
          )}
        </div>
        
        <div className="text-slate-400 text-sm space-y-1">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {king.region}
          </div>
          {king.reign_start && king.reign_end && (
            <div>{language === 'en' ? 'Reign:' : 'Regeringstid:'} {king.reign_start}–{king.reign_end}</div>
          )}
          {king.archaeological_evidence && (
            <div className="text-green-400">✓ {language === 'en' ? 'Archaeological evidence' : 'Arkeologiska bevis'}</div>
          )}
          {king.runestone_mentions && (
            <div className="text-blue-400">✓ {language === 'en' ? 'Runestone mentions' : 'Runstensnoteringar'}</div>
          )}
        </div>
        
        {king.description && (
          <p className="text-slate-300 text-sm mt-2 line-clamp-3">
            {king.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
