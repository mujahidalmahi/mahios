'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TerminalCommand, BiographyDatabaseData } from '@/types/database';
import { useWindowStore } from '@/stores/windowStore';
import { useBootStore } from '@/stores/bootStore';
import { useSystemStore } from '@/stores/systemStore';

interface TerminalAppProps {
  commands?: TerminalCommand[];
  data?: BiographyDatabaseData;
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
  'system.ini': '[MahiOS 05]\nVersion=5.10.2005\nKernel=Modular Quantum RISC-V\nDisplay=1024x768 (High-Res TrueColor)\nAudio=WebAudio 8-Bit Synthesizer',
};

export default function TerminalApp({ commands = [], data }: TerminalAppProps) {
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', type: 'output', text: 'MahiOS 05 Command Terminal [Version 5.10.2005]' },
    { id: '2', type: 'output', text: '(C) 2005-2026 Mujahid Al Mahi. All rights reserved.' },
    { id: '3', type: 'output', text: 'Type "show" to inspect application telemetry, or "help" for command directory.' },
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
    'show', 'open', 'help', 'about', 'skills', 'experience', 'projects', 'feed',
    'contact', 'clear', 'cls', 'matrix', 'reboot', 'whoami', 'quote', 'date',
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

    // OPEN / START APP
    if (cmd === 'open' || cmd === 'start') {
      const target = args[0]?.toLowerCase();
      if (!target) {
        newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: open <app_id> (e.g., open feed, open notepad, open calculator, open projects)' });
      } else {
        const found = data?.apps?.find(
          (a) => a.app_id.toLowerCase() === target || a.id.toLowerCase() === target || a.title.toLowerCase().includes(target)
        );
        if (found) {
          openWindow(found);
          newHistory.push({ id: `out-${Date.now()}`, type: 'success', text: `Launched window: "${found.title}" [${found.app_id}.exe]` });
        } else {
          newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: `Application "${target}" not found. Type "show apps" to list all registered apps.` });
        }
      }
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // SHOW (Issue 5: Comprehensive Telemetry & Inspection)
    if (cmd === 'show') {
      const sub = args[0]?.toLowerCase();

      if (!sub || sub === 'help') {
        const directory = `
================================================================================
MAHIOS 05 APPLICATION DATA TELEMETRY & INSPECTION ENGINE
================================================================================
Subcommand             Application / Telemetry Domain
--------------------------------------------------------------------------------
show feed              Display last 3 broadcast posts from Live Pulse
show projects          Inspect active engineering projects & architecture
show experience        Display employment history, roles & tenure
show skills            Output full-stack technical radar & competencies
show bio               Inspect chronological life timeline & biography
show blog              Display recent engineering publications & notes
show education         Inspect verified academic degrees & institutions
show achievements      List engineering honors, hackathons & awards
show contact           Print official communication coordinates
show philosophy        Display core engineering mental models & principles
show ideology          Print technology ethics & open-source manifesto
show aim               Display strategic targets & roadmap
show dream             Inspect long-term grand vision & futuristic goals
show wishes            Display the 3 existential wishes
show favourites        List curated developer hall of fame & benchmarks
show entertainment     Display bookshelf, gaming records & media
show sysinfo           Print hardware architecture & RISC-V host telemetry
show storage           Display virtual FAT32 drive partitions & disk meters
show apps              List all 28 registered applications & launch IDs
--------------------------------------------------------------------------------
Usage: Type 'show <subcommand>' to inspect live data.
       Type 'open <app_id>' to launch any graphical window.`;
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: directory });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW FEED (Last 3 posts)
      if (sub === 'feed') {
        const posts = (data?.feedPosts || []).slice(0, 3);
        if (posts.length === 0) {
          newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: 'Live Feed: No broadcast pulses recorded yet.' });
        } else {
          const lines = posts.map((p, idx) => {
            return `[PULSE #${idx + 1}]  ${p.timestamp}  |  Tag: #${p.tag}  |  Likes: ${p.likes_count || 0}\n  ${p.content}`;
          }).join('\n--------------------------------------------------------------------------------\n');
          newHistory.push({
            id: `out-${Date.now()}`,
            type: 'output',
            text: `\n=== LIVE PULSE: LAST ${posts.length} TRANSMISSIONS ===\n\n${lines}\n`
          });
        }
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW PROJECTS
      if (sub === 'projects' || sub === 'project') {
        const projs = (data?.projects || []).slice(0, 4);
        const lines = projs.map((p, idx) => 
          `[PROJECT ${idx + 1}] ${p.title} (${p.slug})\n  Summary: ${p.summary}\n  Stack: [${(p.tags || []).join(', ')}]\n  Source/Demo: ${p.live_url || p.github_url || 'https://mujahidmahi.me'}`
        ).join('\n\n');
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `\n=== ENGINEERING REPOSITORIES (${data?.projects?.length || 0} Total) ===\n\n${lines}\n\nType "open projects" to view full interactive gallery.`
        });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW EXPERIENCE
      if (sub === 'experience' || sub === 'exp') {
        const exps = data?.experiences || [];
        const lines = exps.map((e) =>
          `* ${e.role} at ${e.company} (${e.start_date} - ${e.end_date || 'Present'})\n  Location: ${e.location} | Type: ${e.employment_type}\n  Achievements: ${e.achievements?.join('; ') || 'Engineered production systems.'}`
        ).join('\n\n');
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `\n=== CAREER HISTORY & ENGINEERING ROLES ===\n\n${lines}\n`
        });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW SKILLS
      if (sub === 'skills' || sub === 'skill') {
        const skills = data?.skills || [];
        const categories = data?.categories || [];
        let output = '\n=== TECHNICAL STACK & PROFICIENCY RADAR ===\n\n';
        if (categories.length > 0) {
          categories.forEach((cat) => {
            const catSkills = skills.filter((s) => s.category_id === cat.id);
            if (catSkills.length > 0) {
              output += `[${cat.name}]\n  ` + catSkills.map((s) => `${s.name} (${s.proficiency}%)`).join(', ') + '\n\n';
            }
          });
        } else {
          output += skills.map((s) => `${s.name} (${s.proficiency}%)`).join(', ') + '\n';
        }
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: output });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW BIO
      if (sub === 'bio' || sub === 'biography' || sub === 'about') {
        const about = data?.about;
        const timeline = data?.biographyTimeline || [];
        let output = `\n=== BIOGRAPHY: ${about?.full_name || 'Mujahid Al Mahi'} ===\n`;
        output += `Headline: ${about?.taglines?.join(' | ') || 'Full-Stack Software Engineer'}\n`;
        output += `Location: ${about?.location || 'Dhaka, Bangladesh'}\n`;
        output += `Status: ${about?.status_text || 'Available for engineering collaborations'}\n\n`;
        output += '--- Chronological Timeline Milestones ---\n';
        timeline.forEach((t) => {
          output += `[${t.period}] ${t.title}: ${t.key_learning}\n`;
        });
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: output });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW BLOG
      if (sub === 'blog' || sub === 'posts') {
        const posts = (data?.blogPosts || []).slice(0, 3);
        const lines = posts.map((p) =>
          `* ${p.title} (${p.read_time_minutes} min read)\n  Published: ${p.published_at || 'Recent'}\n  Excerpt: ${p.excerpt}`
        ).join('\n\n');
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `\n=== RECENT TECHNICAL ARTICLES ===\n\n${lines}\n`
        });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW EDUCATION
      if (sub === 'education' || sub === 'edu') {
        const edus = data?.education || [];
        const lines = edus.map((e) =>
          `* ${e.degree} in ${e.field_of_study}\n  Institution: ${e.institution}\n  Tenure: ${e.start_year} - ${e.end_year || 'Present'}\n  Grade/Honors: ${e.grade || 'N/A'}`
        ).join('\n\n');
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `\n=== ACADEMIC CREDENTIALS ===\n\n${lines}\n`
        });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW ACHIEVEMENTS
      if (sub === 'achievements' || sub === 'awards') {
        const achs = data?.achievements || [];
        const lines = achs.map((a) =>
          `* [${a.issue_date || '2026'}] ${a.title}\n  Issuer: ${a.issuer}\n  Details: ${a.description || 'Verified honor'}`
        ).join('\n\n');
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `\n=== HONORS & ACHIEVEMENTS ===\n\n${lines}\n`
        });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW CONTACT
      if (sub === 'contact' || sub === 'links') {
        const settings = data?.settings;
        const text = `
=== OFFICIAL COMMUNICATION COORDINATES ===
Owner: ${settings?.owner_name || 'Mujahid Al Mahi'}
Email: ${settings?.email || 'mujahidmahi.official@gmail.com'}
Website: https://mujahidmahi.me
Location: ${settings?.location || 'Dhaka, Bangladesh (GMT+6)'}
GitHub: ${settings?.github_url || 'https://github.com/mujahidalmahi'}
LinkedIn: ${settings?.linkedin_url || 'https://linkedin.com/in/mujahidmahi'}
Twitter/X: ${settings?.twitter_url || 'https://twitter.com/mujahidmahi'}
`;
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW PHILOSOPHY / IDEOLOGY / AIM / DREAM / WISHES / FAVOURITES
      if (sub === 'philosophy') {
        const items = data?.philosophies || [];
        const lines = items.map((p) => `* [${p.axiom}] ${p.title}: ${p.description}`).join('\n\n');
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `\n=== CORE PHILOSOPHY & MENTAL MODELS ===\n\n${lines}\n` });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      if (sub === 'ideology') {
        const items = data?.ideologies || [];
        const lines = items.map((i) => `* ${i.title} (${i.subtitle}): ${i.summary}`).join('\n\n');
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `\n=== TECH ETHICS & ARCHITECTURAL IDEOLOGY ===\n\n${lines}\n` });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      if (sub === 'aim' || sub === 'aims') {
        const items = data?.aims || [];
        const lines = items.map((a) => `* [${a.timeline_target}] ${a.goal_title} (${a.progress_percentage}% - ${a.status})`).join('\n\n');
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `\n=== STRATEGIC AIM & ROADMAP ===\n\n${lines}\n` });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      if (sub === 'dream' || sub === 'dreams') {
        const items = data?.dreams || [];
        const lines = items.map((d) => `* [${d.horizon}] ${d.title} (${d.impact_area}):\n  ${d.vision_manifesto}`).join('\n\n');
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `\n=== GRAND VISION & ASPIRATIONS ===\n\n${lines}\n` });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      if (sub === 'wishes' || sub === 'wish') {
        const items = data?.wishes || [];
        const lines = items.map((w) => `Wish #${w.wish_number}: ${w.title} [Scope: ${w.impact_scope}]\n  ${w.deep_reason}`).join('\n\n');
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `\n=== THE 3 EXISTENTIAL WISHES ===\n\n${lines}\n` });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      if (sub === 'favourites' || sub === 'favorites') {
        const items = data?.favourites || [];
        const lines = items.map((f) => `* ${f.item_name} [${f.category} / ${f.subcategory}]: ${f.reason} (${f.rating}/5★)`).join('\n');
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `\n=== PERSONAL HALL OF FAME ===\n\n${lines}\n` });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      if (sub === 'storage') {
        const diskInfo = `
=== FAT32 FILESYSTEM PARTITIONS & TELEMETRY ===
Drive (C:) SYSTEM_FAT32  -  1,248 MB used  /  2,048 MB total  [OK]
Drive (D:) MEDIA_FAT32   -  4,820 MB used  /  8,192 MB total  [OK]
Drive (A:) 3.5" FLOPPY   -  1,440 KB capacity [Ready]
Drive (E:) CD-ROM OPTICAL-  650 MB ISO9660 Volume [Mounted]
Filesystem driver: Next.js Virtual VirtualFS / V8 Memory Space
`;
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: diskInfo });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      if (sub === 'sysinfo') {
        const banner = `
       __  __       _     _  ____   _____ 
      |  \\/  |     | |   (_)/ __ \\ / ____|
      | \\  / | __ _| |__  _| |  | | (___  
      | |\\/| |/ _\` | '_ \\| | |  | |\\___ \\ 
      | |  | | (_| | | | | | |__| |____) |
      |_|  |_|\\__,_|_| |_|_|\\____/|_____/ 
      
  OS: MahiOS 05 Pro Edition [x86_64]
  Host: Quantum RISC-V 8-Core @ 4.80 GHz
  Kernel: 2026.09.02-release
  Uptime: Active Web Session
  Memory: 65,536 KB / 65,536 KB
  Shell: MahiOS Command Terminal v5.10
  Resolution: 1024x768 TrueColor
        `;
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: banner });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      // SHOW APPS
      if (sub === 'apps') {
        const apps = data?.apps || [];
        const lines = apps.map((a, i) => `  ${(i + 1).toString().padStart(2, ' ')}. [${a.app_id}] ${a.title.padEnd(22, ' ')} -> type 'open ${a.app_id}'`).join('\n');
        newHistory.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `\n=== ALL 28 REGISTERED APPLICATIONS ===\n\n${lines}\n`
        });
        setHistory(newHistory);
        setInputVal('');
        return;
      }

      newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: `Unknown telemetry target: "${sub}". Type "show" for directory.` });
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
      
  OS: MahiOS 05 Pro Edition [x86_64]
  Host: Quantum RISC-V 8-Core @ 4.80 GHz
  Kernel: 2026.09.02-release
  Uptime: Active Web Session
  Memory: 65,536 KB / 65,536 KB
  Shell: MahiOS Command Terminal v5.10
  Resolution: 1024x768 TrueColor
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

    // HELP
    if (cmd === 'help') {
      const helpText = `
MahiOS 05 Command Directory:
  show [target]   Inspect application live data (e.g. show feed, show projects)
  open <app_id>   Launch graphical window (e.g. open calculator, open feed)
  help            Show this command manual
  clear / cls     Clear the terminal screen
  dir / ls        List virtual files in C:\\MAHIOS
  cat <file>      Display contents of a file
  calc <expr>     Evaluate arithmetic expressions
  sysinfo         Display system architecture and neofetch banner
  theme <color>   Change desktop background (teal, navy, charcoal, matrix)
  matrix          Toggle phosphor matrix background rain
  reboot          Cold reboot MahiOS 05
  date / time     Print current system timestamp
`;
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: helpText });
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
        text: `Bad command or filename: "${cmd}". Type "show" to inspect application data, or "help" for valid commands.`,
      });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full h-full bg-black text-[#00ff66] font-mono text-xs sm:text-sm p-3 overflow-y-auto flex flex-col justify-between select-text"
    >
      {/* Terminal History */}
      <div className="space-y-1">
        {history.map((item) => (
          <div
            key={item.id}
            className={`whitespace-pre-wrap leading-relaxed ${
              item.type === 'error'
                ? 'text-red-400 font-bold'
                : item.type === 'success'
                ? 'text-cyan-300 font-semibold'
                : item.type === 'input'
                ? 'text-amber-300 font-semibold'
                : 'text-[#00ff66]'
            }`}
          >
            {item.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Prompt Line */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 mt-2 shrink-0 pt-2 border-t border-[#00ff66]/20">
        <span className="text-amber-400 font-bold shrink-0">C:\MAHIOS&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent border-none outline-none text-[#00ff66] font-mono text-xs sm:text-sm p-0 m-0 caret-[#00ff66]"
        />
      </form>
    </div>
  );
}
