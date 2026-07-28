-- Gör fornborgs-fingerprinten till en förstaklassig ontologi-mall: registrera de två nya
-- fysiska tabellerna som entiteter + lägg predikaten som binder ihop en fornborgs beskrivning.
-- Bakgrund: 'hillfort' fanns redan; 'metal_analysis', 'ore_source', 'reference' fanns redan.

-- Nya entitetstyper.
insert into public.ontology_entity_types
  (code, label_sv, label_en, physical_table, id_column, coord_kind, provenance_columns, status, description)
values
 ('geochemistry', 'Geokemi (multielement-XRF)', 'Geochemistry (multi-element XRF)', 'site_geochemistry', 'id',
  'via_site', 'source,method', 'active',
  'Geokemisk kartering av en fornborg/plats: halter + t-test mellan rumsliga delar (fornborg-fingerprint-dimension). En mätning per grundämne × borgdel. Pilot: Treby borg (Papmehl-Dufay & Isaksson 2025, tab. 1).'),
 ('investigation', 'Arkeologisk undersökning', 'Archaeological investigation', 'archaeological_investigations', 'id',
  'latlng', 'source_uri,source_institution,license', 'active',
  'En dokumenterad undersökning/kartering/beskrivning av en plats över tid (Rhezelius, kartering, utgrävning, LiDAR). Skild från platsen själv — undersökningshistoriken är egna noder.')
on conflict (code) do nothing;

-- Nya predikat: hur en fornborgs beskrivning binds ihop i grafen.
insert into public.rel_predicates (code, label_sv, label_en, subject_type, object_type, qualifier_schema, description)
values
 ('investigated_by', 'undersökt genom', 'investigated by', 'hillfort', 'investigation', null,
  'Kopplar en fornborg/plats till en dokumenterad undersökning (år, institution, fyndsammanfattning).'),
 ('has_geochemistry', 'har geokemi', 'has geochemistry', 'hillfort', 'geochemistry', null,
  'Kopplar en fornborg till sin geokemiska kartering (multielement-XRF per borgdel). Mätningen kan i sin tur supports/contradicts en funktions-tolkning.')
on conflict (code) do nothing;
