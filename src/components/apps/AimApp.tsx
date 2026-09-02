'use client';

import React from 'react';
import { Target, CheckCircle2, Clock, Calendar, Sparkles, TrendingUp } from 'lucide-react';
import { AimItem } from '@/types/database';

interface AimAppProps {
  aims: AimItem[];
}

export default function AimApp({ aims }: AimAppProps) {
  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-[#000080] text-white flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Aims_2026.dat — Technical Roadmap & Milestones
            </h2>
            <p className="text-[11px] text-gray-600">
              Active engineering targets, venture aspirations, and measurable impact horizons.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-white px-2 py-1 retro-box-inset self-start sm:self-auto">
          {aims.length} Strategic Goals
        </span>
      </div>

      {/* Aims Cards */}
      <div className="space-y-4">
        {aims.map((aim) => (
          <div
            key={aim.id}
            className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#000080]">
                    {aim.goal_title}
                  </h3>
                  <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded-2xs ${
                    aim.status === 'achieved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : aim.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {aim.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-mono text-gray-600 flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>Target: {aim.timeline_target}</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-600 font-semibold">
                <span>Execution Progress</span>
                <span className="text-[#000080] font-bold">{aim.progress_percentage}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 retro-box-inset rounded-2xs overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-700 to-indigo-600 transition-all duration-500"
                  style={{ width: `${aim.progress_percentage}%` }}
                />
              </div>
            </div>

            {/* Deliverables Checklist */}
            {aim.deliverables && aim.deliverables.length > 0 && (
              <div className="p-3 bg-white retro-box-inset rounded-2xs space-y-1.5 text-xs">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Key Deliverables & Verification:</span>
                </h4>
                <ul className="space-y-1 text-gray-700">
                  {aim.deliverables.map((del, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-700 font-bold">•</span>
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
