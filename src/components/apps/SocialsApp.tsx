'use client';

import React, { useState } from 'react';
import {
  Share2, ExternalLink, Copy, Check, ShieldCheck,
  Globe, Mail, MessageSquare, Send, Music
} from 'lucide-react';
import { GithubIcon } from '@/components/shared/Icons';
import { SocialLinkItem } from '@/types/database';

interface SocialsAppProps {
  socialLinks: SocialLinkItem[];
}

export default function SocialsApp({ socialLinks }: SocialsAppProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-[#000080] text-white flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Social_Hub.lnk — Digital Identity & Channels
            </h2>
            <p className="text-[11px] text-gray-600">
              Verified communication vectors, developer registries, and presence across the web.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-white px-2 py-1 retro-box-inset self-start sm:self-auto">
          {socialLinks.length} Verified Endpoints
        </span>
      </div>

      {/* Grid of Social Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {socialLinks.map((link) => (
          <div
            key={link.id}
            className="p-3.5 bg-[#f9fafb] retro-box-inset rounded-xs flex items-center justify-between gap-3 hover:bg-white transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-2xs flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: link.accent_color || '#000080' }}
              >
                <Globe className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-gray-900 truncate">{link.platform_name}</h3>
                  {link.is_verified && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded-2xs border border-emerald-300 flex items-center gap-0.5 shrink-0">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>VERIFIED</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-gray-600 truncate">{link.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(link.id, link.url || link.username)}
                className="p-1.5 bg-[#d4d0c8] hover:bg-[#e4e4e4] text-gray-800 retro-box-outset rounded-2xs cursor-pointer"
                title="Copy Handle or URL"
              >
                {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-[#000080] hover:bg-blue-800 text-white rounded-2xs flex items-center justify-center cursor-pointer shadow-xs"
                title={`Open ${link.platform_name}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* PGP Key Banner */}
      <div className="p-3 bg-[#e8ecf4] retro-box-inset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="space-y-0.5">
          <div className="font-bold text-[#000080] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Cryptographic Identity (PGP Key Fingerprint)</span>
          </div>
          <p className="font-mono text-[10px] text-gray-600 truncate">
            4A8F 9C21 B012 3D45 E678 9012 3456 789A BCDE F012
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleCopy('pgp', '4A8F 9C21 B012 3D45 E678 9012 3456 789A BCDE F012')}
          className="px-3 py-1 bg-[#d4d0c8] hover:bg-[#e4e4e4] retro-box-outset rounded-2xs font-semibold text-[11px] cursor-pointer self-start sm:self-auto"
        >
          {copiedId === 'pgp' ? 'Copied Key!' : 'Copy PGP Fingerprint'}
        </button>
      </div>
    </div>
  );
}
