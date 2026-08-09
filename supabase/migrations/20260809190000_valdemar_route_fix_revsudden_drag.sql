-- Kung Valdemars segelled, rättning vid Revsudden (D. Larsson):
-- (1) "Stora Rör (Ölandslandning)" tas bort ur leden. Den låg mellan draget (seq 8) och
--     Köpingsvik (seq 10) på LÄGRE latitud -> knäckte linjen SÖ->NÖ (zigzag vid Revsudden) och
--     feltolkade draget som en Kalmar->Öland-överfart. Draget är ett ED/kanal tvärs Skäggenäs
--     (fastlandet), enda överlandsstället; övrigt gick på vatten. Köpingsvik->norrut = dokumenterad.
delete from valdemar_route_points where name = 'Stora Rör (Ölandslandning)';

-- (2) Draget: koordinat till kanalen tvärs Skäggenäs-roten (= kalmar_field_features "Drags kanal",
--     56.77947/16.41649) och text som ed/kanal — inte "smalaste Kalmar–Öland".
update valdemar_route_points
set lat = 56.77947, lng = 16.41649,
    description = 'Drag/ed – kanalen tvärs Skäggenäsets rot vid Revsudden. Enda överlandsstället (ed/drag) på hela leden; övrigt gick alltid på vatten. Kanalen finns kvar än idag.'
where name = 'Drag (ed vid Skäggenäs/Revsudden)';
