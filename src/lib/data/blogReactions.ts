/**
 * Utility to parse and pack persistent reactions & applause metadata
 * directly into blog_posts.content_html via standardized comments,
 * completely fault-tolerant and persistent in Supabase PostgreSQL.
 */

export interface BlogReactionsData {
  applause: number;
  cleanContentHtml: string;
}

export function parseBlogReactions(contentHtml: string = ''): BlogReactionsData {
  const match = contentHtml.match(/<!--MAHIOS_REACTIONS:(.*?):END-->/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      return {
        applause: typeof parsed.applause === 'number' ? parsed.applause : 0,
        cleanContentHtml: contentHtml.replace(/<!--MAHIOS_REACTIONS:(.*?):END-->/, '').trim(),
      };
    } catch {
      // fallback
    }
  }

  return {
    applause: 0,
    cleanContentHtml: contentHtml,
  };
}

export function packBlogReactions(contentHtml: string = '', applause: number): string {
  const clean = contentHtml.replace(/<!--MAHIOS_REACTIONS:(.*?):END-->/, '').trim();
  const metaComment = `\n<!--MAHIOS_REACTIONS:${JSON.stringify({ applause })}:END-->`;
  return `${clean}${metaComment}`;
}
