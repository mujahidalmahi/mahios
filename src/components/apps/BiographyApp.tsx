'use client';

import React, { useState } from 'react';
import { BookOpen, MapPin, Calendar, Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import { BiographyMilestone } from '@/types/database';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';

interface BiographyAppProps {
  biographyTimeline: BiographyMilestone[];
}

export default function BiographyApp({ biographyTimeline }: BiographyAppProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { openWindow } = useWindowStore();
  const { playSound } = useSystemStore();

  const handleCopyLink = (e: React.MouseEvent, milestone: BiographyMilestone) => {
    e.stopPropagation();
    playSound('click');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mujahidmahi.me';
    const url = `${origin}/?app=biography&chapter=${milestone.id}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(milestone.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenChapter = (e: React.MouseEvent, milestone: BiographyMilestone, index: number) => {
    e.stopPropagation();
    playSound('open');
    openWindow({
      id: `milestone-${milestone.id}`,
      app_id: `milestone-${milestone.id}`,
      title: `${milestone.chapter}: ${milestone.title}`,
      icon_name: 'BookOpen',
      component_key: 'BiographyChapterReaderApp',
      default_x: 75 + ((index * 25) % 150),
      default_y: 50 + ((index * 25) % 150),
      default_width: 740,
      default_height: 560,
      is_system_app: false,
      is_visible: true,
      sort_order: 99,
      category: 'Biography',
    });
  };

  const getCleanExcerpt = (html: string) => {
    return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-[#000080] text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Biography.doc — The Chronicle & Life Timeline
            </h2>
            <p className="text-[11px] text-gray-600">
              Select any chapter milestone below to open its dedicated narrative reading window.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-white px-2 py-1 retro-box-inset self-start sm:self-auto font-bold text-[#000080]">
          {biographyTimeline.length} Chapters Documented
        </span>
      </div>

      {/* Chapters Timeline Stream (Compact Cards) */}
      <div className="space-y-3">
        {biographyTimeline.map((milestone, idx) => {
          const excerpt = getCleanExcerpt(milestone.story_html);
          return (
            <div
              key={milestone.id}
              onClick={(e) => handleOpenChapter(e, milestone, idx)}
              className="p-3 sm:p-4 bg-[#f8f9fa] hover:bg-white retro-box-outset hover:border-blue-600 transition-all cursor-pointer group space-y-2 relative active:retro-box-inset"
              title={`Click to open full document for ${milestone.title}`}
            >
              {/* Top Row: Chapter Label & Period / Location */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-gray-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-blue-900 font-bold bg-blue-100 px-2 py-0.5 rounded-2xs border border-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {milestone.chapter}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-[10px] sm:text-[11px] font-mono text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span className="font-semibold text-gray-800">{milestone.period}</span>
                  </span>
                  {milestone.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      <span>{milestone.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#000080] transition-colors leading-snug">
                {milestone.title}
              </h3>

              {/* Compact Excerpt */}
              {excerpt && (
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {excerpt}
                </p>
              )}

              {/* Bottom Row: Key Realization indicator & Open Chapter button */}
              <div className="flex items-center justify-between pt-1 text-xs">
                {milestone.key_learning ? (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium truncate max-w-[65%]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate italic">&ldquo;{milestone.key_learning}&rdquo;</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-400 font-mono">Full chronicle recorded</span>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, milestone)}
                    className="retro-btn px-2 py-1 text-[10px] font-mono flex items-center gap-1 text-gray-700 hover:text-black cursor-pointer"
                    title="Copy direct share link to this chapter"
                  >
                    {copiedId === milestone.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Share</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOpenChapter(e, milestone, idx)}
                    className="retro-btn px-2.5 py-1 text-[11px] font-bold text-[#000080] flex items-center gap-1 group-hover:bg-[#000080] group-hover:text-white transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Chapter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
