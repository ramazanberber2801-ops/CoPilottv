---
title: Supabase Auth & User Data Persistence
status: todo
priority: urgent
type: feature
tags: [supabase, auth, database, sessions]
created_by: agent
created_at: 2026-06-21T10:59:56Z
position: 5
---

## Notes
Replace localStorage auth with Supabase Auth + PostgreSQL. Users register/login via Supabase, sessions persist across devices (Tesla, mobile, desktop). User IPTV configs stored in Supabase profiles table. Admin rule: ramazanberber2801@gmail.com gets role=admin via database trigger or app-level check.

## Checklist
- [ ] Enable Supabase integration
- [ ] Set up Supabase Auth (email/password)
- [ ] Create profiles table with role, subscription, iptv_config
- [ ] Rewrite AuthContext to use Supabase client
- [ ] Update login/register pages for Supabase auth
- [ ] Update settings/dashboard to sync IPTV config to Supabase
- [ ] Add RLS policies for user data security

## Acceptance
- User can register and login on any device and stay authenticated
- Admin email automatically has premium access
- IPTV playlists persist to Supabase and sync across devices
- Sessions survive page refresh and browser restart