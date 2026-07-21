-- Årsta/Valla-komplexet: ortnamn + Emund den gamle. Applicerad via MCP execute_sql;
-- fil = proveniens. Koordinater = VERKLIGA OSM-punkter (Valla torg, Årsta gård),
-- aldrig sockencentroid/kyrka (cirkulärt). Fakta skilt från tradition (Emunds grav).
-- Kontext: Valla ligger i Årsta (gamla Brännkyrka sn, Södermanland), vid Valla å och
-- Göta landsväg — skild från Vikstrands Valla i Täby sn (Uppland).

-- A. Ortnamn
insert into public.place_names (name, lat, lng, feature_type, province, earliest_attestation_year, attested_form, attestation_source, source, source_license, attribution, external_id)
values
('Valla', 59.2951, 18.0485, 'samlingsplats (torg)', 'Södermanland', null, null,
 'Etymologi: fornsv. "valder" = jämn/gräsbevuxen mark för allmänt ändamål (ting, marknad, kult), "medelpunkt i bygden". Valla gård gav namn åt Valla å. Nuvarande plats: Valla torg, Årsta. Läge vid Göta landsväg söderut.',
 'Ortnamnsetymologi (fornsv. valder) + OSM (koordinat: Valla torg)', 'ODbL (koordinat)',
 'Koordinat © OpenStreetMap-bidragsgivare (ODbL)', 'manual-valla-arsta'),
('Årsta', 59.3027, 18.0424, 'bebyggelse (sätesgård)', 'Södermanland', 1305, 'Arusboawik',
 'Belägg 1305 "Arusboawik" ("de som bor i byn Aros/Arus"). Årsta < Aros = åmynning (Valla ås utflöde i Årstaviken). Årsta gård: sätesgård med kvarn; på 1700-talet Märta Helena Reenstiernas ("Årstafrun") hem.',
 'Ortnamnsbelägg 1305 (Arusboawik) + OSM (koordinat: Årsta gård)', 'ODbL (koordinat)',
 'Koordinat © OpenStreetMap-bidragsgivare (ODbL)', 'manual-arsta')
on conflict (external_id) do nothing;

-- E. Emund den gamle (faktalucka mellan Anund Jakob och senare kungar).
-- Gravläggning i Årsta = FOLKTRADITION, ej historiskt belagt — flaggat i description + sources.
insert into public.historical_kings (name, name_variations, gender, role, region, reign_start, reign_end, death_year, status, de_facto_ruler, archaeological_evidence, runestone_mentions, external_attestation, sources, description, dynasty_id)
select 'Emund den gamle', array['Emund Slemme','Emund gamle'], 'male', 'kung', 'Svealand',
  1050, 1060, 1060, 'historical'::king_status, false, false, false,
  array['Adam av Bremen'],
  'Adam av Bremen; svensk kungalängd. Gravläggning i Årsta = folktradition (obelagd).',
  'Svensk kung ca 1050–1060. Son till Olof Skötkonung och frillan Edla, halvbror till företrädaren Anund Jakob. Siste svenske kungen av Erik Segersälls ätt. Enligt FOLKTRADITION begravd i Årsta vid Valla (ev. förknippad med en vikingatida ryttargrav i gravfält på Årstafältet) — detta är tradition, ej historiskt belagt.',
  (select dynasty_id from public.historical_kings where name='Anund Jakob' and dynasty_id is not null limit 1)
where not exists (select 1 from public.historical_kings where name='Emund den gamle');

-- B–D (spärranläggning L2013:4298/RAÄ 660, Årstafältets gravfält, skålgropssten) tillkommer
-- separat när exakta Fornsök-koordinater + utgrävningsreferens (1958–59) hämtats.
