'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi, Battery, ArrowLeft,
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, HelpCircle, Compass, Radio, BookOpen,
  Share2, Scale, Gamepad2, Target, Sparkles, Flame, Star
} from 'lucide-react';
import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

// Apps
import AboutApp from '@/components/apps/AboutApp';
import ExperienceApp from '@/components/apps/ExperienceApp';
import ProjectsApp from '@/components/apps/ProjectsApp';
import SkillsApp from '@/components/apps/SkillsApp';
import EducationApp from '@/components/apps/EducationApp';
import TerminalApp from '@/components/apps/TerminalApp';
import GalleryApp from '@/components/apps/GalleryApp';
import AchievementsApp from '@/components/apps/AchievementsApp';
import BlogApp from '@/components/apps/BlogApp';
import ResumeApp from '@/components/apps/ResumeApp';
import ContactApp from '@/components/apps/ContactApp';
import SettingsApp from '@/components/apps/SettingsApp';

// 10 New Apps
import PhilosophyApp from '@/components/apps/PhilosophyApp';
import FeedApp from '@/components/apps/FeedApp';
import BiographyApp from '@/components/apps/BiographyApp';
import SocialsApp from '@/components/apps/SocialsApp';
import IdeologyApp from '@/components/apps/IdeologyApp';
import EntertainmentApp from '@/components/apps/EntertainmentApp';
import AimApp from '@/components/apps/AimApp';
import DreamApp from '@/components/apps/DreamApp';
import WishesApp from '@/components/apps/WishesApp';
import FavouritesApp from '@/components/apps/FavouritesApp';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image: ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
};

interface MobileShellProps {
  data: BiographyDatabaseData;
}

export default function MobileShell({ data }: MobileShellProps) {
  const [activeApp, setActiveApp] = useState<DesktopApp | null>(null);
  const [timeString, setTimeString] = useState('');
  const { playSound } = useSystemStore();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTimeString(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderAppContent = (componentKey: string) => {
    switch (componentKey) {
      case 'AboutApp': return <AboutApp about={data.about} />;
      case 'ExperienceApp': return <ExperienceApp experiences={data.experiences} />;
      case 'ProjectsApp': return <ProjectsApp projects={data.projects} />;
      case 'SkillsApp': return <SkillsApp categories={data.categories} skills={data.skills} />;
      case 'EducationApp': return <EducationApp education={data.education} />;
      case 'TerminalApp': return <TerminalApp commands={data.terminalCommands} />;
      case 'GalleryApp': return <GalleryApp categories={data.galleryCategories} images={data.galleryImages} />;
      case 'AchievementsApp': return <AchievementsApp achievements={data.achievements} />;
      case 'BlogApp': return <BlogApp posts={data.blogPosts} />;
      case 'ResumeApp': return <ResumeApp resume={data.resumeConfig} />;
      case 'ContactApp': return <ContactApp />;
      case 'SettingsApp': return <SettingsApp />;
      // 10 New Apps
      case 'PhilosophyApp': return <PhilosophyApp philosophies={data.philosophies} />;
      case 'FeedApp': return <FeedApp feedPosts={data.feedPosts} />;
      case 'BiographyApp': return <BiographyApp biographyTimeline={data.biographyTimeline} />;
      case 'SocialsApp': return <SocialsApp socialLinks={data.socialLinks} />;
      case 'IdeologyApp': return <IdeologyApp ideologies={data.ideologies} />;
      case 'EntertainmentApp': return <EntertainmentApp entertainment={data.entertainment} />;
      case 'AimApp': return <AimApp aims={data.aims} />;
      case 'DreamApp': return <DreamApp dreams={data.dreams} />;
      case 'WishesApp': return <WishesApp wishes={data.wishes} />;
      case 'FavouritesApp': return <FavouritesApp favourites={data.favourites} />;
      default: return <AboutApp about={data.about} />;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-[#111827] text-white flex flex-col justify-between select-none overflow-hidden">
      {/* Phone Status Bar */}
      <div className="h-9 px-5 bg-black/90 backdrop-blur-md flex items-center justify-between text-xs font-semibold tracking-tight shrink-0 z-50 border-b border-slate-800">
        <span>{timeString || '12:00 PM'}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-emerald-400">MahiOS 5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Main Screen Content */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto flex flex-col">
        {activeApp ? (
          /* Active App Full-Screen View */
          <div className="bg-[#c0c0c0] retro-box-outset p-1 rounded-xs text-black flex-1 min-h-0 flex flex-col shadow-2xl overflow-hidden">
            {/* Retro App Header with Back Button */}
            <div className="retro-titlebar px-2.5 py-1.5 flex items-center justify-between font-bold text-xs shrink-0">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setActiveApp(null);
                }}
                className="retro-btn px-2 py-0.5 flex items-center gap-1 text-[11px] font-bold text-[#000080]"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Home</span>
              </button>
              <span className="truncate mx-2">{activeApp.title}</span>
              <div className="w-6" />
            </div>

            {/* Content Body with internal scrolling */}
            <div className="retro-box-inset bg-white p-3.5 m-1 flex-1 min-h-0 overflow-y-auto text-xs">
              {renderAppContent(activeApp.component_key)}
            </div>
          </div>
        ) : (
          /* Mobile App Grid (Launcher Home Screen) */
          <div className="space-y-4 my-auto">
            <div className="text-center py-2 space-y-0.5">
              <h1 className="text-lg font-bold text-white tracking-tight">{data.settings.owner_name}</h1>
              <p className="text-xs text-slate-400 line-clamp-1">{data.settings.headline}</p>
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
              {data.apps.filter((a) => a.is_visible).map((app) => {
                const IconComponent = iconMap[app.icon_name] || HelpCircle;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      playSound('open');
                      setActiveApp(app);
                    }}
                    className="flex flex-col items-center gap-1 focus:outline-none active:scale-95 transition-transform"
                  >
                    <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 shadow-md flex items-center justify-center text-blue-400 relative">
                      <IconComponent className="w-6 h-6" />
                      {app.badge_text && (
                        <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-red-500 text-white text-[8px] font-bold rounded-full shadow">
                          {app.badge_text}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-200 font-medium text-center line-clamp-1">
                      {app.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Home Indicator Bar */}
      <div className="h-5 flex items-center justify-center pb-1 bg-black/80 shrink-0">
        <div className="w-28 h-1 bg-slate-600 rounded-full" />
      </div>
    </div>
  );
}
