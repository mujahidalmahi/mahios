'use client';

import React from 'react';
import { Compass, Quote } from 'lucide-react';
import { PhilosophyItem } from '@/types/database';

interface MobilePhilosophyViewProps {
  philosophies: PhilosophyItem[];
}

export default function MobilePhilosophyView({ philosophies = [] }: MobilePhilosophyViewProps) {
  const sorted = [...philosophies].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Personal Philosophy & Mindset ({sorted.length})
      </div>

      <div className="space-y-3">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-center gap-2 text-slate-900">
              <Compass className="w-4 h-4 text-blue-600 shrink-0" />
              <h3 className="text-sm font-bold">{item.title}</h3>
            </div>

            {item.axiom && (
              <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                &ldquo;{item.axiom}&rdquo;
              </p>
            )}

            {item.description && (
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
