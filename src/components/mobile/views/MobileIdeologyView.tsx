'use client';

import React from 'react';
import { Scale, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { IdeologyPillar } from '@/types/database';

interface MobileIdeologyViewProps {
  ideologies: IdeologyPillar[];
}

export default function MobileIdeologyView({ ideologies = [] }: MobileIdeologyViewProps) {
  const sorted = [...ideologies].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Technological Ethics & Core Beliefs ({sorted.length})
      </div>

      <div className="space-y-3.5">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <Scale className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-xs font-semibold text-amber-800 mt-0.5">{item.subtitle}</p>
                )}
              </div>
            </div>

            {item.summary && (
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950 font-medium leading-relaxed">
                {item.summary}
              </div>
            )}

            {item.content_html && (
              <div
                className="text-xs text-slate-700 leading-relaxed space-y-2 pt-1 font-sans tiptap-editor-content"
                dangerouslySetInnerHTML={{ __html: item.content_html }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
