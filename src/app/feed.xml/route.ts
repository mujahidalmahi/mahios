import { NextResponse } from 'next/server';
import { getBiographyData } from '@/lib/data/fetchBiographyData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const data = await getBiographyData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujahidmahi.me';
  const ownerName = data.settings.owner_name || 'Mujahid Al Mahi';
  const siteTitle = data.settings.site_title || 'MahiOS 05 Dev Notes & Engineering Feed';
  const siteDesc = data.settings.seo_description || data.settings.bio_short;

  const publishedPosts = (data.blogPosts || []).filter((p) => p.is_published);

  const escapeCdata = (str: string) => {
    return (str || '').replace(/\]\]>/g, ']]]]><![CDATA[>');
  };

  const itemsXml = publishedPosts
    .map((post) => {
      const slug = encodeURIComponent(post.slug);
      const postUrl = `${siteUrl}/?app=blog&amp;post=${slug}`;
      const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString();
      const contentHtml = escapeCdata(post.content_html);

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <author><![CDATA[${data.settings.email || 'mujahidmahi.official@gmail.com'} (${ownerName})]]></author>
      ${(post.tags || []).map((t) => `<category><![CDATA[${t}]]></category>`).join('\n      ')}
    </item>`;
    })
    .join('\n');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[${siteDesc}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor><![CDATA[${data.settings.email || 'mujahidmahi.official@gmail.com'} (${ownerName})]]></managingEditor>
    <webMaster><![CDATA[${data.settings.email || 'mujahidmahi.official@gmail.com'} (${ownerName})]]></webMaster>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
