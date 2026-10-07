import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/security/authSession';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimiter';
import { revalidatePath } from 'next/cache';

// Strict Whitelist of database tables permitted for admin mutations
const ALLOWED_TABLES = new Set([
  'projects',
  'skills',
  'skill_categories',
  'experiences',
  'education',
  'achievements',
  'gallery_categories',
  'gallery_images',
  'blog_posts',
  'boot_logs',
  'terminal_commands',
  'resume_config',
  'philosophies',
  'feed_posts',
  'biography_milestones',
  'social_links',
  'ideologies',
  'entertainment_items',
  'aim_items',
  'dream_items',
  'wish_items',
  'favourite_items',
  'about_content',
  'site_settings',
  'contact_messages',
]);

const ALLOWED_ACTIONS = new Set([
  'upsert',
  'insert',
  'update',
  'delete',
  'select',
  'batch_order',
]);

export async function POST(req: NextRequest) {
  try {
    // 1. Strict Administrator Authentication Verification via Cryptographic Token
    const sessionCookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const sessionVerification = verifyAdminSessionToken(sessionCookie);

    if (!sessionVerification.valid) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid cryptographic admin authentication session required.' },
        { status: 401 }
      );
    }

    // 2. Sliding Window Rate Limiting (120 mutations per 60 seconds per IP)
    const clientIp = getClientIp(req.headers);
    const rateLimit = checkRateLimit(`admin_mutate_${clientIp}`, {
      maxRequests: 120,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Too many mutations. Please wait ${rateLimit.resetSeconds} seconds before continuing.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { table, action = 'upsert', data, match } = body;

    // 3. Strict Target Table Whitelisting
    if (!table || typeof table !== 'string' || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json(
        { error: `Target database table '${table}' is not permitted.` },
        { status: 403 }
      );
    }

    // 4. Strict Action Whitelisting
    if (!action || typeof action !== 'string' || !ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json(
        { error: `Unsupported mutation action: ${action}` },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    let queryResult: { data: any; error: any } = { data: null, error: null };

    const isUuid = (val: unknown): boolean =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    let sanitizedData = data;
    if (sanitizedData && (action === 'upsert' || action === 'insert' || action === 'update')) {
      const sanitizeItem = (item: any) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return item;
        }

        let cleaned = { ...item };

        // Handle accidental array-spread-into-object
        if ('0' in cleaned && typeof cleaned['0'] === 'object' && cleaned['0'] !== null) {
          const { '0': innerObj, ...rest } = cleaned;
          cleaned = { ...innerObj, ...rest };
        }

        // Clean any numeric string keys ('0', '1', etc.)
        for (const key of Object.keys(cleaned)) {
          if (/^\d+$/.test(key)) {
            delete cleaned[key];
          }
        }

        // Guarantee valid UUID format if ID is present
        if ('id' in cleaned && typeof cleaned.id === 'string' && !isUuid(cleaned.id)) {
          cleaned.id = crypto.randomUUID();
        }

        return cleaned;
      };

      if (Array.isArray(sanitizedData)) {
        sanitizedData = sanitizedData.map(sanitizeItem);
      } else if (typeof sanitizedData === 'object') {
        sanitizedData = sanitizeItem(sanitizedData);
      }
    }

    if (action === 'select') {
      let query = supabase.from(table).select(body.select || '*');
      if (match && typeof match === 'object') {
        Object.entries(match).forEach(([k, v]) => {
          query = query.eq(k, v);
        });
      }
      if (body.order && typeof body.order === 'object' && body.order.column) {
        query = query.order(body.order.column, { ascending: body.order.ascending ?? true });
      }
      if (typeof body.limit === 'number') {
        query = query.limit(body.limit);
      }
      queryResult = await query;
      if (queryResult.error) {
        return NextResponse.json({ error: queryResult.error.message }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        data: queryResult.data,
      });
    } else if (action === 'batch_order') {
      const items = Array.isArray(body.items) ? body.items : [];
      const updates = items.map((item: any) => {
        const orderKey = 'sort_order' in item ? 'sort_order' : 'sort_index';
        return supabase.from(table).update({ [orderKey]: item[orderKey] }).eq('id', item.id);
      });
      await Promise.all(updates);
      try {
        revalidatePath('/', 'layout');
        revalidatePath('/admin', 'layout');
      } catch (e) {
        console.warn('Revalidation warning:', e);
      }
      return NextResponse.json({ success: true });
    } else if (action === 'upsert') {
      queryResult = await supabase.from(table).upsert(sanitizedData).select();
    } else if (action === 'insert') {
      queryResult = await supabase.from(table).insert(sanitizedData).select();
    } else if (action === 'update') {
      if (match?.id && typeof match.id === 'string' && !isUuid(match.id)) {
        return NextResponse.json({ success: true, data: [] });
      }
      let query = supabase.from(table).update(sanitizedData);
      if (match && typeof match === 'object') {
        Object.entries(match).forEach(([k, v]) => {
          query = query.eq(k, v);
        });
      }
      queryResult = await query.select();
    } else if (action === 'delete') {
      if (match?.id && typeof match.id === 'string' && !isUuid(match.id)) {
        return NextResponse.json({ success: true, data: [] });
      }
      let query = supabase.from(table).delete();
      if (match && typeof match === 'object') {
        Object.entries(match).forEach(([k, v]) => {
          query = query.eq(k, v);
        });
      }
      queryResult = await query.select();
    }

    if (queryResult.error) {
      console.error(`Admin mutation error on table ${table}:`, queryResult.error);
      return NextResponse.json({ error: queryResult.error.message }, { status: 500 });
    }

    // Purge server-side Next.js route caches so changes take effect immediately on desktop
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin', 'layout');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      data: queryResult.data,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server mutation error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
