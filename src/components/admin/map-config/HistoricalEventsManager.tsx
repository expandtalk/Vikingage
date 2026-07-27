
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Calendar, Swords, Ship, Crown, Mountain } from 'lucide-react';

const HISTORICAL_EVENTS = [
  {
    id: 'ice_retreat',
    name: 'Inlandsisens tillbakadragning',
    period: 'paleolithic',
    year: -10000,
    coordinates: { lat: 60.0, lng: 15.0 },
    description: 'Istiden slutar, Skandinavien blir isfritt',
    type: 'geographical',
    impact: 'major'
  },
  {
    id: 'hamburg_culture',
    name: 'Hamburgkulturen',
    period: 'paleolithic', 
    year: -12000,
    coordinates: { lat: 55.5, lng: 13.0 },
    description: 'Första människorna i Sydskandinavien',
    type: 'cultural',
    impact: 'major'
  },
  {
    id: 'uppsala_temple',
    name: 'Templet i Uppsala',
    period: 'vendel_period',
    year: 600,
    coordinates: { lat: 59.9, lng: 17.6 },
    description: 'Odin/Frej-templet etableras som kultcentrum',
    type: 'religious',
    impact: 'major'
  },
  {
    id: 'lindisfarne_raid',
    name: 'Lindisfarne-raidet',
    period: 'viking_age',
    year: 793,
    coordinates: { lat: 55.7, lng: -1.8 },
    description: 'Första dokumenterade vikingaraid, vikingatiden börjar',
    type: 'military',
    impact: 'major'
  }
];

const EVENT_TYPES = [
  { id: 'geographical', label: 'Geografisk', icon: Mountain, color: 'bg-green-600' },
  { id: 'cultural', label: 'Kulturell', icon: Crown, color: 'bg-purple-600' },
  { id: 'religious', label: 'Religiös', icon: MapPin, color: 'bg-amber-600' },
  { id: 'military', label: 'Militär', icon: Swords, color: 'bg-red-600' },
  { id: 'trade', label: 'Handel', icon: Ship, color: 'bg-blue-600' }
];

export const HistoricalEventsManager: React.FC = () => {
  const [events, setEvents] = useState(HISTORICAL_EVENTS);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const filteredEvents = selectedPeriod === 'all' 
    ? events 
    : events.filter(event => event.period === selectedPeriod);

  const getEventTypeInfo = (typeId: string) => {
    return EVENT_TYPES.find(type => type.id === typeId) || EVENT_TYPES[0];
  };

  const handleAddNew = () => {
    setEditingEvent({
      name: '',
      period: 'viking_age',
      year: 800,
      coordinates: { lat: 59.0, lng: 18.0 },
      description: '',
      type: 'cultural',
      impact: 'minor'
    });
    setIsAddingNew(true);
  };

  const formatYear = (year: number) => {
    if (year < 0) {
      return `${Math.abs(year)} f.Kr.`;
    }
    return `${year} e.Kr.`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historiska Händelser & Markörer
              </CardTitle>
              <p className="text-slate-300 text-sm mt-1">
                Hantera viktiga historiska händelser som visas på kartan
              </p>
            </div>
            
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Lägg till händelse
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4">
            <Label className="text-white">Filtrera efter period:</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla perioder</SelectItem>
                <SelectItem value="paleolithic">Paleolitikum</SelectItem>
                <SelectItem value="mesolithic">Mesolitikum</SelectItem>
                <SelectItem value="neolithic">Neolitikum</SelectItem>
                <SelectItem value="bronze_age">Bronsålder</SelectItem>
                <SelectItem value="pre_roman_iron">Förromersktid</SelectItem>
                <SelectItem value="roman_iron">Romersktid</SelectItem>
                <SelectItem value="migration_period">Folkvandringstid</SelectItem>
                <SelectItem value="vendel_period">Vendeltid</SelectItem>
                <SelectItem value="viking_age">Vikingatid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Timeline */}
      <div className="space-y-4">
        {filteredEvents
          .sort((a, b) => a.year - b.year)
          .map((event) => {
            const typeInfo = getEventTypeInfo(event.type);
            const IconComponent = typeInfo.icon;
            
            return (
              <Card key={event.id} className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="text-white font-medium">{event.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-slate-300 border-slate-500">
                              {formatYear(event.year)}
                            </Badge>
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                            <Badge variant={event.impact === 'major' ? 'default' : 'outline'}>
                              {event.impact === 'major' ? 'Stor påverkan' : 'Liten påverkan'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-300 text-sm mb-3">{event.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>📍 {event.coordinates ? `${event.coordinates.lat.toFixed(1)}°N, ${event.coordinates.lng.toFixed(1)}°E` : '—'}</span>
                        <span>📅 {event.period.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-slate-300">
                        Redigera
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400">
                        Ta bort
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">Inga händelser för denna period</h3>
            <p className="text-slate-300 text-sm">
              Lägg till historiska händelser för att visa viktiga milstolpar på kartan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
