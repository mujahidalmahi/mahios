'use client';

import React from 'react';
import { BookOpen, MapPin, Calendar, Sparkles, Milestone, Compass } from 'lucide-react';
import { BiographyMilestone } from '@/types/database';

interface BiographyAppProps {
  biographyTimeline: BiographyMilestone[];
}

export default function BiographyApp({ biographyTimeline }: BiographyAppProps) {
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
              Personal memoirs, pivotal turning points, and the continuous evolution of craft.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-white px-2 py-1 retro-box-inset self-start sm:self-auto">
          {biographyTimeline.length} Chapters Documented
        </span>
      </div>

      {/* Chapters Timeline Stream */}
      <div className="space-y-4">
        {biographyTimeline.map((milestone, idx) => (
          <div
            key={milestone.id}
            className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-3 relative"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200 pb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded-2xs border border-blue-200">
                  {milestone.chapter}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-1">
                  {milestone.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-mono text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>{milestone.period}</span>
                </span>
                {milestone.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>{milestone.location}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Story HTML */}
            <div
              dangerouslySetInnerHTML={{ __html: milestone.story_html }}
              className="text-xs text-gray-800 leading-relaxed space-y-1.5"
            />

            {/* Key Learning Callout */}
            {milestone.key_learning && (
              <div className="p-2.5 bg-emerald-50 border-l-3 border-emerald-600 rounded-2xs text-xs text-gray-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900">Key Realization: </strong>
                  <span>{milestone.key_learning}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
