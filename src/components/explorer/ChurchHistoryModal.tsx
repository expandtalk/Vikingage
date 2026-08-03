import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useChurchDatings, ChurchDating, ChurchDatingRef } from '@/hooks/useChurchDatings';

// Byggnadstidslinje per kyrka ovanpå church_datings (BBR). Öppnas från kartpopuperna via
// window.__openChurchHistory (se ExplorerMain). En rad = en daterad byggnadshändelse.

interface Props {
  reference: (ChurchDatingRef & { title?: string }) | null;
  onClose: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  nybyggnad: '#5c8a5a', tillbyggnad: '#3f7f93', ombyggnad: '#9a7b3c',
  brand: '#a24b4b', valvslagning: '#7a6aa0', inredning: '#8a6f3e',
  rivning: '#6b7280', other: '#5b6976',
};
const span = (e: ChurchDating) =>
  e.year_to && e.year_to !== e.year_from ? `${e.year_from ?? '?'}–${e.year_to}` : `${e.year_from ?? '?'}`;

export const ChurchHistoryModal: React.FC<Props> = ({ reference, onClose }) => {
  const { data = [], isLoading } = useChurchDatings(reference);
  const title = reference?.title || reference?.churchName || 'Kyrka';

  return (
    <Dialog open={!!reference} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title} — byggnadshistoria</DialogTitle>
        </DialogHeader>

        {isLoading && <p className="text-sm text-muted-foreground">Hämtar byggnadshändelser…</p>}

        {!isLoading && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Inga registrerade byggnadshändelser (BBR) för denna kyrka ännu.
          </p>
        )}

        {data.length > 0 && (
          <ol className="relative border-l border-border pl-5 space-y-3 mt-2">
            {data.map((e) => (
              <li key={e.id} className="relative">
                <span
                  className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background"
                  style={{ background: TYPE_COLOR[e.event_type ?? 'other'] ?? TYPE_COLOR.other }}
                />
                <div className="text-sm leading-snug">
                  <span className="font-semibold tabular-nums">{span(e)}</span>
                  <span className="ml-2">{e.event_label}</span>
                  {e.building_part && <span className="ml-1 text-muted-foreground">· {e.building_part}</span>}
                </div>
                {e.architect && (
                  <div className="text-xs text-muted-foreground">Arkitekt: {e.architect}</div>
                )}
              </li>
            ))}
          </ol>
        )}

        {data.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border">
            {data.length} händelser · Källa: Riksantikvarieämbetet, Bebyggelseregistret (BBR)
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
