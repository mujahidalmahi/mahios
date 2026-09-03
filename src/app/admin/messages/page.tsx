'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Trash2, CheckCircle2, Star, MailOpen, Reply,
  Search, AlertCircle, Clock, CheckCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { ContactMessage } from '@/types/database';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';

const PAGE_SIZE = 20;

export default function MessagesInboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'starred'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id?: string; bulk?: boolean }>({ open: false });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setMessages(data);
          setSelectedMessage(data[0]);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const toggleRead = useCallback(async (msg: ContactMessage) => {
    const updated = messages.map((m) => m.id === msg.id ? { ...m, is_read: !m.is_read } : m);
    setMessages(updated);
    if (selectedMessage?.id === msg.id) setSelectedMessage({ ...selectedMessage, is_read: !selectedMessage.is_read });
    try {
      await adminMutate<ContactMessage>({
        table: 'contact_messages',
        action: 'update',
        match: { id: msg.id },
        data: { is_read: !msg.is_read },
      });
    } catch { /* ignore */ }
  }, [messages, selectedMessage]);

  const toggleStar = useCallback(async (msg: ContactMessage) => {
    const updated = messages.map((m) => m.id === msg.id ? { ...m, is_starred: !m.is_starred } : m);
    setMessages(updated);
    if (selectedMessage?.id === msg.id) setSelectedMessage({ ...selectedMessage, is_starred: !selectedMessage.is_starred });
    try {
      await adminMutate<ContactMessage>({
        table: 'contact_messages',
        action: 'update',
        match: { id: msg.id },
        data: { is_starred: !msg.is_starred },
      });
    } catch { /* ignore */ }
  }, [messages, selectedMessage]);

  const handleDelete = async (id: string) => {
    const remaining = messages.filter((m) => m.id !== id);
    setMessages(remaining);
    if (selectedMessage?.id === id) setSelectedMessage(remaining.length > 0 ? remaining[0] : null);
    try {
      await adminMutate<ContactMessage>({
        table: 'contact_messages',
        action: 'delete',
        match: { id },
      });
    } catch { /* ignore */ }
    showFeedback('success', 'Message deleted.');
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const remaining = messages.filter((m) => !selectedIds.has(m.id));
    setMessages(remaining);
    if (selectedMessage && selectedIds.has(selectedMessage.id)) {
      setSelectedMessage(remaining.length > 0 ? remaining[0] : null);
    }
    setSelectedIds(new Set());
    try {
      for (const id of ids) {
        await adminMutate<ContactMessage>({
          table: 'contact_messages',
          action: 'delete',
          match: { id },
        });
      }
    } catch { /* ignore */ }
    showFeedback('success', `${ids.length} message${ids.length > 1 ? 's' : ''} deleted.`);
  };

  const markAllRead = async () => {
    const updated = messages.map((m) => ({ ...m, is_read: true }));
    setMessages(updated);
    if (selectedMessage) setSelectedMessage({ ...selectedMessage, is_read: true });
    try {
      for (const m of messages.filter((msg) => !msg.is_read)) {
        await adminMutate<ContactMessage>({
          table: 'contact_messages',
          action: 'update',
          match: { id: m.id },
          data: { is_read: true },
        });
      }
    } catch { /* ignore */ }
    showFeedback('success', 'All messages marked as read.');
  };

  const toggleSelectId = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const filteredMessages = messages.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      m.sender_name.toLowerCase().includes(q) ||
      m.sender_email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (filterTab === 'unread') return !m.is_read;
    if (filterTab === 'starred') return m.is_starred;
    return true;
  });

  const totalPages = Math.ceil(filteredMessages.length / PAGE_SIZE);
  const pagedMessages = filteredMessages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unreadCount = messages.filter((m) => !m.is_read).length;
  const starredCount = messages.filter((m) => m.is_starred).length;

  if (loading) return <SkeletonListPage rows={6} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <span>Messages Inbox</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">{unreadCount} unread</span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Contact requests and collaboration inquiries from MahiOS visitors</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              Mark All Read
            </button>
          )}
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => setConfirmModal({ open: true, bulk: true })}
              className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selectedIds.size} selected
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-red-950/60 border border-red-800 text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by sender, subject, or content..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1">
          {([
            { key: 'all', label: `All (${messages.length})` },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'starred', label: `Starred (${starredCount})` },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setFilterTab(key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                filterTab === key ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={MailOpen}
          title="No messages yet"
          description="When visitors send contact requests through MahiOS, they'll appear here."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Message List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="flex-1 divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
              {pagedMessages.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No messages match your filter.</div>
              ) : pagedMessages.map((m) => (
                <div
                  key={m.id}
                  onClick={() => { setSelectedMessage(m); if (!m.is_read) toggleRead(m); }}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    selectedMessage?.id === m.id ? 'bg-blue-950/50 border-l-4 border-blue-500' : 'hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(m.id)}
                      onChange={() => toggleSelectId(m.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-slate-600 text-blue-600 focus:ring-0 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${!m.is_read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                          {m.sender_name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleStar(m); }}
                          className="text-slate-500 hover:text-amber-400 p-0.5 shrink-0 cursor-pointer"
                        >
                          <Star className={`w-3 h-3 ${m.is_starred ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">{m.subject}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-2.5 h-2.5 text-slate-600" />
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                        {!m.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-1" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Page {page}/{totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedMessage.subject}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      From: <strong className="text-slate-200">{selectedMessage.sender_name}</strong>{' '}
                      &lt;{selectedMessage.sender_email}&gt;
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`mailto:${selectedMessage.sender_email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleRead(selectedMessage)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700"
                    >
                      {selectedMessage.is_read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmModal({ open: true, id: selectedMessage.id })}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg cursor-pointer border border-red-800/40"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {selectedMessage.message}
                </div>

                {/* Sender email copy */}
                <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-xs font-mono text-slate-400 flex-1">{selectedMessage.sender_email}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(selectedMessage.sender_email)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <MailOpen className="w-10 h-10 text-slate-600" />
                <p className="text-xs">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.bulk ? `Delete ${selectedIds.size} Messages?` : 'Delete Message?'}
        message={
          confirmModal.bulk
            ? `This will permanently delete ${selectedIds.size} selected message${selectedIds.size > 1 ? 's' : ''}. This cannot be undone.`
            : 'This will permanently delete this message. This cannot be undone.'
        }
        confirmLabel="Delete Permanently"
        onConfirm={() => {
          setConfirmModal({ open: false });
          if (confirmModal.bulk) handleBulkDelete();
          else if (confirmModal.id) handleDelete(confirmModal.id);
        }}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </div>
  );
}
