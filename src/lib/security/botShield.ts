// =========================================================
// MahiOS Anti-Bot, Anti-Scraping & Input Sanitization Shield
// =========================================================

// List of known malicious crawlers, scrapers, vulnerability scanners & automated spam tools
const MALICIOUS_USER_AGENTS = [
  'sqlmap',
  'nikto',
  'masscan',
  'zgrab',
  'nmap',
  'dirbuster',
  'wpscan',
  'havij',
  'acunetix',
  'nessus',
  'semrushbot',
  'ahrefsbot',
  'dotbot',
  'mj12bot',
  'blexbot',
  'petalbot',
  'megaindex',
  'httrack',
  'harvest',
  'emailcollector',
  'miner',
  'autoit',
  'libwww-perl',
  'curl/7.0',
  'python-urllib',
  'go-http-client',
  'gptbot',
  'ccbot',
  'bytespider',
  'anthropic-ai',
  'claude-web',
  'diffbot',
];

export function isMaliciousBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const uaLower = userAgent.toLowerCase();

  for (const bot of MALICIOUS_USER_AGENTS) {
    if (uaLower.includes(bot)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates honeypot field. If the invisible honeypot field is filled, it is an automated bot.
 */
export function validateHoneypot(honeypotValue: unknown): boolean {
  if (honeypotValue && typeof honeypotValue === 'string' && honeypotValue.trim().length > 0) {
    return false; // Trapped bot!
  }
  return true; // Clean human submission
}

/**
 * Validates submission speed. Humans require at least ~800ms to fill a form.
 */
export function validateSubmissionSpeed(renderedTimestamp: unknown, minDurationMs = 800): boolean {
  if (!renderedTimestamp) return true; // Optional if not provided
  const renderedAt = Number(renderedTimestamp);
  if (isNaN(renderedAt)) return false;

  const now = Date.now();
  const duration = now - renderedAt;

  // If submitted too fast or timestamp is in the future
  if (duration < minDurationMs || duration > 86400000) {
    return false;
  }

  return true;
}

/**
 * Robust multi-pass sanitization against XSS, null bytes, script execution, and unquoted handlers
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.replace(/\0/g, ''); // Remove null bytes

  // Iteratively strip script, iframe, object, embed, link, meta, style tags
  const dangerousTags = /<\/?(?:script|iframe|object|embed|applet|meta|link|style|base)\b[^>]*>/gi;
  while (dangerousTags.test(sanitized)) {
    sanitized = sanitized.replace(dangerousTags, '');
  }

  // Strip all javascript:, vbscript:, data: protocols
  sanitized = sanitized.replace(/(?:javascript|vbscript|data):/gi, '');

  // Strip all event handlers: on<event> = ... with or without quotes, spaces, or tabs
  sanitized = sanitized.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  return sanitized.trim();
}

/**
 * Strict file extension and MIME type validation
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'pdf',
]);

export function validateFileUpload(
  filename: string,
  mimeType: string,
  fileSize: number,
  maxSizeBytes = 10 * 1024 * 1024 // 10 MB limit
): { valid: boolean; error?: string } {
  // Check size
  if (fileSize > maxSizeBytes) {
    return { valid: false, error: `File exceeds maximum allowed size of ${maxSizeBytes / 1024 / 1024}MB.` };
  }

  const cleanMime = mimeType.toLowerCase().trim();
  const ext = filename.split('.').pop()?.toLowerCase();

  // Block SVG uploads to eliminate SVG script injection / Stored XSS
  if (cleanMime === 'image/svg+xml' || ext === 'svg') {
    return { valid: false, error: 'SVG uploads are disallowed for security. Please upload PNG, JPG, or WebP.' };
  }

  // Check MIME
  if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
    return { valid: false, error: `Disallowed MIME type: ${cleanMime}. Only images (JPG, PNG, WebP, GIF) and PDFs are permitted.` };
  }

  // Check extension
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Disallowed file extension: .${ext}.` };
  }

  // Prevent double extension attacks (e.g. payload.php.jpg)
  const parts = filename.split('.');
  if (parts.length > 2) {
    const dangerousExts = ['php', 'phtml', 'exe', 'sh', 'bat', 'js', 'py', 'cgi', 'pl', 'jsp', 'html', 'htm', 'svg'];
    for (const part of parts.slice(0, -1)) {
      if (dangerousExts.includes(part.toLowerCase())) {
        return { valid: false, error: 'Suspicious multi-extension filename detected.' };
      }
    }
  }

  return { valid: true };
}
