import { BiographyDatabaseData } from '@/types/database';
import { fallbackBiographyData } from './initialData';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getBiographyData(): Promise<BiographyDatabaseData> {
  try {
    // Check if Supabase credentials look real
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url.includes('placeholder')) {
      return fallbackBiographyData;
    }

    const supabase = await createServerSupabaseClient();

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
    ] = await Promise.all([
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

    return {
      settings: settingsRes.data || fallbackBiographyData.settings,
      apps: appsRes.data && appsRes.data.length > 0 ? appsRes.data : fallbackBiographyData.apps,
      about: aboutRes.data || fallbackBiographyData.about,
      categories: categoriesRes.data && categoriesRes.data.length > 0 ? categoriesRes.data : fallbackBiographyData.categories,
      skills: skillsRes.data && skillsRes.data.length > 0 ? skillsRes.data : fallbackBiographyData.skills,
      experiences: experiencesRes.data && experiencesRes.data.length > 0 ? experiencesRes.data : fallbackBiographyData.experiences,
      education: educationRes.data && educationRes.data.length > 0 ? educationRes.data : fallbackBiographyData.education,
      projects: projectsRes.data && projectsRes.data.length > 0 ? projectsRes.data : fallbackBiographyData.projects,
      achievements: achievementsRes.data && achievementsRes.data.length > 0 ? achievementsRes.data : fallbackBiographyData.achievements,
      galleryCategories: galleryCategoriesRes.data && galleryCategoriesRes.data.length > 0 ? galleryCategoriesRes.data : fallbackBiographyData.galleryCategories,
      galleryImages: galleryImagesRes.data && galleryImagesRes.data.length > 0 ? galleryImagesRes.data : fallbackBiographyData.galleryImages,
      blogPosts: blogPostsRes.data && blogPostsRes.data.length > 0 ? blogPostsRes.data : fallbackBiographyData.blogPosts,
      bootLogs: bootLogsRes.data && bootLogsRes.data.length > 0 ? bootLogsRes.data : fallbackBiographyData.bootLogs,
      terminalCommands: terminalCommandsRes.data && terminalCommandsRes.data.length > 0 ? terminalCommandsRes.data : fallbackBiographyData.terminalCommands,
      resumeConfig: resumeConfigRes.data || fallbackBiographyData.resumeConfig,
      philosophies: philosophiesRes.data && philosophiesRes.data.length > 0 ? philosophiesRes.data : fallbackBiographyData.philosophies,
      feedPosts: feedRes.data && feedRes.data.length > 0 ? feedRes.data : fallbackBiographyData.feedPosts,
      biographyTimeline: bioRes.data && bioRes.data.length > 0 ? bioRes.data : fallbackBiographyData.biographyTimeline,
      socialLinks: socialsRes.data && socialsRes.data.length > 0 ? socialsRes.data : fallbackBiographyData.socialLinks,
      ideologies: ideologiesRes.data && ideologiesRes.data.length > 0 ? ideologiesRes.data : fallbackBiographyData.ideologies,
      entertainment: entertainmentRes.data && entertainmentRes.data.length > 0 ? entertainmentRes.data : fallbackBiographyData.entertainment,
      aims: aimsRes.data && aimsRes.data.length > 0 ? aimsRes.data : fallbackBiographyData.aims,
      dreams: dreamsRes.data && dreamsRes.data.length > 0 ? dreamsRes.data : fallbackBiographyData.dreams,
      wishes: wishesRes.data && wishesRes.data.length > 0 ? wishesRes.data : fallbackBiographyData.wishes,
      favourites: favouritesRes.data && favouritesRes.data.length > 0 ? favouritesRes.data : fallbackBiographyData.favourites,
    };
  } catch (error) {
    console.warn('Failed to fetch from Supabase, falling back to local dataset:', error);
    return fallbackBiographyData;
  }
}
