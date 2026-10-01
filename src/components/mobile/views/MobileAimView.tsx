'use client';

import React from 'react';
import { Target, CheckCircle2, Clock, Calendar, Check } from 'lucide-react';
import { AimItem } from '@/types/database';

interface MobileAimViewProps {
  aims: AimItem[];
}

export default function MobileAimView({ aims = [] }: MobileAimViewProps) {
  const sorted = [...aims].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Strategic Roadmap & Objectives ({sorted.length})
      </div>

      <div className="space-y-3">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                  <Target className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.goal_title}</h4>
                  {item.timeline_target && (
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>Target: {item.timeline_target}</span>
                    </div>
                  )}
                </div>
              </div>

              {item.status && (
                <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-lg border shrink-0 ${getStatusBadge(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Execution Progress */}
            {item.progress_percentage !== undefined && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-500 text-[11px]">Execution Progress</span>
                  <span className="text-blue-700">{item.progress_percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.progress_percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Key Deliverables */}
            {item.deliverables && item.deliverables.length > 0 && (
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Key Deliverables & Verification</span>
                </h5>
                <ul className="space-y-1.5 pt-0.5">
                  {item.deliverables.map((del, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 text-xs leading-relaxed">
                      <span className="text-blue-600 font-bold leading-tight mt-0.5">•</span>
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
