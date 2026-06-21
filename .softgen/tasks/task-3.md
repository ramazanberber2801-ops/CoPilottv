---
title: Live TV, Movies & Series Navigation
status: in_progress
priority: high
type: feature
tags: [live-tv, movies, series, content-browser]
created_by: agent
created_at: 2026-06-21T08:30:00Z
position: 3
---

## Notes
Build the main content browser at /app with three tabs: Live TV, Movies, Series. Lazy load content. Tesla-optimized touch targets (min 48px). Content loads through server proxy.

## Checklist
- [ ] Build /app page with tab navigation (Live TV / Movies / Series)
- [ ] Create content grid component with lazy loading / pagination
- [ ] Fetch and display channels/movies/series from configured IPTV source
- [ ] Handle loading, error, and empty states
- [ ] Tesla-optimized touch targets and spacing

## Acceptance
- User can browse Live TV, Movies, and Series in separate tabs
- Content loads lazily (100 items at a time)
- Grid is optimized for Tesla touchscreen (min 48px touch targets)
- Content loads through server proxy without CORS errors