import React from 'react';
import {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, HelpCircle, Compass, Radio, BookOpen,
  Share2, Scale, Gamepad2, Target, Sparkles, Flame, Star, Globe, Rocket,
  Monitor, Trash2, Calculator, FileEdit, Palette, Activity
} from 'lucide-react';

export const appIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Briefcase,
  FolderGit2,
  Cpu,
  GraduationCap,
  Terminal,
  Image: ImageIcon,
  Award,
  FileText,
  FileBadge,
  Mail,
  Settings,
  HelpCircle,
  Compass,
  Radio,
  BookOpen,
  Share2,
  Scale,
  Gamepad2,
  Target,
  Sparkles,
  Flame,
  Star,
  Globe,
  Rocket,
  Monitor,
  Trash2,
  Calculator,
  FileEdit,
  Palette,
  Activity,
};

export function getAppIcon(iconName?: string): React.ComponentType<{ className?: string }> {
  if (!iconName) return FileText;
  return appIconMap[iconName] || FileText;
}
