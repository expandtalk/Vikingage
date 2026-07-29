-- Ärlig proveniens för stadsvapenkorpusen. Dateringarna kom ur en KLISTRAD onlinesammanställning
-- (Daniel 2026-07-29: "texten var inte min utan klistrad från nätet"), INTE ur direktkontroll mot
-- Nevéus & Kälde, Ny svensk vapenbok (1992). Repointa till en proveniens-ärlig tertiärkälla och
-- flagga för verifiering. (Koordinat-/källproveniens-disciplin: stämpla aldrig en auktoritet man ej läst.)

begin;

-- COPYRIGHT: sajterna nedan är upphovsrättsskyddade. Vi lagrar endast FAKTA (årtal, ortnamn) och
-- citerar källan — ingen ordagrann prosa reproduceras. url pekar på attribution, inte på lagrad text.
insert into public.historical_sources (title, title_en, author, reliability, language, kind, url)
select 'Onlinesammanställning: svenska stadsvapen/stadssigill med dateringar (waslingmedia.se / heraldik.se — endast fakta citerade)',
       'Online compilation of Swedish town arms/seals with datings (facts only, cited)',
       'waslingmedia.se; heraldik.se', 'tertiary', 'sv', 'dataset', 'https://waslingmedia.se/'
where not exists (select 1 from public.historical_sources where title like 'Onlinesammanst%stadsvapen%');

do $$
declare v_comp uuid; v_nev uuid;
begin
  select id into v_comp from public.historical_sources where title like 'Onlinesammanst%stadsvapen%' limit 1;
  select id into v_nev  from public.historical_sources where title like '%Ny svensk vapenbok%' limit 1;
  if v_comp is not null and v_nev is not null then
    update public.heraldic_attestations
       set source_id  = v_comp,
           target_ref = 'stadssigill ' || split_part(target_ref, ': ', 2) || ' (onlinesammanställning, att verifiera mot Nevéus & Kälde 1992)',
           notes      = coalesce(notes || ' ', '') || '[proveniens: klistrad onlinesammanställning — att verifiera mot Nevéus & Kälde 1992]'
     where source_id = v_nev and side = 'sigill';
    update public.armorial_bearers
       set source_id = v_comp,
           notes     = coalesce(notes || ' ', '') || '[proveniens: onlinesammanställning — att verifiera]'
     where source_id = v_nev and bearer_kind = 'town';
  end if;
end $$;

commit;

-- Kvar på Nevéus & Kälde (defensibelt — standardverket, textbokskunskap): riksvapnens komposition
-- (coat_charges för stora/lilla riksvapnet). Endast de exakta stads-dateringarna var det overifierade.
