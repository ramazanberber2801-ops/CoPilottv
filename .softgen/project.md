---
title: CoPilot TV
created_at: 2026-06-21T08:30:00Z
---

## Vision
CoPilot TV is a premium IPTV and video streaming web application optimized for Tesla in-car browsers. It delivers live TV, movies, and series through dual input methods (M3U playlist and Xtream Codes API) with a dark cyber-glass interface designed for large touchscreens.

## Design
- **Evocation:** Neon Cyber-Glass — dark immersive cinema meets holographic HUD. Think Blade Runner 2049 interface meets high-end streaming lounge.
- **Emotional signature:** "Controlled immersion — premium tech that feels alive but never chaotic."
- **Palette:**
  - `--background: 240 20% 4%` (#0a0a0f)
  - `--foreground: 240 20% 96%` (#f0f0f5)
  - `--primary: 186 100% 50%` (#00e5ff)
  - `--secondary: 262 83% 58%` (#7c3aed)
  - `--accent: 186 100% 50%` (#00e5ff)
  - `--muted: 220 9% 46%` (#6b7280)
  - `--card: 240 18% 8%` (#12121a)
  - `--border: 240 15% 15%` (#1f1f2e)
  - `--destructive: 0 84% 60%` (#ef4444)
- **Typography:** Sora (headings/display), JetBrains Mono (data/labels)
- **Style direction:** Glassmorphism cards with `backdrop-blur-xl`, `bg-white/5`, `border-white/10`. Electric cyan glow on interactive elements. Tesla-optimized touch targets (min 48px). Rounded-2xl containers.
- **Animations:** Subtle pulse on live indicators, staggered grid entrances, hover scale on cards.

## Features
1. LocalStorage-based auth with hardcoded admin privilege for ramazanberber2801@gmail.com
2. Dual IPTV input: M3U URL or Xtream Codes API
3. Three navigation sections: Live TV, Movies (VOD), Series
4. Server-side proxy API for CORS/mixed-content bypass
5. Lazy-loaded/paginated content grids
6. Full-screen video player with Tesla-optimized controls
7. Subscription management dashboard