'use client';

import React from 'react';
import { Target, CircleDot } from 'lucide-react';
import { AimItem } from '@/types/database';

interface MobileAimViewProps {
  aims: AimItem[];
}

export default function MobileAimView({ aims = [] }: MobileAimViewProps) {
  const sorted = [...aims].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Strategic Aims & Objectives ({sorted.length})
      </div>

      <div className="space-y-2.5">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900">{item.goal_title}</h4>
              </div>
              {item.timeline_target && (
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Target: {item.timeline_target}
                </span>
              )}
            </div>

            {item.progress_percentage !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-blue-600">{item.progress_percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${item.progress_percentage}%` }}
                  />
                </div>
              </div>
            )}

            {item.status && (
              <div className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                <CircleDot className="w-3 h-3 text-blue-500" />
                <span className="capitalize">Status: {item.status.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
