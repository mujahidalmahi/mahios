'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wifi, Battery, Volume2, Database, Search, X, Maximize2, Minus,
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Monitor, Trash2, Calculator, FileEdit, Palette, Activity
} from 'lucide-react';
import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

// All 28 Applications
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

// 6 Authentic Built-in Tools
import MyComputerApp from '@/components/apps/MyComputerApp';
import RecycleBinApp from '@/components/apps/RecycleBinApp';
import CalculatorApp from '@/components/apps/CalculatorApp';
import NotepadApp from '@/components/apps/NotepadApp';
import PaintApp from '@/components/apps/PaintApp';
import TaskManagerApp from '@/components/apps/TaskManagerApp';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image: ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Monitor, Trash2, Calculator, FileEdit, Palette, Activity,
};

interface TabletShellProps {
  data: BiographyDatabaseData;
}

export default function TabletShell({ data }: TabletShellProps) {
  const [activeApp, setActiveApp] = useState<DesktopApp | null>(data.apps[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const { playSound, soundEnabled, toggleSound } = useSystemStore();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTimeString(`${hours}:${minutes} ${ampm}`);

      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      setDateString(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sorted apps according to sort_order
  const sortedApps = useMemo(() => {
    return [...data.apps].sort((a, b) => a.sort_order - b.sort_order);
  }, [data.apps]);

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    sortedApps.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['All', ...Array.from(set)];
  }, [sortedApps]);

  // Filtered apps by category & search query
  const filteredApps = useMemo(() => {
    let result = sortedApps;
    if (activeCategory !== 'All') {
      result = result.filter((a) => a.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.app_id.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sortedApps, activeCategory, searchQuery]);

  const handleSelectApp = (app: DesktopApp) => {
    playSound('open');
    setActiveApp(app);
  };

  const renderAppContent = (componentKey: string) => {
    switch (componentKey) {
      case 'AboutApp': return <AboutApp about={data.about} />;
      case 'ExperienceApp': return <ExperienceApp experiences={data.experiences} />;
      case 'ProjectsApp': return <ProjectsApp projects={data.projects} />;
      case 'SkillsApp': return <SkillsApp categories={data.categories} skills={data.skills} />;
      case 'EducationApp': return <EducationApp education={data.education} />;
      case 'TerminalApp': return <TerminalApp commands={data.terminalCommands} data={data} />;
      case 'GalleryApp': return <GalleryApp categories={data.galleryCategories} images={data.galleryImages} />;
      case 'AchievementsApp': return <AchievementsApp achievements={data.achievements} />;
      case 'BlogApp': return <BlogApp posts={data.blogPosts} />;
      case 'ResumeApp': return <ResumeApp resume={data.resumeConfig} />;
      case 'ContactApp': return <ContactApp />;
      case 'SettingsApp': return <SettingsApp />;
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
      case 'MyComputerApp': return <MyComputerApp />;
      case 'RecycleBinApp': return <RecycleBinApp />;
      case 'CalculatorApp': return <CalculatorApp />;
      case 'NotepadApp': return <NotepadApp />;
      case 'PaintApp': return <PaintApp />;
      case 'TaskManagerApp': return <TaskManagerApp />;
      default: return <AboutApp about={data.about} />;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-[#008080] text-black font-sans flex flex-col justify-between select-none overflow-hidden p-2">
      {/* Background Vintage Dither Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />

      {/* ========================================================= */}
      {/* 1. RETRO TABLET PC TITLEBAR / STATUS BAR                  */}
      {/* ========================================================= */}
      <div className="relative z-10 h-8 px-3 bg-[#c0c0c0] retro-box-outset flex items-center justify-between text-xs font-bold shrink-0 mb-2">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2">
          <img
            src="/images/mahios-logo.png"
            alt="MahiOS"
            className="w-5 h-5 object-contain drop-shadow-xs"
          />
          <span className="text-[#000080] font-mono tracking-tight text-xs">MahiOS 05 Tablet PC</span>
        </div>

        {/* Center: Live Date & Active App */}
        <div className="hidden sm:flex items-center gap-2 text-gray-700 font-mono text-[11px]">
          <span>{dateString}</span>
          {activeApp && (
            <>
              <span>•</span>
              <span className="font-bold text-[#000080]">{activeApp.title}</span>
            </>
          )}
        </div>

        {/* Right: Telemetry & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-700 cursor-help" title="Database Connected">
            <Database className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          </div>
          <button
            type="button"
            onClick={() => toggleSound()}
            className="hover:opacity-75 cursor-pointer"
            title="Toggle Sound"
          >
            <Volume2 className={`w-3.5 h-3.5 ${soundEnabled ? 'text-blue-800' : 'text-gray-400'}`} />
          </button>
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-3.5 h-3.5" />
          <span className="font-mono text-xs font-bold text-black ml-1">{timeString || '12:00 PM'}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DUAL-PANEL TABLET WORKSPACE                            */}
      {/* ========================================================= */}
      <div className="relative z-10 flex-1 min-h-0 flex gap-2 overflow-hidden">
        {/* LEFT PANEL: APPLICATION NAVIGATOR & SEARCH */}
        <div className="w-72 bg-[#c0c0c0] retro-box-outset flex flex-col p-2 shrink-0 overflow-hidden shadow-xl">
          {/* Real-time Search Box */}
          <div className="relative flex items-center bg-white border-2 border-[#808080] retro-box-inset px-2 py-1 mb-1.5 shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-500 mr-1.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 28 programs..."
              className="w-full bg-transparent text-xs text-black placeholder-gray-500 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-black p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Quick Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1 shrink-0 scrollbar-none">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-2xs cursor-pointer truncate ${
                  activeCategory === cat ? 'retro-btn-pressed bg-[#dfdfdf] text-[#000080]' : 'retro-btn'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scrollable Programs List */}
          <div className="flex-1 min-h-0 retro-box-inset bg-white p-1 overflow-y-auto space-y-0.5">
            {filteredApps.map((app) => {
              const Icon = iconMap[app.icon_name] || FileText;
              const isSelected = activeApp?.id === app.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleSelectApp(app)}
                  className={`w-full px-2 py-1.5 flex items-center gap-2 rounded-xs text-left cursor-pointer transition-none ${
                    isSelected
                      ? 'bg-[#000080] text-white font-bold'
                      : 'hover:bg-gray-200 text-black'
                  }`}
                >
                  <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${isSelected ? 'text-white' : 'text-[#000080]'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate text-xs flex-1">{app.title}</span>
                </button>
              );
            })}
          </div>

          {/* Tablet System Quick Footer */}
          <div className="pt-2 mt-1 border-t border-gray-400 flex items-center justify-between text-[10px] text-gray-700 font-mono shrink-0">
            <span>RAM: 64MB OK</span>
            <span>{filteredApps.length} Programs</span>
          </div>
        </div>

        {/* RIGHT PANEL: ACTIVE TABLET APPLICATION STAGE */}
        <div className="flex-1 min-h-0 bg-[#c0c0c0] retro-box-outset flex flex-col overflow-hidden shadow-xl">
          {activeApp ? (
            <>
              {/* Retro App Window Titlebar */}
              <div className="retro-titlebar px-2.5 py-1 flex items-center justify-between text-xs font-bold shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{activeApp.title}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveApp(null)}
                    className="retro-btn w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                    title="Minimize to Dashboard"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    className="retro-btn w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveApp(null)}
                    className="retro-btn w-5 h-5 flex items-center justify-center text-xs text-red-700 hover:bg-red-200 cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 min-h-0 retro-box-inset bg-white p-3.5 m-1 overflow-y-auto">
                {renderAppContent(activeApp.component_key)}
              </div>
            </>
          ) : (
            /* Tablet Dashboard (When no app is open) */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 retro-box-inset bg-white p-2">
                <img
                  src="/images/mahios-logo.png"
                  alt="MahiOS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#000080]">{data.settings.owner_name}</h2>
                <p className="text-xs text-gray-600 max-w-md">{data.settings.headline}</p>
              </div>
              <p className="text-xs text-gray-500 font-mono">Select any of the 28 applications from the left panel to launch.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
