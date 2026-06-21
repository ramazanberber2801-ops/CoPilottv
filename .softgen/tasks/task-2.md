---
title: IPTV Dashboard & Input Methods
status: done
priority: high
type: feature
tags: [iptv, m3u, xtream, settings]
created_by: agent
created_at: 2026-06-21T08:30:00Z
position: 2
---

## Notes
Build settings page for dual IPTV input: M3U URL or Xtream Codes API. Config persists per user in localStorage. Create server proxy for CORS bypass.

## Checklist
- [x] Create IPTV service utilities (M3U parser, Xtream API helpers)
- [x] Build server-side proxy API for CORS/mixed-content bypass
- [x] Build /settings page with M3U and Xtream tabs
- [x] Save config to user profile in localStorage
- [x] Test connection via proxy

## Acceptance
- User can input M3U URL or Xtream credentials
- Config persists and loads on return
- Proxy successfully fetches remote content