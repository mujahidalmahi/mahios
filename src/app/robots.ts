import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujahidmahi.xyz';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api', '/api/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'Bytespider', 'anthropic-ai', 'Claude-Web'],
        disallow: ['/admin', '/admin/', '/api', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
