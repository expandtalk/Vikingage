-- Persondomän i sök: rebuild_search_document_x indexerar nu entity_type='person' (namn + beskrivning
-- + yrken + födelseort → tsv; popularity = wikidata sitelinks). Reindex: select rebuild_search_document_x('person');
-- Full dump av funktionen (patchad live 2026-08-19). Se migration 20260819140000_persons_domain.sql.

CREATE OR REPLACE FUNCTION public.rebuild_search_document_x(p_type text DEFAULT NULL::text, p_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'svamp'
AS $function$
begin

  if p_type is null or p_type = 'person' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, period_start, period_end, popularity)
    select 'person', pr.id, pr.name,
      concat_ws(' · ', 'person',
        case when pr.birth_year is not null then pr.birth_year::text || coalesce('–'||pr.death_year::text,'') end,
        nullif(array_to_string(pr.occupations, ', '),''),
        nullif(pr.birthplace_label,'')),
      concat_ws(' ', pr.description_sv, array_to_string(pr.occupations,' '), pr.birthplace_label, pr.name),
      pr.birth_year, pr.death_year, coalesce(pr.sitelinks,0)
    from persons pr where (p_id is null or pr.id = p_id);
  end if;

  if p_type is null or p_type = 'saint' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'saint', md5('saint:'||s.code)::uuid, coalesce(nullif(s.name,''),'Helgon'),
      concat_ws(' · ', 'helgon', nullif(s.saint_type,''), nullif(s.feast_day,'')),
      concat_ws(' ', array_to_string(coalesce(s.variants,'{}'),' '), s.patron_of, s.region_significance),
      coalesce(s.name_en,'')
    from saints s where (p_id is null or md5('saint:'||s.code)::uuid = p_id);
  end if;

  if p_type is null or p_type = 'ecclesiastical_site' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'ecclesiastical_site', e.id, coalesce(nullif(e.name,''), e.kind, 'Kyrka'),
      concat_ws(' · ', coalesce(e.kind,'kyrka'), nullif(e.status,''), nullif(e.parish,''), nullif(e.landscape,'')),
      concat_ws(' ', e.parish, e.landscape, e.municipality, e.description, e.historical_notes, e.patron_saint, sn.name, e.church_form, e.dating_class),
      concat_ws(' ', e.name_en, e.description_en)
    from ecclesiastical_sites e left join saints sn on sn.code = e.saint_code
    where (p_id is null or e.id = p_id);
  end if;

  if p_type is null or p_type = 'event' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en, period_start, period_end)
    select 'event', ev.id, coalesce(nullif(ev.event_name,''),'Händelse'),
      concat_ws(' · ', coalesce(ev.event_type,'händelse'),
        case when ev.year_start is not null then ev.year_start::text || coalesce('–'||ev.year_end::text,'') end,
        nullif(array_to_string(ev.region_affected,', '),'')),
      concat_ws(' ', ev.description, array_to_string(ev.region_affected,', ')), concat_ws(' ', ev.event_name_en, ev.description_en),
      ev.year_start, ev.year_end
    from historical_events ev where (p_id is null or ev.id = p_id);
  end if;

  if p_type is null or p_type = 'castle' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'castle', m.id, coalesce(nullif(m.name,''),'Borg'), concat_ws(' · ', coalesce(m.category,'borg'), nullif(m.region,''), nullif(m.country_now,'')),
      concat_ws(' ', m.period, m.note)
    from medieval_castles m where (p_id is null or m.id = p_id);
  end if;

  if p_type is null or p_type = 'estate' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'estate', es.id, coalesce(nullif(es.name,''),'Gods/säte'), concat_ws(' · ', coalesce(es.estate_type,'gods/säte'), nullif(es.first_attested::text,'')),
      coalesce(es.description,'')
    from estates es where (p_id is null or es.id = p_id);
  end if;

  if p_type is null or p_type = 'town' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'town', tf.id, coalesce(nullif(tf.name,''), nullif(tf.name_modern,''),'Stad'),
      concat_ws(' · ', coalesce(tf.town_type,'medeltida stad'), nullif(tf.region,''),
        case when tf.privilege_year is not null then 'privilegier '||tf.privilege_year end),
      concat_ws(' ', tf.name_modern, tf.founder, tf.main_church_name, tf.notes, tf.phase)
    from town_formation_profiles tf where (p_id is null or tf.id = p_id);
  end if;

  if p_type is null or p_type = 'church_artwork' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'church_artwork', ca.id, coalesce(nullif(ca.title,''), ca.artwork_type, 'Kyrkokonst'),
      concat_ws(' · ', coalesce(ca.artwork_type,'kyrkokonst'), nullif(ca.material,''), nullif(ca.dating_text,'')),
      concat_ws(' ', ca.motif, ca.location_in_church, ca.notes)
    from church_artworks ca where (p_id is null or ca.id = p_id);
  end if;

  if p_type is null or p_type = 'genetic_individual' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'genetic_individual', gi.id, coalesce(nullif(gi.individual_label,''), nullif(gi.sample_id,''),'aDNA-individ'),
      concat_ws(' · ', 'aDNA-individ', nullif(gi.genetic_sex,''), nullif(gi.y_haplogroup,''), nullif(gi.mt_haplogroup,'')),
      concat_ws(' ', gi.burial_context, gi.ancestry::text, gi.grave_goods::text, gi.y_haplogroup, gi.mt_haplogroup)
    from genetic_individuals gi where (p_id is null or gi.id = p_id);
  end if;

  if p_type is null or p_type = 'crossing_point' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'crossing_point', cp.id, coalesce(nullif(cp.name,''), cp.kind,'Överfart'), concat_ws(' · ', coalesce(cp.kind,'överfart')), coalesce(cp.notes,'')
    from crossing_points cp where (p_id is null or cp.id = p_id);
  end if;

  if p_type is null or p_type = 'thing_site' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'thing_site', ts.id, coalesce(nullif(ts.name,''), ts.thing_type,'Tingsplats'), concat_ws(' · ', coalesce(ts.thing_type,'tingsplats'), nullif(ts.jurisdiction,''), nullif(ts.landscape,'')),
      concat_ws(' ', ts.description, ts.usage_note, ts.monument_type)
    from thing_sites ts where (p_id is null or ts.id = p_id);
  end if;

  if p_type is null or p_type = 'fairway' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'fairway', fw.id, coalesce(nullif(fw.name,''), fw.fairway_kind,'Farled'), concat_ws(' · ', coalesce(fw.fairway_kind,'farled'), nullif(fw.period,'')), coalesce(fw.note,'')
    from fairways fw where (p_id is null or fw.id = p_id);
  end if;

  if p_type is null or p_type = 'maritime_node' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'maritime_node', mn.id, coalesce(nullif(mn.name,''), mn.node_type,'Hamn/nod'), concat_ws(' · ', coalesce(mn.node_type,'hamn/nod')),
      concat_ws(' ', mn.description, mn.folklore_note, mn.shoreline_note), concat_ws(' ', mn.name_en, mn.description_en)
    from maritime_nodes mn where (p_id is null or mn.id = p_id);
  end if;

  if p_type is null or p_type = 'trade_route' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'trade_route', tr.id, coalesce(nullif(tr.name,''), tr.route_kind,'Handelsväg'), concat_ws(' · ', coalesce(tr.route_kind,'handelsväg'), nullif(tr.orientation,'')), coalesce(tr.description,'')
    from trade_routes tr where (p_id is null or tr.id = p_id);
  end if;

  if p_type is null or p_type = 'content_page' then
    insert into search_document (entity_type, entity_id, signum, label, sublabel, body_sv, body_en)
    select 'content_page', md5('content_page:'||cp.id::text)::uuid, coalesce(cp.url, cp.slug), coalesce(nullif(cp.title_sv,''), cp.title_en,'Sida'),
      concat_ws(' · ', coalesce(cp.kind,'sida')), coalesce(cp.teaser_sv,''), coalesce(cp.teaser_en,'')
    from content_pages cp where (p_id is null or md5('content_page:'||cp.id::text)::uuid = p_id);
  end if;

  if p_type is null or p_type = 'experience' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'experience', ex.id, coalesce(nullif(ex.name,''),'Upplevelse'), concat_ws(' · ', coalesce(ex.category,'upplevelse'), nullif(ex.subtype,''), nullif(ex.municipality,'')),
      concat_ws(' ', ex.locality, ex.landscape)
    from experiences ex where (p_id is null or ex.id = p_id);
  end if;

  if p_type is null or p_type = 'investigation' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'investigation', ai.id, coalesce(nullif(ai.title,''),'Undersökning'),
      concat_ws(' · ', coalesce(ai.investigation_type,'undersökning'), nullif(ai.parish,''), case when ai.year_from is not null then ai.year_from::text end),
      concat_ws(' ', ai.finds_summary, ai.keywords, ai.period, ai.municipality)
    from archaeological_investigations ai where (p_id is null or ai.id = p_id);
  end if;

  if p_type is null or p_type = 'archaeological_site' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
    select 'archaeological_site', asite.id, coalesce(nullif(asite.name,''),'Arkeologisk plats'),
      concat_ws(' · ', coalesce(asite.burial_type,'arkeologisk plats'), nullif(asite.parish,''), nullif(asite.period,'')),
      concat_ws(' ', asite.description, asite.dating)
    from archaeological_sites asite where (p_id is null or asite.id = p_id);
  end if;

  if p_type is null or p_type = 'mushroom' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'mushroom', md5('mushroom:'||a.id)::uuid, a.svenskt_namn,
      concat_ws(' · ', 'ätlig matsvamp', nullif(a.vetenskapligt_namn,'')),
      concat_ws(' ', a.vetenskapligt_namn, a.kannetecken, 'svamp matsvamp ätlig plocka'),
      coalesce(a.vetenskapligt_namn,'')
    from svamp.art a where (p_id is null or md5('mushroom:'||a.id)::uuid = p_id);
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'mushroom', md5('mushroom:'||g.id)::uuid, g.svenskt_namn,
      concat_ws(' · ', 'giftig förväxlingssvamp', nullif(g.vetenskapligt_namn,''), 'allvarlighet '||g.allvarlighet||'/5'),
      concat_ws(' ', g.vetenskapligt_namn, g.toxin, g.kanne_pa, g.symtom, 'svamp giftsvamp giftig förväxling'),
      coalesce(g.vetenskapligt_namn,'')
    from svamp.giftsvamp g where (p_id is null or md5('mushroom:'||g.id)::uuid = p_id);
  end if;


  if p_type is null or p_type = 'municipality' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'municipality', md5('municipality:'||ab.code)::uuid, ab.name,
      concat_ws(' · ', 'kommun', 'Sverige'),
      concat_ws(' ', ab.name, 'kommun Sverige'), concat_ws(' ', ab.name, 'municipality Sweden')
    from admin_boundaries ab where ab.level='kommun' and ab.name is not null
      and (p_id is null or md5('municipality:'||ab.code)::uuid = p_id);
  end if;


  if p_type is null or p_type = 'county' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'county', md5('county:'||ab.code)::uuid, ab.name, concat_ws(' · ','län','Sverige'),
      concat_ws(' ', ab.name, 'län region Sverige'), concat_ws(' ', ab.name, 'county region Sweden')
    from admin_boundaries ab where ab.level='lan' and ab.name is not null and (p_id is null or md5('county:'||ab.code)::uuid = p_id);
  end if;

end $function$
;
