'use client';

import React, { useState } from 'react';
import { BookOpen, Calendar, MapPin, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { BiographyMilestone } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

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

  const sortedMilestones = [...biographyTimeline].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  // Chapter Reader Mode
  if (activeMilestone) {
    return (
      <div className="space-y-4 pb-6 animate-fadeIn">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setActiveMilestone(null);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Timeline View</span>
        </button>

        <article className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {activeMilestone.period}
            </span>
            {activeMilestone.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {activeMilestone.location}
                </span>
              </>
            )}
          </div>

          <h2 className="text-base font-black text-slate-900 leading-snug">
            {activeMilestone.title}
          </h2>

          {activeMilestone.chapter && (
            <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg inline-block">
              {activeMilestone.chapter}
            </div>
          )}

          {activeMilestone.image_url && (
            <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={activeMilestone.image_url}
                alt={activeMilestone.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div
            className="text-xs text-slate-800 leading-relaxed space-y-3 pt-2"
            dangerouslySetInnerHTML={{ __html: activeMilestone.story_html || '' }}
          />

          {activeMilestone.key_learning && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block text-[10px] uppercase tracking-wider">Key Takeaway</span>
              <p className="italic">&ldquo;{activeMilestone.key_learning}&rdquo;</p>
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Life Milestones & Timeline ({sortedMilestones.length})
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-blue-200">
        {sortedMilestones.map((milestone) => (
          <div
            key={milestone.id}
            onClick={() => {
              playSound('open');
              setActiveMilestone(milestone);
            }}
            className="relative bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 cursor-pointer hover:border-blue-400 active:scale-[0.99] transition-all"
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
          </div>
        ))}
      </div>
    </div>
  );
}
