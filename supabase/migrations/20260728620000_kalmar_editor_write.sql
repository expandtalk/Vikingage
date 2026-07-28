-- Skriv-policy: inloggad forskare (editor/admin) får UPPDATERA Kalmar-ortnamnens läge.
-- RLS är den riktiga gränsen (frontend-gaten är kosmetisk). Endast UPDATE — ingen insert/delete.
-- Matchar useUserRole-logiken (user_roles med role admin|editor). role castas till text (enum-säkert).
drop policy if exists kpn_editor_update on public.kalmar_place_names;
create policy kpn_editor_update on public.kalmar_place_names
  for update
  using (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role::text in ('admin','editor')
  ))
  with check (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role::text in ('admin','editor')
  ));
