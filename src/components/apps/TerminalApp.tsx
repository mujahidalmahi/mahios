'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TerminalCommand } from '@/types/database';
import { useWindowStore } from '@/stores/windowStore';
import { useBootStore } from '@/stores/bootStore';
import { useSystemStore } from '@/stores/systemStore';

interface TerminalAppProps {
  commands: TerminalCommand[];
}

interface HistoryItem {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

const virtualFiles: Record<string, string> = {
  'bio.txt': 'Mujahid Al Mahi -- Full-Stack Software Engineer & Creative Technologist based in Dhaka, Bangladesh. Passionate about Next.js 16, Supabase, TypeScript, and high-performance web systems.',
  'stack.txt': 'Primary Technologies: Next.js 16, React 19, TypeScript, PostgreSQL, Supabase, Tailwind CSS 4, Docker, Redis, TipTap.',
  'contact.txt': 'Direct Mail: mujahidmahi.official@gmail.com\nGitHub: https://github.com/mujahidalmahi\nLinkedIn: https://linkedin.com/in/mujahidmahi\nWebsite: https://mujahidmahi.me',
  'system.ini': '[MahiOS]\nVersion=2.0.26\nKernel=Modular Quantum RISC-V\nDisplay=CRT 1024x768 (High-Res)\nAudio=WebAudio 8-Bit Synthesizer',
};

export default function TerminalApp({ commands }: TerminalAppProps) {
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', type: 'output', text: 'MahiOS MS-DOS Command Prompt v7.10' },
    { id: '2', type: 'output', text: '(C) Copyright Mahi Systems Corp 1995-2026. All rights reserved.' },
    { id: '3', type: 'output', text: 'Type "help" for a list of system commands, or "dir" to list files.' },
    { id: '4', type: 'output', text: '' },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { openWindow } = useWindowStore();
  const { startBoot, toggleMatrixRain } = useBootStore();
  const { playSound, setDesktopBgColor } = useSystemStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const allAvailableCommands = [
    'help', 'about', 'skills', 'experience', 'projects', 'contact',
    'clear', 'cls', 'matrix', 'reboot', 'whoami', 'quote', 'date',
    'time', 'calc', 'echo', 'theme', 'neofetch', 'sysinfo', 'dir',
    'ls', 'cat', 'exit'
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Up Arrow (Previous command)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
    }
    // Down Arrow (Next command)
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
    // Tab Auto-Completion
    else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.trim().toLowerCase();
      if (!current) return;
      const match = allAvailableCommands.find((c) => c.startsWith(current));
      if (match) {
        setInputVal(match);
      }
    }
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    playSound('click');
    setCommandHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);

    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newHistory: HistoryItem[] = [
      ...history,
      { id: `in-${Date.now()}`, type: 'input', text: `C:\\MAHIOS> ${raw}` },
    ];

    // CLS / CLEAR
    if (cmd === 'clear' || cmd === 'cls') {
      setHistory([]);
      setInputVal('');
      return;
    }

    // REBOOT
    if (cmd === 'reboot') {
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: 'Initiating system cold reboot...' });
      setHistory(newHistory);
      setInputVal('');
      setTimeout(() => startBoot(), 600);
      return;
    }

    // MATRIX
    if (cmd === 'matrix') {
      toggleMatrixRain();
      newHistory.push({ id: `out-${Date.now()}`, type: 'success', text: 'Matrix phosphor rain toggled in background.' });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // DIR / LS
    if (cmd === 'dir' || cmd === 'ls') {
      const fileList = Object.keys(virtualFiles).map((fn) => `  ${fn.padEnd(16, ' ')}  <FILE>  ${virtualFiles[fn].length} bytes`).join('\n');
      newHistory.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: ` Directory of C:\\MAHIOS\n\n${fileList}\n\n  4 File(s)    ${Object.values(virtualFiles).join('').length} bytes total\n  0 Dir(s)     65,536 KB free`,
      });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // CAT / TYPE
    if (cmd === 'cat' || cmd === 'type') {
      const targetFile = args[0]?.toLowerCase();
      if (!targetFile) {
        newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: cat <filename> (e.g., cat bio.txt)' });
      } else if (virtualFiles[targetFile]) {
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: virtualFiles[targetFile] });
      } else {
        newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: `File not found: "${targetFile}"` });
      }
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // CALC
    if (cmd === 'calc') {
      const expr = args.join(' ');
      if (!expr) {
        newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: calc <expression> (e.g. calc 128 * 4)' });
      } else {
        try {
          // Safe math evaluator restricted to numbers and basic operators
          const sanitized = expr.replace(/[^0-9+\-*/().%]/g, '');
          // eslint-disable-next-line no-eval
          const result = Function(`'use strict'; return (${sanitized})`)();
          newHistory.push({ id: `out-${Date.now()}`, type: 'success', text: `= ${result}` });
        } catch {
          newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Invalid mathematical expression' });
        }
      }
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // ECHO
    if (cmd === 'echo') {
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: args.join(' ') });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // THEME
    if (cmd === 'theme') {
      const target = args[0]?.toLowerCase();
      const themeColors: Record<string, string> = {
        teal: '#008080',
        navy: '#000080',
        charcoal: '#18191c',
        matrix: '#0a140a',
        grey: '#808080',
        purple: '#2d1b4e',
      };
      if (themeColors[target]) {
        setDesktopBgColor(themeColors[target]);
        newHistory.push({ id: `out-${Date.now()}`, type: 'success', text: `Desktop background changed to "${target}" (${themeColors[target]}).` });
      } else {
        newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Available themes: teal, navy, charcoal, matrix, grey, purple' });
      }
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // NEOFETCH / SYSINFO
    if (cmd === 'neofetch' || cmd === 'sysinfo') {
      const banner = `
       __  __       _     _  ____   _____ 
      |  \\/  |     | |   (_)/ __ \\ / ____|
      | \\  / | __ _| |__  _| |  | | (___  
      | |\\/| |/ _\` | '_ \\| | |  | |\\___ \\ 
      | |  | | (_| | | | | | |__| |____) |
      |_|  |_|\\__,_|_| |_|_|\\____/|_____/ 
      
  OS: MahiOS 95 Pro Edition [x86_64]
  Host: Quantum RISC-V 8-Core @ 4.80 GHz
  Kernel: 2026.09.02-release
  Uptime: Active Session
  Memory: 65536 KB / 65536 KB
  Shell: MahiOS Command Prompt v7.10
  Resolution: 1024x768 75Hz CRT
      `;
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: banner });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // DATE / TIME
    if (cmd === 'date' || cmd === 'time') {
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `Current System Time: ${new Date().toString()}` });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // Match with database commands or fallback
    const found = commands.find((c) => c.command.toLowerCase() === cmd);
    if (found) {
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: found.response_text });
    } else {
      newHistory.push({
        id: `err-${Date.now()}`,
        type: 'error',
        text: `Bad command or file name: "${raw}". Type "help" for a list of valid commands.`,
      });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="h-full bg-black text-[#00ff66] font-mono text-xs p-3.5 overflow-y-auto select-text space-y-1.5 cursor-text min-h-[340px]"
    >
      {history.map((item) => (
        <div
          key={item.id}
          className={`${
            item.type === 'input'
              ? 'text-white font-bold'
              : item.type === 'error'
              ? 'text-red-400'
              : item.type === 'success'
              ? 'text-cyan-300 font-semibold'
              : 'text-[#00ff66]'
          } whitespace-pre-wrap break-words leading-relaxed text-[11px] sm:text-xs`}
        >
          {item.text}
        </div>
      ))}

      {/* Input Prompt */}
      <form onSubmit={handleCommand} className="flex items-center gap-1.5 text-white font-bold pt-1">
        <span className="shrink-0 text-[#00ff66]">C:\MAHIOS&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs border-none p-0"
          autoFocus
          spellCheck={false}
        />
      </form>

      <div ref={bottomRef} />
    </div>
  );
}
