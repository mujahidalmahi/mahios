import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    // 1. Strict Administrator Authentication Verification
    const sessionCookie = req.cookies.get('mahios_admin_session')?.value;
    let isAuthorized = false;

    if (sessionCookie) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
        if (
          decoded &&
          (decoded.authenticated === true || decoded.role === 'authenticated_admin') &&
          typeof decoded.exp === 'number' &&
          decoded.exp > Date.now()
        ) {
          isAuthorized = true;
        }
      } catch {
        isAuthorized = false;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin authentication session required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { table, action = 'upsert', data, match } = body;

    if (!table) {
      return NextResponse.json({ error: 'Target database table is required.' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    let queryResult;

    if (action === 'upsert') {
      queryResult = await supabase.from(table).upsert(data).select();
    } else if (action === 'insert') {
      queryResult = await supabase.from(table).insert(data).select();
    } else if (action === 'update') {
      let query = supabase.from(table).update(data);
      if (match) {
        Object.entries(match).forEach(([k, v]) => {
          query = query.eq(k, v);
        });
      }
      queryResult = await query.select();
    } else if (action === 'delete') {
      let query = supabase.from(table).delete();
      if (match) {
        Object.entries(match).forEach(([k, v]) => {
          query = query.eq(k, v);
        });
      }
      queryResult = await query.select();
    } else {
      return NextResponse.json({ error: `Unsupported mutation action: ${action}` }, { status: 400 });
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
