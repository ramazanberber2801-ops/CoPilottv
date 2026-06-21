---
title: Live TV, Movies & Series Navigation
status: todo
priority: high
type: feature
tags: [navigation, grid, lazy-loading, content]
created_by: agent
created_at: 2026-06-21T08:30:00Z
position: 3
---

## Notes
Three-tab navigation for Live TV, Movies, and Series. Each section queries the appropriate Xtream API action via the proxy. Implement virtual scrolling or pagination (100 items at a time). Tesla-optimized large touch targets.

## Checklist
- [ ] Create main /app page with tab navigation
- [ ] Build Live TV grid with channel cards and EPG hints
- [ ] Build Movies grid with poster cards and metadata
- [ ] Build Series grid with season/episode browsing
- [ ] Implement lazy loading / pagination for each section
- [ ] Create channel/poster card components with glass styling
- [ ] Add search/filter functionality

## Acceptance
- Three distinct tabs load content separately
- Large lists don't crash the browser (lazy loading)
- Cards are optimized for Tesla touchscreen (min 48px touch targets)
- Content loads through server proxy without CORS errors