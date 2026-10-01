'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const RetroAppLoading = () => (
  <div className="w-full h-full min-h-[160px] flex flex-col items-center justify-center bg-[#c0c0c0] p-6 text-black select-none font-mono">
    <div className="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#c0c0c0] p-4 flex items-center gap-3 shadow-md">
      <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
      <span className="text-xs font-bold tracking-wider uppercase">Loading binary...</span>
    </div>
  </div>
);

export const DynamicAboutApp = dynamic(() => import('./AboutApp'), { loading: RetroAppLoading });
export const DynamicExperienceApp = dynamic(() => import('./ExperienceApp'), { loading: RetroAppLoading });
export const DynamicProjectsApp = dynamic(() => import('./ProjectsApp'), { loading: RetroAppLoading });
export const DynamicSkillsApp = dynamic(() => import('./SkillsApp'), { loading: RetroAppLoading });
export const DynamicEducationApp = dynamic(() => import('./EducationApp'), { loading: RetroAppLoading });
export const DynamicTerminalApp = dynamic(() => import('./TerminalApp'), { loading: RetroAppLoading });
export const DynamicGalleryApp = dynamic(() => import('./GalleryApp'), { loading: RetroAppLoading });
export const DynamicAchievementsApp = dynamic(() => import('./AchievementsApp'), { loading: RetroAppLoading });
export const DynamicBlogApp = dynamic(() => import('./BlogApp'), { loading: RetroAppLoading });
export const DynamicResumeApp = dynamic(() => import('./ResumeApp'), { loading: RetroAppLoading });
export const DynamicContactApp = dynamic(() => import('./ContactApp'), { loading: RetroAppLoading });
export const DynamicSettingsApp = dynamic(() => import('./SettingsApp'), { loading: RetroAppLoading });
export const DynamicPhilosophyApp = dynamic(() => import('./PhilosophyApp'), { loading: RetroAppLoading });
export const DynamicFeedApp = dynamic(() => import('./FeedApp'), { loading: RetroAppLoading });
export const DynamicBiographyApp = dynamic(() => import('./BiographyApp'), { loading: RetroAppLoading });
export const DynamicSocialsApp = dynamic(() => import('./SocialsApp'), { loading: RetroAppLoading });
export const DynamicIdeologyApp = dynamic(() => import('./IdeologyApp'), { loading: RetroAppLoading });
export const DynamicEntertainmentApp = dynamic(() => import('./EntertainmentApp'), { loading: RetroAppLoading });
export const DynamicAimApp = dynamic(() => import('./AimApp'), { loading: RetroAppLoading });
export const DynamicDreamApp = dynamic(() => import('./DreamApp'), { loading: RetroAppLoading });
export const DynamicWishesApp = dynamic(() => import('./WishesApp'), { loading: RetroAppLoading });
export const DynamicFavouritesApp = dynamic(() => import('./FavouritesApp'), { loading: RetroAppLoading });

// Authentic Mini-OS Built-in Tools
export const DynamicMyComputerApp = dynamic(() => import('./MyComputerApp'), { loading: RetroAppLoading });
export const DynamicRecycleBinApp = dynamic(() => import('./RecycleBinApp'), { loading: RetroAppLoading });
export const DynamicCalculatorApp = dynamic(() => import('./CalculatorApp'), { loading: RetroAppLoading });
export const DynamicNotepadApp = dynamic(() => import('./NotepadApp'), { loading: RetroAppLoading });
export const DynamicPaintApp = dynamic(() => import('./PaintApp'), { loading: RetroAppLoading });
export const DynamicTaskManagerApp = dynamic(() => import('./TaskManagerApp'), { loading: RetroAppLoading });
export const DynamicBlogPostReaderApp = dynamic(() => import('./BlogPostReaderApp'), { loading: RetroAppLoading });
export const DynamicBiographyChapterReaderApp = dynamic(() => import('./BiographyChapterReaderApp'), { loading: RetroAppLoading });
