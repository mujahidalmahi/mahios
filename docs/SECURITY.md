# MahiOS Security Architecture & Hardening Guide

MahiOS is fortified with a **multi-layered enterprise security defense subsystem** designed to prevent scraping, bot attacks, brute-force intrusions, and unauthorized administrative access.

---

## 🔒 1. Zero-Bypass 3-Tier Route Guarding

```
Incoming Request: /admin/*
        │
        ▼
[ Tier 1: Next.js 16 Proxy Layer (src/proxy.ts) ]
  ├── Valid cryptographic cookie?  ──► Yes ──► Proceed to Tier 2
  └── No ──► HTTP 307 Redirect to /admin/login
        │
        ▼
[ Tier 2: Server Layout Guard (src/app/admin/layout.tsx) ]
  ├── Verified Node.js session?   ──► Yes ──► Render Server Component
  └── No ──► Passes isAuthenticated: false
        │
        ▼
[ Tier 3: Client DOM Shield (src/components/admin/AdminLayoutClient.tsx) ]
  ├── Authenticated client state? ──► Yes ──► Mount Admin Canvas
  └── No ──► Block DOM, Display Security Curtain & Force Redirect
```

---

## ⏱️ 2. Sliding Window Rate Limiting (`src/lib/security/rateLimiter.ts`)

MahiOS implements an edge-compatible in-memory sliding window rate limiter:

| Endpoint | Max Threshold | Window Duration | Penalty |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | **5 requests** | 60 seconds | HTTP 429 + Automatic Login Lockout Countdown |
| `/api/contact` | **10 requests** | 60 seconds | HTTP 429 + Retry-After Header |
| `/api/upload` | **20 requests** | 60 seconds | HTTP 429 + Rate Limit Reset Header |

---

## 🤖 3. Anti-Bot, Anti-Scraping & Spam Shield (`src/lib/security/botShield.ts`)

- **Crawler & Scanner Blacklist**: Intercepts automated scraping agents and vulnerability scanners (`sqlmap`, `nikto`, `masscan`, `wpscan`, `httrack`, `megaindex`, `ahrefsbot`, `dotbot`, `mj12bot`).
- **Honeypot Trap Fields**: Invisible decoy form inputs that humans cannot see. Bots auto-filling these inputs are silently intercepted.
- **Time-Delta Verification**: Submissions executed in under 800ms (impossible for humans) are flagged as automated scripts and rejected.
- **Input Sanitization**: Automatically purges null bytes, `<script>` tags, inline JS execution protocols, and XSS vectors before database persistence.
- **Robots Directives**: [`src/app/robots.ts`](../src/app/robots.ts) explicitly disallows commercial AI training scrapers (`GPTBot`, `CCBot`, `Bytespider`, `anthropic-ai`) from private routes.

---

## 📁 4. Media Upload Hardening (`src/app/api/upload/route.ts`)

- **Strict MIME Whitelist**: Only `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`, and `application/pdf`.
- **Max File Size**: 10MB per file.
- **Multi-Extension Polyglot Defense**: Blocks filenames with multiple extensions (e.g. `exploit.php.jpg`).

---

## 🛡️ 5. HTTP Security Headers

Configured in `next.config.ts`:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: SAMEORIGIN` (Clickjacking prevention)
- `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
- `X-XSS-Protection: 1; mode=block`
- `X-DNS-Prefetch-Control: on`
