import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getBiographyData } from '@/lib/data/fetchBiographyData';
import { generateDynamicSeoMetadata } from '@/lib/seo/dynamicSeoGenerator';

export const viewport: Viewport = {
  themeColor: '#008080',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getBiographyData();
  const dynamicMeta = generateDynamicSeoMetadata(data);

  return {
    ...dynamicMeta,
    icons: {
      icon: [
        { url: '/favicon.ico?v=2005' },
        { url: '/favicon.png?v=2005', type: 'image/png' },
      ],
      shortcut: '/favicon.ico?v=2005',
      apple: '/favicon.png?v=2005',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getBiographyData();
  const settings = data.settings;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujahidmahi.me';

  // Comprehensive Schema.org Multi-Entity Knowledge Graph
  const allSocials = Array.from(
    new Set([
      settings.github_url,
      settings.linkedin_url,
      settings.twitter_url,
      ...(data.socialLinks || []).map((s) => s.url),
    ])
  ).filter(Boolean);

  const allSkills = Array.from(
    new Set([
      ...(data.skills || []).map((s) => s.name),
      ...(data.about.interests || []),
    ])
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Author Person Entity
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: settings.owner_name || 'Mujahid Al Mahi',
        givenName: 'Mujahid',
        familyName: 'Al Mahi',
        jobTitle: settings.headline || 'Full-Stack Software Engineer & Creative Technologist',
        description: settings.bio_short || data.about.status_text,
        url: siteUrl,
        image: data.about.avatar_url || settings.avatar_url || `${siteUrl}/images/mahios-logo.png`,
        email: settings.email || 'mujahidmahi.official@gmail.com',
        telephone: settings.phone || undefined,
        sameAs: allSocials,
        knowsAbout: allSkills,
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.about.location || settings.location || 'Dhaka',
          addressCountry: 'Bangladesh',
        },
        hasOccupation: {
          '@type': 'Occupation',
          name: 'Software Engineer',
          occupationalCategory: '15-1252.00',
          skills: allSkills.slice(0, 15).join(', '),
        },
        knowsLanguage: ['English', 'Bengali'],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'technical inquiry',
          email: settings.email || 'mujahidmahi.official@gmail.com',
          availableLanguage: ['English', 'Bengali'],
        },
        alumniOf: (data.education || []).map((edu) => ({
          '@type': 'EducationalOrganization',
          name: edu.institution,
        })),
        worksFor: (data.experiences || []).map((exp) => ({
          '@type': 'Organization',
          name: exp.company,
        })),
      },

      // 2. WebSite Entity
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: settings.site_title || 'MahiOS — Mujahid Al Mahi Digital Biography',
        description: settings.seo_description || settings.bio_short,
        inLanguage: 'en-US',
        publisher: {
          '@id': `${siteUrl}/#person`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },

      // 3. Official ProfilePage Entity
      {
        '@type': 'ProfilePage',
        '@id': `${siteUrl}/#profilepage`,
        url: siteUrl,
        name: `${settings.owner_name} | Digital Biography & Interactive OS`,
        description: settings.seo_description,
        mainEntity: {
          '@id': `${siteUrl}/#person`,
        },
      },

      // 4. ItemList of Software Projects
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#projects`,
        name: 'Featured Engineering & Open Source Projects',
        description: `Software architectures and systems engineered by ${settings.owner_name}`,
        itemListElement: (data.projects || []).map((proj, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: proj.title,
            description: proj.summary,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Cross-platform, Edge, Web',
            url: proj.live_url || `${siteUrl}/?app=projects&id=${proj.slug}`,
            codeRepository: proj.github_url || undefined,
          },
        })),
      },

      // 5. Blog Articles & Dev Notes
      ...(data.blogPosts || [])
        .filter((post) => post.is_published)
        .map((post) => ({
          '@type': 'BlogPosting',
          '@id': `${siteUrl}/?app=blog&post=${post.slug}`,
          headline: post.title,
          description: post.excerpt,
          datePublished: post.published_at,
          dateModified: post.updated_at || post.published_at,
          author: {
            '@id': `${siteUrl}/#person`,
          },
          publisher: {
            '@id': `${siteUrl}/#person`,
          },
          mainEntityOfPage: `${siteUrl}/?app=blog&post=${post.slug}`,
          image: post.cover_image_url || undefined,
          keywords: post.tags?.join(', '),
        })),

      // 6. BreadcrumbList for Rich SERP Navigation
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'About', item: `${siteUrl}/?app=about` },
          { '@type': 'ListItem', position: 3, name: 'Projects', item: `${siteUrl}/?app=projects` },
          { '@type': 'ListItem', position: 4, name: 'Experience', item: `${siteUrl}/?app=experience` },
          { '@type': 'ListItem', position: 5, name: 'Skills', item: `${siteUrl}/?app=skills` },
          { '@type': 'ListItem', position: 6, name: 'Dev Notes', item: `${siteUrl}/?app=blog` },
          { '@type': 'ListItem', position: 7, name: 'Terminal', item: `${siteUrl}/?app=terminal` },
        ],
      },

      // 7. SiteNavigationElement for Google Sitelinks
      {
        '@type': 'SiteNavigationElement',
        '@id': `${siteUrl}/#navigation`,
        name: 'MahiOS 05 Universal Navigation',
        hasPart: [
          { '@type': 'WebPage', name: 'About Mujahid Al Mahi', url: `${siteUrl}/?app=about` },
          { '@type': 'WebPage', name: 'Software Projects Portfolio', url: `${siteUrl}/?app=projects` },
          { '@type': 'WebPage', name: 'Career Progression & Experience', url: `${siteUrl}/?app=experience` },
          { '@type': 'WebPage', name: 'Technical Skills Matrix', url: `${siteUrl}/?app=skills` },
          { '@type': 'WebPage', name: 'Academic Education & Honors', url: `${siteUrl}/?app=education` },
          { '@type': 'WebPage', name: 'Dev Notes Engineering Blog', url: `${siteUrl}/?app=blog` },
          { '@type': 'WebPage', name: 'MS-DOS Terminal CLI', url: `${siteUrl}/?app=terminal` },
        ],
      },
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="alternate" type="application/rss+xml" title="MahiOS 05 RSS Feed" href={`${siteUrl}/feed.xml`} />
        <link rel="sitemap" type="application/xml" title="Sitemap" href={`${siteUrl}/sitemap.xml`} />
        <link rel="preconnect" href="https://ygmnicpybqqdcitmvtvf.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ygmnicpybqqdcitmvtvf.supabase.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#18191c] min-h-screen text-slate-100">
        {children}
      </body>
    </html>
  );
}
