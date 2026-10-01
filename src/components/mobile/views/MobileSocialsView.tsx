'use client';

import React from 'react';
import { Share2, ExternalLink, Globe } from 'lucide-react';
import {
  GithubIcon, LinkedinIcon, XIcon, FacebookIcon,
  InstagramIcon, WhatsAppIcon, TelegramIcon
} from '@/components/shared/Icons';
import { SocialLinkItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileSocialsViewProps {
  socialLinks: SocialLinkItem[];
}

const getSocialIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) return GithubIcon;
  if (p.includes('linkedin')) return LinkedinIcon;
  if (p.includes('twitter') || p.includes('x')) return XIcon;
  if (p.includes('facebook')) return FacebookIcon;
  if (p.includes('instagram')) return InstagramIcon;
  if (p.includes('whatsapp')) return WhatsAppIcon;
  if (p.includes('telegram')) return TelegramIcon;
  return Globe;
};

export default function MobileSocialsView({ socialLinks = [] }: MobileSocialsViewProps) {
  const { playSound } = useSystemStore();
  const sortedLinks = [...socialLinks].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Social & Network Connections ({sortedLinks.length})
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {sortedLinks.map((link) => {
          const Icon = getSocialIcon(link.platform_name || '');

          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound('open')}
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between hover:border-blue-400 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-slate-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{link.platform_name}</h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {link.username || link.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 24)}
                  </div>
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
