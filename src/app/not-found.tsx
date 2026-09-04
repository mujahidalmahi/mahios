'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RotateCcw, Terminal, BookOpen, User, AlertTriangle } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export default function NotFoundPage() {
  const router = useRouter();
  const { playSound } = useSystemStore();

  useEffect(() => {
    // Play error beep on mount
    try {
      playSound('error');
    } catch {
      // audio safety
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape' || key === 'enter') {
        router.push('/');
      } else if (key === 't') {
        router.push('/?app=terminal');
      } else if (key === 'b') {
        router.push('/?app=blog');
      } else if (key === 'a') {
        router.push('/?app=about');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound, router]);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#000080] text-white font-mono flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden z-[9999]">
      {/* Top Banner */}
      <div className="space-y-4 max-w-4xl mx-auto w-full">
        <div className="inline-block bg-[#c0c0c0] text-[#000080] font-bold px-3 py-1 text-sm sm:text-base">
          MahiOS 05 — KERNEL STOP ERROR (404)
        </div>

        <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
          <p className="text-[#00ff66] font-bold">
            *** STOP: 0x00000404 (0x00000000, 0xF7A32508, 0xF7A321A0, 0xF78C2000)
          </p>
          <p className="text-yellow-300 font-bold">
            STATUS_OBJECT_NAME_NOT_FOUND: The requested path does not exist on disk volume C:\
          </p>
        </div>

        <hr className="border-t border-white/40 my-4" />

        <div className="text-xs sm:text-sm text-gray-200 space-y-3 leading-relaxed">
          <p>
            An internal navigation pointer was referenced that cannot be resolved in virtual memory.
            If this is the first time you&apos;ve seen this Stop error screen, restart your session.
          </p>
          <p>
            Technical Information:
            <br />
            *** ADDRESS: 0x00404000 at base 0x00400000, DateStamp 2005-2026
            <br />
            *** DRIVER: MAHIOS_ROUTER.SYS - Build 4.08.2026
          </p>
          <p>
            System Recommendations:
            <br />
            * Press [ESC] or [ENTER] to execute warm reboot to MahiOS Desktop.
            <br />
            * Press [T] to launch Safe Mode Diagnostic Terminal.
            <br />
            * Press [B] to inspect published Dev Notes & Engineering Articles.
            <br />
            * Press [A] to view Mujahid Al Mahi Biography & System Specifications.
          </p>
        </div>
      </div>

      {/* Retro OS Recovery Console Action Bar */}
      <div className="max-w-4xl mx-auto w-full pt-6 border-t border-white/40">
        <div className="text-[11px] text-gray-300 uppercase tracking-wider mb-3">
          Select Recovery Protocol:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <Link
            href="/"
            onClick={() => playSound('click')}
            className="retro-btn bg-[#c0c0c0] text-black font-bold text-xs py-2 px-3 flex items-center justify-center gap-2 hover:bg-[#d4d4d4] active:retro-btn-pressed cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reboot (ESC)</span>
          </Link>

          <Link
            href="/?app=terminal"
            onClick={() => playSound('click')}
            className="retro-btn bg-[#c0c0c0] text-black font-bold text-xs py-2 px-3 flex items-center justify-center gap-2 hover:bg-[#d4d4d4] active:retro-btn-pressed cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 shrink-0" />
            <span>Terminal (T)</span>
          </Link>

          <Link
            href="/?app=blog"
            onClick={() => playSound('click')}
            className="retro-btn bg-[#c0c0c0] text-black font-bold text-xs py-2 px-3 flex items-center justify-center gap-2 hover:bg-[#d4d4d4] active:retro-btn-pressed cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Dev Notes (B)</span>
          </Link>

          <Link
            href="/?app=about"
            onClick={() => playSound('click')}
            className="retro-btn bg-[#c0c0c0] text-black font-bold text-xs py-2 px-3 flex items-center justify-center gap-2 hover:bg-[#d4d4d4] active:retro-btn-pressed cursor-pointer"
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>About Me (A)</span>
          </Link>
        </div>

        <div className="flex items-center justify-between mt-4 text-[11px] text-gray-300">
          <span>MahiOS Modular Kernel v4.08</span>
          <span>Press any key to continue _</span>
        </div>
      </div>
    </div>
  );
}
