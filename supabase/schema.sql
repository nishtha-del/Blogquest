-- Run this entire file in Supabase → SQL Editor → New query → Run
-- Step 1: Create tables

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text,
  status text,
  assignee text,
  content_pillar text,
  type text,
  source text,
  keywords text[] default '{}',
  cluster text,
  potential text,
  target_date text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.scratchpad_items (
  id uuid primary key default gen_random_uuid(),
  type text,
  content text,
  title text,
  status text,
  tags text[] default '{}',
  source_url text,
  created_at timestamptz not null default now()
);

-- Step 2: Row Level Security (open policy for hackathon — anon can do everything)

alter table public.blog_posts enable row level security;

create policy "Allow all" on public.blog_posts
  for all
  using (true)
  with check (true);

alter table public.scratchpad_items enable row level security;

create policy "Allow all" on public.scratchpad_items
  for all
  using (true)
  with check (true);
