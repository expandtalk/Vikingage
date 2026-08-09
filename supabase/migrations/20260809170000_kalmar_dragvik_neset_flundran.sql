-- Förläng båtdraget västerut till det flygbildsbelagda neset (Lantmäteri, SWEREF 99 TM
-- N6278950/E580642 -> WGS84 56.647756/16.315133, D. Larsson). Draget korsar Stensö-halvön:
-- neset (V, seq 0) -> ... -> Dragviksudd (Kalmarsund, Ö). Flundran = separat ö, ej draget.
insert into kalmar_field_features (name, feature_type, time_layer, route_group, seq, lat, lng, belegg_status, note)
values ('Dragvik — neset (flygbild)', 'portage', 'crossing', 'stenso_drag', 0, 56.647756, 16.315133, 'belagt',
        'Västligaste ansättningen av båtdraget över Stensö-halvön, belagd på Lantmäteris flygbild (SWEREF 99 TM N6278950/E580642 -> WGS84 56.647756/16.315133, D. Larsson). Draget löper härifrån ESE mot Dragviksudd vid Kalmarsund. Flundran är en separat ö, inte del av draget.');

update kalmar_field_features
set note = 'Ö i vattnet öster om båtdragslinjen — INTE draget/dragviken. Belagt namn ~1939–40 (foto). Äldre namn obelagt (kräver Isof).'
where name = 'Flundran (ö)';
