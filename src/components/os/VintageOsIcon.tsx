'use client';

import React from 'react';

interface VintageOsIconProps {
  appId: string;
  className?: string;
  isSelected?: boolean;
}

export default function VintageOsIcon({ appId, className = 'w-8 h-8', isSelected = false }: VintageOsIconProps) {
  const renderSvg = () => {
    switch (appId) {
      // 1. My Computer: Classic 90s Beige CRT Monitor + Desktop Tower Unit
      case 'my-computer':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Monitor Housing */}
            <rect x="4" y="3" width="22" height="17" rx="1" fill="#cfcdb8" stroke="#333333" strokeWidth="1.5" />
            {/* CRT Screen Bevel & Dark Navy Glass */}
            <rect x="7" y="6" width="16" height="11" fill="#000080" stroke="#555555" strokeWidth="1" />
            <rect x="8" y="7" width="5" height="3" fill="#3b5998" opacity="0.6" />
            {/* Monitor Stand */}
            <path d="M12 20H18L19 22H11L12 20Z" fill="#a8a695" stroke="#333333" strokeWidth="1" />
            {/* Desktop Chassis / Tower below */}
            <rect x="3" y="22" width="24" height="6" rx="1" fill="#dfdccb" stroke="#333333" strokeWidth="1.5" />
            {/* 3.5 Floppy Slot */}
            <line x1="6" y1="24.5" x2="14" y2="24.5" stroke="#444444" strokeWidth="1.5" strokeLinecap="round" />
            {/* CD-ROM drive */}
            <line x1="16" y1="24.5" x2="22" y2="24.5" stroke="#888888" strokeWidth="1" strokeLinecap="round" />
            {/* Power LED */}
            <circle cx="24.5" cy="25" r="0.9" fill="#00e676" stroke="#003300" strokeWidth="0.5" />
          </svg>
        );

      // 2. Recycle Bin: Classic Steel Mesh Bin with Paper Trash
      case 'recycle-bin':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Paper protruding */}
            <path d="M9 10L12 4L16 8L20 4L22 10H9Z" fill="#f5f5f5" stroke="#666666" strokeWidth="1" />
            <line x1="12" y1="6" x2="15" y2="8" stroke="#1565c0" strokeWidth="1" />
            {/* Bin Rim */}
            <ellipse cx="16" cy="11" rx="9" ry="2.5" fill="#90a4ae" stroke="#37474f" strokeWidth="1.5" />
            {/* Wastebasket Body */}
            <path d="M7.5 11.5L10 27.5C10.2 28.5 11.5 29 16 29C20.5 29 21.8 28.5 22 27.5L24.5 11.5" fill="#78909c" stroke="#37474f" strokeWidth="1.5" />
            {/* Recycling Ribbon Motif */}
            <path d="M13 17L16 14L19 17M16 15V22" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      // 3. About Me: Classic Profile ID Badge / Passport Card
      case 'about':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Badge Card */}
            <rect x="4" y="5" width="24" height="22" rx="2" fill="#fafafa" stroke="#333333" strokeWidth="1.5" />
            {/* Dark Blue Header Strip */}
            <path d="M4 7C4 5.9 4.9 5 6 5H26C27.1 5 28 5.9 28 7V10H4V7Z" fill="#000080" />
            {/* Photo Box */}
            <rect x="7" y="13" width="8" height="11" fill="#e0e0e0" stroke="#757575" strokeWidth="1" />
            {/* Avatar Silhouette */}
            <circle cx="11" cy="16.5" r="2.2" fill="#1565c0" />
            <path d="M8.5 22.5C8.5 20.5 9.6 19.5 11 19.5C12.4 19.5 13.5 20.5 13.5 22.5H8.5Z" fill="#1565c0" />
            {/* Text Lines */}
            <line x1="18" y1="14" x2="25" y2="14" stroke="#424242" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="18" y1="18" x2="25" y2="18" stroke="#757575" strokeWidth="1" strokeLinecap="round" />
            <line x1="18" y1="21" x2="23" y2="21" stroke="#757575" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      // 4. Experience: Classic Brown Leather Executive Briefcase
      case 'experience':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Briefcase Handle */}
            <path d="M12 9C12 7 13.5 6 16 6C18.5 6 20 7 20 9" stroke="#3e2723" strokeWidth="2" strokeLinecap="round" />
            {/* Leather Body */}
            <rect x="4" y="9" width="24" height="17" rx="2" fill="#8d6e63" stroke="#3e2723" strokeWidth="1.5" />
            {/* Flap */}
            <path d="M4 11L16 17L28 11V15L16 20L4 15V11Z" fill="#6d4c41" />
            {/* Brass Latches */}
            <rect x="9" y="17" width="2.5" height="3.5" rx="0.5" fill="#fbc02d" stroke="#5d4037" strokeWidth="0.8" />
            <rect x="20.5" y="17" width="2.5" height="3.5" rx="0.5" fill="#fbc02d" stroke="#5d4037" strokeWidth="0.8" />
          </svg>
        );

      // 5. Projects: Classic Warm Manila Folder with Blueprint / Tools
      case 'projects':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Back Tab */}
            <path d="M4 9C4 7.9 4.9 7 6 7H13L15 10H26C27.1 10 28 10.9 28 12V24C28 25.1 27.1 26 26 26H6C4.9 26 4 25.1 4 24V9Z" fill="#c68a1d" stroke="#5c3800" strokeWidth="1.5" />
            {/* Inner Blueprint Paper */}
            <rect x="7" y="10" width="16" height="10" fill="#e3f2fd" stroke="#1976d2" strokeWidth="1" />
            <line x1="9" y1="13" x2="20" y2="13" stroke="#1976d2" strokeWidth="1" />
            <line x1="9" y1="16" x2="16" y2="16" stroke="#1976d2" strokeWidth="1" />
            {/* Front Manila Flap */}
            <path d="M3 13H27L25 26H5L3 13Z" fill="#e5a93b" stroke="#5c3800" strokeWidth="1.5" />
            {/* Shadow edge */}
            <line x1="4" y1="14" x2="26" y2="14" stroke="#ffd54f" strokeWidth="1" />
          </svg>
        );

      // 6. Skills / Tech Stack: Classic Green Printed Circuit Board (PCB) & Microchip
      case 'skills':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* PCB Board */}
            <rect x="4" y="4" width="24" height="24" rx="2" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.5" />
            {/* Silver CPU Center */}
            <rect x="10" y="10" width="12" height="12" fill="#cfd8dc" stroke="#263238" strokeWidth="1.2" />
            <rect x="12" y="12" width="8" height="8" fill="#37474f" />
            <circle cx="16" cy="16" r="1.5" fill="#ffd54f" />
            {/* Copper Traces / Pins */}
            <path d="M10 6V10M16 4V10M22 6V10M10 22V26M16 22V28M22 22V26" stroke="#fbc02d" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M6 10H10M4 16H10M6 22H10M22 10H26M22 16H28M22 22H26" stroke="#fbc02d" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      // 7. Education: Vintage Mortarboard Academic Cap & Diploma
      case 'education':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cap Diamond Top */}
            <polygon points="16,5 29,11 16,17 3,11" fill="#1a237e" stroke="#0d1b40" strokeWidth="1.5" />
            {/* Skull Cap Base */}
            <path d="M9 14.5V20C9 23 12.5 25 16 25C19.5 25 23 23 23 20V14.5" fill="#283593" stroke="#0d1b40" strokeWidth="1.5" />
            {/* Golden Tassel Button & String */}
            <circle cx="16" cy="11" r="1.5" fill="#fbc02d" />
            <path d="M16 11L26 15V21" stroke="#fbc02d" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="25" y="21" width="2" height="3" fill="#f57f17" />
            {/* Rolled Diploma Scroll below */}
            <rect x="8" y="24" width="16" height="4" rx="1.5" fill="#fff9c4" stroke="#f57f17" strokeWidth="1" />
            <rect x="14" y="24" width="4" height="4" fill="#c62828" />
          </svg>
        );

      // 8. Terminal: Classic MS-DOS Prompt Dark CRT Monitor
      case 'terminal':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Box */}
            <rect x="3" y="4" width="26" height="20" rx="1.5" fill="#424242" stroke="#212121" strokeWidth="1.5" />
            {/* Screen */}
            <rect x="5" y="6" width="22" height="16" fill="#000000" stroke="#616161" strokeWidth="1" />
            {/* DOS Prompt C:\>_ in Phosphor Green */}
            <text x="7" y="14" fill="#00e676" fontFamily="monospace" fontSize="7" fontWeight="bold">C:\&gt;</text>
            <rect x="21" y="8.5" width="3" height="6.5" fill="#00e676" />
            {/* Stand */}
            <path d="M11 24H21L23 28H9L11 24Z" fill="#616161" stroke="#212121" strokeWidth="1" />
          </svg>
        );

      // 9. Gallery / Photos: Classic 35mm Polaroid Photo with Mountain Landscape
      case 'gallery':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Polaroid Frame */}
            <rect x="5" y="4" width="22" height="24" rx="1" fill="#f5f5f5" stroke="#424242" strokeWidth="1.5" />
            {/* Photo Glass */}
            <rect x="7" y="6" width="18" height="15" fill="#64b5f6" stroke="#1e88e5" strokeWidth="0.8" />
            {/* Golden Sun */}
            <circle cx="19" cy="10" r="2.5" fill="#fdd835" />
            {/* Green Mountains */}
            <polygon points="7,21 13,13 18,21" fill="#43a047" />
            <polygon points="14,21 19,15 25,21" fill="#2e7d32" />
          </svg>
        );

      // 10. Achievements / Honors: Classic Gold Trophy Cup
      case 'achievements':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Trophy Handles */}
            <path d="M8 9H5C4 9 4 15 8 16M24 9H27C28 9 28 15 24 16" stroke="#f57f17" strokeWidth="2" strokeLinecap="round" />
            {/* Cup Bowl */}
            <path d="M8 7H24V13C24 18 19 20 16 20C13 20 8 18 8 13V7Z" fill="#fbc02d" stroke="#f57f17" strokeWidth="1.5" />
            {/* Cup Lip */}
            <rect x="7" y="6" width="18" height="2" rx="0.5" fill="#ffd54f" stroke="#f57f17" strokeWidth="1" />
            {/* Stem */}
            <rect x="14" y="20" width="4" height="4" fill="#fbc02d" stroke="#f57f17" strokeWidth="1" />
            {/* Dark Marble Base */}
            <rect x="9" y="24" width="14" height="4" rx="1" fill="#37474f" stroke="#212121" strokeWidth="1" />
            <rect x="12" y="25" width="8" height="2" fill="#ffd54f" />
          </svg>
        );

      // 11. Dev Notes Blog: Vintage Blue Ink Document with Folded Corner
      case 'blog':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sheet with dog-ear fold */}
            <path d="M6 5H20L26 11V27H6V5Z" fill="#fafafa" stroke="#424242" strokeWidth="1.5" />
            <path d="M20 5V11H26" fill="#e0e0e0" stroke="#424242" strokeWidth="1" />
            {/* Navy Header Line */}
            <line x1="9" y1="10" x2="16" y2="10" stroke="#000080" strokeWidth="2" strokeLinecap="round" />
            {/* Text lines */}
            <line x1="9" y1="15" x2="23" y2="15" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="18.5" x2="23" y2="18.5" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="22" x2="18" y2="22" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      // 12. Resume / CV: Classic Curriculum Vitae Sheet with Red Seal
      case 'resume':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Paper Sheet */}
            <rect x="5" y="4" width="22" height="25" rx="1" fill="#ffffff" stroke="#424242" strokeWidth="1.5" />
            {/* Navy Top Banner */}
            <rect x="5" y="4" width="22" height="4" fill="#000080" />
            {/* Profile Avatar Box */}
            <rect x="8" y="11" width="5" height="6" fill="#e0e0e0" stroke="#9e9e9e" strokeWidth="0.8" />
            {/* Title Lines */}
            <line x1="16" y1="12" x2="23" y2="12" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="15" x2="21" y2="15" stroke="#757575" strokeWidth="1" strokeLinecap="round" />
            {/* Body lines */}
            <line x1="8" y1="19.5" x2="23" y2="19.5" stroke="#757575" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="8" y1="22.5" x2="18" y2="22.5" stroke="#757575" strokeWidth="1.2" strokeLinecap="round" />
            {/* Official Wax Seal */}
            <circle cx="21" cy="24" r="3" fill="#c62828" stroke="#8e0000" strokeWidth="0.8" />
            <circle cx="21" cy="24" r="1.5" fill="#fbc02d" />
          </svg>
        );

      // 13. Contact / Mail: Classic Airmail Envelope with Postage Stamp
      case 'contact':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Envelope Body */}
            <rect x="3" y="7" width="26" height="18" rx="1.5" fill="#fff9c4" stroke="#5d4037" strokeWidth="1.5" />
            {/* Flap creases */}
            <path d="M3 8L16 18L29 8" stroke="#5d4037" strokeWidth="1.5" strokeLinejoin="round" />
            <line x1="3" y1="25" x2="11" y2="16" stroke="#8d6e63" strokeWidth="1" />
            <line x1="29" y1="25" x2="21" y2="16" stroke="#8d6e63" strokeWidth="1" />
            {/* Postage Stamp */}
            <rect x="22" y="9.5" width="5" height="6" fill="#c62828" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="24.5" cy="12.5" r="1.2" fill="#ffd54f" />
          </svg>
        );

      // 14. Settings / Control Panel: Classic Interlocking Steel Gears & Screwdriver
      case 'settings':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Large Gear */}
            <circle cx="14" cy="18" r="8" fill="#90a4ae" stroke="#37474f" strokeWidth="1.5" />
            <circle cx="14" cy="18" r="3.5" fill="#cfd8dc" stroke="#37474f" strokeWidth="1.2" />
            {/* Teeth */}
            <path d="M14 8V10M14 26V28M4 18H6M22 18H24M7 11L8.5 12.5M19.5 23.5L21 25M7 25L8.5 23.5M19.5 12.5L21 11" stroke="#37474f" strokeWidth="2.5" strokeLinecap="round" />
            {/* Smaller Gold Gear */}
            <circle cx="22" cy="10" r="5" fill="#fbc02d" stroke="#5d4037" strokeWidth="1.2" />
            <circle cx="22" cy="10" r="2" fill="#fff9c4" stroke="#5d4037" strokeWidth="1" />
          </svg>
        );

      // 15. Philosophy: Vintage Brass Navigation Compass with Needle
      case 'philosophy':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Top Ring */}
            <circle cx="16" cy="4.5" r="2.5" fill="none" stroke="#f57f17" strokeWidth="1.5" />
            {/* Brass Outer Casing */}
            <circle cx="16" cy="17" r="12" fill="#fbc02d" stroke="#5d4037" strokeWidth="1.5" />
            {/* White Dial */}
            <circle cx="16" cy="17" r="9.5" fill="#fafafa" stroke="#757575" strokeWidth="1" />
            {/* Cardinal Marks */}
            <line x1="16" y1="8" x2="16" y2="10" stroke="#000000" strokeWidth="1.2" />
            <line x1="16" y1="24" x2="16" y2="26" stroke="#000000" strokeWidth="1.2" />
            <line x1="7" y1="17" x2="9" y2="17" stroke="#000000" strokeWidth="1.2" />
            <line x1="23" y1="17" x2="25" y2="17" stroke="#000000" strokeWidth="1.2" />
            {/* Magnetic Needle: Red North / Blue South */}
            <polygon points="16,9 18.5,17 13.5,17" fill="#d32f2f" stroke="#b71c1c" strokeWidth="0.8" />
            <polygon points="16,25 18.5,17 13.5,17" fill="#1976d2" stroke="#0d47a1" strokeWidth="0.8" />
            <circle cx="16" cy="17" r="1.5" fill="#fbc02d" stroke="#333333" strokeWidth="0.8" />
          </svg>
        );

      // 16. Live Pulse / Feed: Classic Radio Broadcast Tower & Waves
      case 'feed':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Tower Legs */}
            <path d="M16 11L10 28H22L16 11Z" fill="#cfd8dc" stroke="#37474f" strokeWidth="1.5" />
            <line x1="12" y1="22" x2="20" y2="22" stroke="#37474f" strokeWidth="1.2" />
            <line x1="13.5" y1="17" x2="18.5" y2="17" stroke="#37474f" strokeWidth="1.2" />
            {/* Transmitter Beacon */}
            <circle cx="16" cy="9" r="3" fill="#c62828" stroke="#37474f" strokeWidth="1.2" />
            {/* Concentric Broadcast Waves */}
            <path d="M10 6C12 4 20 4 22 6" stroke="#0288d1" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M6 3C10 0 22 0 26 3" stroke="#0288d1" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      // 17. Biography: Vintage Leather Hardcover Book with Bookmark
      case 'biography':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Book Base Pages */}
            <path d="M5 25C8 24 14 24 16 26C18 24 24 24 27 25V7C24 6 18 6 16 8C14 6 8 6 5 7V25Z" fill="#efebe9" stroke="#3e2723" strokeWidth="1.5" />
            {/* Spine & Cover Trim */}
            <path d="M4 26C7 25 14 25 16 27C18 25 25 25 28 26V7C25 6 18 6 16 8C14 6 7 6 4 7V26Z" fill="none" stroke="#5d4037" strokeWidth="1.5" />
            <line x1="16" y1="8" x2="16" y2="27" stroke="#3e2723" strokeWidth="1.5" />
            {/* Red Silk Ribbon Bookmark */}
            <path d="M16 8V18L14 16L12 18V7" fill="#c62828" stroke="#8e0000" strokeWidth="0.8" />
            {/* Gold Lettering */}
            <line x1="19" y1="11" x2="24" y2="11" stroke="#fbc02d" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="19" y1="14" x2="24" y2="14" stroke="#fbc02d" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      // 18. Social Links Hub: Two Vintage Networked Desktop PCs
      case 'socials':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* PC 1 (Top Left) */}
            <rect x="3" y="4" width="13" height="10" rx="1" fill="#cfcdb8" stroke="#333333" strokeWidth="1.2" />
            <rect x="5" y="6" width="9" height="6" fill="#000080" />
            {/* PC 2 (Bottom Right) */}
            <rect x="16" y="15" width="13" height="10" rx="1" fill="#cfcdb8" stroke="#333333" strokeWidth="1.2" />
            <rect x="18" y="17" width="9" height="6" fill="#000080" />
            {/* Blue Twisted Network Cable */}
            <path d="M9 14V20C9 21 10 22 11 22H22V25" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Network Nodes */}
            <circle cx="9" cy="14" r="1.5" fill="#fbc02d" />
            <circle cx="22" cy="25" r="1.5" fill="#fbc02d" />
          </svg>
        );

      // 19. Ideology & Ethics: Classic Brass Scales of Justice
      case 'ideology':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Center Pillar */}
            <line x1="16" y1="5" x2="16" y2="26" stroke="#5d4037" strokeWidth="2" strokeLinecap="round" />
            {/* Base */}
            <path d="M11 26H21L22 28H10L11 26Z" fill="#fbc02d" stroke="#5d4037" strokeWidth="1" />
            {/* Balance Beam */}
            <line x1="6" y1="9" x2="26" y2="9" stroke="#fbc02d" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="9" r="2" fill="#f57f17" />
            {/* Left Pan */}
            <line x1="6" y1="9" x2="4" y2="16" stroke="#8d6e63" strokeWidth="1" />
            <line x1="6" y1="9" x2="8" y2="16" stroke="#8d6e63" strokeWidth="1" />
            <path d="M3 16C3 18 5 19 6 19C7 19 9 18 9 16H3Z" fill="#fbc02d" stroke="#5d4037" strokeWidth="1" />
            {/* Right Pan */}
            <line x1="26" y1="9" x2="24" y2="16" stroke="#8d6e63" strokeWidth="1" />
            <line x1="26" y1="9" x2="28" y2="16" stroke="#8d6e63" strokeWidth="1" />
            <path d="M23 16C23 18 25 19 26 19C27 19 29 18 29 16H23Z" fill="#fbc02d" stroke="#5d4037" strokeWidth="1" />
          </svg>
        );

      // 20. Media & Games: Classic 90s Gray SNES Gamepad
      case 'entertainment':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Controller Body */}
            <path d="M6 10C3 10 2 15 2 20C2 24 5 26 8 26C11 26 13 23 14 21H18C19 23 21 26 24 26C27 26 30 24 30 20C30 15 29 10 26 10H6Z" fill="#cfd8dc" stroke="#37474f" strokeWidth="1.5" />
            {/* Black D-Pad */}
            <rect x="7" y="16" width="6" height="2" fill="#212121" />
            <rect x="9" y="14" width="2" height="6" fill="#212121" />
            {/* Colored Action Buttons */}
            <circle cx="21" cy="18" r="1.5" fill="#fbc02d" />
            <circle cx="25" cy="18" r="1.5" fill="#c62828" />
            <circle cx="23" cy="15" r="1.5" fill="#1976d2" />
            <circle cx="23" cy="21" r="1.5" fill="#2e7d32" />
          </svg>
        );

      // 21. Strategic Aims: Classic Archery Bullseye Target with Arrow
      case 'aim':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Red Ring */}
            <circle cx="16" cy="16" r="12" fill="#c62828" stroke="#37474f" strokeWidth="1.5" />
            {/* White Ring */}
            <circle cx="16" cy="16" r="9" fill="#ffffff" stroke="#c62828" strokeWidth="1" />
            {/* Inner Red Ring */}
            <circle cx="16" cy="16" r="6" fill="#c62828" />
            {/* Golden Bullseye */}
            <circle cx="16" cy="16" r="3" fill="#fbc02d" stroke="#f57f17" strokeWidth="0.8" />
            {/* Arrow stuck in center */}
            <line x1="28" y1="4" x2="16" y2="16" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
            <polygon points="28,4 27,8 24,5" fill="#e0e0e0" />
          </svg>
        );

      // 22. Dreamscape: Golden Crescent Moon in Night Sky Cloud
      case 'dream':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Night Sky Cloud */}
            <path d="M7 22C4 22 3 19 5 17C4 14 7 12 10 13C12 9 18 9 20 13C23 12 26 15 25 18C27 20 25 22 23 22H7Z" fill="#1a237e" stroke="#0d1b40" strokeWidth="1.5" />
            {/* Golden Crescent Moon */}
            <path d="M18 4C14 4 10 7.5 10 12C10 16.5 14 20 18 20C20 20 22 19 23 18C19 18 16 15 16 12C16 9 19 6 23 6C22 5 20 4 18 4Z" fill="#ffd54f" stroke="#f57f17" strokeWidth="1.2" />
            {/* Little 4-point stars */}
            <circle cx="8" cy="8" r="1.2" fill="#fff9c4" />
            <circle cx="26" cy="10" r="1" fill="#fff9c4" />
          </svg>
        );

      // 23. 3 Wishes: Classic Magic Aladdin Lamp
      case 'wishes':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Magic Lamp Body */}
            <path d="M7 19C7 16 10 15 14 15H21L26 11C27 10 28 11 27 13L24 16C26 18 25 21 21 21H10C8 21 7 20 7 19Z" fill="#fbc02d" stroke="#5d4037" strokeWidth="1.5" />
            {/* Handle */}
            <path d="M8 16C5 16 4 20 7 21" stroke="#5d4037" strokeWidth="2" strokeLinecap="round" />
            {/* Lamp Base */}
            <ellipse cx="14" cy="22" rx="6" ry="2" fill="#f57f17" stroke="#5d4037" strokeWidth="1" />
            {/* Genie Smoke / Flame */}
            <path d="M26 10C26 6 30 7 28 3C25 4 23 7 25 10" stroke="#0288d1" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 24. Favourites: 3D Faceted Vintage Golden Star
      case 'favourites':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Golden 5-point Star with Classic 3D Facets */}
            <polygon points="16,3 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12" fill="#fbc02d" stroke="#5d4037" strokeWidth="1.5" />
            {/* Shaded Facets */}
            <polygon points="16,3 20,12 16,22" fill="#ffd54f" />
            <polygon points="30,12 22,18 16,22" fill="#f57f17" opacity="0.6" />
            <polygon points="25,28 16,22 10,18" fill="#f57f17" opacity="0.8" />
            <polygon points="7,28 10,18 16,22" fill="#ffd54f" />
            <polygon points="2,12 12,12 16,22" fill="#f57f17" opacity="0.6" />
          </svg>
        );

      // 25. Calculator: Classic 90s Desktop Electronic Calculator
      case 'calculator':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Plastic Casing */}
            <rect x="5" y="4" width="22" height="25" rx="2" fill="#cfd8dc" stroke="#37474f" strokeWidth="1.5" />
            {/* LCD Display */}
            <rect x="8" y="7" width="16" height="5" rx="0.5" fill="#80cbc4" stroke="#004d40" strokeWidth="1" />
            <text x="18" y="11" fill="#004d40" fontFamily="monospace" fontSize="4.5" fontWeight="bold">05</text>
            {/* Keypad Grid (3x4 buttons) */}
            <rect x="8" y="14" width="3.5" height="2.5" fill="#37474f" rx="0.5" />
            <rect x="14.25" y="14" width="3.5" height="2.5" fill="#37474f" rx="0.5" />
            <rect x="20.5" y="14" width="3.5" height="2.5" fill="#c62828" rx="0.5" />

            <rect x="8" y="18" width="3.5" height="2.5" fill="#37474f" rx="0.5" />
            <rect x="14.25" y="18" width="3.5" height="2.5" fill="#37474f" rx="0.5" />
            <rect x="20.5" y="18" width="3.5" height="2.5" fill="#1565c0" rx="0.5" />

            <rect x="8" y="22" width="3.5" height="2.5" fill="#37474f" rx="0.5" />
            <rect x="14.25" y="22" width="3.5" height="2.5" fill="#37474f" rx="0.5" />
            <rect x="20.5" y="22" width="3.5" height="2.5" fill="#f57f17" rx="0.5" />
          </svg>
        );

      // 26. Notepad: Classic Yellow Legal Pad with Spiral Binding
      case 'notepad':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Yellow Legal Pad */}
            <rect x="6" y="5" width="20" height="24" rx="1" fill="#fff9c4" stroke="#5d4037" strokeWidth="1.5" />
            {/* Top Navy Binding Header */}
            <rect x="6" y="5" width="20" height="4" fill="#000080" />
            {/* Red Margin Line */}
            <line x1="11" y1="9" x2="11" y2="29" stroke="#e57373" strokeWidth="1" />
            {/* Blue Ruled Lines */}
            <line x1="12" y1="13" x2="24" y2="13" stroke="#90caf9" strokeWidth="1" />
            <line x1="12" y1="17" x2="24" y2="17" stroke="#90caf9" strokeWidth="1" />
            <line x1="12" y1="21" x2="24" y2="21" stroke="#90caf9" strokeWidth="1" />
            <line x1="12" y1="25" x2="20" y2="25" stroke="#90caf9" strokeWidth="1" />
          </svg>
        );

      // 27. Paint Studio: Classic Wooden Artist Palette with Color Dabs
      case 'paint':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Wooden Palette with Thumb Hole */}
            <path d="M16 4C9 4 4 9 4 16C4 23 10 27 16 27C19 27 21 25 21 23C21 22 20 21 20 20C20 18 22 17 24 17H25C27 17 28 15 28 13C28 8 23 4 16 4Z" fill="#d7ccc8" stroke="#5d4037" strokeWidth="1.5" />
            {/* Thumb Hole */}
            <circle cx="19" cy="22" r="2" fill="#3e2723" />
            {/* Primary Paint Dabs */}
            <circle cx="10" cy="10" r="2.5" fill="#c62828" stroke="#8e0000" strokeWidth="0.5" />
            <circle cx="16" cy="8" r="2.5" fill="#1565c0" stroke="#0d47a1" strokeWidth="0.5" />
            <circle cx="22" cy="11" r="2.5" fill="#fbc02d" stroke="#f57f17" strokeWidth="0.5" />
            <circle cx="9" cy="17" r="2.5" fill="#2e7d32" stroke="#1b5e20" strokeWidth="0.5" />
          </svg>
        );

      // 28. Task Manager / System Monitor: Vintage Monitor with Green Heartbeat Pulse
      case 'task-manager':
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Monitor Casing */}
            <rect x="4" y="4" width="24" height="19" rx="1.5" fill="#cfd8dc" stroke="#37474f" strokeWidth="1.5" />
            {/* Dark Green Oscilloscope Screen */}
            <rect x="6" y="6" width="20" height="15" fill="#002b11" stroke="#004d40" strokeWidth="1" />
            {/* Grid Lines */}
            <line x1="6" y1="13.5" x2="26" y2="13.5" stroke="#004d20" strokeWidth="0.8" strokeDasharray="1 1" />
            <line x1="16" y1="6" x2="16" y2="21" stroke="#004d20" strokeWidth="0.8" strokeDasharray="1 1" />
            {/* Green Pulse Wave */}
            <path d="M6 14H11L13 8L16 19L18 11L20 14H26" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Stand */}
            <path d="M12 23H20L21 27H11L12 23Z" fill="#90a4ae" stroke="#37474f" strokeWidth="1" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="5" width="20" height="23" rx="1.5" fill="#cfcdb8" stroke="#333333" strokeWidth="1.5" />
            <rect x="9" y="8" width="14" height="10" fill="#000080" />
            <line x1="9" y1="22" x2="23" y2="22" stroke="#555555" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative ${className} select-none transition-none flex items-center justify-center shrink-0`}>
      {renderSvg()}
      {/* Authentic Windows 95 Dither Selection Overlay when Selected */}
      {isSelected && (
        <div className="absolute inset-0 bg-[#000080]/40 pointer-events-none mix-blend-color-burn [background-image:radial-gradient(#000080_1px,transparent_1px)] [background-size:2px_2px]" />
      )}
    </div>
  );
}
