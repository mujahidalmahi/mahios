'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail, Trash2, CheckCircle2, Star, MailOpen, Reply,
  Search, Filter, ExternalLink, ShieldCheck, Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ContactMessage } from '@/types/database';

export default function MessagesInboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'starred'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadMessages() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setMessages(data);
          setSelectedMessage(data[0]);
        } else {
          // Demo seed
          const demo: ContactMessage = {
            id: 'msg-demo-1',
            sender_name: 'Alex Vance',
            sender_email: 'alex@cyberneticlabs.io',
            subject: 'Excited to collaborate on your retro OS architecture!',
            message: 'Hello Mahi,\n\nI was exploring your MahiOS biography and was completely blown away by the attention to detail in the CRT scanlines and window manager. We are currently architecting a new interactive developer platform and would love to discuss a potential engineering collaboration or advisory role.\n\nBest regards,\nAlex Vance',
            is_read: false,
            is_starred: true,
            created_at: new Date().toISOString(),
          };
          setMessages([demo]);
          setSelectedMessage(demo);
        }
      } catch {
        // Local
      }
    }
    loadMessages();
  }, []);

  const toggleRead = async (msg: ContactMessage) => {
    const updated = messages.map((m) => (m.id === msg.id ? { ...m, is_read: !m.is_read } : m));
    setMessages(updated);
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage({ ...selectedMessage, is_read: !selectedMessage.is_read });
    }

    try {
      const supabase = createClient();
      await supabase.from('contact_messages').update({ is_read: !msg.is_read }).eq('id', msg.id);
    } catch {
      // Local
    }
  };

  const toggleStar = async (msg: ContactMessage) => {
    const updated = messages.map((m) => (m.id === msg.id ? { ...m, is_starred: !m.is_starred } : m));
    setMessages(updated);
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage({ ...selectedMessage, is_starred: !selectedMessage.is_starred });
    }

    try {
      const supabase = createClient();
      await supabase.from('contact_messages').update({ is_starred: !msg.is_starred }).eq('id', msg.id);
    } catch {
      // Local
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this message?')) return;
    const remaining = messages.filter((m) => m.id !== id);
    setMessages(remaining);
    if (selectedMessage?.id === id) {
      setSelectedMessage(remaining.length > 0 ? remaining[0] : null);
    }

    try {
      const supabase = createClient();
      await supabase.from('contact_messages').delete().eq('id', id);
    } catch {
      // Local
    }

    setNotification('Message deleted successfully.');
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'unread') return !m.is_read;
    if (filterTab === 'starred') return m.is_starred;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <span>Visitor Contact Messages & Inquiries</span>
          </h1>
          <p className="text-xs text-slate-400">
            Messages and collaboration requests received through the MahiOS Mail_Client application.
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-full flex items-center gap-1.5 shadow-md self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{unreadCount} Unread Message{unreadCount > 1 ? 's' : ''}</span>
          </span>
        )}
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search and Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search messages by sender, email, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterTab === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filterTab === 'starred'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Starred
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching messages found.
            </div>
          ) : (
            filteredMessages.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMessage(m);
                  if (!m.is_read) toggleRead(m);
                }}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedMessage?.id === m.id
                    ? 'bg-blue-950/50 border-l-4 border-blue-500'
                    : 'hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-xs truncate ${!m.is_read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                    {m.sender_name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(m);
                    }}
                    className="text-slate-500 hover:text-amber-400 p-1"
                  >
                    <Star className={`w-3.5 h-3.5 ${m.is_starred ? 'text-amber-400 fill-amber-400' : ''}`} />
                  </button>
                </div>
                <div className="text-xs text-slate-300 truncate">{m.subject}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  {new Date(m.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail View */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">{selectedMessage.subject}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    From: <strong className="text-slate-200">{selectedMessage.sender_name}</strong> &lt;{selectedMessage.sender_email}&gt;
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.sender_email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply Mail</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => toggleRead(selectedMessage)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {selectedMessage.is_read ? 'Mark Unread' : 'Mark Read'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans shadow-inner">
                {selectedMessage.message}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <MailOpen className="w-10 h-10 text-slate-600" />
              <p className="text-xs">Select a message from the inbox to inspect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
