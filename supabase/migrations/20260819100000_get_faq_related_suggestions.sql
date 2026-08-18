-- get_faq v2: PAA-relaterade frågor visas som SÖKFÖRSLAG (chips) även om mål-FAQ:n ännu är obesvarad
-- (klick kör en vanlig sökning). Tar bort kravet rq.status='published' i related-grenen.
create or replace function public.get_faq(p_q text)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  with n as (select coalesce(normalize_search_query(p_q), lower(btrim(p_q))) nm),
  qrow as (
    select q.* from public.faq_question q, n
    where q.status='published' and (q.slug = n.nm or lower(q.question_sv)=n.nm
          or n.nm = any(select lower(v) from unnest(coalesce(q.variants,'{}'::text[])) v))
    limit 1)
  select case when not exists(select 1 from qrow) then null else (
    select to_jsonb(qr) || jsonb_build_object(
      'lenses', coalesce((select jsonb_agg(jsonb_build_object(
          'discipline', l.discipline, 'discipline_label', d.label_sv,
          'answer_sv', l.answer_sv, 'answer_en', l.answer_en, 'evidence_sv', l.evidence_sv,
          'status', l.status, 'confidence', l.confidence, 'scholar', l.scholar_name, 'sources', l.sources)
          order by d.sort, l.sort)
        from public.faq_answer_lens l join public.research_discipline d on d.code=l.discipline
        where l.question_id=qr.id and l.review_status='verified'),'[]'::jsonb),
      'bias', coalesce((select jsonb_agg(jsonb_build_object('type', b.bias_type, 'note_sv', b.note_sv, 'note_en', b.note_en))
        from public.faq_bias_note b where b.question_id=qr.id),'[]'::jsonb),
      'related', coalesce((select jsonb_agg(jsonb_build_object('slug', rq.slug, 'question_sv', rq.question_sv) order by r.rank)
        from public.faq_related r join public.faq_question rq on rq.id=r.related_id
        where r.question_id=qr.id),'[]'::jsonb))
    from qrow qr) end;
$$;
grant execute on function public.get_faq(text) to anon, authenticated;
