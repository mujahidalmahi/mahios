import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { parseBlogReactions, packBlogReactions } from '@/lib/data/blogReactions';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimiter';
import { isMaliciousBot, sanitizeInput } from '@/lib/security/botShield';

const ALLOWED_ENTITY_TYPES = new Set(['blog', 'blog_view', 'feed', 'project']);

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent');
    if (isMaliciousBot(userAgent)) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const clientIp = getClientIp(req.headers);

    // Rate limit: maximum 60 reactions per minute per IP
    const rateLimit = checkRateLimit(`reactions_${clientIp}`, {
      maxRequests: 60,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json();
    const { entityType, entityId, action, count } = body;

    if (!entityType || !entityId || !ALLOWED_ENTITY_TYPES.has(entityType)) {
      return NextResponse.json({ error: 'Invalid or missing entityType or entityId' }, { status: 400 });
    }

    const cleanEntityId = sanitizeInput(String(entityId)).slice(0, 128);
    if (!cleanEntityId) {
      return NextResponse.json({ error: 'Invalid entityId' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // 1. Blog Post Reactions & Applause
    if (entityType === 'blog') {
      const incrementBy = typeof count === 'number' && count > 0 ? Math.min(count, 50) : 1;
      try {
        const { data: post, error: fetchErr } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', cleanEntityId)
          .single();

        if (!fetchErr && post) {
          const { applause: currentApplause, cleanContentHtml } = parseBlogReactions(post.content_html);
          const newApplause = currentApplause + incrementBy;
          const updatedContentHtml = packBlogReactions(cleanContentHtml, newApplause);

          const { error: updateErr } = await supabase
            .from('blog_posts')
            .update({
              content_html: updatedContentHtml,
              updated_at: new Date().toISOString(),
            })
            .eq('id', cleanEntityId);

          if (!updateErr) {
            return NextResponse.json({ success: true, applause: newApplause });
          }
        }
      } catch {
        // Fallback for offline/unconfigured database
      }

      // Fallback for seeded/mock posts so client never gets an error
      return NextResponse.json({ success: true, applause: incrementBy, isLocal: true });
    }

    // 2. Blog Post Real View Count Increment
    if (entityType === 'blog_view') {
      const { data: post, error: fetchErr } = await supabase
        .from('blog_posts')
        .select('views_count')
        .eq('id', cleanEntityId)
        .single();

      if (!fetchErr && post) {
        const newViews = (post.views_count || 0) + 1;
        await supabase
          .from('blog_posts')
          .update({ views_count: newViews })
          .eq('id', cleanEntityId);

        return NextResponse.json({ success: true, views_count: newViews });
      }
      return NextResponse.json({ success: false });
    }

    // 3. Feed Post Real Likes Toggle
    if (entityType === 'feed') {
      const { data: post, error: fetchErr } = await supabase
        .from('feed_posts')
        .select('likes_count')
        .eq('id', cleanEntityId)
        .single();

      if (fetchErr || !post) {
        return NextResponse.json({ error: 'Feed post not found' }, { status: 404 });
      }

      const currentLikes = post.likes_count || 0;
      const newLikes = action === 'unlike' ? Math.max(0, currentLikes - 1) : currentLikes + 1;

      const { error: updateErr } = await supabase
        .from('feed_posts')
        .update({ likes_count: newLikes })
        .eq('id', cleanEntityId);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, likes_count: newLikes });
    }

    // 4. Project Stars Toggle
    if (entityType === 'project') {
      const { data: proj, error: fetchErr } = await supabase
        .from('projects')
        .select('stats')
        .eq('id', cleanEntityId)
        .single();

      if (!fetchErr && proj) {
        const currentStats = proj.stats || { stars: 0 };
        const currentStars = typeof currentStats.stars === 'number' ? currentStats.stars : 0;
        const newStars = action === 'unstar' ? Math.max(0, currentStars - 1) : currentStars + 1;
        const updatedStats = { ...currentStats, stars: newStars };

        await supabase
          .from('projects')
          .update({ stats: updatedStats })
          .eq('id', cleanEntityId);

        return NextResponse.json({ success: true, stars: newStars });
      }
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({ error: 'Unsupported entityType' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal reaction error' },
      { status: 500 }
    );
  }
}
