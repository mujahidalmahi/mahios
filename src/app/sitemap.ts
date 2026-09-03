import { MetadataRoute } from 'next';
import { getBiographyData } from '@/lib/data/fetchBiographyData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getBiographyData();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujahidmahi.me';

  const routes: MetadataRoute.Sitemap = [
    // 1. Root Desktop Operating System
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. All 28 Core Desktop Applications (Crawlable Deep-Link URL Routes)
  const coreApps = [
    'about', 'experience', 'projects', 'skills', 'education',
    'terminal', 'gallery', 'achievements', 'blog', 'resume',
    'contact', 'settings', 'philosophy', 'feed', 'biography',
    'socials', 'ideology', 'entertainment', 'aim', 'dream',
    'wishes', 'favourites', 'computer', 'recycle-bin', 'calc',
    'notepad', 'paint', 'taskmgr'
  ];

  coreApps.forEach((appId) => {
    routes.push({
      url: `${baseUrl}/?app=${appId}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // 3. Every Published Blog Post / Dev Notes Article Deep-Link
  (data.blogPosts || [])
    .filter((post) => post.is_published)
    .forEach((post) => {
      routes.push({
        url: `${baseUrl}/?app=blog&post=${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : (post.published_at ? new Date(post.published_at) : new Date()),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });

  // 4. Every Engineering Project Case Study Deep-Link
  (data.projects || []).forEach((proj) => {
    routes.push({
      url: `${baseUrl}/?app=projects&id=${proj.slug}`,
      lastModified: proj.updated_at ? new Date(proj.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  return routes;
}
