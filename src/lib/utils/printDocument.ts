'use client';

export interface PrintDocumentOptions {
  title: string;
  categoryBadge?: string;
  subtitle?: string;
  periodOrDate?: string;
  location?: string;
  author?: string;
  contentHtml?: string;
  plainText?: string;
  calloutTitle?: string;
  calloutText?: string;
  tags?: string[];
  footerNote?: string;
}

/**
 * Isolated Targeted Document Printer.
 * Renders ONLY the targeted document (chapter, article, or resume) inside a dedicated,
 * print-optimized iframe to prevent printing the desktop OS wallpaper, taskbar,
 * titlebars, or suffering viewport overflow clipping.
 */
export function printDocument(options: PrintDocumentOptions): void {
  if (typeof window === 'undefined') return;

  // Clean up any lingering print iframes
  const existingIframe = document.getElementById('mahios-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'mahios-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const author = options.author || 'Mujahid Al Mahi';
  const metaParts = [
    options.periodOrDate,
    options.location,
    author,
  ].filter(Boolean);

  const contentBody = options.contentHtml
    ? options.contentHtml
    : options.plainText
    ? `<pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10.5pt; line-height: 1.65; color: #1e293b; background: #f8fafc; padding: 16px; border: 1px solid #e2e8f0; border-radius: 4px;">${options.plainText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${options.title} — ${author}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 18mm 16mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.75;
      font-size: 11.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-header {
      border-bottom: 2.5px solid #000080;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #000080;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 2px 8px;
      border-radius: 3px;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 22pt;
      font-weight: 800;
      margin: 0 0 6px 0;
      color: #020617;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }
    .subtitle {
      font-size: 11.5pt;
      color: #475569;
      font-weight: 500;
      margin: 0 0 8px 0;
    }
    .meta-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      font-size: 9.5pt;
      color: #64748b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 6px;
    }
    .meta-bar span:not(:last-child):after {
      content: "•";
      margin-left: 12px;
      color: #cbd5e1;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .tag {
      font-size: 8.5pt;
      font-family: ui-monospace, monospace;
      color: #1e40af;
      background: #f1f5f9;
      padding: 1px 6px;
      border-radius: 3px;
    }
    .content {
      font-size: 11.5pt;
      line-height: 1.8;
      color: #1e293b;
    }
    .content p {
      margin: 0 0 14px 0;
    }
    .content strong {
      font-weight: 700;
      color: #0f172a;
    }
    .content em {
      font-style: italic;
    }
    .content ul, .content ol {
      margin: 0 0 14px 0;
      padding-left: 24px;
    }
    .content li {
      margin-bottom: 4px;
    }
    .content blockquote {
      border-left: 3.5px solid #000080;
      padding-left: 14px;
      margin: 16px 0;
      font-style: italic;
      color: #334155;
    }
    .callout-box {
      margin: 22px 0;
      padding: 16px 20px;
      background: #f8fafc;
      border-left: 4.5px solid #000080;
      border-top: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      border-radius: 4px;
      page-break-inside: avoid;
    }
    .callout-title {
      font-size: 9.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #000080;
      margin-bottom: 5px;
    }
    .callout-text {
      font-size: 11pt;
      font-style: italic;
      color: #1e293b;
      margin: 0;
      line-height: 1.6;
    }
    .print-footer {
      margin-top: 36px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 8.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="print-header">
    ${options.categoryBadge ? `<div class="badge">${options.categoryBadge}</div>` : ''}
    <h1>${options.title}</h1>
    ${options.subtitle ? `<div class="subtitle">${options.subtitle}</div>` : ''}
    <div class="meta-bar">
      ${metaParts.map((p) => `<span>${p}</span>`).join('')}
    </div>
    ${options.tags && options.tags.length > 0 ? `
      <div class="tags">
        ${options.tags.map((t) => `<span class="tag">#${t.replace(/^#/, '')}</span>`).join('')}
      </div>
    ` : ''}
  </div>

  <div class="content">
    ${contentBody}
  </div>

  ${options.calloutText ? `
    <div class="callout-box">
      <div class="callout-title">${options.calloutTitle || 'Key Realization & Takeaway'}</div>
      <div class="callout-text">“${options.calloutText}”</div>
    </div>
  ` : ''}

  <div class="print-footer">
    <span>${options.footerNote || 'Mujahid Al Mahi • Digital Biography & Engineering Portfolio'}</span>
    <span>Generated via MahiOS 05</span>
  </div>
</body>
</html>`;

  doc.open();
  doc.write(html);
  doc.close();

  // Trigger print dialog after brief layout calculation
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Print iframe error, falling back to window.print():', e);
      window.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 2500);
    }
  }, 250);
}
