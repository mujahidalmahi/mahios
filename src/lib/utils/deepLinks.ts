import {
  BiographyDatabaseData,
  DesktopApp,
  BlogPost,
  Project,
  BiographyMilestone,
} from '@/types/database';

export interface DeepLinkResult {
  targetApp: DesktopApp;
  targetType: 'blog_post' | 'project' | 'biography_chapter' | 'app';
  blogPost?: BlogPost;
  project?: Project;
  biographyChapter?: BiographyMilestone;
}

/**
 * Parses window.location query parameters and hash fragments to determine
 * which application, blog article, project, or biography chapter should be opened.
 */
export function resolveDeepLink(data: BiographyDatabaseData): DeepLinkResult | null {
  if (typeof window === 'undefined') return null;

  const search = window.location.search;
  const hash = window.location.hash;

  if (!search && !hash) return null;

  const params = new URLSearchParams(search);
  const reqApp = (params.get('app') || '').toLowerCase().trim();
  const reqPost = params.get('post') || params.get('blog') || params.get('note');
  const reqProject = params.get('project') || params.get('id') || params.get('slug');
  const reqChapter = params.get('chapter') || params.get('milestone') || params.get('ch');

  // Extract hash routing if present (e.g., #note-xyz, #project-xyz, #chapter-003, #terminal)
  let hashType: 'blog' | 'project' | 'biography' | 'app' | null = null;
  let hashVal: string | null = null;

  if (hash && hash.startsWith('#')) {
    const clean = hash.slice(1).trim();
    if (clean.startsWith('note-')) {
      hashType = 'blog';
      hashVal = clean.replace('note-', '');
    } else if (clean.startsWith('blog-')) {
      hashType = 'blog';
      hashVal = clean.replace('blog-', '');
    } else if (clean.startsWith('post-')) {
      hashType = 'blog';
      hashVal = clean.replace('post-', '');
    } else if (clean.startsWith('project-')) {
      hashType = 'project';
      hashVal = clean.replace('project-', '');
    } else if (clean.startsWith('chapter-')) {
      hashType = 'biography';
      hashVal = clean.replace('chapter-', '');
    } else if (clean.startsWith('bio-')) {
      hashType = 'biography';
      hashVal = clean.replace('bio-', '');
    } else if (clean.startsWith('milestone-')) {
      hashType = 'biography';
      hashVal = clean.replace('milestone-', '');
    } else if (clean.length > 0) {
      hashType = 'app';
      hashVal = clean;
    }
  }

  // -------------------------------------------------------------
  // 1. BLOG POST DEEP LINK (?app=blog&post=slug, ?post=slug, #note-slug)
  // -------------------------------------------------------------
  const blogQueryTarget = reqPost || (reqApp === 'blog' ? reqProject : null);
  const blogTarget = blogQueryTarget || (hashType === 'blog' ? hashVal : null);

  if (blogTarget || reqApp === 'blog') {
    if (blogTarget) {
      const targetClean = decodeURIComponent(blogTarget).toLowerCase().trim();
      const post = data.blogPosts.find(
        (p) =>
          p.slug.toLowerCase() === targetClean ||
          p.id.toLowerCase() === targetClean ||
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetClean
      );

      if (post) {
        const blogReaderApp: DesktopApp = {
          id: `blog-${post.id}`,
          app_id: `blog-${post.id}`,
          title: post.title,
          icon_name: 'FileText',
          component_key: 'BlogPostReaderApp',
          default_x: 80,
          default_y: 50,
          default_width: 840,
          default_height: 600,
          is_system_app: false,
          is_visible: true,
          sort_order: 99,
          category: 'Dev Notes',
        };

        return {
          targetApp: blogReaderApp,
          targetType: 'blog_post',
          blogPost: post,
        };
      }
    }

    // Fallback if blog app itself is requested without specific post
    const baseBlogApp = data.apps.find((a) => a.app_id === 'blog' || a.component_key === 'BlogApp');
    if (baseBlogApp) {
      return {
        targetApp: baseBlogApp,
        targetType: 'app',
      };
    }
  }

  // -------------------------------------------------------------
  // 2. PROJECT DEEP LINK (?app=projects&id=slug, ?project=slug, #project-slug)
  // -------------------------------------------------------------
  const projectQueryTarget =
    reqApp === 'projects' || reqApp === 'project'
      ? reqProject
      : params.has('project')
      ? params.get('project')
      : null;
  const projectTarget = projectQueryTarget || (hashType === 'project' ? hashVal : null);

  if (projectTarget || reqApp === 'projects' || reqApp === 'project') {
    const projectsApp =
      data.apps.find((a) => a.app_id === 'projects' || a.component_key === 'ProjectsApp') || {
        id: 'projects',
        app_id: 'projects',
        title: 'Projects & Work',
        icon_name: 'FolderGit2',
        component_key: 'ProjectsApp',
        default_x: 80,
        default_y: 60,
        default_width: 860,
        default_height: 580,
        is_system_app: false,
        is_visible: true,
        sort_order: 3,
        category: 'Engineering',
      };

    let targetProject: Project | undefined;
    if (projectTarget) {
      const targetClean = decodeURIComponent(projectTarget).toLowerCase().trim();
      targetProject = data.projects.find(
        (p) =>
          p.slug.toLowerCase() === targetClean ||
          p.id.toLowerCase() === targetClean ||
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetClean
      );
    }

    return {
      targetApp: projectsApp,
      targetType: 'project',
      project: targetProject,
    };
  }

  // -------------------------------------------------------------
  // 3. BIOGRAPHY CHAPTER DEEP LINK (?app=biography&chapter=id, ?chapter=003, #chapter-003)
  // -------------------------------------------------------------
  const chapterQueryTarget =
    reqChapter || (reqApp === 'biography' || reqApp === 'bio' ? reqProject : null);
  const chapterTarget = chapterQueryTarget || (hashType === 'biography' ? hashVal : null);

  if (chapterTarget || reqApp === 'biography' || reqApp === 'bio') {
    if (chapterTarget) {
      const targetClean = decodeURIComponent(chapterTarget).toLowerCase().trim();
      const numTarget = targetClean.replace(/\D/g, '');

      const milestone = data.biographyTimeline.find((m) => {
        if (m.id.toLowerCase() === targetClean) return true;
        if (m.chapter.toLowerCase() === targetClean) return true;
        const numM = m.chapter.replace(/\D/g, '');
        if (numM && numTarget && numM === numTarget) return true;
        if (m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetClean) return true;
        return false;
      });

      if (milestone) {
        const bioReaderApp: DesktopApp = {
          id: `milestone-${milestone.id}`,
          app_id: `milestone-${milestone.id}`,
          title: `${milestone.chapter}: ${milestone.title}`,
          icon_name: 'BookOpen',
          component_key: 'BiographyChapterReaderApp',
          default_x: 90,
          default_y: 60,
          default_width: 860,
          default_height: 620,
          is_system_app: false,
          is_visible: true,
          sort_order: 99,
          category: 'Digital Biography',
        };

        return {
          targetApp: bioReaderApp,
          targetType: 'biography_chapter',
          biographyChapter: milestone,
        };
      }
    }

    const baseBioApp = data.apps.find((a) => a.app_id === 'biography' || a.component_key === 'BiographyApp');
    if (baseBioApp) {
      return {
        targetApp: baseBioApp,
        targetType: 'app',
      };
    }
  }

  // -------------------------------------------------------------
  // 4. ANY OTHER SYSTEM / CONTENT APPLICATION (?app=xxx, #xxx)
  // -------------------------------------------------------------
  const requestedAppName = reqApp || (hashType === 'app' ? hashVal : null);
  if (requestedAppName) {
    const cleanApp = decodeURIComponent(requestedAppName).toLowerCase().replace(/[^a-z0-9_]/g, '');
    const found = data.apps.find(
      (a) =>
        a.app_id.toLowerCase() === cleanApp ||
        a.component_key.toLowerCase() === `${cleanApp}app` ||
        a.component_key.toLowerCase() === cleanApp ||
        a.app_id.toLowerCase().includes(cleanApp)
    );

    if (found) {
      return {
        targetApp: found,
        targetType: 'app',
      };
    }
  }

  return null;
}
