import React from 'react';
import { cookies } from 'next/headers';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'MahiOS Admin Control Center',
  description: 'Authenticated Management System for MahiOS Digital Portfolio',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('mahios_admin_session')?.value;

  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
      if (decoded && typeof decoded.exp === 'number' && decoded.exp > Date.now()) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Also verify Supabase session cookies if present
  if (!isAuthenticated) {
    const hasSupabaseCookie = cookieStore.getAll().some(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );
    if (hasSupabaseCookie) {
      isAuthenticated = true;
    }
  }

  return (
    <AdminLayoutClient isAuthenticated={isAuthenticated}>
      {children}
    </AdminLayoutClient>
  );
}
