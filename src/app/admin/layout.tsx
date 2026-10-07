import React from 'react';
import { cookies } from 'next/headers';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/security/authSession';

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
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  const sessionVerification = verifyAdminSessionToken(sessionCookie);
  const isAuthenticated = sessionVerification.valid;

  return (
    <AdminLayoutClient isAuthenticated={isAuthenticated}>
      {children}
    </AdminLayoutClient>
  );
}
