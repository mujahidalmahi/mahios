'use client';

import React, { useState } from 'react';
import { Trash2, RotateCcw, FileText, FileCode, Check, AlertCircle } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

interface TrashedItem {
  id: string;
  name: string;
  originalLocation: string;
  dateDeleted: string;
  size: string;
  type: string;
}

const initialTrash: TrashedItem[] = [
  {
    id: 't-1',
    name: 'Unused_jQuery_Plugins.zip',
    originalLocation: 'C:\\Projects\\LegacyWeb\\',
    dateDeleted: '2023-04-12 14:32',
    size: '14.2 MB',
    type: 'Compressed Archive',
  },
  {
    id: 't-2',
    name: 'Legacy_Bugs_Fixed.log',
    originalLocation: 'C:\\System32\\Logs\\',
    dateDeleted: '2025-11-04 09:15',
    size: '84 KB',
    type: 'Log File',
  },
  {
    id: 't-3',
    name: 'Draft_Resume_2021_Outdated.pdf',
    originalLocation: 'C:\\Documents\\Resumes\\',
    dateDeleted: '2024-02-18 18:20',
    size: '2.1 MB',
    type: 'Adobe PDF Document',
  },
  {
    id: 't-4',
    name: 'Overcomplicated_CSS_Framework.scss',
    originalLocation: 'C:\\Projects\\Styles\\',
    dateDeleted: '2025-08-22 11:45',
    size: '512 KB',
    type: 'SCSS Stylesheet',
  },
  {
    id: 't-5',
    name: 'Hardcoded_Passwords.txt',
    originalLocation: 'C:\\Security\\Purged\\',
    dateDeleted: '2026-09-02 22:20',
    size: '1 KB',
    type: 'Plain Text (Permanently Purged)',
  },
];

export default function RecycleBinApp() {
  const [items, setItems] = useState<TrashedItem[]>(initialTrash);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { playSound } = useSystemStore();

  const handleEmpty = () => {
    playSound('error');
    setItems([]);
    setMessage('Recycle Bin has been completely emptied. 16.9 MB of disk space recovered!');
    setTimeout(() => setMessage(null), 3500);
  };

  const handleRestore = (id: string) => {
    playSound('click');
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setMessage(`Restored "${item?.name || 'File'}" to original location.`);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-3 text-black text-xs font-sans select-none">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between p-1.5 bg-[#d4d0c8] border-b border-gray-400">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#000080]">
          <Trash2 className="w-4 h-4" />
          <span>Recycle Bin ({items.length} items)</span>
        </div>

        <div className="flex items-center gap-2">
          {selectedId && (
            <button
              type="button"
              onClick={() => handleRestore(selectedId)}
              className="px-2.5 py-1 retro-btn flex items-center gap-1 font-bold cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-700" />
              <span>Restore Item</span>
            </button>
          )}

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleEmpty}
            className="px-2.5 py-1 retro-btn flex items-center gap-1 font-bold cursor-pointer disabled:opacity-40 text-xs text-red-900"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Recycle Bin</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-2 bg-emerald-100 border border-emerald-500 text-emerald-900 rounded-xs flex items-center gap-2 font-mono text-[11px]">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Files List Table */}
      <div className="bg-white border-2 border-[#808080] retro-box-inset min-h-[260px] overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#e4e4e4] border-b border-gray-300 font-bold select-none text-gray-700">
              <th className="p-1.5 border-r border-gray-300">Name</th>
              <th className="p-1.5 border-r border-gray-300">Original Location</th>
              <th className="p-1.5 border-r border-gray-300">Date Deleted</th>
              <th className="p-1.5 border-r border-gray-300">Size</th>
              <th className="p-1.5">Item Type</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 font-mono">
                  The Recycle Bin is completely empty.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    playSound('click');
                    setSelectedId(item.id);
                  }}
                  className={`cursor-pointer border-b border-gray-100 ${
                    selectedId === item.id ? 'bg-[#000080] text-white' : 'hover:bg-blue-50 text-black'
                  }`}
                >
                  <td className="p-1.5 flex items-center gap-1.5 font-bold">
                    <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span>{item.name}</span>
                  </td>
                  <td className="p-1.5 font-mono text-[10px]">{item.originalLocation}</td>
                  <td className="p-1.5 font-mono text-[10px]">{item.dateDeleted}</td>
                  <td className="p-1.5 font-mono text-[10px]">{item.size}</td>
                  <td className="p-1.5 text-[10px] truncate">{item.type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-gray-500 font-mono flex items-center justify-between px-1">
        <span>Total deleted volume: {items.length > 0 ? '16.9 MB' : '0 Bytes'}</span>
        <span>Items deleted can be restored to their original directories.</span>
      </div>
    </div>
  );
}
