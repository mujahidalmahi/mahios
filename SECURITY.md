# Security Policy

## Supported Versions

We actively maintain and provide security updates for the latest major release:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

---

## 🔒 Security Architecture Highlights

MahiOS implements multi-layered security protections:
- **Zero-Bypass 3-Tier Route Guarding**: Next.js 16 Proxy layer, Node.js Server Layout, and Client DOM Shield.
- **Rate Limiting Engine**: Sliding window rate limiter protecting `/api/auth/login`, `/api/contact`, and `/api/upload`.
- **Anti-Bot & Anti-Scraping**: Honeypot traps, malicious crawler user-agent blocklists, and time-delta verification.
- **Enterprise Headers**: Strict Transport Security (HSTS), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.
- **Input Sanitization**: XSS stripping and validation on all database mutation routes.
- **File Upload Protection**: Strict MIME type whitelisting, file size restrictions, and multi-extension polyglot defense.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within MahiOS, please help us keep the community safe by responsibly disclosing it.

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security issues by sending an email to:
📧 **mujahidmahi.official@gmail.com**

Please include:
1. Type of vulnerability (e.g. XSS, authentication bypass, CSRF, rate limit circumvention)
2. Step-by-step instructions to reproduce the issue
3. A proof of concept (PoC) script or screenshots if applicable
4. Potential impact

You will receive an acknowledgment within **24 hours**, and regular updates regarding the patch status until a fix is released.
