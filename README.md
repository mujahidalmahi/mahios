<div align="center">

# 💾 MahiOS

### *A 1990s Retro Desktop Operating System & Dynamic Digital Biography*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![CI Status](https://img.shields.io/github/actions/workflow/status/mujahidalmahi/mahios/ci.yml?branch=main&style=for-the-badge)](https://github.com/mujahidalmahi/mahios/actions)

[🌐 Live Demo](https://mujahidmahi.me) • [📖 Documentation](./docs) • [🛠️ Admin CMS](./docs/ADMIN_GUIDE.md) • [🚀 Deploy Guide](./docs/DEPLOYMENT.md) • [💬 Report Issue](https://github.com/mujahidalmahi/mahios/issues)

```
 __________________________________________________________________________
| [X] MahiOS 95 Kernel v2.0 - Authenticated Workspace                      |
|==========================================================================|
|  [User]    [Career]    [Projects]    [Skills]    [Terminal]    [Gallery] |
|  [Ethics]  [Vision]    [Roadmap]     [Feed]      [Dreams]      [Wishes]  |
|                                                                          |
|       _  _         _      _   ___   ____                                 |
|      | \/ |  ___  | |__  (_) / _ \ / ___|                                |
|      | |\/| |/ _` | '_ \ | || | | |\___ \                                |
|      | |  | | (_| | | | || || |_| | ___) |                               |
|      |_|  |_|\__,_|_| |_||_| \___/ |____/                                |
|                                                                          |
|                  Designed & Engineered by Mujahid Al Mahi                |
|__________________________________________________________________________|
```

</div>

---

## ✨ Overview

**MahiOS** is a tribute to the golden age of personal computing — reimagining the iconic **Windows 95 / retro desktop operating system** as a modern, high-performance personal biography and engineering portfolio.

Built with **Next.js 16 (App Router & Turbopack)**, **React 19 Server Components**, **Supabase PostgreSQL**, **TipTap Rich Text Suite**, and the **Web Audio API**, MahiOS blends tactile retro aesthetics (GPU CRT shaders, beveled window managers, synthetic 8-bit sound chimes) with modern developer tooling and a **powerful, zero-bypass Admin CMS Control Center**.

---

## 🌟 Key Features

### 🖥️ 1. Retro Desktop OS Simulation
- **Window Management State Machine**: Drag, resize, minimize, maximize, snap, and z-index elevation via [Zustand](https://github.com/pmndrs/zustand).
- **22 Interactive Window Applications**:
  - **About Me**: Interactive bio story, skills radar, taglines, and experience metrics.
  - **Career & Stack**: Employment timeline, tech badges, and company portfolio.
  - **Projects Directory**: Showcase with dynamic domain filtering, GitHub links, and live previews.
  - **MS-DOS Command Prompt**: Interactive retro CLI with custom commands (`help`, `neofetch`, `matrix`, `calc`, `whoami`).
  - **Status Feed**: Micro-blogging timeline with media previews, hashtags, and likes.
  - **Philosophy & Principles**: Core mental models and guiding rules for engineering and life.
  - **Strategic Aims & Roadmap**: Interactive goals with progress percentages and deliverable checklists.
  - **Dreamscape Manifestos**: Long-term vision manifestos with multi-decade horizons.
  - **3 Wishes**: Existential wishes for humanity and global tech ethics.
  - **Personal Hall of Fame**: Curated gear, dev tools, books, and cuisine with 1–10 star ratings.
  - **Mail Client (`Mail_Client.exe`)**: Functional visitor inquiry dispatcher with instant inquiry templates.
  - **Photo Archives & Lightbox**: Visual albums with retro metadata.
  - **Honors & Certs**: Digital credential viewer with interactive confetti effects.
  - **Resume CV Viewer**: Print-optimized ATS resume viewer with 1-click PDF download.
  - **BIOS Boot Sequence**: Authentically timed hardware POST diagnostic boot stream.

### 🔊 2. Hardware-Accurate Sound Synthesis
- Built-in **Web Audio API** sound synthesizer with zero external audio assets.
- Produces authentic mechanical clicks, startup chords, window open/close swooshes, success chimes, and alert buzzes.

### 📺 3. GPU CRT & Matrix Phosphor Shaders
- Authentic raster scanlines, lens vignette curvature, monitor glare, and matrix digital rain toggles.

### 📱 4. Multi-Device Adaptive Form Factors
- **Desktop Shell**: Full floating window canvas with retro start menu and taskbar.
- **Tablet Shell**: Touch-optimized floating matrix and split-pane layout.
- **Mobile Shell**: Smartphone app grid dock and bottom navigation.

### 🎛️ 5. Master Admin CMS Dashboard (`/admin`)
- **25+ Specialized Studios**: Real-time management across all 26 database models.
- **100% Dynamic Category Freedom**: Type any category on the fly with the reusable `CategoryPicker` component.
- **Universal Command Palette (`Ctrl + K` / `Cmd + K`)**: Fuzzy search and instant navigation across all administrative pages.
- **TipTap Rich Text Suite**: Headings, tables, inline code, code blocks, blockquotes, link modals, and image embed tools.
- **1-Click JSON Backup Exporter**: Instant offline snapshot backup of the entire database.

### 🔒 6. Multi-Layered Enterprise Security Subsystem
- **3-Tier Zero-Bypass Route Protection**: Next.js 16 Proxy layer (`src/proxy.ts`) + Node.js Server Layout Guard (`src/app/admin/layout.tsx`) + Client DOM Lockout Shield (`src/components/admin/AdminLayoutClient.tsx`).
- **Sliding Window Rate Limiting**: Token-bucket rate limiting on `/api/auth/login` (5 req/min with brute-force lockout), `/api/contact` (10 req/min), and `/api/upload` (20 req/min).
- **Anti-Bot & Anti-Scraping Shield**: Intercepts malicious crawlers (`sqlmap`, `nikto`, `httrack`, `ahrefsbot`), honeypot traps, and time-delta submission checks.
- **Enterprise HTTP Security Headers**: HSTS, CSP, X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`), and Permissions-Policy.

