import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function SkeletonLine({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-800 rounded ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-8 h-8 rounded-lg bg-slate-800" />
        <div className="w-12 h-5 rounded bg-slate-800" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-3/4" />
        <div className="h-2 bg-slate-800/60 rounded w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-800 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-800 rounded w-1/3" />
        <div className="h-2 bg-slate-800/60 rounded w-1/2" />
      </div>
      <div className="w-16 h-6 rounded bg-slate-800" />
      <div className="w-8 h-8 rounded-lg bg-slate-800" />
    </div>
  );
}

export function SkeletonListPage({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-5 bg-slate-800 rounded w-48" />
          <div className="h-3 bg-slate-800/60 rounded w-64" />
        </div>
        <div className="h-8 w-28 bg-slate-800 rounded-lg" />
      </div>
      {/* Row skeletons */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonFormPage() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-2">
          <div className="h-5 bg-slate-800 rounded w-48" />
          <div className="h-3 bg-slate-800/60 rounded w-64" />
        </div>
        <div className="h-8 w-24 bg-slate-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="h-4 bg-slate-800 rounded w-32" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-1.5">
                <div className="h-3 bg-slate-800/60 rounded w-24" />
                <div className="h-9 bg-slate-800 rounded-lg" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
