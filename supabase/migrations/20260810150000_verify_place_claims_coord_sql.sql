-- Väg 2 (Daniel 2026-08-10): deterministisk drift-vakt i REN SQL — ingen LLM, ingen HTTP.
-- Endast attribute='coordinate_wgs84' är maskinkontrollerbar in-DB (stäms mot swedish_hillforts).
-- Källbundna mätningar (diameter, hustomtantal, RAÄ-beteckning) förblir machine_verifiable=false → människo-kö.
-- P625/live-RAÄ-checkar kräver HTTP → görs av verifierare-agenten (WebFetch), inte här.
-- Applicerad på prod via apply_migration (verify_place_claims_coord_sql + _fix_ambiguous); denna fil = repo-spegel.

update public.place_claim set machine_verifiable = true where attribute = 'coordinate_wgs84';

-- Pass 1 (befordra needs_verification→verified) + Pass 2 (drift: verified→disputed). Raderar aldrig.
-- Non-guessing: agerar bara vid entydig kanon-bindning (närmaste fornborg inom p_link_m, ensam);
-- annars 'unresolved' och orörd. Läker saknad entity_id när claimet ligger på kanon (≤ p_tol_m).
create or replace function public.verify_place_claims(
  p_tol_m  numeric default 50,
  p_link_m numeric default 200
) returns table(claim_id uuid, place_slug text, attribute text, action text, distance_m numeric, detail text)
language plpgsql
security definer
set search_path = public
as $$
declare
  r          record;
  v_lat      numeric;
  v_lng      numeric;
  v_pt       geometry;
  v_fort_id  uuid;
  v_fort_pt  geometry;
  v_within   int;
  v_dist     numeric;
  v_new      text;
begin
  for r in
    select pc.* from public.place_claim pc
     where pc.machine_verifiable = true
       and pc.attribute = 'coordinate_wgs84'
       and pc.verification_status in ('needs_verification','verified')
  loop
    begin
      v_lat := trim(split_part(r.value_text, ',', 1))::numeric;
      v_lng := trim(split_part(r.value_text, ',', 2))::numeric;
    exception when others then
      return query select r.id, r.place_slug, r.attribute, 'skipped'::text, null::numeric,
                          'ogiltig koordinat-text'::text;
      continue;
    end;
    v_pt := ST_SetSRID(ST_MakePoint(v_lng, v_lat), 4326);

    if r.entity_id is not null then
      select h.id, h.coordinates::geometry into v_fort_id, v_fort_pt
        from public.swedish_hillforts h where h.id = r.entity_id;
    else
      select count(*) into v_within
        from public.swedish_hillforts h
       where ST_DistanceSphere(v_pt, h.coordinates::geometry) <= p_link_m;
      if v_within = 1 then
        select h.id, h.coordinates::geometry into v_fort_id, v_fort_pt
          from public.swedish_hillforts h
         where ST_DistanceSphere(v_pt, h.coordinates::geometry) <= p_link_m
         limit 1;
      else
        v_fort_id := null; v_fort_pt := null;
      end if;
    end if;

    if v_fort_pt is null then
      return query select r.id, r.place_slug, r.attribute, 'unresolved'::text, null::numeric,
                          coalesce(v_within,0)||' fornborgar inom '||p_link_m||' m'::text;
      continue;
    end if;

    v_dist := round(ST_DistanceSphere(v_pt, v_fort_pt)::numeric, 1);

    if r.entity_id is null and v_dist <= p_tol_m then
      update public.place_claim set entity_id = v_fort_id where id = r.id;
    end if;

    if r.verification_status = 'needs_verification' then
      if v_dist <= p_tol_m then v_new := 'verified'; else v_new := 'disputed'; end if;
    else
      if v_dist > p_tol_m then v_new := 'disputed'; else v_new := 'verified'; end if;
    end if;

    if v_new <> r.verification_status then
      update public.place_claim
         set verification_status = v_new,
             reviewed_by = 'verifierare/sql',
             reviewed_at = now(),
             note = case when v_new='disputed'
                         then left(coalesce(r.note||' | ','')||'drift: '||v_dist||' m från kanon '||v_fort_id, 500)
                         else r.note end
       where id = r.id;
      return query select r.id, r.place_slug, r.attribute,
                          (case when r.verification_status='needs_verification' then 'promoted:' else 'reconciled:' end)||v_new,
                          v_dist, 'avstånd '||v_dist||' m (tol '||p_tol_m||')'::text;
    else
      if r.verification_status='verified' then
        update public.place_claim set reviewed_by='verifierare/sql', reviewed_at=now() where id=r.id;
      end if;
      return query select r.id, r.place_slug, r.attribute, 'ok:'||v_new, v_dist,
                          'avstånd '||v_dist||' m (tol '||p_tol_m||')'::text;
    end if;
  end loop;
end;
$$;

comment on function public.verify_place_claims(numeric,numeric) is
  'Väg 2 drift-vakt: deterministisk reconciliering av coordinate_wgs84-claims mot swedish_hillforts (ingen HTTP/LLM). Pass 1 befordrar needs_verification→verified, Pass 2 nedgraderar verified→disputed vid drift. Binder claim→fornborg entydigt, läker entity_id, raderar aldrig. Kör: select * from verify_place_claims();';

revoke all on function public.verify_place_claims(numeric,numeric) from anon, authenticated;
