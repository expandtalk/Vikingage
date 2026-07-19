-- P1: Försona geografin (docs/kunskapsgraf-arkitektur.md).
-- Gör public.parishes till enad gazetteer (KMR + rundata) och ger varje inskrift
-- en exakt parish_id via rundata-kedjan (objectid / signum / alias) med proveniens.
--
-- Nyckelinsikter (verifierade mot live-DB 2026-07-19):
--  * public.parishes (927) = KMR/Fornsök-registret (external_id = her_SE_parishes-id).
--  * rundata_raw.parishes (1 696) = rundatas pan-nordiska socken/sogn/sókn-register
--    med hierarki parish→hundred→province→country.
--  * Empirisk brygga: objekt är länkade till BÅDE rundata-socken (place_parish) och
--    KMR-socken (object_her_SE→her_SE.her_separishid) → samförekomst per objekt
--    ger KMR↔rundata-mappning utan namnmatchning.
--  * 98,8 % av inskrifterna löses EXAKT via kedjan; ingen fuzzy behövs för bulken.
-- Idempotent: körbar flera gånger (guards på is null / not exists).

begin;

-- ---------- 1. Utöka gazetteern ----------
alter table public.parishes
  add column if not exists rundata_parishid uuid,
  add column if not exists rundata_name text,
  add column if not exists hundred_external_id text,
  add column if not exists parish_type text,
  add column if not exists country text;

create unique index if not exists parishes_rundata_parishid_key
  on public.parishes(rundata_parishid) where rundata_parishid is not null;

-- external_id (KMR) är genuint frånvarande för rundata-socknar utanför KMR
-- (DK/NO/IS/övriga länder + svenska stadsförsamlingar) → nullable.
alter table public.parishes alter column external_id drop not null;

-- ---------- 2. Empirisk KMR↔rundata-mappning (samförekomst per objekt) ----------
drop table if exists _p1_pairs;
create table _p1_pairs as
select pp.parishid as rundata_parishid, h.her_separishid, count(*) as n_objects
from rundata_raw.place_parish pp
join rundata_raw.objects o on o.placeid = pp.placeid and pp.current = 1
join rundata_raw.object_her_se oh on oh.objectid = o.objectid
join rundata_raw.her_se h on h.her_seid = oh.her_seid
where h.her_separishid is not null
group by 1, 2;

-- bästa KMR-socken per rundata-socken, sedan bästa rundata-socken per KMR-socken
-- (löser konflikter deterministiskt: flest delade objekt vinner)
drop table if exists _p1_attach;
create table _p1_attach as
select distinct on (her_separishid) her_separishid, rundata_parishid, n_objects
from (
  select distinct on (rundata_parishid) rundata_parishid, her_separishid, n_objects
  from _p1_pairs
  order by rundata_parishid, n_objects desc, her_separishid
) best
order by her_separishid, n_objects desc, rundata_parishid;

-- ---------- 3. Koppla rundata-identitet till befintliga KMR-rader ----------
update public.parishes p set
  rundata_parishid = a.rundata_parishid,
  rundata_name = rp.parish,
  parish_type = case lower(coalesce((regexp_match(rp.parish, '(\S+)$'))[1], ''))
    when 'socken' then 'socken' when 'sogn' then 'sogn' when 'sókn' then 'sokn'
    when 'landsförsamling' then 'landsforsamling' when 'stad' then 'stad' else 'other' end,
  hundred_external_id = case when rp.hundredid is not null
    then 'X' || upper(replace(rp.hundredid::text, '-', '')) end,
  country = c.en
from _p1_attach a
join rundata_raw.parishes rp on rp.parishid = a.rundata_parishid
left join rundata_raw.hundreds rh on rh.hundredid = rp.hundredid
left join rundata_raw.provinces pv on pv.provinceid = rh.provinceid
left join rundata_raw.countries c on c.countryid = pv.countryid
where upper(p.external_id) = 'X' || upper(replace(a.her_separishid::text, '-', ''))
  and p.rundata_parishid is null;

