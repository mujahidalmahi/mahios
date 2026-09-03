'use client';

import React, { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { playSound } = useSystemStore();

  useEffect(() => {
    try {
      playSound('error');
    } catch {
      // audio safety
    }
  }, [error, playSound]);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#008080] flex items-center justify-center p-4 font-sans select-none z-[9999]">
      {/* Retro Outset Error Window */}
      <div className="w-full max-w-lg bg-[#c0c0c0] retro-box-outset shadow-2xl border-2 border-white">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-xs select-none">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-300" />
            <span>MahiOS System Fault — Fatal Exception 0E</span>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="p-4 space-y-4 text-black text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-lg shrink-0 border border-white">
              ✕
            </div>
            <div className="space-y-1.5 flex-1">
              <p className="font-bold text-sm">A fatal runtime exception has occurred in MahiOS subsystem.</p>
              <p className="text-gray-700 leading-relaxed font-mono text-[11px] bg-white p-2 border border-gray-400 retro-box-inset">
                {error?.message || 'An unexpected memory fault occurred during kernel execution.'}
                {error?.digest && <span className="block text-gray-500 mt-1">Digest: {error.digest}</span>}
              </p>
              <p className="text-gray-600">
                * Press &apos;Retry Execution&apos; to attempt thread recovery.
                <br />
                * Press &apos;Reboot MahiOS&apos; to reinitialize the operating system desktop.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-400">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                reset();
              }}
              className="retro-btn px-4 py-1.5 bg-[#c0c0c0] font-bold text-xs active:retro-btn-pressed cursor-pointer"
            >
              Retry Execution
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                window.location.href = '/';
              }}
              className="retro-btn px-4 py-1.5 bg-[#c0c0c0] font-bold text-xs active:retro-btn-pressed cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reboot MahiOS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
