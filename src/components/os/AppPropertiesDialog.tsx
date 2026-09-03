'use client';

import React, { useState } from 'react';
import { X, FileCode, HardDrive, ShieldCheck, Database, Sliders, Check } from 'lucide-react';
import { DesktopApp } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface AppPropertiesDialogProps {
  app: DesktopApp;
  onClose: () => void;
}

export default function AppPropertiesDialog({ app, onClose }: AppPropertiesDialogProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'shortcut' | 'telemetry'>('general');
  const { playSound } = useSystemStore();

  // Deterministic realistic simulated size based on app title length
  const approxBytes = 842000 + (app.title.length * 124500);
  const sizeMb = (approxBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 select-none font-sans text-xs">
      <div className="w-full max-w-[390px] bg-[#c0c0c0] retro-box-outset shadow-2xl border-2 border-white">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-xs select-none">
          <div className="flex items-center gap-1.5 truncate">
            <FileCode className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{app.title} Properties</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="w-4 h-4 retro-btn flex items-center justify-center text-black font-bold cursor-pointer text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="p-3 space-y-3 text-black">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-400">
            {[
              { key: 'general', label: 'General' },
              { key: 'shortcut', label: 'Shortcut' },
              { key: 'telemetry', label: 'Telemetry' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  playSound('click');
                  setActiveTab(key as typeof activeTab);
                }}
                className={`px-3 py-1 font-bold text-xs cursor-pointer border-t border-l border-r rounded-t-xs -mb-[1px] ${
                  activeTab === key
                    ? 'bg-[#c0c0c0] border-white text-black z-10'
                    : 'bg-[#d8d8d8] border-gray-400 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 border-b border-gray-400 pb-2">
                <div className="w-10 h-10 p-2 bg-white border border-gray-400 retro-box-inset flex items-center justify-center shrink-0">
                  <FileCode className="w-6 h-6 text-[#000080]" />
                </div>
                <div>
                  <div className="font-bold text-sm text-black">{app.title}</div>
                  <div className="text-[11px] text-gray-600 font-mono">
                    {app.app_id}.exe (MahiOS Application)
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex">
                  <span className="w-24 text-gray-600">Type of file:</span>
                  <span className="font-bold">MahiOS Executable (.EXE)</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">Description:</span>
                  <span>{app.title} Module</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">Location:</span>
                  <span className="truncate">C:\MahiOS\BIN\{app.app_id}.exe</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">Size on disk:</span>
                  <span>{sizeMb} MB ({approxBytes.toLocaleString()} bytes)</span>
                </div>
              </div>

              <div className="border-t border-gray-400 pt-2 space-y-1 text-[10px] text-gray-600 font-mono">
                <div>Created: Wednesday, September 2, 1995, 08:00:00 AM</div>
                <div>Modified: Thursday, September 3, 2026, 22:00:00 PM</div>
                <div>Accessed: Today, Active Session</div>
              </div>

              <div className="border-t border-gray-400 pt-2 flex items-center gap-4 text-xs">
                <span className="text-gray-700 font-bold">Attributes:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" defaultChecked disabled className="rounded-none" />
                  <span>Read-only</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" disabled className="rounded-none" />
                  <span>Hidden</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" defaultChecked disabled className="rounded-none" />
                  <span>Archive</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: SHORTCUT */}
          {activeTab === 'shortcut' && (
            <div className="space-y-2 text-[11px] font-mono">
              <div>
                <label className="block text-gray-600 mb-0.5">Target type:</label>
                <input
                  type="text"
                  readOnly
                  value="MahiOS Core Subsystem"
                  className="w-full bg-[#e8e8e8] border border-gray-400 p-1 text-black"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Target:</label>
                <input
                  type="text"
                  readOnly
                  value={`"C:\\MahiOS\\BIN\\${app.app_id}.exe"`}
                  className="w-full bg-[#e8e8e8] border border-gray-400 p-1 text-black font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Start in:</label>
                <input
                  type="text"
                  readOnly
                  value="C:\MahiOS\"
                  className="w-full bg-[#e8e8e8] border border-gray-400 p-1 text-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-gray-600 mb-0.5">Shortcut key:</label>
                  <input
                    type="text"
                    readOnly
                    value="None"
                    className="w-full bg-[#e8e8e8] border border-gray-400 p-1 text-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Run:</label>
                  <input
                    type="text"
                    readOnly
                    value="Normal window"
                    className="w-full bg-[#e8e8e8] border border-gray-400 p-1 text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY & DATABASE */}
          {activeTab === 'telemetry' && (
            <div className="space-y-2.5 text-[11px]">
              <div className="p-2 bg-white border border-gray-400 retro-box-inset font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Component Key:</span>
                  <span className="font-bold text-[#000080]">{app.component_key}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="capitalize">{app.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">System App:</span>
                  <span>{app.is_system_app ? 'TRUE (Protected)' : 'FALSE (User)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Default Geometry:</span>
                  <span>{app.default_width} × {app.default_height} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Database Binding:</span>
                  <span className="text-emerald-700 font-bold">PostgreSQL Live</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-600 font-mono bg-blue-50 p-2 border border-blue-200">
                ℹ️ Synchronized in real time with Supabase cluster. Edits made in the Admin Dashboard automatically bind to this application instance.
              </div>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-400">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="px-4 py-1 retro-btn font-bold cursor-pointer text-xs"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="px-4 py-1 retro-btn cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled
              className="px-4 py-1 retro-btn opacity-50 cursor-not-allowed text-xs"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
