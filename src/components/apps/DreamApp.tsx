'use client';

import React from 'react';
import { Sparkles, Globe, Rocket, Compass, Star, Eye } from 'lucide-react';
import { DreamItem } from '@/types/database';

interface DreamAppProps {
  dreams: DreamItem[];
}

export default function DreamApp({ dreams }: DreamAppProps) {
  const getHorizonBadge = (horizon: string) => {
    switch (horizon) {
      case 'decade':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 text-[9px] font-bold font-mono rounded-2xs">10-YEAR HORIZON</span>;
      case 'lifetime':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 text-[9px] font-bold font-mono rounded-2xs">LIFETIME HORIZON</span>;
      case 'civilizational':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-bold font-mono rounded-2xs">CIVILIZATIONAL HORIZON</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-indigo-950 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span>Dreamscape.vsn — Grand Ambitions & Vision Manifestos</span>
            </h2>
            <p className="text-[11px] text-gray-600">
              Audacious, long-term technological dreams for humanity and the cosmos.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-white px-2 py-1 retro-box-inset self-start sm:self-auto">
          {dreams.length} Manifestos
        </span>
      </div>

      {/* Dreams Stream */}
      <div className="space-y-4">
        {dreams.map((dream) => (
          <div
            key={dream.id}
            className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-indigo-700 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  {dream.title}
                </h3>
              </div>

              {getHorizonBadge(dream.horizon)}
            </div>

            {/* Vision Manifesto */}
            <div className="p-3.5 bg-indigo-50/70 border-l-3 border-indigo-700 rounded-2xs text-xs text-indigo-950 leading-relaxed font-medium">
              &ldquo;{dream.vision_manifesto}&rdquo;
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-gray-500">
              <span className="flex items-center gap-1 text-gray-700">
                <Globe className="w-3.5 h-3.5 text-blue-700" />
                <span>Impact Sphere: {dream.impact_area}</span>
              </span>
              <span className="text-indigo-800 font-bold">★ Active Manifestation</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
