-- Run this SQL in your Supabase SQL Editor to create the playlists table

-- Playlists table: stores each user's IPTV configuration
create table if not exists playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  config_type text not null check (config_type in ('m3u', 'xtream')),
  m3u_url text,
  xtream_server_url text,
  xtream_username text,
  xtream_password text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table playlists enable row level security;

-- Users can only view their own playlists
create policy "Users can view own playlists"
  on playlists for select
  using (auth.uid() = user_id);

-- Users can only insert their own playlists
create policy "Users can insert own playlists"
  on playlists for insert
  with check (auth.uid() = user_id);

-- Users can only update their own playlists
create policy "Users can update own playlists"
  on playlists for update
  using (auth.uid() = user_id);

-- Users can only delete their own playlists
create policy "Users can delete own playlists"
  on playlists for delete
  using (auth.uid() = user_id);