---
title: IPTV Dashboard & Input Methods
status: todo
priority: high
type: feature
tags: [iptv, dashboard, xtream, m3u]
created_by: agent
created_at: 2026-06-21T08:30:00Z
position: 2
---

## Notes
User settings/dashboard to configure IPTV provider. Toggle between M3U URL paste and Xtream Codes API credentials. Store config in localStorage per user. Validate inputs before saving.

## Checklist
- [ ] Create /dashboard page with subscription status display
- [ ] Build IPTV config component with M3U / Xtream tabs
- [ ] Implement M3U URL input and validation
- [ ] Implement Xtream Codes form (server URL, username, password)
- [ ] Save config to localStorage linked to user ID
- [ ] Add subscription upgrade UI (mock payment flow)

## Acceptance
- User can switch between M3U and Xtream input methods
- Config persists per user in localStorage
- Dashboard shows current subscription tier