import type { Metadata } from 'next';
import { BiographyDatabaseData } from '@/types/database';

interface DeepLinkParams {
  app?: string;
  post?: string;
  id?: string;
  q?: string;
}

/**
 * Dynamically synthesizes SEO meta tags, title, description, and OpenGraph/Twitter cards
 * directly from live Supabase data (education, skills, projects, career roles, and about info).
 *
 * Every time an admin updates education, skills, projects, or experiences in the admin dashboard,
 * this engine automatically regenerates the exact meta tags without manual intervention.
 */
export function generateDynamicSeoMetadata(
  data: BiographyDatabaseData,
  params?: DeepLinkParams
): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mujahidmahi.me';
  const settings = data.settings;
  const ownerName = settings.owner_name || 'Mujahid Al Mahi';
  const location = data.about?.location || settings.location || 'Dhaka, Bangladesh';

  // 1. Dynamic Career & Role Information
  const topExp = data.experiences && data.experiences.length > 0 ? data.experiences[0] : null;
  const activeRoleText = topExp
    ? `${topExp.role} at ${topExp.company}`
    : settings.headline || 'Full-Stack Software Engineer & Creative Technologist';

  // 2. Dynamic Education & Academic Information
  const topEdu = data.education && data.education.length > 0 ? data.education[0] : null;
  const educationSummary = topEdu
    ? `${topEdu.degree} in ${topEdu.field_of_study} from ${topEdu.institution}`
    : 'Computer Science & Software Engineering';

  // 3. Dynamic Skills & Competencies List
  const topSkillNames = (data.skills || []).slice(0, 10).map((s) => s.name);
  const skillsSnippet = topSkillNames.length > 0 ? topSkillNames.join(', ') : 'Next.js, TypeScript, React, PostgreSQL';

  // 4. Dynamic Project Titles
  const projectTitles = (data.projects || []).slice(0, 5).map((p) => p.title);
  const projectsSnippet = projectTitles.length > 0 ? projectTitles.join(', ') : 'Distributed systems & web applications';

  // 5. Automated Universal Keyword Aggregator
  const allDynamicKeywords = Array.from(
    new Set([
      ownerName,
      `${ownerName} Software Engineer`,
      `${ownerName} Portfolio`,
      `${ownerName} CV`,
      `${ownerName} Resume`,
      `${ownerName} ${location}`,
      activeRoleText,
      ...(topExp ? [topExp.role, topExp.company] : []),
      ...(topEdu ? [topEdu.institution, topEdu.degree, topEdu.field_of_study] : []),
      ...(data.skills || []).map((s) => s.name),
      ...(data.categories || []).map((c) => c.name),
      ...(data.projects || []).flatMap((p) => p.tags || []),
      ...(data.projects || []).map((p) => p.title),
      ...(data.about?.interests || []),
      ...(data.about?.taglines || []),
      ...(settings.seo_keywords || []),
      'MahiOS',
      'MahiOS 05',
      'Retro Operating System',
      'Web Desktop Portfolio',
      'Full Stack Developer',
      'Cloud Architecture',
    ])
  ).slice(0, 30);

  // 6. Resolve Deep-Linked Applications (if ?app=... is provided)
  const reqApp = params?.app;
  const reqPost = params?.post;
  const reqId = params?.id;

  let pageTitle = settings.seo_title || `${ownerName} | ${activeRoleText}`;
  let pageDescription =
    settings.seo_description ||
    `Official portfolio and interactive operating system of ${ownerName}. ${activeRoleText}. Education: ${educationSummary}. Expertise in ${skillsSnippet}. Explore ${projectTitles.length}+ software projects and engineering dev notes.`;
  let pageCanonical = siteUrl;
  let ogImage =
    settings.og_image_url ||
    data.about?.avatar_url ||
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80';

  if (reqApp === 'blog' && reqPost) {
    const post = data.blogPosts?.find((p) => p.slug === reqPost || p.id === reqPost);
    if (post) {
      pageTitle = `${post.title} — Dev Notes | ${ownerName}`;
      pageDescription = post.excerpt || `Technical engineering article by ${ownerName}: ${post.title}. Topics: ${post.tags?.join(', ')}.`;
      pageCanonical = `${siteUrl}/?app=blog&post=${post.slug}`;
      if (post.cover_image_url) ogImage = post.cover_image_url;
    }
  } else if (reqApp === 'projects') {
    if (reqId) {
      const proj = data.projects?.find((p) => p.slug === reqId || p.id === reqId);
      if (proj) {
        pageTitle = `${proj.title} — Engineering Project | ${ownerName}`;
        pageDescription = proj.summary || `Software architecture case study by ${ownerName}: ${proj.title}. Technologies: ${proj.tags?.join(', ')}.`;
        pageCanonical = `${siteUrl}/?app=projects&id=${proj.slug}`;
        if (proj.thumbnail_url || (proj.images && proj.images.length > 0)) {
          ogImage = proj.thumbnail_url || proj.images[0];
        }
      }
    } else {
      pageTitle = `Software Engineering Projects & System Architecture | ${ownerName}`;
      pageDescription = `Explore ${data.projects?.length || 0} software architectures and open-source systems engineered by ${ownerName}: ${projectsSnippet}. Built with ${skillsSnippet}.`;
      pageCanonical = `${siteUrl}/?app=projects`;
    }
  } else if (reqApp === 'skills') {
    pageTitle = `Technical Skills Matrix & Competencies | ${ownerName}`;
    pageDescription = `Comprehensive technical proficiency matrix of ${ownerName}. Core competencies across ${(data.categories || []).map((c) => c.name).join(', ')}. Specialized in ${skillsSnippet}.`;
    pageCanonical = `${siteUrl}/?app=skills`;
  } else if (reqApp === 'education') {
    pageTitle = `Academic Education & Credentials | ${ownerName}`;
    pageDescription = `Academic credentials, computer science degrees, and engineering training of ${ownerName}: ${data.education.map((e) => `${e.degree} from ${e.institution}`).join('; ')}.`;
    pageCanonical = `${siteUrl}/?app=education`;
  } else if (reqApp === 'experience') {
    pageTitle = `Career Progression & Engineering History | ${ownerName}`;
    pageDescription = `Professional work history and software engineering progression of ${ownerName}. Current role: ${activeRoleText}. Previous achievements across distributed systems and modern web architecture.`;
    pageCanonical = `${siteUrl}/?app=experience`;
  } else if (reqApp === 'about') {
    pageTitle = `About ${ownerName} | Digital Biography & Engineering Principles`;
    pageDescription = `Learn about ${ownerName} (${location}). ${data.about?.status_text || activeRoleText}. ${data.about?.experience_years}+ years building software systems and digital artifacts.`;
    pageCanonical = `${siteUrl}/?app=about`;
  } else if (reqApp === 'philosophy') {
    pageTitle = `Engineering Principles & Architectural Philosophies | ${ownerName}`;
    pageDescription = `Core architectural axioms and software engineering principles adhered to by ${ownerName}: ${data.philosophies?.map((p) => p.title).join(', ')}.`;
    pageCanonical = `${siteUrl}/?app=philosophy`;
  } else if (reqApp === 'terminal') {
    pageTitle = `MahiOS MS-DOS Command Line Interface | ${ownerName}`;
    pageDescription = `Interactive UNIX/DOS terminal CLI built into MahiOS. Run real commands to query ${ownerName}'s system telemetry, skills, and projects.`;
    pageCanonical = `${siteUrl}/?app=terminal`;
  } else if (reqApp === 'achievements') {
    pageTitle = `Honors, Awards & Engineering Recognitions | ${ownerName}`;
    pageDescription = `Engineering awards and technical honors earned by ${ownerName}: ${data.achievements?.map((a) => a.title).join(', ')}.`;
    pageCanonical = `${siteUrl}/?app=achievements`;
  } else if (reqApp === 'resume') {
    pageTitle = `Complete Professional Resume & CV | ${ownerName}`;
    pageDescription = `Full curriculum vitae of ${ownerName} (${location}). Current: ${activeRoleText}. Education: ${educationSummary}. Skills: ${skillsSnippet}.`;
    pageCanonical = `${siteUrl}/?app=resume`;
  }

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: allDynamicKeywords,
    authors: [{ name: ownerName, url: siteUrl }],
    creator: ownerName,
    publisher: ownerName,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pageCanonical,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageCanonical,
      siteName: settings.site_title || 'MahiOS Digital Biography',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${ownerName} — Digital Biography & Interactive OS`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      creator: settings.twitter_handle || '@mujahidmahi',
      images: [ogImage],
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
  };
}
