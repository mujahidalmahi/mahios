'use client';

import React, { useState, useEffect } from 'react';
import {
  AppWindow, CheckCircle2, Save, Eye, EyeOff,
  Edit2, X, Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, Sparkles, Smartphone, Pin
} from 'lucide-react';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { DesktopApp } from '@/types/database';

export default function DesktopAppsManagerPage() {
  const [apps, setApps] = useState<DesktopApp[]>(fallbackBiographyData.apps);
  const [editingApp, setEditingApp] = useState<DesktopApp | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [mobileSlots, setMobileSlots] = useState<string[]>([
    'about', 'biography', 'projects', 'terminal', 'feed', 'contact'
  ]);
  const [isSavingMobile, setIsSavingMobile] = useState(false);

  useEffect(() => {
    async function loadApps() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('desktop_apps').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) {
          const map = new Map<string, DesktopApp>();
          fallbackBiographyData.apps.forEach((a) => map.set(a.app_id, a));
          data.forEach((a: DesktopApp) => {
            if (map.has(a.app_id)) {
              map.set(a.app_id, { ...map.get(a.app_id)!, ...a });
            } else {
              map.set(a.app_id, a);
            }
          });
          const sorted = Array.from(map.values()).sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
          setApps(sorted);

          // Calculate current mobile top 6
          const currentPinned = sorted
            .filter((a) => a.default_x >= 1 && a.default_x <= 6)
            .sort((a, b) => a.default_x - b.default_x)
            .map((a) => a.app_id);

          if (currentPinned.length === 6) {
            setMobileSlots(currentPinned);
          } else {
            const existing = new Set(currentPinned);
            const backfill = sorted
              .filter((a) => !existing.has(a.app_id) && a.is_visible)
              .slice(0, 6 - currentPinned.length)
              .map((a) => a.app_id);
            setMobileSlots([...currentPinned, ...backfill]);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadApps();
  }, []);

  const allDistinctCategories = Array.from(new Set(apps.map((a) => a.category).filter(Boolean)));

  const openNewApp = () => {
    setIsNew(true);
    setEditingApp({
      id: `app-${Date.now()}`,
      app_id: `custom_${Date.now()}`,
      title: 'New Application',
      icon_name: 'AppWindow',
      component_key: 'AboutApp',
      badge_text: '',
      is_visible: true,
      is_system_app: false,
      category: allDistinctCategories[0] || 'utilities',
      default_width: 760,
      default_height: 520,
      default_x: 60,
      default_y: 40,
      sort_order: apps.length + 1,
    });
  };

  const openEditApp = (app: DesktopApp) => {
    setIsNew(false);
    setEditingApp({ ...app });
  };

  const handleDeleteApp = async (id: string) => {
    if (!confirm('Are you sure you want to remove this desktop application?')) return;
    try {
      await adminMutate<DesktopApp>({
        table: 'desktop_apps',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setApps(apps.filter((a) => a.id !== id));
    setNotification('Application removed from desktop');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleVisibility = async (app: DesktopApp) => {
    const updated = apps.map((a) => (a.id === app.id ? { ...a, is_visible: !a.is_visible } : a));
    setApps(updated);
    try {
      await adminMutate<DesktopApp>({
        table: 'desktop_apps',
        action: 'update',
        match: { id: app.id },
        data: { is_visible: !app.is_visible },
      });
    } catch {
      // Local fallback
    }
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    if (isNew) {
      setApps([...apps, editingApp]);
    } else {
      setApps(apps.map((a) => (a.id === editingApp.id ? editingApp : a)));
    }

    try {
      await adminMutate<DesktopApp>({
        table: 'desktop_apps',
        action: 'upsert',
        data: editingApp,
      });
    } catch {
      // Local fallback
    }

    setEditingApp(null);
    setNotification(`Application "${editingApp.title}" saved.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= apps.length) return;

    const newApps = [...apps];
    const temp = newApps[index];
    newApps[index] = newApps[targetIdx];
    newApps[targetIdx] = temp;

    const updated = newApps.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setApps(updated);

    try {
      await adminMutate<DesktopApp[]>({
        table: 'desktop_apps',
        action: 'upsert',
        data: updated,
      });
      setNotification('Application order updated.');
      setTimeout(() => setNotification(null), 2000);
    } catch (err) {
      console.error('Failed saving app order:', err);
    }
  };

  const handleSlotChange = (slotIndex: number, newAppId: string) => {
    const newSlots = [...mobileSlots];
    const existingSlot = newSlots.indexOf(newAppId);
    if (existingSlot !== -1) {
      newSlots[existingSlot] = newSlots[slotIndex];
    }
    newSlots[slotIndex] = newAppId;
    setMobileSlots(newSlots);
  };

  const handleSaveMobileTop6 = async (slotsToSave = mobileSlots) => {
    setIsSavingMobile(true);
    try {
      const updated = apps.map((app) => {
        const slotIdx = slotsToSave.indexOf(app.app_id);
        return {
          ...app,
          default_x: slotIdx !== -1 ? slotIdx + 1 : 0,
        };
      });

      setApps(updated);

      await adminMutate<DesktopApp[]>({
        table: 'desktop_apps',
        action: 'upsert',
        data: updated,
      });

      setNotification('Mobile Home Top 6 applications updated successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed saving mobile top 6:', err);
      setNotification('Failed saving mobile top 6 selection.');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSavingMobile(false);
    }
  };

  const handleToggleMobilePin = async (appId: string) => {
    let newSlots = [...mobileSlots];
    const isPinned = newSlots.includes(appId);

    if (isPinned) {
      newSlots = newSlots.filter((id) => id !== appId);
      const existing = new Set(newSlots);
      const candidate = apps.find((a) => a.is_visible && !existing.has(a.app_id));
      if (candidate) newSlots.push(candidate.app_id);
    } else {
      newSlots[5] = appId;
    }

    setMobileSlots(newSlots);
    await handleSaveMobileTop6(newSlots);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AppWindow className="w-5 h-5 text-blue-400" />
            <span>Desktop OS Applications Studio</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-blue-400 border border-slate-700">
              {apps.length} Applications Total
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Control which retro window applications spawn on the desktop, their order, mobile homepage dock, icons, and categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewApp}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New App</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* MOBILE HOMEPAGE TOP 6 APPLICATIONS SELECTION DOCK        */}
      {/* ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Mobile Homepage Top 6 Applications</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700 font-semibold">
                  Today Screen Dock
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose and order the 6 featured applications pinned directly to the mobile homepage grid.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSavingMobile}
            onClick={() => handleSaveMobileTop6()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition-all self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingMobile ? 'Saving Slots...' : 'Save Mobile Top 6'}</span>
          </button>
        </div>

        {/* 6 Slot Selectors in a Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
            const currentAppId = mobileSlots[slotIdx];
            const currentApp = apps.find((a) => a.app_id === currentAppId);

            return (
              <div
                key={slotIdx}
                className="bg-slate-950 border border-slate-800 hover:border-blue-900/80 rounded-xl p-3 space-y-2 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-blue-400 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    <span>Slot #{slotIdx + 1}</span>
                  </span>
                  {currentApp && (
                    <span className="text-[10px] text-slate-500 capitalize truncate max-w-[65px]">
                      {currentApp.category}
                    </span>
                  )}
                </div>

                <select
                  value={currentAppId || ''}
                  onChange={(e) => handleSlotChange(slotIdx, e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-blue-500 truncate cursor-pointer"
                >
                  {apps.map((a) => (
                    <option key={a.id} value={a.app_id}>
                      {a.title} ({a.app_id})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of registered applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app, idx) => (
          <div
            key={app.id}
            className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all ${
              app.is_visible ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  #{idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{app.title}</h3>
                    {app.badge_text && (
                      <span className="px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono rounded">
                        {app.badge_text}
                      </span>
                    )}
                    {mobileSlots.includes(app.app_id) && (
                      <span className="px-1.5 py-0.2 bg-blue-950/80 text-blue-300 border border-blue-700 text-[10px] font-mono rounded flex items-center gap-1 font-semibold">
                        <Smartphone className="w-2.5 h-2.5 text-blue-400" />
                        <span>Mobile #{mobileSlots.indexOf(app.app_id) + 1}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {app.app_id}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span>View: {app.component_key}</span>
                    <span>•</span>
                    <span className="capitalize">{app.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleMobilePin(app.app_id)}
                  className={`p-1.5 rounded cursor-pointer transition-all ${
                    mobileSlots.includes(app.app_id)
                      ? 'text-blue-400 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                  title={
                    mobileSlots.includes(app.app_id)
                      ? `Pinned in Mobile Slot #${mobileSlots.indexOf(app.app_id) + 1} (Click to unpin)`
                      : 'Pin to Mobile Top 6'
                  }
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(app)}
                  className={`p-1.5 rounded cursor-pointer ${
                    app.is_visible ? 'text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
                  }`}
                  title={app.is_visible ? 'Visible on Desktop' : 'Hidden from Desktop'}
                >
                  {app.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEditApp(app)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                  title="Edit App Config"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!app.is_system_app && (
                  <button
                    type="button"
                    onClick={() => handleDeleteApp(app.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded cursor-pointer"
                    title="Delete App"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
              <span>{app.default_width} × {app.default_height}px</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === apps.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== EDIT/CREATE MODAL ==================== */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AppWindow className="w-5 h-5 text-blue-400" />
                <span>{isNew ? 'Register Desktop Application' : `Edit: ${editingApp.title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingApp(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">App Title</label>
                <input
                  type="text"
                  required
                  value={editingApp.title}
                  onChange={(e) => setEditingApp({ ...editingApp, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Unique App ID (Slug)</label>
                <input
                  type="text"
                  required
                  value={editingApp.app_id}
                  onChange={(e) => setEditingApp({ ...editingApp, app_id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Target Component View</label>
                <select
                  value={editingApp.component_key}
                  onChange={(e) => setEditingApp({ ...editingApp, component_key: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="AboutApp">AboutApp (Narrative Bio, Tech Radar)</option>
                  <option value="ExperienceApp">ExperienceApp (Career History & Stack)</option>
                  <option value="ProjectsApp">ProjectsApp (Projects Directory)</option>
                  <option value="SkillsApp">SkillsApp (Tech Modules & Proficiencies)</option>
                  <option value="EducationApp">EducationApp (Degrees & Leadership)</option>
                  <option value="PhilosophyApp">PhilosophyApp (Mental Models & Principles)</option>
                  <option value="FeedApp">FeedApp (Live Status Updates & Micro-Posts)</option>
                  <option value="BiographyApp">BiographyApp (Life Timeline & Chapters)</option>
                  <option value="SocialsApp">SocialsApp (Verified Digital ID Hub)</option>
                  <option value="IdeologyApp">IdeologyApp (Tech Ethics & Worldview)</option>
                  <option value="EntertainmentApp">EntertainmentApp (Media & Games)</option>
                  <option value="AimApp">AimApp (Strategic Roadmap & Progress)</option>
                  <option value="DreamApp">DreamApp (Dreamscape Manifestos)</option>
                  <option value="WishesApp">WishesApp (3 Wishes for Humanity)</option>
                  <option value="FavouritesApp">FavouritesApp (Personal Hall of Fame)</option>
                  <option value="TerminalApp">TerminalApp (MS-DOS Command Prompt)</option>
                  <option value="GalleryApp">GalleryApp (Photo Archive & Lightbox)</option>
                  <option value="AchievementsApp">AchievementsApp (Trophies & Certs)</option>
                  <option value="BlogApp">BlogApp (Articles & Notes Reader)</option>
                  <option value="ResumeApp">ResumeApp (ATS Print & CV Viewer)</option>
                  <option value="ContactApp">ContactApp (Mail Client & Dispatcher)</option>
                  <option value="SettingsApp">SettingsApp (Control Panel & Themes)</option>
                </select>
              </div>

              {/* Dynamic Category Picker */}
              <CategoryPicker
                value={editingApp.category}
                onChange={(cat) => setEditingApp({ ...editingApp, category: cat })}
                existingCategories={allDistinctCategories.length > 0 ? allDistinctCategories : ['system', 'core', 'work', 'skills', 'mindset', 'vision', 'social', 'lifestyle', 'media', 'utilities']}
                label="App Category"
                helperText="Select or type any custom category to organize this app in the OS."
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Icon Graphic</label>
                  <select
                    value={editingApp.icon_name}
                    onChange={(e) => setEditingApp({ ...editingApp, icon_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="User">User</option>
                    <option value="Briefcase">Briefcase</option>
                    <option value="FolderGit2">FolderGit2</option>
                    <option value="Cpu">Cpu</option>
                    <option value="GraduationCap">GraduationCap</option>
                    <option value="Compass">Compass</option>
                    <option value="Radio">Radio</option>
                    <option value="BookOpen">BookOpen</option>
                    <option value="Share2">Share2</option>
                    <option value="Scale">Scale</option>
                    <option value="Gamepad2">Gamepad2</option>
                    <option value="Target">Target</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="Flame">Flame</option>
                    <option value="Star">Star</option>
                    <option value="Terminal">Terminal</option>
                    <option value="Image">Image</option>
                    <option value="Award">Award</option>
                    <option value="FileText">FileText</option>
                    <option value="FileBadge">FileBadge</option>
                    <option value="Mail">Mail</option>
                    <option value="Settings">Settings</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Badge Text (Pill)</label>
                  <input
                    type="text"
                    placeholder="e.g. LIVE, NEW, ★3"
                    value={editingApp.badge_text || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, badge_text: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Default Width (px)</label>
                  <input
                    type="number"
                    value={editingApp.default_width}
                    onChange={(e) => setEditingApp({ ...editingApp, default_width: parseInt(e.target.value) || 720 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Default Height (px)</label>
                  <input
                    type="number"
                    value={editingApp.default_height}
                    onChange={(e) => setEditingApp({ ...editingApp, default_height: parseInt(e.target.value) || 500 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
