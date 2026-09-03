import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black text-[#00ff66] font-mono p-6 sm:p-12 flex flex-col justify-between select-none overflow-hidden crt-scanlines z-[9999]">
      <div className="space-y-2 text-xs sm:text-sm max-w-3xl">
        <div className="text-white font-bold text-sm sm:text-base border-b border-[#00ff66]/40 pb-1 flex justify-between items-center">
          <span>MAHI QUANTUM BIOS v4.08 (C) 2005-2026</span>
          <span className="text-yellow-400 font-normal text-xs">[ENERGY STAR ALLIANCE]</span>
        </div>

        <div className="space-y-1 text-[#00ff66]/90 pt-2">
          <p>CPU: Dual Quantum Virtual Processor @ 3.40 GHz</p>
          <p>Base Memory: 640KB OK</p>
          <p>Extended Memory: 33554432KB OK</p>
          <p>Cache Memory: 1024KB OK</p>
        </div>

        <div className="space-y-1 text-slate-300 pt-3">
          <p>Primary Master: MAHI-NVME-SYSTEM-V4 ... OK</p>
          <p>Secondary Master: SUPABASE-PG-DISTRIBUTED ... OK</p>
          <p>PCI Devices Initialized: 14 Devices Found</p>
        </div>

        <div className="pt-4 flex items-center gap-2 text-white">
          <div className="w-2.5 h-4 bg-[#00ff66] animate-pulse" />
          <span>LOADING MAHIOS KERNEL SUBSYSTEMS...</span>
        </div>
      </div>

      <div className="text-[11px] text-gray-400 flex items-center justify-between border-t border-gray-800 pt-3">
        <span>Press DEL to enter SETUP • ESC to bypass memory check</span>
        <span>Build 2005-2026.09</span>
      </div>
    </div>
  );
}
