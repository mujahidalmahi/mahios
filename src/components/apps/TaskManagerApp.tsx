'use client';

import React, { useState, useEffect } from 'react';
import { Activity, XCircle, ExternalLink, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';

export default function TaskManagerApp() {
  const { windows, closeWindow, focusWindow } = useWindowStore();
  const { playSound } = useSystemStore();
  const [activeTab, setActiveTab] = useState<'apps' | 'performance' | 'processes'>('apps');
  const [selectedWinId, setSelectedWinId] = useState<string | null>(null);

  // Simulated live CPU usage waveform
  const [cpuUsage, setCpuUsage] = useState(14);
  const [history, setHistory] = useState<number[]>([12, 14, 18, 15, 13, 22, 19, 14, 16, 15, 20]);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = Math.floor(Math.random() * 25) + 8;
      setCpuUsage(next);
      setHistory((prev) => [...prev.slice(1), next]);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleEndTask = () => {
    if (selectedWinId) {
      playSound('error');
      closeWindow(selectedWinId);
      setSelectedWinId(null);
    }
  };

  const handleSwitchTo = () => {
    if (selectedWinId) {
      playSound('open');
      focusWindow(selectedWinId);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between text-black text-xs font-sans select-none space-y-2">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-gray-400 pb-1">
        {[
          { key: 'apps', label: 'Applications' },
          { key: 'performance', label: 'Performance' },
          { key: 'processes', label: 'Processes' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`px-3 py-1 retro-btn cursor-pointer font-bold ${
              activeTab === key ? 'bg-white shadow-inner' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {/* TAB 1: RUNNING APPLICATIONS */}
        {activeTab === 'apps' && (
          <div className="space-y-2">
            <div className="bg-white border-2 border-[#808080] retro-box-inset min-h-[220px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#e0e0e0] border-b border-gray-300 font-bold">
                    <th className="p-1.5 border-r border-gray-300">Task Name</th>
                    <th className="p-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {windows.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-6 text-center text-gray-400 font-mono">
                        No active application windows currently open.
                      </td>
                    </tr>
                  ) : (
                    windows.map((win) => (
                      <tr
                        key={win.id}
                        onClick={() => setSelectedWinId(win.appId)}
                        className={`cursor-pointer border-b border-gray-100 ${
                          selectedWinId === win.appId ? 'bg-[#000080] text-white' : 'hover:bg-blue-50'
                        }`}
                      >
                        <td className="p-1.5 font-bold flex items-center gap-2">
                          <span>📁</span>
                          <span>{win.title}</span>
                        </td>
                        <td className="p-1.5 font-mono text-[10px]">
                          {win.isMinimized ? 'Minimized' : 'Running'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={!selectedWinId}
                onClick={handleEndTask}
                className="px-3 py-1 retro-btn font-bold cursor-pointer disabled:opacity-40 text-red-900"
              >
                End Task
              </button>
              <button
                type="button"
                disabled={!selectedWinId}
                onClick={handleSwitchTo}
                className="px-3 py-1 retro-btn font-bold cursor-pointer disabled:opacity-40 text-blue-900"
              >
                Switch To
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PERFORMANCE & WAVEFORM */}
        {activeTab === 'performance' && (
          <div className="space-y-3 p-1">
            {/* CPU Waveform */}
            <div className="bg-black p-3 rounded-xs border-2 border-[#808080] retro-box-inset font-mono text-[#00ff66]">
              <div className="flex items-center justify-between border-b border-[#003300] pb-1 mb-2 text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  CPU Usage History: {cpuUsage}%
                </span>
                <span className="text-[10px]">600 MHz Virtual Core</span>
              </div>

              {/* Sparkline visualization */}
              <div className="h-28 flex items-end gap-1.5 pt-2 px-1 border border-[#003300]">
                {history.map((val, idx) => (
                  <div key={idx} className="flex-1 bg-[#003300] h-full flex flex-col justify-end">
                    <div
                      className="bg-[#00ff66] w-full transition-all duration-300"
                      style={{ height: `${Math.min(100, val * 3)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RAM Meter */}
            <div className="p-3 bg-[#e8e8e8] border border-gray-400 retro-box-inset space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span>Physical Memory Footprint:</span>
                <span className="font-mono">34.8 MB / 64.0 MB</span>
              </div>
              <div className="w-full h-3 bg-white border border-gray-500 overflow-hidden">
                <div className="h-full bg-[#000080]" style={{ width: '54%' }} />
              </div>
              <div className="text-[10px] text-gray-500 font-mono flex justify-between">
                <span>Allocated: 54%</span>
                <span>Available: 29.2 MB</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM PROCESSES */}
        {activeTab === 'processes' && (
          <div className="bg-white border-2 border-[#808080] retro-box-inset overflow-y-auto max-h-[260px]">
            <table className="w-full text-left border-collapse text-[10px] font-mono">
              <thead>
                <tr className="bg-[#e4e4e4] border-b border-gray-300 font-bold text-gray-700">
                  <th className="p-1">Image Name</th>
                  <th className="p-1">PID</th>
                  <th className="p-1">CPU</th>
                  <th className="p-1">Mem Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: 'System Idle Process', pid: 0, cpu: '86%', mem: '16 K' },
                  { name: 'mahios_kernel.exe', pid: 4, cpu: '6%', mem: '4,210 K' },
                  { name: 'window_manager.sys', pid: 142, cpu: '4%', mem: '3,840 K' },
                  { name: 'webaudio_synth.drv', pid: 218, cpu: '1%', mem: '1,420 K' },
                  { name: 'crt_shader_gl.dll', pid: 304, cpu: '2%', mem: '5,100 K' },
                  { name: 'supabase_sync.daemon', pid: 412, cpu: '1%', mem: '2,680 K' },
                  { name: 'turbopack_engine.bin', pid: 520, cpu: '0%', mem: '6,400 K' },
                ].map((proc) => (
                  <tr key={proc.pid} className="hover:bg-blue-50">
                    <td className="p-1 font-bold text-slate-900">{proc.name}</td>
                    <td className="p-1 text-gray-600">{proc.pid}</td>
                    <td className="p-1 text-emerald-700">{proc.cpu}</td>
                    <td className="p-1 text-blue-900">{proc.mem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Status */}
      <div className="h-5 bg-[#d4d0c8] border-t border-gray-400 px-2 flex items-center justify-between text-[10px] font-mono text-gray-700">
        <span>Processes: 7</span>
        <span>CPU Usage: {cpuUsage}%</span>
        <span>Mem Usage: 54%</span>
      </div>
    </div>
  );
}
