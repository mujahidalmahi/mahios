'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock, Mail, ArrowRight, ShieldCheck, Terminal, AlertCircle,
  Eye, EyeOff, Loader2, KeyRound, Clock
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

  useEffect(() => {
    setRenderTimestamp(Date.now());
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
        throw new Error(data.error || 'Authentication failed');
      }

      // Success -> Redirect to requested path
      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid administrator credentials';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/10 mb-3">
          <Terminal className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <span>MahiOS Security Portal</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Cryptographically Protected Administration Gateway
        </p>
      </div>

      {/* Lockout Notice */}
      {lockoutTimer !== null && lockoutTimer > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
          <span>
            Security Lockout Active: Please wait <strong>{lockoutTimer}s</strong> before next attempt.
          </span>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Anti-Bot Honeypot (Invisible to humans) */}
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

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Admin Identity / Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mujahidmahi.xyz"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
        </div>

        {/* Password Field with Eye Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Passphrase / Master Key
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isLoading || (lockoutTimer !== null && lockoutTimer > 0)}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Authenticate & Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Security Footer Details */}
      <div className="pt-4 border-t border-slate-800 flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Rate Limiting & Bot Shield</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono">
          Protected by sliding window token bucket and TLS HTTP-only cookies.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
