---
title: Proxy API & Video Player
status: done
priority: urgent
type: feature
tags: [proxy, video-player, cors, tesla]
created_by: agent
created_at: 2026-06-21T08:30:00Z
position: 4
---

## Notes
Build server-side proxy for CORS/mixed-content bypass. Create full-screen video player with Tesla-optimized controls. Player controls must be large enough for Tesla touchscreen.

## Checklist
- [x] Build server proxy API at /api/proxy with streaming support
- [x] Create VideoPlayer component with full-screen mode
- [x] Add play/pause, mute, fullscreen, seek controls
- [x] Player controls are large enough for Tesla touchscreen
- [x] Error states show meaningful messages

## Acceptance
- Proxy successfully fetches and streams remote content
- Video player opens in full-screen overlay
- Controls are touch-optimized (min 48px)
- Playback works with keyboard and touch