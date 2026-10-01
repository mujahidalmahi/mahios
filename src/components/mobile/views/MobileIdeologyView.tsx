'use client';

import React from 'react';
import { Scale, CheckCircle2, Shield, Sparkles, BookOpen } from 'lucide-react';
import { IdeologyPillar } from '@/types/database';

interface MobileIdeologyViewProps {
  ideologies: IdeologyPillar[];
}

export default function MobileIdeologyView({ ideologies = [] }: MobileIdeologyViewProps) {
  const sorted = [...ideologies].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-8 flex flex-col min-h-full font-sans">
      <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span>Technological Ethics & Core Beliefs ({sorted.length})</span>
        <span className="text-[10px] font-mono text-amber-600">Ethical Framework</span>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
          <Scale className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No ideological pillars defined yet</p>
          <p className="text-[11px] text-slate-400">Configure core beliefs in the Admin Dashboard</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sorted.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 leading-snug truncate">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-xs font-bold text-amber-800 mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  Pillar #{item.sort_order ?? index + 1}
                </span>
              </div>

              {item.summary && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950 font-medium leading-relaxed">
                  {item.summary}
                </div>
              )}

              {item.content_html && (
                <div
                  className="text-xs text-slate-700 leading-relaxed space-y-2 pt-1 font-sans prose prose-sm max-w-none prose-p:text-slate-700 prose-headings:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: item.content_html }}
                />
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Pillar #{item.sort_order ?? index + 1}</span>
                <span className="text-blue-700 font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-600" />
                  Core Ethical Foundation
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
