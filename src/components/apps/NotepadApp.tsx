'use client';

import React, { useState, useEffect } from 'react';
import { FileEdit, Download, RotateCcw, Copy, Check } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export default function NotepadApp() {
  const [text, setText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mahios_notepad_text') || 'Welcome to MahiOS Notepad v1.0!\n\nUse this vintage scratchpad to jot down quick notes, code snippets, or system thoughts.\nYour text automatically persists in your browser.';
    }
    return 'Welcome to MahiOS Notepad v1.0!';
  });

  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'text-xs' | 'text-sm' | 'text-base'>('text-xs');
  const { playSound } = useSystemStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahios_notepad_text', text);
    }
  }, [text]);

  const handleDownload = () => {
    playSound('click');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Note_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    playSound('click');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    playSound('click');
    if (confirm('Clear entire notepad content?')) {
      setText('');
    }
  };

  const lineCount = text.split('\n').length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="h-full flex flex-col justify-between text-black text-xs font-sans select-none">
      {/* Menu Bar */}
      <div className="flex items-center justify-between p-1 bg-[#d4d0c8] border-b border-gray-400">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownload}
            className="px-2 py-0.5 retro-btn flex items-center gap-1 cursor-pointer font-bold"
          >
            <Download className="w-3 h-3 text-blue-800" />
            <span>Save .TXT</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-0.5 retro-btn flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-0.5 retro-btn flex items-center gap-1 cursor-pointer text-red-900"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Font Toggle */}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-gray-600">Font:</span>
          {(['text-xs', 'text-sm', 'text-base'] as const).map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setFontSize(s)}
              className={`px-1.5 py-0.2 retro-btn cursor-pointer ${fontSize === s ? 'font-bold bg-white' : ''}`}
            >
              {i === 0 ? 'Sm' : i === 1 ? 'Md' : 'Lg'}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 bg-white border-2 border-[#808080] retro-box-inset p-2 overflow-hidden flex flex-col">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing your notes here..."
          className={`w-full h-full resize-none font-mono focus:outline-none leading-relaxed text-slate-900 ${fontSize}`}
        />
      </div>

      {/* Status Bar */}
      <div className="h-5 bg-[#d4d0c8] border-t border-gray-400 px-2 flex items-center justify-between text-[10px] font-mono text-gray-700">
        <div>Windows 95 Text Document (ANSI)</div>
        <div className="flex items-center gap-3">
          <span>Lines: {lineCount}</span>
          <span>Words: {wordCount}</span>
          <span>Chars: {charCount}</span>
        </div>
      </div>
    </div>
  );
}
