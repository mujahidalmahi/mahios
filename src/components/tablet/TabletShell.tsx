'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi, Battery, ArrowLeft,
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, HelpCircle, X, Compass, Radio, BookOpen,
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

interface TabletShellProps {
  data: BiographyDatabaseData;
}

export default function TabletShell({ data }: TabletShellProps) {
  const [activeApp, setActiveApp] = useState<DesktopApp | null>(data.apps[0] || null);
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
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-[#0f172a] text-white p-2 sm:p-3 flex flex-col justify-between select-none overflow-hidden">
      {/* Tablet Status Bar */}
      <div className="h-8 px-4 bg-slate-900/95 rounded-t-xl border-t border-x border-slate-700 flex items-center justify-between text-xs font-medium shrink-0">
        <span className="font-semibold text-slate-300">{timeString || '12:00 PM'}</span>
        <span className="font-bold text-xs text-blue-400">MahiOS Tablet Edition</span>
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Tablet Work Area */}
      <div className="flex-1 min-h-0 bg-slate-900 border-x border-slate-700 p-3 sm:p-4 flex flex-col overflow-hidden">
        {activeApp ? (
          <div className="retro-box-outset bg-[#c0c0c0] text-black flex-1 min-h-0 flex flex-col overflow-hidden shadow-2xl rounded-xs">
            <div className="retro-titlebar px-3 py-1.5 flex items-center justify-between font-bold text-xs shrink-0">
              <span className="truncate">{activeApp.title}</span>
              <button
                type="button"
                onClick={() => {
                  playSound('close');
                  setActiveApp(null);
                }}
                className="retro-window-btn"
                title="Close"
              >
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </button>
            </div>
            <div className="retro-box-inset bg-white p-4 m-1 flex-1 min-h-0 overflow-y-auto text-xs">
              {renderAppContent(activeApp.component_key)}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">{data.settings.owner_name}</h2>
              <p className="text-xs text-slate-400">{data.settings.headline}</p>
            </div>
            <p className="text-xs text-slate-500 font-mono">Select an application from the bottom dock below</p>
          </div>
        )}
      </div>

      {/* Tablet Bottom Floating Dock */}
      <div className="h-16 sm:h-18 bg-slate-900/95 rounded-b-xl border-b border-x border-slate-700 px-3 flex items-center justify-center shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto p-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-xl max-w-full">
          {data.apps.filter((a) => a.is_visible).map((app) => {
            const Icon = iconMap[app.icon_name] || HelpCircle;
            const isSelected = activeApp?.id === app.id;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  playSound('open');
                  setActiveApp(app);
                }}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white scale-105 shadow-md shadow-blue-600/30'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={app.title}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
