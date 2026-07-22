-- Korrigering: Kalmar var INTE ett maktcentrum utan en praktisk MÖTESPLATS (centralt läge
-- för unionsmötet 1397). Ekonomiska tyngdpunkten låg kvar i Mälardalen, stött av Finland/Åland.
UPDATE public.estates
SET description = 'Gränsstad mot Danmark, vald som praktisk central MÖTESPLATS för unionsmötet 1397 (mitt emellan rikena) — inte ett maktcentrum. Rikets ekonomiska tyngdpunkt låg kvar i Mälardalen (Sigtuna/Stockholm/Uppsala), stött österut av Finland/Åland.'
WHERE name = 'Kalmar (slott)';

UPDATE public.estate_holdings SET role='förläning',
  note='Höll Kalmar slott som EN av många förläningar (drots) — Kalmar var inte hans maktbas.'
WHERE holder_name='Bo Jonsson Grip'
  AND estate_id=(SELECT id FROM public.estates WHERE name='Kalmar (slott)');

UPDATE public.estate_holdings SET role='unionsmöte',
  note='Kalmarunionen beseglas i Kalmar 1397 pga centralt läge — mötesplats, ej maktsäte.'
WHERE holder_name='Erik av Pommern'
  AND estate_id=(SELECT id FROM public.estates WHERE name='Kalmar (slott)');
