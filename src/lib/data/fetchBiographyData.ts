import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import { fallbackBiographyData } from './initialData';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// Helper to safely extract data from a PromiseSettledResult
function getResultData<T>(
  result: PromiseSettledResult<{ data: T | null; error?: unknown }>,
  fallback: T
): T {
  if (result.status === 'fulfilled' && result.value?.data) {
    const data = result.value.data;
    if (Array.isArray(data)) {
      return (data.length > 0 ? data : fallback) as T;
    }
    return data;
  }
  return fallback;
}

export async function getBiographyData(): Promise<BiographyDatabaseData> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!url || url.includes('placeholder')) {
      return fallbackBiographyData;
    }

    const supabase = createAdminSupabaseClient();

    // Query all 26 tables in parallel with full fault tolerance
    const results = await Promise.allSettled([
      supabase.from('site_settings').select('*').single(),
      supabase.from('desktop_apps').select('*').order('sort_order', { ascending: true }),
      supabase.from('about_content').select('*').single(),
      supabase.from('skill_categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('skills').select('*').order('sort_order', { ascending: true }),
      supabase.from('experiences').select('*').order('sort_order', { ascending: true }),
      supabase.from('education').select('*').order('sort_order', { ascending: true }),
      supabase.from('projects').select('*').order('sort_order', { ascending: true }),
      supabase.from('achievements').select('*').order('sort_order', { ascending: true }),
      supabase.from('gallery_categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('gallery_images').select('*').order('sort_order', { ascending: true }),
      supabase.from('blog_posts').select('*').order('sort_order', { ascending: true }),
      supabase.from('boot_logs').select('*').order('sort_order', { ascending: true }),
      supabase.from('terminal_commands').select('*').order('sort_order', { ascending: true }),
      supabase.from('resume_config').select('*').single(),
      supabase.from('philosophies').select('*').order('sort_order', { ascending: true }),
      supabase.from('feed_posts').select('*').order('sort_order', { ascending: true }),
      supabase.from('biography_milestones').select('*').order('sort_order', { ascending: true }),
      supabase.from('social_links').select('*').order('sort_order', { ascending: true }),
      supabase.from('ideologies').select('*').order('sort_order', { ascending: true }),
      supabase.from('entertainment_items').select('*').order('sort_order', { ascending: true }),
      supabase.from('aim_items').select('*').order('sort_order', { ascending: true }),
      supabase.from('dream_items').select('*').order('sort_order', { ascending: true }),
      supabase.from('wish_items').select('*').order('wish_number', { ascending: true }),
      supabase.from('favourite_items').select('*').order('sort_order', { ascending: true }),
    ]);

    const [
      settingsRes,
      appsRes,
      aboutRes,
      categoriesRes,
      skillsRes,
      experiencesRes,
      educationRes,
      projectsRes,
      achievementsRes,
      galleryCategoriesRes,
      galleryImagesRes,
      blogPostsRes,
      bootLogsRes,
      terminalCommandsRes,
      resumeConfigRes,
      philosophiesRes,
      feedRes,
      bioRes,
      socialsRes,
      ideologiesRes,
      entertainmentRes,
      aimsRes,
      dreamsRes,
      wishesRes,
      favouritesRes,
    ] = results;

    const rawApps = getResultData(appsRes, fallbackBiographyData.apps);

    // Merge Supabase apps with all 28 default apps to guarantee complete 28-app alignment
    const appsMap = new Map<string, DesktopApp>();
    // First seed with full 28 fallback apps
    fallbackBiographyData.apps.forEach((a) => appsMap.set(a.app_id, a));
    // Overlay any admin updates from Supabase
    if (Array.isArray(rawApps)) {
      rawApps.forEach((a: DesktopApp) => {
        if (appsMap.has(a.app_id)) {
          appsMap.set(a.app_id, { ...appsMap.get(a.app_id)!, ...a });
        } else {
          appsMap.set(a.app_id, a);
        }
      });
    }

    const mergedApps = Array.from(appsMap.values());

    return {
      settings: getResultData(settingsRes, fallbackBiographyData.settings),
      apps: mergedApps,
      about: getResultData(aboutRes, fallbackBiographyData.about),
      categories: getResultData(categoriesRes, fallbackBiographyData.categories),
      skills: getResultData(skillsRes, fallbackBiographyData.skills),
      experiences: getResultData(experiencesRes, fallbackBiographyData.experiences),
      education: getResultData(educationRes, fallbackBiographyData.education),
      projects: getResultData(projectsRes, fallbackBiographyData.projects),
      achievements: getResultData(achievementsRes, fallbackBiographyData.achievements),
      galleryCategories: getResultData(galleryCategoriesRes, fallbackBiographyData.galleryCategories),
      galleryImages: getResultData(galleryImagesRes, fallbackBiographyData.galleryImages),
      blogPosts: getResultData(blogPostsRes, fallbackBiographyData.blogPosts),
      bootLogs: getResultData(bootLogsRes, fallbackBiographyData.bootLogs),
      terminalCommands: getResultData(terminalCommandsRes, fallbackBiographyData.terminalCommands),
      resumeConfig: getResultData(resumeConfigRes, fallbackBiographyData.resumeConfig),
      philosophies: getResultData(philosophiesRes, fallbackBiographyData.philosophies),
      feedPosts: getResultData(feedRes, fallbackBiographyData.feedPosts),
      biographyTimeline: getResultData(bioRes, fallbackBiographyData.biographyTimeline),
      socialLinks: getResultData(socialsRes, fallbackBiographyData.socialLinks),
      ideologies: getResultData(ideologiesRes, fallbackBiographyData.ideologies),
      entertainment: getResultData(entertainmentRes, fallbackBiographyData.entertainment),
      aims: getResultData(aimsRes, fallbackBiographyData.aims),
      dreams: getResultData(dreamsRes, fallbackBiographyData.dreams),
      wishes: getResultData(wishesRes, fallbackBiographyData.wishes),
      favourites: getResultData(favouritesRes, fallbackBiographyData.favourites),
    };
  } catch (error) {
    console.warn('Failed to fetch from Supabase, falling back to local dataset:', error);
    return fallbackBiographyData;
  }
}
