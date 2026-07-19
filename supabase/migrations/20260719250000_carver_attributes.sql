-- Attribut-taxonomi för ristarnamn (Källström kap 8.2.3): släktskap, härkomst,
-- sysselsättning, övrigt. Tvåspråkig (value_sv/value_en); typ-etiketterna översätts
-- i frontend (config/carverAttributes.ts). Ren uuid-FK mot carvers. RLS public read.
create table if not exists public.carver_attributes (
  id uuid primary key default gen_random_uuid(),
  carver_id uuid not null references public.carvers(id) on delete cascade,
  attribute_type text not null,   -- kinship | origin | occupation | other
  value_sv text,
  value_en text,
  source_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.carver_attributes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='carver_attributes' and policyname='carver_attributes_public_read') then
    create policy carver_attributes_public_read on public.carver_attributes for select using (true);
  end if;
end $$;

insert into public.carver_attributes (carver_id, attribute_type, value_sv, value_en, source_ref)
select v.cid::uuid, v.atype, v.vsv, v.ven, 'Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).'
from (values
  ('eecd1fd6-2346-4b5c-be0c-1add646db741','origin','Borresta, Orkesta socken','Borresta, Orkesta parish'),
  ('7a075931-3395-464a-a8e8-828c1aad2de8','occupation','skald','skald (poet)'),
  ('607f7f67-e8c1-4c71-9d0e-641b57cfdbb1','occupation','skald','skald (poet)'),
  ('ad81d51d-1ab9-4660-8097-6ba52aa0176b','kinship','Fotsarve — av runristaren Fots ätt','Fotsarve — descendant of the carver Fot')
) as v(cid, atype, vsv, ven)
where not exists (
  select 1 from public.carver_attributes ca
  where ca.carver_id = v.cid::uuid and ca.attribute_type = v.atype and ca.value_sv = v.vsv
);
