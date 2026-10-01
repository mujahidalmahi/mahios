'use client';

import React, { useState, useMemo } from 'react';
import { Target, CheckCircle2, Clock, Calendar, Check, Layers } from 'lucide-react';
import { AimItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileAimViewProps {
  aims: AimItem[];
}

export default function MobileAimView({ aims = [] }: MobileAimViewProps) {
  const { playSound } = useSystemStore();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    aims.forEach((a) => {
      if (a.category) cats.add(a.category.trim());
    });
    return ['all', ...Array.from(cats)];
  }, [aims]);

  const sorted = useMemo(() => {
    let list = [...aims].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    if (filterCategory !== 'all') {
      list = list.filter((a) => a.category?.trim().toLowerCase() === filterCategory.toLowerCase());
    }
    return list;
  }, [aims, filterCategory]);

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
    <div className="space-y-3 pb-8 flex flex-col min-h-full font-sans">
      {/* Category Pills if multiple categories exist */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = filterCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playSound('click');
                  setFilterCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? 'All Aims' : cat}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span>Strategic Roadmap & Objectives ({sorted.length})</span>
        <span className="text-[10px] font-mono text-red-600">Horizon 2026+</span>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
          <Target className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No strategic aims found</p>
          <p className="text-[11px] text-slate-400">Add engineering milestones in the Admin Dashboard</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 hover:border-red-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 shadow-2xs">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900 leading-snug">{item.goal_title}</h4>
                      {item.category && (
                        <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-slate-100 text-slate-700 rounded-md font-bold">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.timeline_target && (
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-1">
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
                    <span className="text-red-700">{item.progress_percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60 p-0.5">
                    <div
                      className="h-full bg-linear-to-r from-red-600 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, item.progress_percentage))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Key Deliverables */}
              {item.deliverables && item.deliverables.length > 0 && (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Key Deliverables & Verification</span>
                  </h5>
                  <ul className="space-y-1.5 pt-0.5">
                    {item.deliverables.map((del, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700 text-xs leading-relaxed">
                        <span className="text-red-600 font-bold leading-tight mt-0.5">•</span>
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Aim #{item.sort_order ?? index + 1}</span>
                <span className="text-red-600 font-semibold">● Active Strategic Target</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
