---
title: Supabase Integration
status: in_progress
priority: urgent
type: feature
tags: [supabase, auth, database]
created_by: agent
created_at: 2026-06-21T11:23:00Z
position: 6
---

## Notes
Integrate real Supabase auth and playlists table. Replace all localStorage fake auth with Supabase Auth. Ensure persistent sessions for Tesla browser. Save/load playlist configs from Supabase.

## Checklist
- [ ] Update src/lib/supabase.ts with playlist DB helpers
- [ ] Rewrite src/contexts/AuthContext.tsx with real Supabase auth
- [ ] Update src/pages/login.tsx to use Supabase signIn
- [ ] Update src/pages/register.tsx to use Supabase signUp
- [ ] Update src/pages/settings.tsx to save/load from Supabase playlists table
- [ ] Update src/pages/dashboard.tsx to work with Supabase user
- [ ] Update src/pages/app.tsx to fetch playlist from Supabase
- [ ] Ensure admin privilege for ramazanberber2801@gmail.com via DB or context
- [ ] Run check_for_errors and validate

## Acceptance
- Users can sign up and log in with real Supabase Auth
- Playlist configs persist in Supabase and load on login
- Session persists across browser restarts
- No localStorage fake auth remains