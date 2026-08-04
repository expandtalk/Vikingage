-- Rättar Valdemarsledens Drag-waypoint (vrp-8): låg ~6 km för långt norrut (56.83) → drog linjen fel.
-- Verkligt drag/ed vid Skäggenäs/Revsudden = 56.7794/16.4203 (ortnamnet "Drag"; smalaste Kalmar–Öland).
UPDATE valdemar_route_points
   SET lat = 56.7794, lng = 16.4203,
       name = 'Drag (ed vid Skäggenäs/Revsudden)',
       description = 'Drag/ed över Skäggenäsets rot vid Revsudden — smalaste Kalmar–Öland, enda överlandsstället (ed/drag) på hela leden; övrigt gick på vatten. Ortnamnet "Drag" ligger här (56.779/16.420). Nutida Skäggenäskanalen (1900-tal) följer samma passage.'
 WHERE id = 'vrp-8';
