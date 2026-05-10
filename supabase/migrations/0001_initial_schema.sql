-- =====================================================================
-- Catto Compass — initial Supabase schema (Postgres + RLS)
-- Tables: shops, walks, redemptions, campaigns
-- Indexes scale-aware: composite index on (user_id, created_at)
-- Aggregate stats via SECURITY DEFINER RPC for council dashboard public read
-- =====================================================================

-- enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---- shops ---------------------------------------------------------
create table if not exists public.shops (
  id text primary key,
  name text not null,
  type text not null check (type in ('Cafe', 'Restaurant', 'Bakery')),
  emoji text,
  cuisine text,
  tags text[],
  multiplier int default 1 check (multiplier between 1 and 5),
  lat numeric(10, 7),
  lng numeric(10, 7),
  street text,
  verified_via_nominatim boolean default false,
  city_slug text default 'chatswood',
  created_at timestamptz default now()
);
create index if not exists shops_city on public.shops(city_slug);
create index if not exists shops_type on public.shops(type);

-- ---- walks ---------------------------------------------------------
create table if not exists public.walks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  shop_id text references public.shops(id) not null,
  transport_mode text not null check (transport_mode in ('walk', 'bike', 'scoot', 'bus')),
  distance_m int not null,
  co2_saved_kg numeric(8, 4) not null,
  points_earned int not null,
  verified_geolocation boolean default false,
  start_lat numeric(10, 7),
  start_lng numeric(10, 7),
  end_lat numeric(10, 7),
  end_lng numeric(10, 7),
  city_slug text default 'chatswood',
  created_at timestamptz default now()
);

-- composite index supports per-user history + global recent queries
create index if not exists walks_user_created on public.walks(user_id, created_at desc);
create index if not exists walks_city_created on public.walks(city_slug, created_at desc);
create index if not exists walks_shop on public.walks(shop_id);

-- ---- redemptions ---------------------------------------------------
create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  shop_id text references public.shops(id) not null,
  walk_id uuid references public.walks(id),
  points_spent int not null,
  discount_applied numeric(6, 2),
  redeemed_at timestamptz default now()
);
create index if not exists redemptions_user on public.redemptions(user_id);

-- ---- campaigns (shop owner saved Claude generations) -----------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  shop_id text references public.shops(id),
  biz_type text check (biz_type in ('Cafe', 'Restaurant', 'Bakery')),
  photo_path text,
  campaign_json jsonb not null,
  generated_via text check (generated_via in ('live', 'mock')),
  created_at timestamptz default now()
);
create index if not exists campaigns_user on public.campaigns(user_id, created_at desc);

-- ---- views ---------------------------------------------------------
-- per-user lifetime totals (used in header pill)
create or replace view public.user_points as
  select
    user_id,
    coalesce(sum(points_earned), 0)::int as total_points,
    coalesce(sum(co2_saved_kg), 0)::numeric(10, 4) as total_co2,
    count(*)::int as total_walks
  from public.walks
  group by user_id;

-- ---- RLS policies --------------------------------------------------
alter table public.shops enable row level security;
alter table public.walks enable row level security;
alter table public.redemptions enable row level security;
alter table public.campaigns enable row level security;

-- shops: public read (anyone can see the shop list)
drop policy if exists "shops public read" on public.shops;
create policy "shops public read" on public.shops for select using (true);

-- walks: users see and insert only their own
drop policy if exists "walks own select" on public.walks;
create policy "walks own select" on public.walks for select using (auth.uid() = user_id);
drop policy if exists "walks own insert" on public.walks;
create policy "walks own insert" on public.walks for insert with check (auth.uid() = user_id);

-- redemptions: users own only
drop policy if exists "redemptions own select" on public.redemptions;
create policy "redemptions own select" on public.redemptions for select using (auth.uid() = user_id);
drop policy if exists "redemptions own insert" on public.redemptions;
create policy "redemptions own insert" on public.redemptions for insert with check (auth.uid() = user_id);

-- campaigns: users own only
drop policy if exists "campaigns own all" on public.campaigns;
create policy "campaigns own all" on public.campaigns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- aggregate RPC (SECURITY DEFINER) ------------------------------
-- Public council dashboard reads aggregate stats via this function.
-- It runs as table owner (bypasses RLS) but only exposes aggregates.
create or replace function public.council_stats(
  p_city_slug text default 'chatswood',
  p_window_days int default 7
)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'total_walks',  count(*),
    'total_co2',    coalesce(sum(co2_saved_kg), 0),
    'total_km',     coalesce(sum(distance_m), 0) / 1000.0,
    'total_points', coalesce(sum(points_earned), 0),
    'walking_now',  count(*) filter (where created_at > now() - interval '5 minutes'),
    'unique_users', count(distinct user_id),
    'window_days',  p_window_days,
    'computed_at',  now()
  )
  from public.walks
  where city_slug = p_city_slug
    and created_at > now() - (p_window_days || ' days')::interval;
$$;

grant execute on function public.council_stats(text, int) to anon, authenticated;

-- per-street ranking
create or replace function public.council_top_streets(
  p_city_slug text default 'chatswood',
  p_window_days int default 7,
  p_limit int default 5
)
returns table(street text, count bigint, pct numeric)
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select s.street, count(*) as cnt
    from public.walks w
    join public.shops s on s.id = w.shop_id
    where w.city_slug = p_city_slug
      and w.created_at > now() - (p_window_days || ' days')::interval
      and s.street is not null
    group by s.street
  ),
  total as (select sum(cnt)::numeric as total from ranked)
  select r.street, r.cnt, round(r.cnt / nullif(t.total, 0), 2) as pct
  from ranked r cross join total t
  order by r.cnt desc
  limit p_limit;
$$;

grant execute on function public.council_top_streets(text, int, int) to anon, authenticated;

-- daily walks for sparkline
create or replace function public.council_daily_walks(
  p_city_slug text default 'chatswood',
  p_days int default 26
)
returns table(day date, count bigint)
language sql
security definer
set search_path = public
as $$
  with days as (
    select generate_series(
      current_date - (p_days - 1),
      current_date,
      '1 day'::interval
    )::date as day
  )
  select d.day, coalesce(count(w.id), 0) as count
  from days d
  left join public.walks w
    on w.city_slug = p_city_slug
   and w.created_at::date = d.day
  group by d.day
  order by d.day;
$$;

grant execute on function public.council_daily_walks(text, int) to anon, authenticated;
