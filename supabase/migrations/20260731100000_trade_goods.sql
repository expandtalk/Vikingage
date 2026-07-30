-- Varudimension på lederna (Daniels steg 4). Nordiskt perspektiv: export österut / import hem.
-- Solidus-guldet (folkvandringstidens östkontakt) kopplas som precis evidens via coins.
create table if not exists trade_goods (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null, name_en text,
  commodity_class text,            -- ädelmetall | päls | järn | människa | lyxvara | råvara | redskap
  direction text,                  -- import | export | båda  (nordiskt perspektiv)
  era_from integer, era_to integer,
  description text, evidence_note text,
  created_at timestamptz default now()
);
create table if not exists route_goods (
  route_id uuid not null references trade_routes(id) on delete cascade,
  good_id uuid not null references trade_goods(id) on delete cascade,
  direction text,                  -- import | export
  note text,
  primary key (route_id, good_id)
);

alter table trade_goods enable row level security;
alter table route_goods enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trade_goods' and policyname='trade_goods_read') then
    create policy trade_goods_read on trade_goods for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename='trade_goods' and policyname='trade_goods_write') then
    create policy trade_goods_write on trade_goods for all using (is_admin()) with check (is_admin()); end if;
  if not exists (select 1 from pg_policies where tablename='route_goods' and policyname='route_goods_read') then
    create policy route_goods_read on route_goods for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename='route_goods' and policyname='route_goods_write') then
    create policy route_goods_write on route_goods for all using (is_admin()) with check (is_admin()); end if;
end $$;
