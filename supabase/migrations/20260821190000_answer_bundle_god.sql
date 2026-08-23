-- Lägg 'god' i answer_bundle: alla 26 gudar (gods-tabellen) får en gud-vy i svarspanelen, inte bara de
-- ~7 med sakrala ortnamn (Daniel: "vi har väl nästan 30 gudanamn?"). Data-drivet ur gods → ingen drift
-- mot en hårdkodad lista. Matchar svenskt namn ELLER fornnordiskt namn.
create or replace function public.answer_bundle(p_query text)
returns jsonb language sql stable set search_path = public as $$
  with q as (select trim(p_query) qq)
  select jsonb_build_object(
    'person', (select to_jsonb(p) from (
        select id,name,birth_year,death_year,occupations,description_sv,image_url,image_license,image_credit,
               birthplace_label,sbl,wikidata_qid,viaf
        from persons, q where name ilike q.qq order by sitelinks desc nulls last limit 1) p),
    'name', (select to_jsonb(n) from (
        select id,canonical,gender,meaning,etymology,origin_language,tradition_layer,theophoric,
               swedish_usage_layer,first_attestation_year,first_attestation_source,on_runestone,
               runestone_inscriptions,sdhk_first_year,persons_first_year,name_day_text,total_bearers,
               modern_birth_count,birthyear_peak_decade,popularization
        from name_authority, q where canonical ilike q.qq limit 1) n),
    'god', (select to_jsonb(g) from (
        select id,name,name_old_norse,category,domain,description,symbols,wikidata_id
        from gods, q where name ilike q.qq or name_old_norse ilike q.qq limit 1) g),
    'attestation', (select to_jsonb(a) from (
        select name, earliest_attestation_year as year, attested_form as form, attestation_source as source
        from place_names, q where name ilike q.qq and earliest_attestation_year is not null
        order by earliest_attestation_year asc limit 1) a),
    'socken', (select to_jsonb(s) from socken_dossier((select qq from q)) s limit 1),
    'jordebok', coalesce((select jsonb_agg(to_jsonb(j) order by j.year_from) from (
        select id,title,record_type,year_from,year_to,archive,archive_ref,url,source_org
        from jordebok_records, q where socken ilike q.qq) j), '[]'::jsonb),
    'charters', (select jsonb_build_object(
        'total', coalesce(max(c.total_count),0),
        'rows', coalesce(jsonb_agg(to_jsonb(c) order by c.sdhk_id),'[]'::jsonb))
        from (select * from medieval_charters_browse(q => (select qq from q), page_size => 6)) c),
    'fornvannen', coalesce((select jsonb_agg(jsonb_build_object('id',f.id,'title',f.title,'year',f.written_year,'url',f.url))
        from fornvannen_for_query((select qq from q), 20) f), '[]'::jsonb),
    'faq', get_faq((select qq from q)),
    'matching_places', coalesce((select jsonb_agg(jsonb_build_object('name',pn.name,'feature_type',pn.feature_type,'lat',pn.lat,'lng',pn.lng)) from (
        select name, feature_type, lat, lng from place_names, q where name ilike q.qq || '%' and lat is not null limit 60) pn), '[]'::jsonb),
    'waypoints', coalesce((select jsonb_agg(jsonb_build_object('name',sd.label,'sublabel',sd.sublabel,'signum',sd.signum)) from (
        select label, sublabel, signum from search_document, q where entity_type='road_waypoint' and label ilike '%'||q.qq||'%' limit 6) sd), '[]'::jsonb),
    'lit', coalesce((select jsonb_agg(to_jsonb(l)) from lit_for_query((select qq from q), 6) l), '[]'::jsonb),
    'archive_images', coalesce((select jsonb_agg(to_jsonb(im)) from images_for_query((select qq from q), 12) im), '[]'::jsonb)
  );
$$;
revoke all on function public.answer_bundle(text) from public;
grant execute on function public.answer_bundle(text) to anon, authenticated;
