import { MetadataRoute } from 'next';
import { getBiographyData } from '@/lib/data/fetchBiographyData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getBiographyData();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujahidmahi.me';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  // Blog posts dynamic sitemap entries
  data.blogPosts
    .filter((post) => post.is_published)
    .forEach((post) => {
      routes.push({
        url: `${baseUrl}/#note-${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    });

  // Projects dynamic entries
  data.projects.forEach((proj) => {
    routes.push({
      url: `${baseUrl}/#project-${proj.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  });

  return routes;
}
