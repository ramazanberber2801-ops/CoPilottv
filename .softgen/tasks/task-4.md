---
title: Proxy API & Video Player
status: todo
priority: urgent
type: feature
tags: [proxy, api, video-player, cors]
created_by: agent
created_at: 2026-06-21T08:30:00Z
position: 4
---

## Notes
Server-side proxy to bypass CORS and mixed-content restrictions. All frontend requests route through Next.js API routes. Video player uses HLS.js or native HTML5 video with proxy-streamed sources.

## Checklist
- [ ] Create /api/proxy.ts for general HTTP proxy
- [ ] Create /api/iptv.ts for Xtream API proxy with action routing
- [ ] Create /api/stream.ts for video stream proxy (.m3u8, .ts)
- [ ] Build VideoPlayer component with full-screen support
- [ ] Implement HLS stream support via proxy
- [ ] Add Tesla-optimized player controls (large buttons)
- [ ] Add loading states and error handling

## Acceptance
- API requests to HTTP IPTV servers succeed without CORS errors
- Video streams play through the proxy
- Player controls are large enough for Tesla touchscreen
- Error states show meaningful messages