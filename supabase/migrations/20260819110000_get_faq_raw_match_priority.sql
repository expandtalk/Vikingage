-- get_faq v3: matcha RÅ fråga först (specifik FAQ), normaliserad endast som fallback. Annars
-- kollapsar normaliseringen "var bodde vikingarna" → "vikingarna" och träffar den generella
-- pilot-FAQ:n i st.f. den specifika. Jämför trimmad (utan avslutande ?/./!) på båda sidor.
create or replace function public.get_faq(p_q text)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  with q0 as (
    select regexp_replace(lower(btrim(p_q)),'[?!.]+$','') r,
           coalesce(normalize_search_query(p_q), lower(btrim(p_q))) nm),
  qrow as (
    select fq.*,
      (case when fq.slug=q0.r or regexp_replace(lower(fq.question_sv),'[?!.]+$','')=q0.r
                 or q0.r = any(select lower(v) from unnest(coalesce(fq.variants,'{}'::text[])) v)
            then 0 else 1 end) as pri
    from public.faq_question fq, q0
    where fq.status='published' and (
      -- rå (specifik) match
      fq.slug=q0.r or regexp_replace(lower(fq.question_sv),'[?!.]+$','')=q0.r
        or q0.r = any(select lower(v) from unnest(coalesce(fq.variants,'{}'::text[])) v)
      -- normaliserad fallback
      or fq.slug=q0.nm or lower(fq.question_sv)=q0.nm
        or q0.nm = any(select lower(v) from unnest(coalesce(fq.variants,'{}'::text[])) v))
    order by pri asc, length(fq.question_sv) desc
    limit 1)
  select case when not exists(select 1 from qrow) then null else (
    select to_jsonb(qr) - 'pri' || jsonb_build_object(
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

-- Städa pilotens för giriga varianter (de specifika frågorna ägs av PAA-FAQ:erna).
update public.faq_question
set variants = array['vikingarna','vikingar','vilka var vikingarna','vem var vikingarna','who were the vikings','vikings']
where slug='vilka-var-vikingarna';
