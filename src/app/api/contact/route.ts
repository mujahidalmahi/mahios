import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimiter';
import {
  isMaliciousBot,
  sanitizeInput,
  validateHoneypot,
  validateSubmissionSpeed,
} from '@/lib/security/botShield';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent');
    if (isMaliciousBot(userAgent)) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const clientIp = getClientIp(req.headers);

    // Rate Limit: Max 5 contact messages per 60 seconds per IP
    const rateLimit = checkRateLimit(`contact_${clientIp}`, {
      maxRequests: 5,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many submissions. Please wait ${rateLimit.resetSeconds} seconds before sending another message.`,
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
    const { sender_name, sender_email, subject, message, honeypot, renderedAt } = body;

    // 1. Honeypot check
    if (!validateHoneypot(honeypot)) {
      // Fake success to misdirect automated spammers without storing spam
      return NextResponse.json({ success: true, message: 'Message queued.' });
    }

    // 2. Submission speed check
    if (!validateSubmissionSpeed(renderedAt, 800)) {
      return NextResponse.json({ error: 'Automated submission detected.' }, { status: 400 });
    }

    // 3. Input Sanitization
    const cleanName = sanitizeInput(sender_name || '');
    const cleanEmail = sanitizeInput(sender_email || '');
    const cleanSubject = sanitizeInput(subject || 'Message from MahiOS Visitor');
    const cleanMessage = sanitizeInput(message || '');

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return NextResponse.json(
        { error: 'Valid Name, Email, and Message are required.' },
        { status: 400 }
      );
    }

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email address format.' }, { status: 400 });
    }

    // Store in Supabase if configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (url && !url.includes('placeholder')) {
      const supabase = createAdminSupabaseClient();
      const { error } = await supabase.from('contact_messages').insert({
        sender_name: cleanName,
        sender_email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        ip_address: clientIp,
        is_read: false,
        is_starred: false,
      });

      if (error) {
        console.error('Database contact message insert error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message securely transmitted via MahiOS mail subsystem!',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
