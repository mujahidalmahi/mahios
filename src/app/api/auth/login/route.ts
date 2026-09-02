import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimiter';
import { isMaliciousBot, sanitizeInput, validateHoneypot } from '@/lib/security/botShield';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent');
    if (isMaliciousBot(userAgent)) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const clientIp = getClientIp(req.headers);

    // Strict Rate Limiting: 5 attempts per 60 seconds per IP
    const rateLimit = checkRateLimit(`login_${clientIp}`, {
      maxRequests: 5,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${rateLimit.resetSeconds} seconds before retrying.`,
          retryAfter: rateLimit.resetSeconds,
        },
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
    const { email, password, honeypot } = body;

    // Honeypot check for bots
    if (!validateHoneypot(honeypot)) {
      return NextResponse.json({ error: 'Authentication failed.' }, { status: 400 });
    }

    const cleanEmail = sanitizeInput(email || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    let isAuthenticated = false;
    let authUserEmail = cleanEmail;

    // 1. Authenticate via Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data?.user) {
          isAuthenticated = true;
          authUserEmail = data.user.email || cleanEmail;
        }
      } catch (e) {
        console.warn('Supabase auth attempt returned:', e);
      }
    }



    if (!isAuthenticated) {
      return NextResponse.json(
        {
          error: 'Invalid administrator credentials. Authentication failed.',
          remainingAttempts: rateLimit.remaining,
        },
        {
          status: 401,
          headers: {
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      );
    }

    // Generate Secure Session Token
    const sessionToken = Buffer.from(
      JSON.stringify({
        authenticated: true,
        sub: authUserEmail,
        role: 'authenticated_admin',
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      })
    ).toString('base64');

    const res = NextResponse.json({
      success: true,
      message: 'Authentication successful. Entering MahiOS Command Center.',
      redirectUrl: '/admin',
    });

    // Set secure HTTP-Only session cookie
    res.cookies.set('mahios_admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Authentication service error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
