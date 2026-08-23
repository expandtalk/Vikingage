import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Map as MapIcon } from 'lucide-react';

// "Mina kartinställningar" — per-användare default: hemposition + vilka historiska kartlager som tänds.
// Skriver user_preferences (RLS: bara ägaren). Lagernycklarna är VERIFIERADE (historicalMapLayers),
// inte gissade; de dynamiskt genererade entitetslagren kan läggas till senare när de exponeras stabilt.

const HIST_LAYERS: { key: string; label: string }[] = [
  { key: 'histmap_topo', label: 'Häradskartan / topografiska (äldre)' },
  { key: 'histmap_generalstab', label: 'Generalstabskartan' },
  { key: 'histmap_haradsekonomiska', label: 'Häradsekonomiska kartan' },
  { key: 'histmap_relief', label: 'Höjdrelief (terräng)' },
];

export const MapPreferences: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [layers, setLayers] = useState<string[]>([]);
  const [homeLat, setHomeLat] = useState('');
  const [homeLng, setHomeLng] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any).from('user_preferences')
        .select('default_layers, home_lat, home_lng').eq('user_id', user.id).maybeSingle();
      if (data) {
        setLayers(Array.isArray(data.default_layers) ? data.default_layers : []);
        setHomeLat(data.home_lat != null ? String(data.home_lat) : '');
        setHomeLng(data.home_lng != null ? String(data.home_lng) : '');
      }
      setLoading(false);
    })();
  }, [user]);

  const toggle = (key: string) =>
    setLayers((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const save = async () => {
    if (!user) return;
    const lat = homeLat.trim() ? Number(homeLat) : null;
    const lng = homeLng.trim() ? Number(homeLng) : null;
    if ((lat != null && Number.isNaN(lat)) || (lng != null && Number.isNaN(lng))) {
      toast({ title: 'Ogiltig koordinat', description: 'Lat/lng måste vara tal.', variant: 'destructive' }); return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from('user_preferences').upsert({
      user_id: user.id, default_layers: layers, home_lat: lat, home_lng: lng,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) { toast({ title: 'Kunde inte spara', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Inställningar sparade' });
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapIcon className="h-5 w-5" /> Mina kartinställningar
        </h3>
        <p className="text-xs text-slate-400 mt-1">Vad som tänds som standard när du öppnar kartan.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-300 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Hämtar…</div>
      ) : (
        <>
          <div className="space-y-2">
            <Label className="text-white text-sm">Historiska kartlager (default på)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HIST_LAYERS.map((l) => (
                <label key={l.key} className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                  <input type="checkbox" checked={layers.includes(l.key)} onChange={() => toggle(l.key)} />
                  {l.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="space-y-1">
              <Label className="text-white text-sm">Hemposition — lat</Label>
              <Input value={homeLat} onChange={(e) => setHomeLat(e.target.value)} inputMode="decimal"
                className="bg-white/10 border-white/20 text-white" placeholder="59.33" />
            </div>
            <div className="space-y-1">
              <Label className="text-white text-sm">lng</Label>
              <Input value={homeLng} onChange={(e) => setHomeLng(e.target.value)} inputMode="decimal"
                className="bg-white/10 border-white/20 text-white" placeholder="18.06" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={save} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Spara
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MapPreferences;
