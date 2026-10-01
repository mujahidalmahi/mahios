'use client';

import React, { useState } from 'react';
import { Share2, X, Check, Copy, ExternalLink, Smartphone } from 'lucide-react';
import { XIcon, WhatsAppIcon, LinkedinIcon, FacebookIcon } from '@/components/shared/Icons';
import { useSystemStore } from '@/stores/systemStore';

export interface RetroShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary?: string;
  url: string;
}

export default function RetroShareModal({
  isOpen,
  onClose,
  title,
  summary,
  url,
}: RetroShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { playSound } = useSystemStore();

  if (!isOpen) return null;

  const shareText = summary ? `${title} — ${summary}` : title;

  const handleCopyLink = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShareX = () => {
    playSound('click');
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    playSound('click');
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${title}\n${url}`
    )}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    playSound('click');
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    playSound('click');
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary || title,
          url,
        });
      } catch (err) {
        // User aborted or native share rejected
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 backdrop-blur-[1px] p-3 animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#c0c0c0] retro-box-outset p-1 font-sans text-xs select-none shadow-2xl space-y-2 text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 font-bold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="tracking-wide">SHARE.EXE — Broadcast & Share</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="w-4 h-4 bg-[#c0c0c0] text-black font-bold retro-box-outset active:retro-box-inset flex items-center justify-center cursor-pointer text-[10px]"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-2 space-y-3">
          {/* Target Content Preview */}
          <div className="retro-box-inset bg-white p-2.5 space-y-1">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              Item to Share:
            </div>
            <h4 className="font-bold text-xs text-[#000080] line-clamp-1">{title}</h4>
            {summary && (
              <p className="text-[11px] text-gray-700 line-clamp-2 leading-relaxed">
                {summary}
              </p>
            )}
          </div>

          {/* Social Platform Destinations */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
              Choose Sharing Platform:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareX}
                className="retro-btn px-2.5 py-1.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 active:retro-btn-pressed font-medium"
              >
                <XIcon className="w-3.5 h-3.5 text-black" />
                <span>Share on X</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="retro-btn px-2.5 py-1.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 text-emerald-800 active:retro-btn-pressed font-medium"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="retro-btn px-2.5 py-1.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 text-blue-900 active:retro-btn-pressed font-medium"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={handleShareFacebook}
                className="retro-btn px-2.5 py-1.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 text-blue-800 active:retro-btn-pressed font-medium"
              >
                <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" />
                <span>Facebook</span>
              </button>
            </div>

            {hasNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full mt-1.5 retro-btn px-3 py-1.5 flex items-center justify-center gap-2 cursor-pointer text-[#000080] font-bold hover:bg-blue-50 active:retro-btn-pressed"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Use Device / System Share Menu</span>
              </button>
            )}
          </div>

          {/* Direct Link Copy Inset */}
          <div className="space-y-1 pt-1 border-t border-gray-300">
            <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
              Direct Link:
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 px-2 py-1 bg-white retro-box-inset font-mono text-[11px] text-gray-800 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="retro-btn px-3 py-1 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 active:retro-btn-pressed"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#000080]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Dismiss Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="retro-btn px-4 py-1 font-bold text-gray-800 cursor-pointer hover:bg-gray-100 active:retro-btn-pressed"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
