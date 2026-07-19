import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Edit, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Inscription {
  id: string;
  signum: string;
  location?: string;
  parish?: string;
  province?: string;
  country?: string;
  coordinates?: any; // PostGIS point or null
  additional_latitude?: number;
  additional_longitude?: number;
}

export const AdminInscriptions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null);
  const [editingCoordinates, setEditingCoordinates] = useState(false);
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const { toast } = useToast();

  const searchInscriptions = async (query: string, filter: 'all' | 'missing' | 'high_priority') => {
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from('runic_inscriptions')
        .select('*')
        .order('signum');

      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(`signum.ilike.%${query}%,location.ilike.%${query}%,parish.ilike.%${query}%`);
      }

      if (filter === 'missing') {
        supabaseQuery = supabaseQuery.is('coordinates', null);
      } else if (filter === 'high_priority') {
        supabaseQuery = supabaseQuery.is('coordinates', null).not('location', 'is', null);
      }

      const { data, error } = await supabaseQuery.limit(5000); // Öka för att se alla runstenar
      
      if (error) throw error;
      setInscriptions(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Fel",
        description: "Kunde inte söka efter inskrifter",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCoordinates = async (inscriptionId: string, signum: string, lat: number, lng: number) => {
    try {
      const { error } = await supabase
        .from('additional_coordinates')
        .upsert({
          signum,
          latitude: lat,
          longitude: lng,
          source: 'manual_admin',
          confidence: 'high',
          notes: `Manually added by admin for ${signum}`
        }, {
          onConflict: 'signum'
        });

      if (error) throw error;

      toast({
        title: "Sparad",
        description: `Koordinater sparade för ${signum}`,
      });

      setEditingCoordinates(false);
      setSelectedInscription(null);
      setNewLat('');
      setNewLng('');
      
      // Refresh the search to show updated data
      if (searchTerm) {
        searchInscriptions(searchTerm, 'all');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara koordinater",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    searchInscriptions('', 'missing'); // Show missing coordinates by default
  }, []);

  const getCoordinateStatus = (inscription: Inscription) => {
    const hasCoords = (inscription.coordinates && typeof inscription.coordinates === 'object' && inscription.coordinates.x && inscription.coordinates.y) || 
                     (inscription.additional_latitude && inscription.additional_longitude);
    if (hasCoords) {
      return { status: 'has_coordinates', label: 'Har koordinater', color: 'bg-green-500' };
    }
    if (inscription.location && inscription.parish) {
      return { status: 'high_priority', label: 'Hög geocoding-potential', color: 'bg-blue-500' };
    }
    if (inscription.location) {
      return { status: 'medium_priority', label: 'Medium geocoding-potential', color: 'bg-yellow-500' };
    }
    return { status: 'no_coordinates', label: 'Saknar koordinater', color: 'bg-red-500' };
  };

  return (
    <Card className="viking-card relative z-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gold" />
          Runstenshantering
        </CardTitle>
        <CardDescription>
          Sök, filtrera och editera runstenar och deras koordinater
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Sök på signum, plats eller socken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => searchInscriptions(searchTerm, 'all')} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="missing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="missing" onClick={() => searchInscriptions(searchTerm, 'missing')}>
                Saknar koordinater
              </TabsTrigger>
              <TabsTrigger value="high_priority" onClick={() => searchInscriptions(searchTerm, 'high_priority')}>
                Hög potential
              </TabsTrigger>
              <TabsTrigger value="all" onClick={() => searchInscriptions(searchTerm, 'all')}>
                Alla
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {loading && <div className="text-center py-4">Söker...</div>}
          
          {inscriptions.map((inscription) => {
            const coordStatus = getCoordinateStatus(inscription);
            return (
              <div key={inscription.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold">{inscription.signum}</h3>
                      <Badge className={`${coordStatus.color} text-white`}>
                        {coordStatus.label}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {inscription.location && <div><strong>Plats:</strong> {inscription.location}</div>}
                      {inscription.parish && <div><strong>Socken:</strong> {inscription.parish}</div>}
                      {inscription.province && <div><strong>Landskap:</strong> {inscription.province}</div>}
                      
                      {/* Show existing coordinates */}
                      {inscription.coordinates && typeof inscription.coordinates === 'object' && inscription.coordinates.x && inscription.coordinates.y && (
                        <div><strong>Koordinater:</strong> {inscription.coordinates.y}, {inscription.coordinates.x}</div>
                      )}
                      {inscription.additional_latitude && inscription.additional_longitude && (
                        <div><strong>Tillagda koordinater:</strong> {inscription.additional_latitude}, {inscription.additional_longitude}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedInscription(inscription);
                        setEditingCoordinates(true);
                        // Pre-fill with existing coordinates if available
                        if (inscription.additional_latitude && inscription.additional_longitude) {
                          setNewLat(inscription.additional_latitude.toString());
                          setNewLng(inscription.additional_longitude.toString());
                        } else if (inscription.coordinates && typeof inscription.coordinates === 'object' && inscription.coordinates.x && inscription.coordinates.y) {
                          setNewLat(inscription.coordinates.y.toString());
                          setNewLng(inscription.coordinates.x.toString());
                        }
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      Editera
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {!loading && inscriptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Inga resultat hittades. Prova att söka eller ändra filter.
            </div>
          )}
        </div>

        {/* Edit coordinates modal */}
        <Dialog open={editingCoordinates} onOpenChange={setEditingCoordinates}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editera koordinater för {selectedInscription?.signum}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Latitud</label>
                <Input
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  placeholder="59.1234"
                  type="number"
                  step="any"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Longitud</label>
                <Input
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  placeholder="18.1234"
                  type="number"
                  step="any"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingCoordinates(false);
                  setSelectedInscription(null);
                  setNewLat('');
                  setNewLng('');
                }}
              >
                Avbryt
              </Button>
              <Button
                onClick={() => {
                  if (!selectedInscription) return;
                  const lat = parseFloat(newLat);
                  const lng = parseFloat(newLng);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    saveCoordinates(selectedInscription.id, selectedInscription.signum, lat, lng);
                  } else {
                    toast({
                      title: "Fel",
                      description: "Ogiltiga koordinater",
                      variant: "destructive"
                    });
                  }
                }}
                disabled={!newLat || !newLng}
              >
                Spara
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};