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

const getVirtualFiles = (data?: BiographyDatabaseData): Record<string, string> => {
  const s = data?.settings;
  const ab = data?.about;
  const skills = (data?.skills || []).map((sk) => sk.name).join(', ');
  const socials = (data?.socialLinks || [])
    .map((sl) => `  * ${sl.platform_name.padEnd(14, ' ')} : ${sl.url} (${sl.username})`)
    .join('\n');

  return {
    'bio.txt': `${s?.owner_name || ab?.full_name || 'Mujahid Al Mahi'}\nRole: ${s?.headline || ab?.taglines?.join(' | ') || 'Full-Stack Software Engineer'}\nLocation: ${s?.location || ab?.location || 'Dhaka, Bangladesh'}\nStatus: ${s?.status_message || ab?.status_text || 'Available'}\n\n${s?.bio_short || ''}`,
    'contact.txt': `=== OFFICIAL COMMUNICATION COORDINATES ===\nOwner: ${s?.owner_name || ab?.full_name || 'Mujahid Al Mahi'}\nEmail: ${s?.email || 'N/A'}\nPhone: ${s?.phone || 'N/A'}\nLocation: ${s?.location || ab?.location || 'Dhaka, Bangladesh'}\n\nSocial & Professional Channels:\n${socials || `  * GitHub   : ${s?.github_url || 'N/A'}\n  * LinkedIn : ${s?.linkedin_url || 'N/A'}`}`,
    'stack.txt': `=== TECHNICAL RADAR & STACK ===\n${skills || 'C/C++, JS/TS, Python, React, Next.js, PostgreSQL, Docker, Redis'}`,
    'system.ini': `[MahiOS 05]\nVersion=5.10.2005\nOwner=${s?.owner_name || 'Mujahid Al Mahi'}\nKernel=Next.js 16 App Router & Turbopack\nDisplay=1024x768 TrueColor\nAudio=WebAudio 8-Bit Synthesizer`,
  };
};