-- ---------- 4. Lägg in rundata-socknar som saknar KMR-motsvarighet ----------
insert into public.parishes
  (id, external_id, code, name, rundata_parishid, rundata_name, parish_type, hundred_external_id, country)
select
  gen_random_uuid(), null, null,
  trim(regexp_replace(rp.parish, '\s+(socken|sogn|sókn|landsförsamling|stad)$', '', 'i')),
  rp.parishid, rp.parish,
  case lower(coalesce((regexp_match(rp.parish, '(\S+)$'))[1], ''))
    when 'socken' then 'socken' when 'sogn' then 'sogn' when 'sókn' then 'sokn'
    when 'landsförsamling' then 'landsforsamling' when 'stad' then 'stad' else 'other' end,
  case when rp.hundredid is not null then 'X' || upper(replace(rp.hundredid::text, '-', '')) end,
  c.en
from rundata_raw.parishes rp
left join rundata_raw.hundreds rh on rh.hundredid = rp.hundredid
left join rundata_raw.provinces pv on pv.provinceid = rh.provinceid
left join rundata_raw.countries c on c.countryid = pv.countryid
where not exists (select 1 from public.parishes p where p.rundata_parishid = rp.parishid);

-- ---------- 5. parish_id + proveniens på inskrifterna ----------
alter table public.runic_inscriptions
  add column if not exists parish_id uuid references public.parishes(id),
  add column if not exists parish_match_method text,
  add column if not exists parish_match_score double precision;

create index if not exists runic_inscriptions_parish_id_idx
  on public.runic_inscriptions(parish_id);

-- ---------- 6. Trestegsupplösning (exakt kedja, prioritetsordning) ----------
drop table if exists _p1_resolve;
create table _p1_resolve as
with signum_map as (
  select lower(replace(s.signum1 || s.signum2, ' ', '')) as norm_signum,
         i.objectid, si.canonical
  from rundata_raw.signa s
  join rundata_raw.signum_inscription si on si.signumid = s.signumid
  join rundata_raw.inscriptions i on i.inscriptionid = si.inscriptionid
)
-- metod 1: id = rundata objectid (nyimporterade)
select r.id, pp.parishid as rundata_parishid, 'rundata_objectid' as method, 1 as prio
from public.runic_inscriptions r
join rundata_raw.objects o on o.objectid = r.id
join rundata_raw.place_parish pp on pp.placeid = o.placeid and pp.current = 1
union all
-- metod 2: kanoniskt signum
select r.id, pp.parishid, 'rundata_signum', 2
from public.runic_inscriptions r
join signum_map sm on sm.canonical = 1
  and sm.norm_signum = lower(replace(coalesce(r.primary_signum, r.signum), ' ', ''))
join rundata_raw.objects o on o.objectid = sm.objectid
join rundata_raw.place_parish pp on pp.placeid = o.placeid and pp.current = 1
union all
-- metod 3: alias-signum (alla signum + alternative_signum-arrayen)
select r.id, pp.parishid, 'rundata_signum_alias', 3
from public.runic_inscriptions r
cross join lateral unnest(array[r.signum, r.primary_signum] || coalesce(r.alternative_signum, '{}')) as als(sig)
join signum_map sm on als.sig is not null
  and sm.norm_signum = lower(replace(als.sig, ' ', ''))
join rundata_raw.objects o on o.objectid = sm.objectid
join rundata_raw.place_parish pp on pp.placeid = o.placeid and pp.current = 1;

update public.runic_inscriptions r set
  parish_id = p.id,
  parish_match_method = x.method,
  parish_match_score = null  -- exakt kedja: ingen fuzzy-score
from (
  select distinct on (id) id, rundata_parishid, method
  from _p1_resolve
  order by id, prio, rundata_parishid
) x
join public.parishes p on p.rundata_parishid = x.rundata_parishid
where r.id = x.id and r.parish_id is null;

-- ---------- 7. Granskningslista för olösta ----------
create or replace view public.v_parish_unresolved as
select id, signum, primary_signum, name, country, location, socken, harad
from public.runic_inscriptions
where parish_id is null;

drop table if exists _p1_pairs;
drop table if exists _p1_attach;
drop table if exists _p1_resolve;

commit;
