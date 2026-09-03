'use client';

import React, { useState } from 'react';
import {
  HardDrive, Disc, Cpu, Monitor, ShieldCheck, Terminal,
  Settings, Folder, Database, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';

export default function MyComputerApp() {
  const { playSound } = useSystemStore();
  const { openWindow } = useWindowStore();
  const [selectedDrive, setSelectedDrive] = useState<string | null>('c');

  const drives = [
    {
      id: 'c',
      letter: 'C:',
      label: 'System Drive (OS)',
      type: 'Fixed Disk',
      total: '128 GB',
      free: '84.2 GB',
      percentUsed: 34,
      fileSystem: 'FAT32',
    },
    {
      id: 'd',
      letter: 'D:',
      label: 'Media & Portfolio',
      type: 'Fixed Disk',
      total: '512 GB',
      free: '320.4 GB',
      percentUsed: 37,
      fileSystem: 'FAT32',
    },
    {
      id: 'a',
      letter: 'A:',
      label: '3½ Floppy Drive',
      type: 'Removable Disk',
      total: '1.44 MB',
      free: '1.44 MB',
      percentUsed: 0,
      fileSystem: 'FAT12',
    },
    {
      id: 'e',
      letter: 'E:',
      label: 'CD-ROM Drive',
      type: 'Optical Drive',
      total: '650 MB',
      free: '0 MB',
      percentUsed: 100,
      fileSystem: 'CDFS',
    },
  ];

  return (
    <div className="space-y-4 text-black text-xs font-sans select-none">
      {/* Explorer Top Toolbar */}
      <div className="flex items-center gap-2 p-1.5 bg-[#d4d0c8] border-b border-gray-400">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#000080]">
          <Monitor className="w-4 h-4" />
          <span>My Computer — Local System Storage & Hardware Architecture</span>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
          Storage Drives & Partitions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {drives.map((d) => (
            <div
              key={d.id}
              onClick={() => {
                playSound('click');
                setSelectedDrive(d.id);
              }}
              className={`p-2.5 border-2 rounded-xs flex items-start gap-3 cursor-pointer transition-colors ${
                selectedDrive === d.id
                  ? 'bg-[#000080] text-white border-blue-900'
                  : 'bg-white border-[#808080] text-black hover:bg-blue-50'
              }`}
            >
              <div className="p-2 bg-[#c0c0c0] text-[#000080] border border-gray-400 rounded shrink-0">
                {d.id === 'e' ? <Disc className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs truncate">
                    {d.label} ({d.letter})
                  </span>
                  <span className="text-[10px] font-mono opacity-80">{d.fileSystem}</span>
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">
                  {d.free} free of {d.total}
                </div>

                {/* Disk Space Meter */}
                <div className="w-full h-2 bg-gray-200 border border-gray-500 mt-1.5 overflow-hidden rounded-2xs">
                  <div
                    className={`h-full ${
                      selectedDrive === d.id ? 'bg-[#00ff66]' : 'bg-[#000080]'
                    }`}
                    style={{ width: `${d.percentUsed}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Specifications Box */}
      <div className="bg-[#f0f0f0] p-3 border-2 border-[#808080] retro-box-inset space-y-2">
        <div className="flex items-center justify-between border-b border-gray-300 pb-1">
          <div className="flex items-center gap-1.5 font-bold text-xs text-[#000080]">
            <Cpu className="w-4 h-4" />
            <span>MahiOS System Information & Hardware Specs</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Certified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono">
          <div>
            <span className="text-gray-500">Operating System: </span>
            <span className="font-bold">MahiOS 95 Enterprise</span>
          </div>
          <div>
            <span className="text-gray-500">Registered To: </span>
            <span className="font-bold text-[#000080]">Mujahid Al Mahi</span>
          </div>
          <div>
            <span className="text-gray-500">Engine Core: </span>
            <span>Next.js 16.3 (Turbopack)</span>
          </div>
          <div>
            <span className="text-gray-500">Database Cluster: </span>
            <span>Supabase PostgreSQL 15</span>
          </div>
          <div>
            <span className="text-gray-500">RAM: </span>
            <span>64.0 MB Simulated Fast EDO RAM</span>
          </div>
          <div>
            <span className="text-gray-500">Sound Synthesis: </span>
            <span>Web Audio API (8-Bit Synthesizer)</span>
          </div>
          <div>
            <span className="text-gray-500">Display Adapter: </span>
            <span>VGA 1024x768 (256 Colors CRT Shader)</span>
          </div>
          <div>
            <span className="text-gray-500">Host Domain: </span>
            <span className="text-blue-700 font-bold">mujahidmahi.me</span>
          </div>
        </div>
      </div>

      {/* System Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-300">
        <button
          type="button"
          onClick={() => {
            playSound('open');
            openWindow({
              id: 'app-terminal',
              app_id: 'terminal',
              title: 'MS-DOS Prompt',
              icon_name: 'Terminal',
              component_key: 'TerminalApp',
              default_x: 80,
              default_y: 60,
              default_width: 720,
              default_height: 480,
              is_system_app: true,
              is_visible: true,
              sort_order: 10,
              category: 'utilities',
            });
          }}
          className="px-3 py-1 retro-btn flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Launch Command Prompt</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('open');
            openWindow({
              id: 'app-settings',
              app_id: 'settings',
              title: 'Control Panel',
              icon_name: 'Settings',
              component_key: 'SettingsApp',
              default_x: 100,
              default_y: 80,
              default_width: 740,
              default_height: 520,
              is_system_app: true,
              is_visible: true,
              sort_order: 27,
              category: 'utilities',
            });
          }}
          className="px-3 py-1 retro-btn flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Open Control Panel</span>
        </button>
      </div>
    </div>
  );
}
