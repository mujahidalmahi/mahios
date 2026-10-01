'use client';

import React, { useState, useMemo } from 'react';
import {
  Share2, ExternalLink, Globe, Copy, Check, Mail,
  MessageSquare, Music, ShieldCheck
} from 'lucide-react';
import {
  GithubIcon, LinkedinIcon, XIcon, FacebookIcon,
  InstagramIcon, WhatsAppIcon, TelegramIcon
} from '@/components/shared/Icons';
import { SocialLinkItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileSocialsViewProps {
  socialLinks: SocialLinkItem[];
}

const getPlatformConfig = (platform: string, iconName?: string) => {
  const p = (platform || '').toLowerCase();
  const i = (iconName || '').toLowerCase();

  if (p.includes('github') || i.includes('github')) {
    return { icon: GithubIcon, bg: 'bg-[#181717]', text: 'text-white' };
  }
  if (p.includes('linkedin') || i.includes('linkedin')) {
    return { icon: LinkedinIcon, bg: 'bg-[#0A66C2]', text: 'text-white' };
  }
  if (p.includes('twitter') || p === 'x' || p.includes('x (') || p.startsWith('x ') || i.includes('twitter') || i === 'x') {
    return { icon: XIcon, bg: 'bg-black', text: 'text-white' };
  }
  if (p.includes('facebook') || p.includes('fb') || i.includes('facebook')) {
    return { icon: FacebookIcon, bg: 'bg-[#1877F2]', text: 'text-white' };
  }
  if (p.includes('instagram') || p.includes('insta') || i.includes('instagram')) {
    return { icon: InstagramIcon, bg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]', text: 'text-white' };
  }
  if (p.includes('whatsapp') || p.includes('wa') || i.includes('whatsapp')) {
    return { icon: WhatsAppIcon, bg: 'bg-[#25D366]', text: 'text-white' };
  }
  if (p.includes('telegram') || p.includes('tg') || i.includes('telegram')) {
    return { icon: TelegramIcon, bg: 'bg-[#229ED9]', text: 'text-white' };
  }
  if (p.includes('mail') || p.includes('email') || i.includes('mail')) {
    return { icon: Mail, bg: 'bg-[#EA4335]', text: 'text-white' };
  }
  if (p.includes('discord') || i.includes('discord')) {
    return { icon: MessageSquare, bg: 'bg-[#5865F2]', text: 'text-white' };
  }
  if (p.includes('spotify') || i.includes('spotify')) {
    return { icon: Music, bg: 'bg-[#1DB954]', text: 'text-white' };
  }
  return { icon: Globe, bg: 'bg-slate-700', text: 'text-white' };
};

export default function MobileSocialsView({ socialLinks = [] }: MobileSocialsViewProps) {
  const { playSound } = useSystemStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Deduplicate by platform name
  const distinctLinks = useMemo(() => {
    if (!socialLinks || socialLinks.length === 0) return [];
    const seen = new Set<string>();
    const result: SocialLinkItem[] = [];
    const sorted = [...socialLinks].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    for (const item of sorted) {
      const key = (item.platform_name || item.id).trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  }, [socialLinks]);

  const handleCopy = (id: string, text: string) => {
    playSound('click');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full">
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Connected Hubs ({distinctLinks.length})</span>
        </div>
        <div className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>Verified Channels</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {distinctLinks.map((link) => {
          const { icon: Icon, bg, text } = getPlatformConfig(link.platform_name || '', link.icon_name);
          const handle = link.username || link.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 24);
          const isCopied = copiedId === link.id;

          return (
            <div
              key={link.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-400 transition-all"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('open')}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                      {link.platform_name}
                    </h4>
                    <span className="text-[10px] text-blue-600 font-bold shrink-0">✓</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                    {handle}
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(link.id, link.url)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer active:scale-95 transition-all"
                  title="Copy link"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound('open')}
                  className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 cursor-pointer active:scale-95 transition-all"
                  title="Visit profile"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
