import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Shipwreck } from './useShipwrecks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (args: { payload: Record<string, unknown>; lat: number | null; lng: number | null }) => void;
  wreck?: Shipwreck | null;
  isLoading: boolean;
}

const CONFIDENCE = ['', 'high', 'probable', 'possible', 'uncertain'];
const METHODS = ['', 'dendrochronology', 'radiocarbon', 'typology', 'historical'];

const EMPTY = {
  name: '', survey_label: '', vessel_type: '', identification: '', identification_confidence: '',
  construction: '', wood_species: '', length_m: '', beam_m: '', water_depth_m: '',
  lat: '', lng: '', coord_source: '', coord_precision_m: '',
  dating_summary: '', dating_earliest: '', dating_latest: '', dating_method: '', dating_confidence: '',
  sinking_year: '', sinking_event: '',
  raa_number: '', fornreg_ref: '', parish: '', municipality: '', landscape: '',
  also_known_as: '', source_ref: '', source_license: '', source_attribution: '', notes: '',
};

const num = (s: string) => (s.trim() === '' ? null : Number(s));

export const ShipwreckModal: React.FC<Props> = ({ isOpen, onClose, onSave, wreck, isLoading }) => {
  const [f, setF] = useState({ ...EMPTY });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (wreck) {
      setF({
        name: wreck.name ?? '', survey_label: wreck.survey_label ?? '', vessel_type: wreck.vessel_type ?? '',
        identification: wreck.identification ?? '', identification_confidence: wreck.identification_confidence ?? '',
        construction: wreck.construction ?? '', wood_species: wreck.wood_species ?? '',
        length_m: wreck.length_m?.toString() ?? '', beam_m: wreck.beam_m?.toString() ?? '', water_depth_m: wreck.water_depth_m?.toString() ?? '',
        lat: wreck.lat?.toString() ?? '', lng: wreck.lng?.toString() ?? '',
        coord_source: wreck.coord_source ?? '', coord_precision_m: wreck.coord_precision_m?.toString() ?? '',
        dating_summary: wreck.dating_summary ?? '', dating_earliest: wreck.dating_earliest?.toString() ?? '',
        dating_latest: wreck.dating_latest?.toString() ?? '', dating_method: wreck.dating_method ?? '', dating_confidence: wreck.dating_confidence ?? '',
        sinking_year: wreck.sinking_year?.toString() ?? '', sinking_event: wreck.sinking_event ?? '',
        raa_number: wreck.raa_number ?? '', fornreg_ref: wreck.fornreg_ref ?? '', parish: wreck.parish ?? '',
        municipality: wreck.municipality ?? '', landscape: wreck.landscape ?? '',
        also_known_as: (wreck.also_known_as ?? []).join(', '), source_ref: wreck.source_ref ?? '',
        source_license: wreck.source_license ?? '', source_attribution: wreck.source_attribution ?? '', notes: wreck.notes ?? '',
      });
    } else {
      setF({ ...EMPTY });
    }
  }, [wreck]);

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      name: f.name.trim(),
      survey_label: f.survey_label || null,
      vessel_type: f.vessel_type || null,
      identification: f.identification || null,
      identification_confidence: f.identification_confidence || null,
      construction: f.construction || null,
      wood_species: f.wood_species || null,
      length_m: num(f.length_m), beam_m: num(f.beam_m), water_depth_m: num(f.water_depth_m),
      coord_source: f.coord_source || null, coord_precision_m: num(f.coord_precision_m),
      dating_summary: f.dating_summary || null,
      dating_earliest: num(f.dating_earliest), dating_latest: num(f.dating_latest),
      dating_method: f.dating_method || null, dating_confidence: f.dating_confidence || null,
      sinking_year: num(f.sinking_year), sinking_event: f.sinking_event || null,
      raa_number: f.raa_number || null, fornreg_ref: f.fornreg_ref || null,
      parish: f.parish || null, municipality: f.municipality || null, landscape: f.landscape || null,
      also_known_as: f.also_known_as.trim() ? f.also_known_as.split(',').map((s) => s.trim()).filter(Boolean) : null,
      source_ref: f.source_ref || null, source_license: f.source_license || null,
      source_attribution: f.source_attribution || null, notes: f.notes || null,
    };
    onSave({ payload, lat: num(f.lat), lng: num(f.lng) });
  };

  const T = ({ label }: { label: string }) => (
    <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1 pt-2">{label}</h3>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{wreck ? 'Redigera vrak' : 'Ny vrakrapport'}</DialogTitle>
          <DialogDescription>Marinarkeologisk fältdokumentation — fyll i det som är belagt, lämna resten tomt.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <T label="Identitet" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Namn *</Label><Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="t.ex. Nya Enigheden" /></div>
            <div><Label>Undersökningsbeteckning</Label><Input value={f.survey_label} onChange={(e) => set('survey_label', e.target.value)} placeholder="t.ex. Vrak 1" /></div>
            <div><Label>Fartygstyp</Label><Input value={f.vessel_type} onChange={(e) => set('vessel_type', e.target.value)} placeholder="linjeskepp / brännare / fraktskepp / okänt" /></div>
            <div><Label>Även känt som (komma-separerat)</Label><Input value={f.also_known_as} onChange={(e) => set('also_known_as', e.target.value)} placeholder="Enigheden, Prins Christian" /></div>
            <div><Label>Identifiering</Label><Input value={f.identification} onChange={(e) => set('identification', e.target.value)} placeholder="föreslagen identitet" /></div>
            <div><Label>Identifierings-konfidens</Label>
              <Select value={f.identification_confidence || '—'} onValueChange={(v) => set('identification_confidence', v === '—' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{CONFIDENCE.map((c) => <SelectItem key={c || '—'} value={c || '—'}>{c || '—'}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <T label="Konstruktion & mått" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2"><Label>Konstruktion</Label><Input value={f.construction} onChange={(e) => set('construction', e.target.value)} placeholder="ek, kravell, tättspantat…" /></div>
            <div><Label>Träslag</Label><Input value={f.wood_species} onChange={(e) => set('wood_species', e.target.value)} placeholder="ek (Quercus) / furu (Pinus)" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Längd (m)</Label><Input type="number" step="0.1" value={f.length_m} onChange={(e) => set('length_m', e.target.value)} /></div>
              <div><Label>Bredd (m)</Label><Input type="number" step="0.1" value={f.beam_m} onChange={(e) => set('beam_m', e.target.value)} /></div>
              <div><Label>Djup (m)</Label><Input type="number" step="0.1" value={f.water_depth_m} onChange={(e) => set('water_depth_m', e.target.value)} /></div>
            </div>
          </div>

          <T label="Position" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Latitud (WGS84)</Label><Input type="number" step="0.000001" value={f.lat} onChange={(e) => set('lat', e.target.value)} placeholder="56.64613" /></div>
            <div><Label>Longitud (WGS84)</Label><Input type="number" step="0.000001" value={f.lng} onChange={(e) => set('lng', e.target.value)} placeholder="16.37927" /></div>
            <div><Label>Koordinatkälla</Label><Input value={f.coord_source} onChange={(e) => set('coord_source', e.target.value)} placeholder="SWEREF99TM→WGS84 (rapport)" /></div>
            <div><Label>Koordinat-precision (m)</Label><Input type="number" value={f.coord_precision_m} onChange={(e) => set('coord_precision_m', e.target.value)} placeholder="5" /></div>
          </div>

          <T label="Datering" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2"><Label>Dateringssammanfattning</Label><Input value={f.dating_summary} onChange={(e) => set('dating_summary', e.target.value)} placeholder="Dendro: avverkning efter 1632…" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Tidigast (år)</Label><Input type="number" value={f.dating_earliest} onChange={(e) => set('dating_earliest', e.target.value)} placeholder="1632" /></div>
              <div><Label>Senast (år)</Label><Input type="number" value={f.dating_latest} onChange={(e) => set('dating_latest', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Metod</Label>
                <Select value={f.dating_method || '—'} onValueChange={(v) => set('dating_method', v === '—' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{METHODS.map((m) => <SelectItem key={m || '—'} value={m || '—'}>{m || '—'}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Konfidens</Label>
                <Select value={f.dating_confidence || '—'} onValueChange={(v) => set('dating_confidence', v === '—' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{CONFIDENCE.map((c) => <SelectItem key={c || '—'} value={c || '—'}>{c || '—'}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <T label="Förlisning & läge" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Förlisningsår</Label><Input type="number" value={f.sinking_year} onChange={(e) => set('sinking_year', e.target.value)} placeholder="1679" /></div>
            <div><Label>RAÄ/lämnings-nr</Label><Input value={f.raa_number} onChange={(e) => set('raa_number', e.target.value)} placeholder="L1955:2423" /></div>
            <div className="md:col-span-2"><Label>Förlisningshändelse</Label><Input value={f.sinking_event} onChange={(e) => set('sinking_event', e.target.value)} placeholder="Sänkt som blockskepp vid Grimskär 1679…" /></div>
            <div><Label>Socken</Label><Input value={f.parish} onChange={(e) => set('parish', e.target.value)} /></div>
            <div><Label>Kommun</Label><Input value={f.municipality} onChange={(e) => set('municipality', e.target.value)} /></div>
            <div><Label>Landskap</Label><Input value={f.landscape} onChange={(e) => set('landscape', e.target.value)} /></div>
            <div><Label>Fornreg-ref</Label><Input value={f.fornreg_ref} onChange={(e) => set('fornreg_ref', e.target.value)} placeholder="202500483" /></div>
          </div>

          <T label="Proveniens (källa & licens)" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2"><Label>Källhänvisning</Label><Input value={f.source_ref} onChange={(e) => set('source_ref', e.target.value)} placeholder="Warming, Palm & Rönnby 2026…" /></div>
            <div><Label>Attribution</Label><Input value={f.source_attribution} onChange={(e) => set('source_attribution', e.target.value)} placeholder="Västerviks Museum" /></div>
            <div><Label>Licens</Label><Input value={f.source_license} onChange={(e) => set('source_license', e.target.value)} placeholder="CC BY 4.0" /></div>
            <div className="md:col-span-2"><Label>Anteckningar</Label><Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="analyser, källkritik, sägen-noter (tydligt märkta)…" /></div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Avbryt</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !f.name.trim()}>{isLoading ? 'Sparar…' : (wreck ? 'Uppdatera' : 'Skapa')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
