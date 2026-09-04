'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Calendar, MapPin, Sparkles, Clock, Share2,
  Check, Printer, ArrowLeft, ArrowRight, X
} from 'lucide-react';
import { BiographyMilestone } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { printDocument } from '@/lib/utils/printDocument';
import { useWindowStore } from '@/stores/windowStore';

interface BiographyChapterReaderAppProps {
  milestone: BiographyMilestone;
  allMilestones?: BiographyMilestone[];
}

export default function BiographyChapterReaderApp({
  milestone,
  allMilestones = [],
}: BiographyChapterReaderAppProps) {
  const [currentMilestone, setCurrentMilestone] = useState<BiographyMilestone>(milestone);
  const [readingTheme, setReadingTheme] = useState<'normal' | 'sepia' | 'terminal' | 'cyber'>('normal');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copied, setCopied] = useState(false);
  const { playSound } = useSystemStore();
  const { closeWindow, activeWindowId } = useWindowStore();

  useEffect(() => {
    setCurrentMilestone(milestone);
  }, [milestone]);

  const currentIndex = allMilestones.findIndex((m) => m.id === currentMilestone.id);
  const prevMilestone = currentIndex > 0 ? allMilestones[currentIndex - 1] : null;
  const nextMilestone = currentIndex >= 0 && currentIndex < allMilestones.length - 1 ? allMilestones[currentIndex + 1] : null;

  const handlePrev = () => {
    if (!prevMilestone) return;
    playSound('click');
    setCurrentMilestone(prevMilestone);
  };

  const handleNext = () => {
    if (!nextMilestone) return;
    playSound('click');
    setCurrentMilestone(nextMilestone);
  };

  const handleCopy = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const cleanText = (currentMilestone.story_html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const textToCopy = `${currentMilestone.chapter}: ${currentMilestone.title} (${currentMilestone.period})\n\n${cleanText}${currentMilestone.key_learning ? `\n\nKey Realization: ${currentMilestone.key_learning}` : ''}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    playSound('click');
    printDocument({
      title: currentMilestone.title,
      categoryBadge: currentMilestone.chapter,
      periodOrDate: currentMilestone.period,
      location: currentMilestone.location,
      contentHtml: currentMilestone.story_html,
      calloutTitle: 'Key Realization & Takeaway',
      calloutText: currentMilestone.key_learning,
      author: 'Mujahid Al Mahi',
      footerNote: 'Mujahid Al Mahi Digital Biography • Timeline Chapter',
    });
  };

  const getThemeClasses = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#5f4b32]';
      case 'terminal':
        return 'bg-black text-[#00ff66] font-mono selection:bg-[#00ff66] selection:text-black';
      case 'cyber':
        return 'bg-[#0a0f1d] text-[#38bdf8] font-mono selection:bg-[#38bdf8] selection:text-black';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-xs leading-relaxed';
      case 'lg':
        return 'text-base sm:text-lg leading-relaxed';
      default:
        return 'text-sm sm:text-base leading-relaxed';
    }
  };

  const wordCount = (currentMilestone.story_html || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className={`h-full flex flex-col justify-between overflow-hidden select-text ${getThemeClasses()}`}>
      {/* Top Document Studio Toolbar */}
      <div className="bg-[#c0c0c0] retro-box-outset p-2 flex flex-wrap items-center justify-between gap-2 text-black font-sans text-xs shrink-0 select-none border-b border-gray-400">
        {/* Left: Reading Theme */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-gray-600 uppercase mr-1">Theme:</span>
          {(['normal', 'sepia', 'terminal', 'cyber'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                playSound('click');
                setReadingTheme(t);
              }}
              className={`px-2 py-0.5 text-[10px] capitalize cursor-pointer ${
                readingTheme === t ? 'retro-btn-pressed bg-[#dfdfdf] font-bold text-[#000080]' : 'retro-btn'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Center: Font Size Controls */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-gray-600 uppercase mr-1">Font:</span>
          {(['sm', 'base', 'lg'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                playSound('click');
                setFontSize(s);
              }}
              className={`px-2 py-0.5 text-[10px] uppercase cursor-pointer ${
                fontSize === s ? 'retro-btn-pressed bg-[#dfdfdf] font-bold text-[#000080]' : 'retro-btn'
              }`}
            >
              {s === 'sm' ? 'A-' : s === 'lg' ? 'A+' : 'A'}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="retro-btn px-2 py-0.5 flex items-center gap-1 text-[11px] font-bold text-[#000080] cursor-pointer"
            title="Copy full chapter text"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="retro-btn px-1.5 py-0.5 text-gray-700 cursor-pointer hidden sm:flex items-center gap-1"
            title="Print Chapter"
          >
            <Printer className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Chapter Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-7 space-y-6">
        {/* Document Header Banner */}
        <div className="space-y-2 border-b border-current/20 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-2xs border border-current/30 bg-current/5 tracking-wider text-[#000080] dark:text-blue-400">
              {currentMilestone.chapter}
            </span>
            <span className="text-[10px] font-mono text-current/70 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{readTimeMin} min read ({wordCount} words)</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            {currentMilestone.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-current/80 pt-1">
            <span className="flex items-center gap-1 bg-current/5 px-2 py-0.5 rounded-2xs border border-current/20">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentMilestone.period}</span>
            </span>
            {currentMilestone.location && (
              <span className="flex items-center gap-1 bg-current/5 px-2 py-0.5 rounded-2xs border border-current/20">
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentMilestone.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Story HTML Narrative */}
        <div
          dangerouslySetInnerHTML={{ __html: currentMilestone.story_html }}
          className={`prose prose-sm max-w-none leading-relaxed space-y-3 ${getFontSizeClasses()}`}
        />

        {/* Key Realization Highlight Box */}
        {currentMilestone.key_learning && (
          <div className="p-4 rounded-xs border-2 border-current/30 bg-current/5 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Key Realization & Craft Insight</span>
            </div>
            <p className="text-xs sm:text-sm italic pl-6 leading-relaxed">
              &ldquo;{currentMilestone.key_learning}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation & Status Bar */}
      <div className="bg-[#c0c0c0] retro-box-outset p-2 flex items-center justify-between gap-2 text-black font-sans text-xs shrink-0 select-none border-t border-gray-400">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!prevMilestone}
            onClick={handlePrev}
            className="retro-btn px-2.5 py-1 flex items-center gap-1 disabled:opacity-40 cursor-pointer text-xs font-bold"
            title={prevMilestone ? `Previous: ${prevMilestone.chapter}` : 'First chapter'}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev Chapter</span>
          </button>

          <button
            type="button"
            disabled={!nextMilestone}
            onClick={handleNext}
            className="retro-btn px-2.5 py-1 flex items-center gap-1 disabled:opacity-40 cursor-pointer text-xs font-bold"
            title={nextMilestone ? `Next: ${nextMilestone.chapter}` : 'Last chapter'}
          >
            <span className="hidden sm:inline">Next Chapter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {allMilestones.length > 0 && (
          <span className="text-[11px] font-mono text-gray-700">
            Chapter {currentIndex + 1} of {allMilestones.length}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              if (activeWindowId) closeWindow(activeWindowId);
            }}
            className="retro-btn px-3 py-1 flex items-center gap-1 text-xs font-bold text-gray-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
