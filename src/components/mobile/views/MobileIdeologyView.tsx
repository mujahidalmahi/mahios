'use client';

import React from 'react';
import { Scale, CheckCircle2 } from 'lucide-react';
import { IdeologyPillar } from '@/types/database';

interface MobileIdeologyViewProps {
  ideologies: IdeologyPillar[];
}

export default function MobileIdeologyView({ ideologies = [] }: MobileIdeologyViewProps) {
  const sorted = [...ideologies].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Tech Ideology & Principles ({sorted.length})
      </div>

      <div className="space-y-3">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-center gap-2 text-slate-900">
              <Scale className="w-4 h-4 text-amber-600 shrink-0" />
              <h3 className="text-sm font-bold">{item.title}</h3>
            </div>

            {item.subtitle && (
              <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block">
                {item.subtitle}
              </div>
            )}

            {item.summary && (
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {item.summary}
              </p>
            )}

            {item.content_html && (
              <div
                className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100"
                dangerouslySetInnerHTML={{ __html: item.content_html }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