export default function TerminalApp({ commands = [], data }: TerminalAppProps) {
  const ownerName = data?.settings?.owner_name || 'Mujahid Al Mahi';
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', type: 'output', text: 'MahiOS 05 Command Terminal [Version 5.10.2005]' },
    { id: '2', type: 'output', text: `(C) 2005-2026 ${ownerName}. All rights reserved.` },
    { id: '3', type: 'output', text: 'Type "help" for commands, or "contact" for communication coordinates.' },
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

  const allAvailableCommands = Array.from(
    new Set([
      'show', 'open', 'help', 'about', 'bio', 'skills', 'stack', 'experience', 'exp',
      'projects', 'project', 'feed', 'contact', 'socials', 'links', 'resume', 'cv',
      'clear', 'cls', 'matrix', 'reboot', 'whoami', 'quote', 'date', 'time', 'calc',
      'echo', 'theme', 'wallpaper', 'neofetch', 'sysinfo', 'dir', 'ls', 'cat', 'exit',
      ...commands.map((c) => c.command.toLowerCase()),
    ])
  );

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
      if (sub === 'contact' || sub === 'links' || sub === 'socials') {
        const s = data?.settings;
        const socials = data?.socialLinks || [];
        let text = `\n=== OFFICIAL COMMUNICATION COORDINATES ===\n\n`;
        text += `  Owner     : ${s?.owner_name || data?.about?.full_name || 'Mujahid Al Mahi'}\n`;
        if (s?.headline) text += `  Headline  : ${s.headline}\n`;
        if (s?.email)    text += `  Email     : ${s.email}\n`;
        if (s?.phone)    text += `  Phone     : ${s.phone}\n`;
        if (s?.location || data?.about?.location) {
          text += `  Location  : ${s?.location || data?.about?.location}\n`;
        }
        if (socials.length > 0) {
          text += `\n  --- Verified Social & Professional Channels ---\n`;
          socials.forEach((sl) => {
            text += `  * ${sl.platform_name.padEnd(14, ' ')} : ${sl.url} (${sl.username})\n`;
          });
        } else {
          if (s?.github_url)   text += `  * GitHub         : ${s.github_url}\n`;
          if (s?.linkedin_url) text += `  * LinkedIn       : ${s.linkedin_url}\n`;
          if (s?.twitter_url)  text += `  * Twitter/X      : ${s.twitter_url}\n`;
        }
        text += `\nType "open contact" or "open socials" to launch interactive applications.\n`;
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
      const vFiles = getVirtualFiles(data);
      const fileList = Object.keys(vFiles)
        .map((fn) => `  ${fn.padEnd(16, ' ')}  <FILE>  ${vFiles[fn].length} bytes`)
        .join('\n');
      newHistory.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: ` Directory of C:\\MAHIOS\n\n${fileList}\n\n  ${Object.keys(vFiles).length} File(s)    ${Object.values(vFiles).join('').length} bytes total\n  0 Dir(s)     65,536 KB free`,
      });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // CAT / TYPE
    if (cmd === 'cat' || cmd === 'type') {
      const targetFile = args[0]?.toLowerCase();
      const vFiles = getVirtualFiles(data);
      if (!targetFile) {
        newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: cat <filename> (e.g., cat contact.txt, cat bio.txt)' });
      } else if (vFiles[targetFile]) {
        newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: vFiles[targetFile] });
      } else {
        newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: `File not found: "${targetFile}". Type "dir" to list files.` });
      }
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // CONTACT / SOCIALS / LINKS
    if (cmd === 'contact' || cmd === 'socials' || cmd === 'links') {
      const s = data?.settings;
      const socials = data?.socialLinks || [];
      let text = `\n=== OFFICIAL COMMUNICATION COORDINATES ===\n\n`;
      text += `  Owner     : ${s?.owner_name || data?.about?.full_name || 'Mujahid Al Mahi'}\n`;
      if (s?.headline) text += `  Headline  : ${s.headline}\n`;
      if (s?.email)    text += `  Email     : ${s.email}\n`;
      if (s?.phone)    text += `  Phone     : ${s.phone}\n`;
      if (s?.location || data?.about?.location) {
        text += `  Location  : ${s?.location || data?.about?.location}\n`;
      }
      if (socials.length > 0) {
        text += `\n  --- Verified Social & Professional Channels ---\n`;
        socials.forEach((sl) => {
          text += `  * ${sl.platform_name.padEnd(14, ' ')} : ${sl.url} (${sl.username})\n`;
        });
      } else {
        if (s?.github_url)   text += `  * GitHub         : ${s.github_url}\n`;
        if (s?.linkedin_url) text += `  * LinkedIn       : ${s.linkedin_url}\n`;
        if (s?.twitter_url)  text += `  * Twitter/X      : ${s.twitter_url}\n`;
      }
      text += `\nType "open contact" or "open socials" to launch interactive applications.\n`;
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // ABOUT / BIO
    if (cmd === 'about' || cmd === 'bio') {
      const s = data?.settings;
      const ab = data?.about;
      let text = `\n=== BIOGRAPHY: ${s?.owner_name || ab?.full_name || 'Mujahid Al Mahi'} ===\n\n`;
      if (s?.headline) text += `  Role       : ${s.headline}\n`;
      if (ab?.taglines && ab.taglines.length > 0) {
        text += `  Focus      : ${ab.taglines.join(' | ')}\n`;
      }
      if (s?.location || ab?.location) {
        text += `  Location   : ${s?.location || ab?.location}\n`;
      }
      if (ab?.experience_years) {
        text += `  Tenure     : ${ab.experience_years}+ Years Professional Experience\n`;
      }
      if (s?.status_message || ab?.status_text) {
        text += `  Status     : ${s?.status_message || ab?.status_text}\n`;
      }
      if (s?.bio_short) {
        text += `\n  Overview:\n  ${s.bio_short}\n`;
      }
      if (ab?.quote) {
        text += `\n  Quote: "${ab.quote}" -- ${ab.quote_author || 'Mahi'}\n`;
      }
      text += `\nType "open about" or "open biography" for complete interactive story.\n`;
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // WHOAMI
    if (cmd === 'whoami') {
      const s = data?.settings;
      newHistory.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `Active Operator: ${s?.owner_name || 'Mujahid Al Mahi'} [Guest Shell Session @ ${s?.location || 'Dhaka, Bangladesh'}]`,
      });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // SKILLS / STACK
    if (cmd === 'skills' || cmd === 'stack') {
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
      output += 'Type "open skills" for interactive domain and ranked radar visualizer.\n';
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: output });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // PROJECTS / PROJECT
    if (cmd === 'projects' || cmd === 'project') {
      const projs = data?.projects || [];
      const lines = projs.map((p, idx) =>
        `[#${idx + 1}] ${p.title} (${p.slug})\n  Summary: ${p.summary}\n  Stack: [${(p.tags || []).join(', ')}]\n  Source/Demo: ${p.live_url || p.github_url || 'N/A'}`
      ).join('\n\n');
      newHistory.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `\n=== ACTIVE SOFTWARE PROJECTS (${projs.length} Total) ===\n\n${lines}\n\nType "open projects" to view full interactive app.`
      });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // EXPERIENCE / EXP
    if (cmd === 'experience' || cmd === 'exp') {
      const exps = data?.experiences || [];
      const lines = exps.map((e) =>
        `* ${e.role} at ${e.company} (${e.start_date} - ${e.end_date || 'Present'})\n  Location: ${e.location} | Type: ${e.employment_type}\n  Achievements: ${e.achievements?.join('; ') || 'Production system engineering'}`
      ).join('\n\n');
      newHistory.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `\n=== CAREER MILESTONES & ENGINEERING ROLES ===\n\n${lines}\n\nType "open experience" for interactive career timeline.`
      });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // RESUME / CV
    if (cmd === 'resume' || cmd === 'cv') {
      const rc = data?.resumeConfig;
      let text = `\n=== CURRICULUM VITAE / RESUME ===\n\n`;
      text += `  Candidate: ${data?.settings?.owner_name || 'Mujahid Al Mahi'}\n`;
      text += `  File     : ${rc?.download_filename || 'Mujahid_Al_Mahi_Resume.pdf'}\n`;
      text += `  Revision : ${rc?.last_updated_date || 'September 2026'}\n`;
      if (rc?.pdf_url) {
        text += `  URL      : ${rc.pdf_url}\n`;
      }
      if (rc?.summary_markdown) {
        text += `\n  Summary:\n  ${rc.summary_markdown}\n`;
      }
      text += `\nType "open resume" to preview or download PDF.\n`;
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // QUOTE
    if (cmd === 'quote') {
      const ab = data?.about;
      const quote = ab?.quote || 'Simplicity is prerequisite for reliability.';
      const author = ab?.quote_author || 'Edsger W. Dijkstra';
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: `\n"${quote}"\n  -- ${author}\n` });
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

    // THEME / WALLPAPER
    if (cmd === 'theme' || cmd === 'wallpaper') {
      const target = args.join(' ').trim();
      const themeColors: Record<string, string> = {
        teal: '#008080',
        navy: '#000080',
        charcoal: '#18191c',
        matrix: '#0a140a',
        grey: '#808080',
        purple: '#2d1b4e',
      };
      if (themeColors[target.toLowerCase()]) {
        setDesktopBgColor(themeColors[target.toLowerCase()]);
        newHistory.push({ id: `out-${Date.now()}`, type: 'success', text: `Desktop background changed to "${target}" (${themeColors[target.toLowerCase()]}).` });
      } else if (target && (target.startsWith('#') || target.startsWith('http') || target.startsWith('/'))) {
        setDesktopBgColor(target);
        newHistory.push({ id: `out-${Date.now()}`, type: 'success', text: `Desktop wallpaper updated to: ${target}` });
      } else {
        newHistory.push({ id: `err-${Date.now()}`, type: 'error', text: 'Usage: theme <preset | #hex | image_url>\nPresets: teal, navy, charcoal, matrix, grey, purple' });
      }
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // NEOFETCH / SYSINFO
    if (cmd === 'neofetch' || cmd === 'sysinfo') {
      const s = data?.settings;
      const banner = `
       __  __       _     _  ____   _____ 
      |  \\/  |     | |   (_)/ __ \\ / ____|
      | \\  / | __ _| |__  _| |  | | (___  
      | |\\/| |/ _\` | '_ \\| | |  | |\\___ \\ 
      | |  | | (_| | | | | | |__| |____) |
      |_|  |_|\\__,_|_| |_|_|\\____/|_____/ 
      
  OS: MahiOS 05 Pro Edition [x86_64]
  Owner: ${s?.owner_name || 'Mujahid Al Mahi'}
  Location: ${s?.location || 'Dhaka, Bangladesh'}
  Host: Quantum Web Kernel Architecture
  Kernel: Next.js 16 App Router & Turbopack
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
  help            - Show this command directory
  contact         - Official communication coordinates & social channels
  about           - Biographical summary and engineering focus
  skills / stack  - Technical radar and competencies
  projects        - Active software repositories and architectures
  experience      - Career history, employers and tenure
  resume / cv     - Curriculum Vitae and PDF document
  show [target]   - Inspect telemetry (show feed, show bio, show sysinfo, etc.)
  open <app_id>   - Launch graphical window (e.g. open projects, open resume)
  theme <value>   - Change desktop wallpaper color or image URL
  dir / ls        - Directory list of virtual files
  cat <file>      - Output contents of a file (cat contact.txt, cat bio.txt)
  calc <expr>     - Arithmetic evaluation (e.g. calc 1024 * 768)
  sysinfo         - Print system architecture telemetry
  reboot          - Cold system reboot
  clear / cls     - Clear terminal screen
`;
      newHistory.push({ id: `out-${Date.now()}`, type: 'output', text: helpText });
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    // Match with user-defined database commands from admin dashboard
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
