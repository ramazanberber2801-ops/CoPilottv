---
title: Authentication System
status: done
priority: urgent
type: feature
tags: [auth, localstorage]
created_by: agent
created_at: 2026-06-21T08:30:00Z
position: 1
---

## Notes
Build login and registration with localStorage persistence. Hardcoded admin rule: email "ramazanberber2801@gmail.com" automatically gets role=admin and subscription=premium. All other users get role=user and subscription=free.

## Checklist
- [x] Create AuthContext with login/register/logout and admin/premium guards
- [x] Build /login page with Neon Cyber-Glass styling
- [x] Build /register page with Neon Cyber-Glass styling
- [x] Update _app.tsx to wrap with AuthProvider
- [x] Update index.tsx as landing/auth gateway
- [x] Add auth guards for protected routes

## Acceptance
- User can register and login with localStorage persistence
- ramazanberber2801@gmail.com automatically has admin/premium status
- Non-admin users have free status by default
- Auth state persists across page refreshes