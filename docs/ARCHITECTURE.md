# MahiOS System Architecture

MahiOS is designed as a **1990s retro desktop operating system simulation** running directly in modern web browsers, combined with a **Next.js 16 full-stack CMS and real-time Supabase database layer**.

```
+-------------------------------------------------------------------------+
|                              CLIENT BROWSER                             |
|                                                                         |
|  +---------------------+   +---------------------+   +----------------+ |
|  | Desktop OS Shell    |   | Tablet Shell        |   | Mobile Shell   | |
|  | (Retro CRT Shaders) |   | (Window Matrix)     |   | (Dock App Grid)| |
|  +----------+----------+   +----------+----------+   +--------+-------+ |
|             |                         |                       |         |
|             +-------------------------+-----------------------+         |
|                                       |                                 |
|                       +---------------+---------------+                 |
|                       | Zustand State Manager         |                 |
|                       | (WindowManager, SystemSound)  |                 |
|                       +---------------+---------------+                 |
|                                       |                                 |
|                       +---------------+---------------+                 |
|                       | 22 Dynamic Retro Apps         |                 |
|                       | (Terminal, Bio, Projects...)  |                 |
|                       +-------------------------------+                 |
+---------------------------------------+---------------------------------+
                                        |
                                        | (Encrypted HTTPS / WebSockets)
                                        v
+-------------------------------------------------------------------------+
|                        NEXT.JS 16 APP ROUTER SERVER                     |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Next.js 16 Proxy Layer (Bot Shield, Rate Limiting, Route Guard)   |  |
|  +-----------------------------------+-------------------------------+  |
|                                      |                                  |
|         +----------------------------+----------------------------+     |
|         |                                                         |     |
|         v                                                         v     |
|  +---------------+                                         +----------+ |
|  | Public API    |                                         | Admin CMS| |
|  | (/api/contact)|                                         | (25+ Hub)| |
|  +---------------+                                         +----------+ |
+---------------------------------------+---------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------+
|                         DATA & STORAGE LAYER                            |
|                                                                         |
|   +---------------------------------+   +---------------------------+   |
|   | Supabase PostgreSQL (26 Tables) |   | Cloudinary / CDN Media    |   |
|   +---------------------------------+   +---------------------------+   |
+-------------------------------------------------------------------------+
```

---

## 🖥️ 1. Window Manager Engine (`src/stores/windowStore.ts`)

The window manager uses **Zustand** for high-performance reactive state management:
- **Z-Index Stacking**: Automatic active window elevation on click or drag.
- **Dynamic Coordinates**: Dynamic centering on initial spawn (`default_x`, `default_y`), bounding box collision detection within viewport limits.
- **Window States**: `minimized`, `maximized`, `normal`, and active taskbar button synchronization.
- **Multi-Instance Prevention**: Tracks open window IDs to focus existing windows if an app is reopened.

---

## 🔊 2. Web Audio Sound Synthesizer (`src/stores/systemStore.ts`)

Instead of requiring external audio MP3 files, MahiOS includes a **built-in hardware-accurate Web Audio API sound synthesizer**:
- **`startup`**: Polyphonic retro boot chord with harmonic overtones.
- **`click`**: High-frequency mechanical tactile click pulse.
- **`open` / `close`**: Rising / falling frequency sweep.
- **`error`**: Dual-tone square wave alert buzz.
- **`success`**: Ascending arpeggio chime.

---

## 📺 3. CRT Scanline & Phosphor Shader Pipeline (`src/styles/crt.css`)

MahiOS simulates authentic 1990s cathode-ray tube monitors via pure CSS GPU-accelerated shaders:
- **Horizontal Raster Scanlines**: Repeating SVG linear-gradient raster lines with subtle scanline jitter.
- **Phosphor Vignette**: Radial gradient lens curvature that darkens monitor corners.
- **Screen Curvature Effect**: Optional 3D barrel distortion simulation.
- **Green Phosphor / Amber Terminal Shaders**: Authentic monochrome phosphor glow with matrix digital rain.

---

## 📱 4. Multi-Device Adaptive Form Factors

MahiOS delivers 3 specialized user interface shells:
1. **Desktop Shell (`src/components/desktop/Desktop.tsx`)**: Full desktop workspace with floating resizable windows, desktop icon grid, start menu, system tray, and taskbar.
2. **Tablet Shell (`src/components/tablet/TabletShell.tsx`)**: Split-pane and floating canvas optimized for touch gestures.
3. **Mobile Shell (`src/components/mobile/MobileShell.tsx`)**: Smartphone dock, full-screen app launcher grid, and intuitive bottom navigation.

---

## 🔒 5. Enterprise Security Architecture

- **3-Tier Zero-Bypass Route Protection**: Next.js 16 proxy layer interceptor + Node.js Server Layout Guard + Client DOM Lockout curtain.
- **Sliding Window Rate Limiter**: Configurable token bucket rate limiting on `/api/auth/login`, `/api/contact`, and `/api/upload`.
- **Anti-Bot & Anti-Scraping**: Honeypot traps, user-agent crawler blocklist, and human time-delta validation.
