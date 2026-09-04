/**
 * Lightweight, secure Markdown to HTML renderer for MahiOS.
 * Converts markdown text (headings, bold, italic, lists, code, quotes, links, hr)
 * into safe HTML without external runtime dependencies.
 */

export function renderMarkdownToHtml(
  markdown: string,
  theme: 'light' | 'dark' = 'light'
): string {
  if (!markdown || typeof markdown !== 'string') return '';

  const isDark = theme === 'dark';

  // Theme-specific styles
  const styles = {
    h1: isDark
      ? 'text-lg font-bold text-white mt-4 mb-2 border-b border-slate-700 pb-1'
      : 'text-lg font-bold text-[#000080] mt-4 mb-2 border-b border-gray-200 pb-1',
    h2: isDark
      ? 'text-base font-bold text-slate-100 mt-3.5 mb-1.5 border-b border-slate-800 pb-1'
      : 'text-base font-bold text-[#000080] mt-3.5 mb-1.5 border-b border-gray-200 pb-1',
    h3: isDark
      ? 'text-sm font-bold text-slate-200 mt-3 mb-1'
      : 'text-sm font-bold text-gray-900 mt-3 mb-1',
    h4: isDark
      ? 'text-xs font-bold text-cyan-400 mt-2.5 mb-1 uppercase tracking-wide'
      : 'text-xs font-bold text-[#000080] mt-2.5 mb-1 uppercase tracking-wide',
    bold: isDark ? 'font-bold text-white' : 'font-bold text-gray-950',
    italic: 'italic',
    link: isDark
      ? 'text-cyan-400 hover:text-cyan-300 underline underline-offset-2'
      : 'text-blue-700 hover:text-[#000080] underline underline-offset-2',
    inlineCode: isDark
      ? 'px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded font-mono text-[11px] border border-slate-700'
      : 'px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-[11px] border border-gray-200',
    codeBlock: isDark
      ? 'my-2 p-3 bg-slate-900 text-cyan-300 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto'
      : 'my-2 p-3 bg-gray-50 text-gray-900 font-mono text-xs rounded-lg border border-gray-200 overflow-x-auto',
    ul: isDark
      ? 'list-disc list-inside my-2 space-y-1 text-slate-300 pl-1'
      : 'list-disc list-inside my-2 space-y-1 text-gray-700 pl-1',
    ol: isDark
      ? 'list-decimal list-inside my-2 space-y-1 text-slate-300 pl-1'
      : 'list-decimal list-inside my-2 space-y-1 text-gray-700 pl-1',
    quote: isDark
      ? 'border-l-3 border-cyan-500 pl-3 my-2 text-slate-400 italic bg-slate-900/40 py-1 rounded-r'
      : 'border-l-3 border-[#000080] pl-3 my-2 text-gray-600 italic bg-blue-50/50 py-1 rounded-r',
    hr: isDark ? 'my-4 border-slate-800' : 'my-4 border-gray-200',
    p: isDark
      ? 'my-1.5 leading-relaxed text-slate-300'
      : 'my-1.5 leading-relaxed text-gray-800',
  };

  // Step 1: Escape raw HTML tags for XSS safety
  let safe = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Step 2: Extract and protect code blocks
  const codeBlocks: string[] = [];
  safe = safe.replace(/```([\s\S]*?)```/g, (_match, code) => {
    const placeholder = `%%MAHIOSCODEBLOCK${codeBlocks.length}%%`;
    codeBlocks.push(
      `<pre class="${styles.codeBlock}"><code>${code.trim()}</code></pre>`
    );
    return placeholder;
  });

  // Step 3: Extract and protect inline code
  const inlineCodes: string[] = [];
  safe = safe.replace(/`([^`]+)`/g, (_match, code) => {
    const placeholder = `%%MAHIOSINLINECODE${inlineCodes.length}%%`;
    inlineCodes.push(`<code class="${styles.inlineCode}">${code}</code>`);
    return placeholder;
  });

  // Step 4: Headings
  safe = safe.replace(/^#### (.*$)/gim, `<h4 class="${styles.h4}">$1</h4>`);
  safe = safe.replace(/^### (.*$)/gim, `<h3 class="${styles.h3}">$1</h3>`);
  safe = safe.replace(/^## (.*$)/gim, `<h2 class="${styles.h2}">$1</h2>`);
  safe = safe.replace(/^# (.*$)/gim, `<h1 class="${styles.h1}">$1</h1>`);

  // Step 5: Horizontal rules
  safe = safe.replace(/^(?:---|\*\*\*|___)\s*$/gim, `<hr class="${styles.hr}" />`);

  // Step 6: Blockquotes
  safe = safe.replace(/^&gt;\s*(.*$)/gim, `<blockquote class="${styles.quote}">$1</blockquote>`);

  // Step 7: Bold & Italic
  safe = safe.replace(/\*\*\*(.*?)\*\*\*/g, `<strong class="${styles.bold}"><em class="${styles.italic}">$1</em></strong>`);
  safe = safe.replace(/___(.*?)___/g, `<strong class="${styles.bold}"><em class="${styles.italic}">$1</em></strong>`);
  safe = safe.replace(/\*\*(.*?)\*\*/g, `<strong class="${styles.bold}">$1</strong>`);
  safe = safe.replace(/__(.*?)__/g, `<strong class="${styles.bold}">$1</strong>`);
  safe = safe.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, `$1<em class="${styles.italic}">$2</em>$3`);
  safe = safe.replace(/(^|[^_])_([^_\n]+)_([^_]|$)/g, `$1<em class="${styles.italic}">$2</em>$3`);

  // Step 8: Links [title](url)
  safe = safe.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s\)]+)\)/g,
    `<a href="$2" target="_blank" rel="noopener noreferrer" class="${styles.link}">$1</a>`
  );

  // Step 9: Lists
  // Unordered lists (lines starting with - , * , + )
  safe = safe.replace(/(?:^[ \t]*[-*+][ \t]+.*(?:\r?\n|$))+/gm, (listBlock) => {
    const items = listBlock
      .trim()
      .split(/\r?\n/)
      .map((line) => {
        const content = line.replace(/^[ \t]*[-*+][ \t]+/, '');
        return `<li class="my-0.5">${content}</li>`;
      })
      .join('');
    return `<ul class="${styles.ul}">${items}</ul>`;
  });

  // Ordered lists (lines starting with 1. , 2. )
  safe = safe.replace(/(?:^[ \t]*\d+\.[ \t]+.*(?:\r?\n|$))+/gm, (listBlock) => {
    const items = listBlock
      .trim()
      .split(/\r?\n/)
      .map((line) => {
        const content = line.replace(/^[ \t]*\d+\.[ \t]+/, '');
        return `<li class="my-0.5">${content}</li>`;
      })
      .join('');
    return `<ol class="${styles.ol}">${items}</ol>`;
  });

  // Step 10: Paragraphs & Line Breaks
  const blocks = safe.split(/\n\s*\n/);
  safe = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(?:h[1-6]|ul|ol|pre|blockquote|hr|table|div)/i.test(trimmed)) {
        return trimmed;
      }
      return `<p class="${styles.p}">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');

  // Step 11: Restore code blocks and inline code
  safe = safe.replace(/%%MAHIOSCODEBLOCK(\d+)%%/g, (_match, id) => codeBlocks[Number(id)] || '');
  safe = safe.replace(/%%MAHIOSINLINECODE(\d+)%%/g, (_match, id) => inlineCodes[Number(id)] || '');

  return safe;
}