---

## 🏗️ System Architecture

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

## ⚡ Quick Start

### Prerequisites
- Node.js 18.18+ or 20+ (Recommended: Node.js 20 LTS)
- npm, pnpm, or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/mujahidalmahi/mahios.git
cd mahios
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env.local` by copying the example template:
```bash
cp .env.example .env.local
```

*(Note: MahiOS includes complete offline demo fallback data. You can start exploring immediately without connecting Supabase!)*

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the retro desktop simulation.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the Admin CMS (Default Master Key: `mahi-admin-2026`).

---

## 📚 Detailed Documentation

| Document | Description |
| :--- | :--- |
| 🏛️ [**Architecture Deep Dive**](./docs/ARCHITECTURE.md) | Technical design, Window state machines, Web Audio synthesizer, CRT shaders, and Next.js 16 architecture. |
| 🗄️ [**Database Schema Guide**](./docs/DATABASE_SCHEMA.md) | Complete guide to all 26 Supabase tables, migrations, relationships, and RLS policies. |
| 🎛️ [**Admin CMS Guide**](./docs/ADMIN_GUIDE.md) | Walkthrough of the 25+ studios, custom categories, TipTap rich text, media storage, and Ctrl+K search. |
| 🚀 [**Deployment Guide**](./docs/DEPLOYMENT.md) | Production setup for Vercel, Supabase, Cloudinary, custom domains, and DNS. |
| 🎨 [**Customization Guide**](./docs/CUSTOMIZATION.md) | How to build new desktop apps, customize sound effects, scanlines, and themes. |
| 🔒 [**Security Architecture**](./docs/SECURITY.md) | Deep dive into the 3-tier route protection, anti-bot shield, honeypots, rate limiting, and HTTP security headers. |

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.3.4](https://nextjs.org/) (App Router, Turbopack, Proxy Layer) |
| **Core Library** | [React 19.2.8](https://react.dev/) (Server & Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Retro CRT CSS |
| **State Management**| [Zustand 5](https://github.com/pmndrs/zustand) |
| **Database & Auth** | [Supabase PostgreSQL](https://supabase.com/) with Row Level Security (RLS) |
| **Rich Text Editor**| [TipTap 3](https://tiptap.dev/) (Full format suite, tables, links, images) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Audio Engine** | Web Audio API (Hardware synthesized polyphonic retro sound) |
| **Animations** | [Framer Motion 13](https://www.framer.com/motion/) + Canvas Confetti |

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please review our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

```bash
# Create your feature branch
git checkout -b feat/my-new-retro-app

# Commit your changes
git commit -m "feat: add vintage Paint canvas application"

# Push to your branch
git push origin feat/my-new-retro-app
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👤 Author

**Mujahid Al Mahi**
- 🌐 Website: [https://mujahidmahi.me](https://mujahidmahi.me)
- 🐙 GitHub: [@mujahidalmahi](https://github.com/mujahidalmahi)
- 💼 LinkedIn: [Mujahid Al Mahi](https://linkedin.com/in/mujahidmahi)
- 📧 Email: [mujahidmahi.official@gmail.com](mailto:mujahidmahi.official@gmail.com)

---

<div align="center">
  <sub>Built with 💾 retro soul and ⚡ modern engineering craft by <a href="https://mujahidmahi.me">Mujahid Al Mahi</a>.</sub>
</div>
