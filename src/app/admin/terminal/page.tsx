'use client';

import React, { useState, useEffect } from 'react';
import {
  Terminal, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Sparkles, HelpCircle
} from 'lucide-react';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { TerminalCommand } from '@/types/database';

export default function TerminalAdminPage() {
  const [commands, setCommands] = useState<TerminalCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<TerminalCommand | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('terminal_commands')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
          setCommands(fallbackBiographyData.terminalCommands);
        } else {
          setCommands(data as TerminalCommand[]);
        }
      } catch {
        setCommands(fallbackBiographyData.terminalCommands);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openNew = () => {
    setIsNew(true);
    setEditingItem({
      id: `tc-${Date.now()}`,
      command: '',
      response_text: '',
      description: '',
      is_hidden: false,
      sort_order: commands.length + 1,
    });
  };

  const openEdit = (cmd: TerminalCommand) => {
    setIsNew(false);
    setEditingItem({ ...cmd });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this terminal command?')) return;
    try {
      const supabase = createClient();
      await supabase.from('terminal_commands').delete().eq('id', id);
      setCommands((prev) => prev.filter((c) => c.id !== id));
      setFeedback({ type: 'success', text: 'Terminal command deleted.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setCommands((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setFeedback(null);

    const cleanCommand = editingItem.command.trim().toLowerCase();

    try {
      const supabase = createClient();
      const payload = {
        ...editingItem,
        command: cleanCommand,
      };

      if (isNew) {
        const { error } = await supabase.from('terminal_commands').insert([payload]);
        if (!error) {
          setCommands((prev) => [...prev, payload]);
        } else {
          setCommands((prev) => [...prev, payload]);
        }
      } else {
        const { error } = await supabase
          .from('terminal_commands')
          .update(payload)
          .eq('id', editingItem.id);

        if (!error) {
          setCommands((prev) => prev.map((c) => (c.id === editingItem.id ? payload : c)));
        } else {
          setCommands((prev) => prev.map((c) => (c.id === editingItem.id ? payload : c)));
        }
      }

      setFeedback({ type: 'success', text: `Command "${cleanCommand}" saved successfully.` });
      setEditingItem(null);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: 'error', text: 'Error saving command to database.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 text-xs font-mono">Loading Terminal Commands...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-blue-400" />
            <span>MS-DOS Terminal Commands</span>
          </h1>
          <p className="text-xs text-slate-400">
            Define dynamic CLI commands, responses, and easter eggs executable in the MahiOS command prompt.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Command</span>
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

      {/* Commands Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <th className="p-4">Command</th>
              <th className="p-4">Description</th>
              <th className="p-4">Response Output Preview</th>
              <th className="p-4">Visibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {commands.map((cmd) => (
              <tr key={cmd.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-mono font-bold text-emerald-400">
                  &gt; {cmd.command}
                </td>
                <td className="p-4 text-slate-300 font-medium">
                  {cmd.description || '—'}
                </td>
                <td className="p-4 text-slate-400 font-mono text-[11px] max-w-xs truncate">
                  {cmd.response_text}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    cmd.is_hidden
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                      : 'bg-blue-950/60 text-blue-300 border border-blue-800'
                  }`}>
                    {cmd.is_hidden ? 'Hidden / Easter Egg' : 'Listed in Help'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(cmd)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                      title="Edit Command"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cmd.id)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                      title="Delete Command"
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
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>{isNew ? 'Create New Terminal Command' : `Edit Command: ${editingItem.command}`}</span>
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
                <label className="font-semibold text-slate-300">Command Keyword (Single word, e.g. "quote", "music", "secret"):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. coffee"
                  value={editingItem.command}
                  onChange={(e) => setEditingItem({ ...editingItem, command: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Command Help Description:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dispenses a fresh virtual coffee"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Output Response Text (Multi-line supported):</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the message to print when the user executes this command..."
                  value={editingItem.response_text}
                  onChange={(e) => setEditingItem({ ...editingItem, response_text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingItem.is_hidden}
                  onChange={(e) => setEditingItem({ ...editingItem, is_hidden: e.target.checked })}
                  className="rounded border-slate-700 accent-blue-600"
                />
                <span>Hide from "help" command list (Secret Easter Egg)</span>
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
                  <span>{saving ? 'Saving...' : 'Save Command'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
