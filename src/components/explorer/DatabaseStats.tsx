
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Database, TrendingUp, BookOpen, Shield, MapPin, Navigation, Users, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DatabaseStatsProps {
  dbStats: {
    totalInscriptions: number;
    totalAnalyses: number;
    totalNotes: number;
    totalCoordinates?: number;
    totalFortresses?: number;
    totalCities?: number;
    totalCarvers?: number;
    totalArtefacts?: number;
    totalRecords?: number;
  };
}

export const DatabaseStats: React.FC<DatabaseStatsProps> = ({ dbStats }) => {
  const { t, language } = useLanguage();
  const sv = language === 'sv';

  // Filter categories that have more than the minimum threshold
  const statsToShow = [
    {
      key: 'inscriptions',
      value: dbStats.totalInscriptions,
      label: t('runicInscriptions'),
      icon: Database,
      color: 'text-blue-400'
    },
    {
      key: 'coordinates',
      value: dbStats.totalCoordinates || 0,
      label: sv ? 'Koordinater' : 'Coordinates',
      icon: Navigation,
      color: 'text-green-400'
    },
    {
      key: 'carvers',
      value: dbStats.totalCarvers || 0,
      label: sv ? 'Runristare' : 'Rune carvers',
      icon: Users,
      color: 'text-orange-400'
    },
    {
      key: 'artefacts',
      value: dbStats.totalArtefacts || 0,
      label: sv ? 'Artefakter' : 'Artefacts',
      icon: Package,
      color: 'text-indigo-400'
    },
    {
      key: 'fortresses',
      value: dbStats.totalFortresses || 0,
      label: sv ? 'Vikingaborgar' : 'Viking fortresses',
      icon: Shield,
      color: 'text-red-400'
    },
    {
      key: 'cities',
      value: dbStats.totalCities || 0,
      label: sv ? 'Vikingastäder' : 'Viking towns',
      icon: MapPin,
      color: 'text-yellow-400'
    },
    {
      key: 'analyses',
      value: dbStats.totalAnalyses,
      label: t('aiAnalyses'),
      icon: TrendingUp,
      color: 'text-purple-400'
    },
    {
      key: 'notes',
      value: dbStats.totalNotes,
      label: t('researchNotes'),
      icon: BookOpen,
      color: 'text-amber-400'
    }
  ].filter(stat => {
    // Different thresholds for different types
    if (['carvers', 'artefacts'].includes(stat.key)) {
      return stat.value >= 5; // Lower threshold for carvers and artefacts
    }
    return stat.value >= 30; // Higher threshold for others
  });

  // Always show total if we have significant data
  if (dbStats.totalRecords && dbStats.totalRecords >= 100) {
    statsToShow.push({
      key: 'total',
      value: dbStats.totalRecords,
      label: sv ? 'Totalt i databasen' : 'Total in database',
      icon: Database,
      color: 'text-cyan-400'
    });
  }

  if (statsToShow.length === 0) {
    return null; // Don't show anything if no categories have enough data
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(statsToShow.length, 4)} gap-4`}>
      {statsToShow.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.key} className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stat.value.toLocaleString('sv-SE')}
                  </p>
                </div>
                <IconComponent className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
