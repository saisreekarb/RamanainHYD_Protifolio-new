-- Run this entire script in Supabase Dashboard > SQL Editor > New query.
create table if not exists public.portfolio (
  id integer primary key check (id = 1),
  name text not null default 'YOUR NAME',
  role text not null default 'Video Editor & Creative Storyteller',
  tagline text not null default 'Stories worth watching.',
  about text not null default '',
  email text not null default '',
  instagram text not null default '',
  youtube text not null default '',
  skills jsonb not null default '[]'::jsonb
);
create table if not exists public.projects (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null default '',
  url text not null,
  type text not null check (type in ('video','image')),
  public_id text not null,
  created_at timestamptz not null default now()
);
alter table public.portfolio enable row level security;
alter table public.projects enable row level security;
-- Browser clients receive no direct table access. Server API uses service-role key.
revoke all on public.portfolio from anon, authenticated;
revoke all on public.projects from anon, authenticated;
insert into public.portfolio (id) values (1) on conflict (id) do nothing;
