-- Forskaren (Daniel, Öland/Kalmar-ägare) granskade SOL-diffen och KORRIGERADE Gårdby + Kalmar till
-- SOL 2003:s läsning. Attribuerat, ej tyst överskrivning — diffen är "nej (korrigerad)", historiken bevaras.
begin;
update public.ortnamn_sol_comparison set
  our_reading = 'Förleden dialektordet gorr ''gyttja, dy'' + by ''gård; by'' (KORRIGERAT enligt SOL 2003; tidigare folketymologi ''gård'').',
  our_source = 'SOL 2003 — korrigerad av Daniel (Öland/Kalmar-ägare)', diff = 'nej (korrigerad)',
  note = 'Rättat: gorr (dy) ≠ gård. Forskaren granskade diffen och antog SOL:s läsning.'
  where name = 'Gårdby' and owner = 'Daniel (Öland/Kalmar)';
update public.ortnamn_sol_comparison set
  our_reading = 'kalm ''stenröse, stenanhopning'' + mar/marn ''grund vik, grusrevel'' — stenig grusrevel/grund vik (KORRIGERAT enligt SOL 2003 / Hellberg, Forn-Kalmar; ej folketymologin ''kall mar'').',
  our_source = 'SOL 2003 / Hellberg, Forn-Kalmar (KSH 1) — korrigerad av Daniel', diff = 'nej (korrigerad)',
  note = 'Rättat: kalm+mar, inte ''kall mar''. Forskaren antog SOL/Hellberg.'
  where name = 'Kalmar' and owner = 'Daniel (Öland/Kalmar)';
commit;
