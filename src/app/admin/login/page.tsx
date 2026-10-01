'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Terminal, ShieldCheck, AlertCircle, Clock,
  Eye, EyeOff, Loader2, KeyRound, Server, Wifi, Cpu
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot trap
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const [renderTimestamp, setRenderTimestamp] = useState<number>(Date.now());

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setRenderTimestamp(Date.now());
    emailInputRef.current?.focus();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer === null || lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer !== null && lockoutTimer > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          honeypot,
          renderedAt: renderTimestamp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.retryAfter) {
          setLockoutTimer(data.retryAfter);
        }
        throw new Error(data.error || 'Access denied: Invalid administrator credentials');
      }

      // Success -> Full page navigation with updated session cookies
      window.location.href = redirectPath;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failure: pam_authenticate() failed';
      setError(msg);
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-[#0a0e17] border border-[#1e293b] rounded-lg shadow-2xl overflow-hidden font-mono text-xs select-text">
      {/* Server Terminal Window Header */}
      <div className="bg-[#111827] border-b border-[#1f293d] px-3.5 py-2 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* Linux Terminal Traffic Light Dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#10b981]/80 inline-block" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-[#00ff66]" />
          <span className="text-gray-300 font-bold text-xs tracking-wider">
            root@mahios-srv01:~ (ssh:22)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400">
            <Wifi className="w-3 h-3" />
            <span>TLS 1.3 AES-256</span>
          </span>
          <span className="bg-[#1f293d] px-2 py-0.5 rounded text-gray-300">
            tty1
          </span>
        </div>
      </div>

      {/* Terminal Screen Body */}
      <div className="p-4 sm:p-6 space-y-4 text-[#e2e8f0] bg-[#070a11]">
        {/* Server MOTD (Message of the Day) Banner */}
        <div className="space-y-1.5 text-gray-400 border-b border-gray-800/80 pb-3 leading-relaxed text-[11px]">
          <div className="text-emerald-400 font-bold">
            Linux mahios-srv01 6.1.0-26-amd64 #1 SMP PREEMPT_DYNAMIC GNU/Linux
          </div>
          <div className="text-gray-500">
            Welcome to <strong className="text-white">MahiOS Enterprise Server Console</strong> (v2.6.4-LTS)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 pt-1 text-[10px] text-gray-400">
            <div>• Hostname : mahios-srv01.quantum.internal</div>
            <div>• Cluster  : Dhaka-Narayanganj-Edge-01</div>
            <div>• Storage  : Supabase PG v15.8 (NVMe)</div>
            <div>• Firewall : Active (Sliding Token Shield)</div>
          </div>
          <div className="text-amber-400/90 pt-1 text-[10px]">
            * Strict Notice: Unauthorized administrative access is monitored and logged.
          </div>
        </div>

        {/* Lockout Banner */}
        {lockoutTimer !== null && lockoutTimer > 0 && (
          <div className="p-3 bg-amber-950/40 border border-amber-600/60 rounded text-amber-300 flex items-center gap-2.5 animate-pulse">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              [SECURITY LOCKOUT] Terminal suspended. Wait <strong>{lockoutTimer}s</strong> before retry.
            </span>
          </div>
        )}

        {/* Error Output */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-600/60 rounded text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold">[AUTH FAILURE]: {error}</div>
              <div className="text-[10px] text-red-400/80">pam_unix(mahios:auth): authentication failure; logname= uid=0 euid=0</div>
            </div>
          </div>
        )}

        {/* Terminal Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-1">
          {/* Anti-Bot Honeypot */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="security_honeypot_field"
              tabIndex={-1}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Prompt 1: Identity / Login */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold select-none shrink-0">
                mahios-srv01 login:
              </span>
              <div className="flex-1 relative flex items-center">
                <input
                  ref={emailInputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="username"
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-gray-600 border-b border-gray-700/60 focus:border-emerald-500 py-1"
                />
              </div>
            </div>
          </div>

          {/* Prompt 2: Password */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold select-none shrink-0">
                Password:
              </span>
              <div className="flex-1 relative flex items-center">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-gray-600 border-b border-gray-700/60 focus:border-emerald-500 py-1 pr-7"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 text-gray-500 hover:text-gray-300 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Command Prompt Execute Action */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-500 text-[11px]">
              <span className="text-emerald-400 font-bold">root@mahios:~#</span>
              <span className="animate-pulse">_</span>
              <span className="text-gray-600 hidden sm:inline">(Press [Enter] to submit credentials)</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || (lockoutTimer !== null && lockoutTimer > 0)}
              className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-[#00ff66] border border-[#00ff66]/50 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(0,255,102,0.25)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ff66]" />
                  <span>[CONNECTING &amp; VERIFYING...]</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>[ AUTHENTICATE ROOT ]</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Telemetry Stamp */}
        <div className="pt-3 border-t border-gray-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-500 select-none">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>PAM (Pluggable Authentication Modules) • Rate Limiting Active</span>
          </div>
          <span>Session Nonce: {renderTimestamp.toString().slice(-6)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-2xl p-8 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-emerald-400 font-mono text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>INITIALIZING SSH TERMINAL TTY1...</span>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
