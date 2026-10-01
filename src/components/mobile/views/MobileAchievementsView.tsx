'use client';

import React, { useState, useMemo } from 'react';
import { Award, Calendar, ExternalLink, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Achievement } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileAchievementsViewProps {
  achievements: Achievement[];
}

const ITEMS_PER_PAGE = 6;

export default function MobileAchievementsView({ achievements = [] }: MobileAchievementsViewProps) {
  const { playSound } = useSystemStore();
  const [currentPage, setCurrentPage] = useState(1);

  const sortedAchievements = useMemo(() => {
    return [...achievements].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [achievements]);

  const totalPages = Math.max(1, Math.ceil(sortedAchievements.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAchievements.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAchievements, currentPage]);

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full flex-1">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Honors & Certifications ({sortedAchievements.length})
      </div>

      <div className="space-y-2.5">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h3>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">{item.issuer}</div>
                </div>
              </div>

              {item.certificate_url && (
                <a
                  href={item.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound('open')}
                  className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg shrink-0"
                  title="Verify Credential"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <Calendar className="w-3 h-3" />
              <span>{item.issue_date}</span>
            </div>

            {item.description && (
              <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-200 shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-xs font-mono font-bold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
