import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getBiographyData } from '@/lib/data/fetchBiographyData';

export const viewport: Viewport = {
  themeColor: '#008080',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getBiographyData();
  const settings = data.settings;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujahidmahi.xyz';
  const title = settings.seo_title || `${settings.owner_name} | Digital Biography & Interactive OS`;
  const description = settings.seo_description || settings.bio_short;

  return {
    title: {
      default: title,
      template: `%s | ${settings.owner_name}`,
    },
    description,
    keywords: settings.seo_keywords,
    authors: [{ name: settings.owner_name, url: siteUrl }],
    creator: settings.owner_name,
    publisher: settings.owner_name,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: settings.site_title,
      images: [
        {
          url: settings.og_image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
          width: 1200,
          height: 630,
          alt: `${settings.owner_name} - MahiOS Digital Biography`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: settings.twitter_handle || '@mujahidmahi',
      images: [settings.og_image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: settings.favicon_url || '/favicon.ico',
      shortcut: settings.favicon_url || '/favicon.ico',
      apple: settings.favicon_url || '/apple-touch-icon.png',
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujahidmahi.xyz';

  // JSON-LD Structured Data for Person & WebSite
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: settings.owner_name,
        jobTitle: 'Full-Stack Software Engineer & Creative Technologist',
        description: settings.bio_short,
        url: siteUrl,
        image: settings.avatar_url,
        sameAs: [
          settings.github_url,
          settings.linkedin_url,
          settings.twitter_url,
        ].filter(Boolean),
        address: {
          '@type': 'PostalAddress',
          addressLocality: settings.location,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: settings.site_title,
        description: settings.seo_description,
        publisher: {
          '@id': `${siteUrl}/#person`,
        },
      },
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
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
