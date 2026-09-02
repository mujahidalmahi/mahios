import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
      {/* Icon circle */}
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center">
        <Icon className="w-7 h-7 text-slate-500" />
      </div>

      {/* Text */}
      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {/* Action */}
      {actionLabel && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-600/25 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-600/25 mt-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
