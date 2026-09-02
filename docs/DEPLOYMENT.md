# MahiOS Deployment & Production Guide

This guide walks you through deploying **MahiOS** to production using **Vercel**, **Supabase**, and **Cloudinary**.

---

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmujahidalmahi%2Fmahios)

---

## 📋 Step-by-Step Deployment Walkthrough

### Step 1: Set Up Supabase Database

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** in your Supabase dashboard.
4. Open [`supabase/schema.sql`](../supabase/schema.sql) in this repository and copy the entire contents.
5. Paste into the Supabase SQL editor and click **Run**. This will create all 26 tables, default RLS policies, and seed rows.
6. Navigate to **Project Settings -> API** and copy:
   - `Project URL` (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon public key` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role secret key` (`SUPABASE_SERVICE_ROLE_KEY`)

---

### Step 2: Set Up Cloudinary Media Storage (Optional)

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Go to your Dashboard and copy:
   - `Cloud Name` (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`)
   - `API Key` (`CLOUDINARY_API_KEY`)
   - `API Secret` (`CLOUDINARY_API_SECRET`)

*(Note: If you skip Cloudinary, MahiOS automatically falls back to Supabase Storage and initial static images!)*

---

### Step 3: Deploy to Vercel

1. Push your repository to GitHub (`git push origin main`).
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your `mahios` repository.
4. Add the following **Environment Variables**:

| Variable Name | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Your live website URL | `https://mujahidmahi.xyz` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Private Service Role Key | `eyJhbGciOi...` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`| Cloudinary Cloud Name (Optional) | `mahios-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key (Optional) | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary Secret (Optional) | `secret_abcdef` |
| `ADMIN_MASTER_KEY` | Master passphrase for Admin login | `your-secure-admin-passphrase` |

5. Click **Deploy**. Vercel will build and deploy MahiOS in under 60 seconds!

---

## 🔒 Post-Deployment Security Checklist

- [ ] Change the default `ADMIN_MASTER_KEY` in Vercel environment variables to a strong random passphrase.
- [ ] Confirm that visiting `/admin` directly redirects to `/admin/login`.
- [ ] Test the contact form (`Mail_Client.exe`) to confirm email messages are received in your Admin inbox (`/admin/messages`).
- [ ] Confirm HTTPS SSL certificates are active on your custom domain.
