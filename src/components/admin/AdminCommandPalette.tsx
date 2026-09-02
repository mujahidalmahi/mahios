'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, X, LayoutDashboard, User, Briefcase, FolderGit2,
  Cpu, GraduationCap, Award, Image as ImageIcon, FileText, FileBadge,
  AppWindow, Palette, Settings, Mail, Terminal, SlidersHorizontal,
  Compass, Radio, BookOpen, Share2, Scale, Gamepad2, Target,
  Sparkles, Flame, Star, ArrowRight, ExternalLink
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
}

export default function AdminCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const commands: CommandItem[] = [
    { id: 'overview', title: 'Dashboard Overview', description: 'System telemetry & database statistics', category: 'General', href: '/admin', icon: LayoutDashboard },
    { id: 'about', title: 'About Me Story', description: 'Bio narrative, taglines & metric counters', category: 'Content', href: '/admin/content/about', icon: User },
    { id: 'experience', title: 'Career Experience', description: 'Positions, company logos, and deliverables', category: 'Content', href: '/admin/content/experience', icon: Briefcase },
    { id: 'projects', title: 'Projects & Architecture', description: 'Portfolio applications, screenshots & live links', category: 'Content', href: '/admin/content/projects', icon: FolderGit2 },
    { id: 'skills', title: 'Tech Stack & Skills', description: 'Skill categories, proficiency levels & badges', category: 'Content', href: '/admin/content/skills', icon: Cpu },
    { id: 'education', title: 'Academic Qualifications', description: 'Degrees, institutions, crests & coursework', category: 'Content', href: '/admin/content/education', icon: GraduationCap },
    { id: 'biography', title: 'Biography Timeline', description: 'Multi-chapter life timeline & milestones', category: 'Content', href: '/admin/content/biography', icon: BookOpen },
    { id: 'achievements', title: 'Honors & Certifications', description: 'Trophies, credential IDs & verification links', category: 'Content', href: '/admin/content/achievements', icon: Award },
    { id: 'resume', title: 'Resume & CV Config', description: 'PDF uploader & ATS plaintext editor', category: 'Content', href: '/admin/content/resume', icon: FileBadge },
    { id: 'philosophy', title: 'Philosophy & Principles', description: 'Guiding engineering and life mental models', category: 'Mindset', href: '/admin/content/philosophy', icon: Compass },
    { id: 'ideology', title: 'Ideology & Tech Ethics', description: 'Open-source ethos, AGI views & digital sovereignty', category: 'Mindset', href: '/admin/content/ideology', icon: Scale },
    { id: 'aim', title: 'Strategic Aims & Roadmap', description: 'Engineering roadmaps, milestones & targets', category: 'Mindset', href: '/admin/content/aim', icon: Target },
    { id: 'dream', title: 'Dreamscape Manifestos', description: 'Audacious long-term civilizational visions', category: 'Mindset', href: '/admin/content/dream', icon: Sparkles },
    { id: 'wishes', title: '3 Wishes for Humanity', description: 'Three universal wishes & profound intents', category: 'Mindset', href: '/admin/content/wishes', icon: Flame },
    { id: 'feed', title: 'Live Feed & Status Updates', description: 'Publish quick micro-updates and thoughts', category: 'Social & Media', href: '/admin/content/feed', icon: Radio },
    { id: 'socials', title: 'Social Links & Digital ID', description: 'Handles, profile links, verified status & PGP', category: 'Social & Media', href: '/admin/content/socials', icon: Share2 },
    { id: 'entertainment', title: 'Media & Games', description: 'Video games, sci-fi movies, anime & books', category: 'Social & Media', href: '/admin/content/entertainment', icon: Gamepad2 },
    { id: 'favourites', title: 'Favourites Hall of Fame', description: 'Curated developer tools, keyboards, and coffee', category: 'Social & Media', href: '/admin/content/favourites', icon: Star },
    { id: 'gallery', title: 'Photo Archives & Albums', description: 'High-res photography & album management', category: 'Social & Media', href: '/admin/content/gallery', icon: ImageIcon },
    { id: 'blog', title: 'Dev Notes & Articles', description: 'Technical essays with full TipTap rich text', category: 'Social & Media', href: '/admin/content/blog', icon: FileText },
    { id: 'messages', title: 'Messages Inbox', description: 'Visitor contact inquiries & replies', category: 'General', href: '/admin/messages', icon: Mail },
    { id: 'apps', title: 'Desktop Applications Studio', description: 'Window dimensions, icons, coordinates & badges', category: 'System', href: '/admin/apps', icon: AppWindow },
    { id: 'terminal', title: 'Terminal MS-DOS CLI', description: 'Custom shell commands & easter eggs', category: 'System', href: '/admin/terminal', icon: Terminal },
    { id: 'boot', title: 'BIOS Boot Stream', description: 'Log stream delays, status badges & sequence', category: 'System', href: '/admin/boot', icon: SlidersHorizontal },
    { id: 'seo', title: 'SEO & Favicon Studio', description: 'Meta tags, OpenGraph cards & Google preview', category: 'System', href: '/admin/seo', icon: Search },
    { id: 'theme', title: 'Theme & CRT Shaders', description: '12 color palettes, wallpaper textures & curvature', category: 'System', href: '/admin/theme', icon: Palette },
    { id: 'settings', title: 'Site Identity Settings', description: 'Owner name, bio, favicon & social links', category: 'System', href: '/admin/settings', icon: Settings },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filtered = query.trim() === ''
    ? commands
    : commands.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    setQuery('');
    if (item.href) router.push(item.href);
    if (item.action) item.action();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, studio name, or action (e.g. Projects, Skills, SEO, Theme)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching studios or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full p-3 rounded-xl hover:bg-blue-600/10 hover:border-blue-500/30 border border-transparent flex items-center justify-between text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:border-blue-500/50 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white group-hover:text-blue-300 truncate">
                          {item.title}
                        </span>
                        <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{item.description}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Navigate with mouse or enter</span>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">ESC</span>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
