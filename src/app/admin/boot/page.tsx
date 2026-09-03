'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Clock
} from 'lucide-react';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { BootLog } from '@/types/database';
import { adminMutate } from '@/lib/api/adminMutate';

export default function BootAdminPage() {
  const [logs, setLogs] = useState<BootLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<BootLog | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('boot_logs')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
          setLogs(fallbackBiographyData.bootLogs);
        } else {
          setLogs(data as BootLog[]);
        }
      } catch {
        setLogs(fallbackBiographyData.bootLogs);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openNew = () => {
    setIsNew(true);
    setEditingItem({
      id: `b-${Date.now()}`,
      message: '',
      delay_ms: 220,
      status_type: 'OK',
      sort_order: logs.length + 1,
      is_active: true,
    });
  };

  const openEdit = (item: BootLog) => {
    setIsNew(false);
    setEditingItem({ ...item });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this boot sequence log entry?')) return;
    try {
      const res = await adminMutate({
        table: 'boot_logs',
        action: 'delete',
        match: { id },
      });
      if (!res.success) throw new Error(res.error);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setFeedback({ type: 'success', text: 'Boot log removed.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: `Delete failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setFeedback(null);

    try {
      if (isNew) {
        const res = await adminMutate({
          table: 'boot_logs',
          action: 'insert',
          data: editingItem,
        });
        if (!res.success) throw new Error(res.error);
        setLogs((prev) => [...prev, editingItem]);
      } else {
        const res = await adminMutate({
          table: 'boot_logs',
          action: 'update',
          data: editingItem,
          match: { id: editingItem.id },
        });
        if (!res.success) throw new Error(res.error);
        setLogs((prev) => prev.map((l) => (l.id === editingItem.id ? editingItem : l)));
      }

      setFeedback({ type: 'success', text: 'Boot sequence log saved successfully.' });
      setEditingItem(null);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: `Error saving log: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setSaving(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= logs.length) return;

    const newLogs = [...logs];
    const temp = newLogs[index];
    newLogs[index] = newLogs[targetIdx];
    newLogs[targetIdx] = temp;

    const updated = newLogs.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setLogs(updated);

    // Save to Supabase
    try {
      const supabase = createClient();
      updated.forEach(async (item) => {
        await supabase.from('boot_logs').update({ sort_order: item.sort_order }).eq('id', item.id);
      });
    } catch {
      // Ignore
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 text-xs font-mono">Loading Boot Logs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <span>BIOS Boot Sequence Stream</span>
          </h1>
          <p className="text-xs text-slate-400">
            Control the exact hacker boot stream lines, status badges, millisecond delays, and execution order.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Boot Log Line</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/50 border border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Boot Logs List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="p-4 w-12">#</th>
              <th className="p-4">Badge</th>
              <th className="p-4">Terminal Message</th>
              <th className="p-4">Delay (ms)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {logs.map((log, idx) => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 text-slate-500 font-bold">
                  {idx + 1}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    log.status_type === 'OK' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    log.status_type === 'COMPLETE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    log.status_type === 'WARN' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    [{log.status_type}]
                  </span>
                </td>
                <td className="p-4 text-slate-200">
                  {log.message}
                </td>
                <td className="p-4 text-slate-400">
                  {log.delay_ms} ms
                </td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold ${log.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {log.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-4 text-right font-sans">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === logs.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(log)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                      title="Edit Log"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                      title="Delete Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>{isNew ? 'Create New Boot Log Line' : 'Edit Boot Log Entry'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Terminal Log Message:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Loading Neural Net Architecture..."
                  value={editingItem.message}
                  onChange={(e) => setEditingItem({ ...editingItem, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Status Badge Type:</label>
                  <select
                    value={editingItem.status_type}
                    onChange={(e) => setEditingItem({ ...editingItem, status_type: e.target.value as BootLog['status_type'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="OK">[OK] Green</option>
                    <option value="INFO">[INFO] Slate</option>
                    <option value="INIT">[INIT] Cyan</option>
                    <option value="WARN">[WARN] Amber</option>
                    <option value="COMPLETE">[COMPLETE] Glowing Cyan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Delay (Milliseconds):</label>
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    step="10"
                    required
                    value={editingItem.delay_ms}
                    onChange={(e) => setEditingItem({ ...editingItem, delay_ms: parseInt(e.target.value) || 200 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingItem.is_active}
                  onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                  className="rounded border-slate-700 accent-blue-600"
                />
                <span>Include in active boot sequence</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Log Line'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
