-- Sök-analys: låt ADMIN läsa de aggregerade sök-tabellerna (search_term_stat, search_click,
-- search_gaps) så vi ser vad folk söker + vad de klickar → systemet/vi lär oss vad vi ska bygga.
-- Fortsatt GDPR-säkert: tabellerna innehåller BARA aggregat (term→antal), ingen individdata.
-- Skrivning sker även fortsatt bara via SECURITY DEFINER-RPC:erna; detta ger bara admin-LÄSNING.

do $$
begin
  -- search_term_stat
  if not exists (select 1 from pg_policies where tablename='search_term_stat' and policyname='admin read term stats') then
    create policy "admin read term stats" on public.search_term_stat for select using (public.is_admin());
  end if;
  -- search_click
  if not exists (select 1 from pg_policies where tablename='search_click' and policyname='admin read click stats') then
    create policy "admin read click stats" on public.search_click for select using (public.is_admin());
  end if;
end $$;

-- search_gaps saknade RLS-skydd men hade breda anon-grants (drift-risk). Städa: aktivera RLS och
-- ge admin läsning; ta bort anon:s direkta DML (skrivning går ändå via log_search_gap SECURITY DEFINER).
alter table public.search_gaps enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename='search_gaps' and policyname='admin read gaps') then
    create policy "admin read gaps" on public.search_gaps for select using (public.is_admin());
  end if;
end $$;
revoke insert, update, delete, truncate, references, trigger on public.search_gaps from anon;
revoke insert, update, delete, truncate, references, trigger on public.search_gaps from authenticated;
