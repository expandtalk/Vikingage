import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Ship, MapPin } from 'lucide-react';
import { useShipwrecks, type Shipwreck } from './shipwrecks/useShipwrecks';
import { ShipwreckModal } from './shipwrecks/ShipwreckModal';

export const AdminShipwrecks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Shipwreck | null>(null);
  const { shipwrecks, isLoading, createShipwreck, updateShipwreck, deleteShipwreck } = useShipwrecks();

  const filtered = (shipwrecks || []).filter((w) =>
    [w.name, w.survey_label, w.identification, w.vessel_type, w.raa_number]
      .filter(Boolean).some((s) => String(s).toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleSave = async (args: { payload: Record<string, unknown>; lat: number | null; lng: number | null }) => {
    if (selected) await updateShipwreck.mutateAsync({ id: selected.id, ...args });
    else await createShipwreck.mutateAsync(args);
    setIsModalOpen(false);
    setSelected(null);
  };

  const handleDelete = async (w: Shipwreck) => {
    if (window.confirm(`Ta bort vraket ${w.name}?`)) await deleteShipwreck.mutateAsync(w.id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5" /> Skeppsvrak (marinarkeologi)</CardTitle>
              <CardDescription>Vrakrapporter: position, konstruktion, datering, identifiering och proveniens. Fyll bara i det som är belagt.</CardDescription>
            </div>
            <Button onClick={() => { setSelected(null); setIsModalOpen(true); }} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Ny vrakrapport
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Sök vrak…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Badge variant="outline">{filtered.length} av {shipwrecks?.length || 0}</Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((w) => (
                <Card key={w.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{w.name}</CardTitle>
                        <CardDescription className="text-sm">{w.identification || w.vessel_type}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelected(w); setIsModalOpen(true); }} title="Redigera"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(w)} title="Ta bort"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {w.dating_summary && <p className="text-sm text-muted-foreground line-clamp-2">{w.dating_summary}</p>}
                    <div className="flex flex-wrap gap-2">
                      {w.vessel_type && <Badge variant="secondary" className="text-xs">{w.vessel_type}</Badge>}
                      {w.dating_confidence && <Badge variant="outline" className="text-xs">datering: {w.dating_confidence}</Badge>}
                      {w.raa_number && <Badge variant="outline" className="text-xs">{w.raa_number}</Badge>}
                    </div>
                    {w.lat != null && w.lng != null && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /><span>{Number(w.lat).toFixed(4)}, {Number(w.lng).toFixed(4)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">{searchTerm ? 'Inga vrak hittades' : 'Inga vrak ännu'}</div>
          )}
        </CardContent>
      </Card>

      <ShipwreckModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelected(null); }}
        onSave={handleSave}
        wreck={selected}
        isLoading={createShipwreck.isPending || updateShipwreck.isPending}
      />
    </div>
  );
};
