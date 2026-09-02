import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimiter';
import { isMaliciousBot, validateFileUpload } from '@/lib/security/botShield';
import { uploadMedia } from '@/lib/storage/upload';

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent');
    if (isMaliciousBot(userAgent)) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    const clientIp = getClientIp(req.headers);

    // Rate Limit: 20 uploads per 60 seconds per IP
    const rateLimit = checkRateLimit(`upload_${clientIp}`, {
      maxRequests: 20,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Upload rate limit exceeded. Please wait ${rateLimit.resetSeconds} seconds before uploading more files.`,
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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'mahios';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Security Validation: Check MIME, Extension, Size, and Filename
    const validation = validateFileUpload(file.name, file.type, file.size, 10 * 1024 * 1024);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMedia(buffer, file.name, file.type, folder);

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
