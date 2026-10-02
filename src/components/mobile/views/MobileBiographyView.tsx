'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen, Calendar, MapPin, ChevronLeft, ChevronRight,
  Share2, Printer, Check, Copy, Sparkles, ArrowLeft, ArrowRight
} from 'lucide-react';
import { BiographyMilestone } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { printDocument } from '@/lib/utils/printDocument';

interface MobileBiographyViewProps {
  biographyTimeline: BiographyMilestone[];
  initialMilestoneId?: string;
}

export default function MobileBiographyView({ biographyTimeline = [], initialMilestoneId }: MobileBiographyViewProps) {
  const { playSound } = useSystemStore();
  const [activeMilestone, setActiveMilestone] = useState<BiographyMilestone | null>(() => {
    if (initialMilestoneId) {
      return biographyTimeline.find((m) => m.id === initialMilestoneId) || null;
    }
    return null;
  });

  const [readingTheme, setReadingTheme] = useState<'normal' | 'sepia' | 'terminal'>('normal');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copiedShare, setCopiedShare] = useState(false);

  const sortedMilestones = useMemo(() => {
    return [...biographyTimeline].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
  }, [biographyTimeline]);

  const currentIndex = activeMilestone
    ? sortedMilestones.findIndex((m) => m.id === activeMilestone.id)
    : -1;
  const prevMilestone = currentIndex > 0 ? sortedMilestones[currentIndex - 1] : null;
  const nextMilestone =
    currentIndex >= 0 && currentIndex < sortedMilestones.length - 1
      ? sortedMilestones[currentIndex + 1]
      : null;

  const handleShare = () => {
    if (!activeMilestone) return;
    playSound('click');
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?app=biography&chapter=${activeMilestone.id}`
      : `https://mujahidmahi.me/?app=biography&chapter=${activeMilestone.id}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: activeMilestone.title,
        text: activeMilestone.chapter || activeMilestone.title,
        url: shareUrl,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handlePrint = () => {
    if (!activeMilestone) return;
    playSound('click');
    printDocument({
      title: activeMilestone.title,
      categoryBadge: activeMilestone.chapter,
      periodOrDate: activeMilestone.period,
      location: activeMilestone.location,
      contentHtml: activeMilestone.story_html,
      calloutTitle: 'Key Realization & Takeaway',
      calloutText: activeMilestone.key_learning,
      author: 'Mujahid Al Mahi',
      footerNote: 'Mujahid Al Mahi Digital Biography • Timeline Chapter',
    });
  };

  // Chapter Reader Mode
  if (activeMilestone) {
    const themeStyles = {
      normal: 'bg-white text-slate-900 border-slate-200',
      sepia: 'bg-[#fbf0d9] text-[#433422] border-[#e6d3af]',
      terminal: 'bg-[#0f172a] text-[#34d399] border-[#1e293b]',
    }[readingTheme];

    const fontSizeClass = {
      sm: 'text-xs',
      base: 'text-sm',
      lg: 'text-base',
    }[fontSize];

    return (
      <div className="space-y-3 pb-6 flex flex-col min-h-full">
        {/* Top Navigation & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveMilestone(null);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 xs:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 active:scale-95 transition-all cursor-pointer min-h-[36px]"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Timeline</span>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Theme selector */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
              {(['normal', 'sepia', 'terminal'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setReadingTheme(t)}
                  className={`px-1.5 xs:px-2 py-1 rounded capitalize ${
                    readingTheme === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {t === 'terminal' ? 'Term' : t}
                </button>
              ))}
            </div>

            {/* Font size */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
              {(['sm', 'base', 'lg'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFontSize(s)}
                  className={`px-1.5 xs:px-2 py-1 rounded uppercase ${
                    fontSize === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {s === 'sm' ? 'A' : s === 'base' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>

            {/* Print & Share */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer active:scale-95"
              title="Print Chapter"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer active:scale-95"
              title="Share Chapter"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Chapter Article Container */}
        <article className={`rounded-2xl p-3.5 xs:p-5 border shadow-2xs space-y-4 transition-colors break-words overflow-hidden ${themeStyles}`}>
          <div className="space-y-1.5 border-b pb-3 border-current/10">
            <div className="flex items-center gap-2 text-[11px] font-mono opacity-70">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {activeMilestone.period}
              </span>
              {activeMilestone.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {activeMilestone.location}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-lg font-black leading-snug tracking-tight">
              {activeMilestone.title}
            </h1>

            {activeMilestone.chapter && (
              <div className="text-xs font-semibold text-blue-600 opacity-90">
                {activeMilestone.chapter}
              </div>
            )}
          </div>

          {activeMilestone.image_url && (
            <div className="w-full h-44 rounded-xl overflow-hidden bg-black/5 border border-current/10">
              <img
                src={activeMilestone.image_url}
                alt={activeMilestone.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div
            className={`leading-relaxed space-y-3 break-words overflow-x-auto max-w-full ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: activeMilestone.story_html || '' }}
          />

          {activeMilestone.key_learning && (
            <div className="bg-black/5 p-3.5 rounded-xl border border-current/10 text-xs space-y-1.5 mt-4">
              <span className="font-bold block text-[10px] uppercase tracking-wider opacity-75">
                Key Realization & Takeaway
              </span>
              <p className="italic opacity-90">&ldquo;{activeMilestone.key_learning}&rdquo;</p>
            </div>
          )}
        </article>

        {/* Previous / Next Chapter Soft Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2">
          {prevMilestone ? (
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setActiveMilestone(prevMilestone);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 px-2.5 xs:px-3 py-2 bg-white text-slate-800 rounded-xl text-[11px] xs:text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all min-h-[40px]"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Prev: {prevMilestone.period}</span>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {nextMilestone ? (
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setActiveMilestone(nextMilestone);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 px-2.5 xs:px-3 py-2 bg-white text-slate-800 rounded-xl text-[11px] xs:text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all min-h-[40px]"
            >
              <span className="truncate">Next: {nextMilestone.period}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    );
  }

  // Timeline List View
  return (
    <div className="space-y-3 pb-8 flex flex-col min-h-full flex-1 font-sans">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Life Milestones & Timeline ({sortedMilestones.length})
      </div>

      {sortedMilestones.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No biography chapters documented yet</p>
          <p className="text-[11px] text-slate-400">Add timeline milestones in the Admin Dashboard</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-3.5 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-blue-200">
          {sortedMilestones.map((milestone) => (
            <div
              key={milestone.id}
              onClick={() => {
                playSound('open');
                setActiveMilestone(milestone);
              }}
              className="relative bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2 cursor-pointer hover:border-blue-400 active:scale-[0.99] transition-all"
            >
            {/* Timeline bullet dot */}
            <div className="absolute -left-5.5 top-5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />

            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-mono font-bold">
                {milestone.period}
              </span>
              <div className="w-5 h-5 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-tight">{milestone.title}</h3>

            {milestone.chapter && (
              <p className="text-xs text-slate-600 font-medium line-clamp-1">
                {milestone.chapter}
              </p>
            )}

            {milestone.location && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                <MapPin className="w-3 h-3 text-slate-300" />
                <span>{milestone.location}</span>
              </div>
            )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
