-- Ikonografisk beskrivning för U 379, verifierad mot foto (Wikimedia Commons, Mariakyrkans
-- kyrkogård) + Rundata (stil/kors). Fritext i scholarly_notes tills en strukturerad
-- runsten-ikonografi/feature-modell byggs (jfr runsten-forensik-programmet). Proveniens-fil.
UPDATE public.runic_inscriptions
SET scholarly_notes = $desc$Ikonografi (verifierad mot foto, Mariakyrkans kyrkogård): Kristet kors överst i mitten med utvidgade, kilformade armändar (korspatté-liknande). Under korsfoten en oval bindring där den inre runslingan börjar; två inre runband löper ned genom ringen och förbinds av en båge nedtill. Ett yttre runband ramar in hela stenen och förgrenar sig inåt. Ett litet sekundärkors i nedre vänstra inre bandet. Inga profil-djurhuvuden — plan slinga, enklare komposition (Rundata-stil Kb). Material: granit. Texten avslutas med kristen bön (kuþ hialbi ant hans). Korstyp-koder (Rundata): A1, B2, C4, D1, F3.$desc$,
    updated_at = now()
WHERE signum = 'U 379';
