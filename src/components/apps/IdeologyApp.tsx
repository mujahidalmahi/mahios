'use client';

import React from 'react';
import { Scale, Cpu, Shield, Globe2, Sparkles, BookOpen } from 'lucide-react';
import { IdeologyPillar } from '@/types/database';

interface IdeologyAppProps {
  ideologies: IdeologyPillar[];
}

export default function IdeologyApp({ ideologies }: IdeologyAppProps) {
  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-[#000080] text-white flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Ideology.sys — Technological Ethics & Core Beliefs
            </h2>
            <p className="text-[11px] text-gray-600">
              Perspectives on open-source commons, human agency in the age of AGI, and digital sovereignty.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-white px-2 py-1 retro-box-inset self-start sm:self-auto">
          {ideologies.length} Ethical Pillars
        </span>
      </div>

      {/* Pillars Stream */}
      <div className="space-y-4">
        {ideologies.map((pillar) => (
          <div
            key={pillar.id}
            className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-3"
          >
            <div className="border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-700" />
                <h3 className="text-sm sm:text-base font-bold text-[#000080]">
                  {pillar.title}
                </h3>
              </div>
              <p className="text-xs font-semibold text-gray-700 mt-0.5 ml-4">
                {pillar.subtitle}
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xs text-xs text-blue-950 font-medium leading-relaxed">
              {pillar.summary}
            </div>

            {/* Deep Essay Body */}
            <div
              dangerouslySetInnerHTML={{ __html: pillar.content_html }}
              className="text-xs text-gray-800 leading-relaxed space-y-2 pt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
