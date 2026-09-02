-- =========================================================
-- MahiOS: Complete Supabase Database Schema & Initial Seed
-- Author: Mujahid Al Mahi <mujahidmahi.official@gmail.com>
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Site Settings Table (Single row configuration)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_title TEXT NOT NULL DEFAULT 'MahiOS 95 — Mujahid Al Mahi Digital Biography',
    owner_name TEXT NOT NULL DEFAULT 'Mujahid Al Mahi',
    headline TEXT NOT NULL DEFAULT 'Full-Stack Software Engineer & Creative Technologist',
    bio_short TEXT NOT NULL DEFAULT 'Building resilient software, retro digital spaces, and high-performance applications.',
    avatar_url TEXT DEFAULT '',
    favicon_url TEXT DEFAULT '/favicon.ico',
    boot_title TEXT NOT NULL DEFAULT 'MAHI QUANTUM BIOS v4.08 (C) 1995-2026',
    boot_subtitle TEXT NOT NULL DEFAULT 'MahiOS Modular Kernel Initialization Engine',
    terminal_speed INTEGER NOT NULL DEFAULT 40,
    crt_scanlines_enabled BOOLEAN NOT NULL DEFAULT false,
    crt_curvature_enabled BOOLEAN NOT NULL DEFAULT false,
    sound_effects_enabled BOOLEAN NOT NULL DEFAULT true,
    matrix_rain_enabled BOOLEAN NOT NULL DEFAULT false,
    seo_title TEXT NOT NULL DEFAULT 'Mujahid Al Mahi | Digital Biography & Interactive OS',
    seo_description TEXT NOT NULL DEFAULT 'Step inside MahiOS: a 90s vintage CRT digital biography, portfolio, and interactive OS showcasing the engineering journey, projects, and skills of Mujahid Al Mahi.',
    seo_keywords TEXT[] NOT NULL DEFAULT ARRAY['Mujahid Al Mahi', 'Full Stack Developer', 'MahiOS', 'Software Engineer', 'Next.js 16', 'Interactive Portfolio', 'Creative Developer'],
    og_image_url TEXT DEFAULT '',
    twitter_handle TEXT DEFAULT '@mujahidmahi',
    github_url TEXT DEFAULT 'https://github.com/mujahidalmahi',
    linkedin_url TEXT DEFAULT 'https://linkedin.com/in/mujahidmahi',
    twitter_url TEXT DEFAULT 'https://twitter.com/mujahidmahi',
    email TEXT DEFAULT 'mujahidmahi.official@gmail.com',
    phone TEXT DEFAULT '+880 1700-000000',
    location TEXT DEFAULT 'Dhaka, Bangladesh',
    status_message TEXT DEFAULT 'System operational. Coding the future in 8-bit aesthetic.',
    copyright_text TEXT DEFAULT '© 1995-2026 Mujahid Al Mahi. All systems operational.',
    theme_accent_color TEXT DEFAULT '#000080',
    desktop_background_color TEXT DEFAULT '#008080',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Desktop Applications Table
CREATE TABLE IF NOT EXISTS desktop_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    icon_url TEXT DEFAULT '',
    component_key TEXT NOT NULL,
    default_x INTEGER NOT NULL DEFAULT 100,
    default_y INTEGER NOT NULL DEFAULT 50,
    default_width INTEGER NOT NULL DEFAULT 740,
    default_height INTEGER NOT NULL DEFAULT 520,
    is_system_app BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    category TEXT DEFAULT 'system',
    badge_text TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. About Me Table
CREATE TABLE IF NOT EXISTS about_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL DEFAULT 'Mujahid Al Mahi',
    taglines TEXT[] NOT NULL DEFAULT ARRAY['Full-Stack Systems Engineer', 'Next.js 16 & React Specialist', 'Creative Technologist', 'Open Source Craftsman'],
    bio_html TEXT NOT NULL DEFAULT '<p>Hello world! I am <strong>Mujahid Al Mahi</strong>, a passionate software engineer based in Dhaka, Bangladesh.</p>',
    avatar_url TEXT DEFAULT '',
    resume_url TEXT DEFAULT '',
    status_text TEXT DEFAULT 'Online & Available for High-Impact Projects',
    location TEXT DEFAULT 'Dhaka, Bangladesh',
    experience_years NUMERIC DEFAULT 4.5,
    projects_completed INTEGER DEFAULT 28,
    coffee_cups INTEGER DEFAULT 1480,
    interests TEXT[] NOT NULL DEFAULT ARRAY['Distributed Systems', 'Compiler Design', 'Retro Computing', 'Spatial UI', 'Mechanical Keyboards', 'Single-Origin Coffee'],
    quote TEXT DEFAULT 'Simplicity is prerequisite for reliability.',
    quote_author TEXT DEFAULT 'Edsger W. Dijkstra',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Skill Categories Table
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Code',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES skill_categories(id) ON DELETE CASCADE,
    proficiency INTEGER NOT NULL DEFAULT 85,
    icon_name TEXT DEFAULT 'Code2',
    years_of_experience NUMERIC DEFAULT 3,
    is_featured BOOLEAN DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Experience Table
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT DEFAULT 'Remote',
    employment_type TEXT DEFAULT 'Full-time',
    start_date TEXT NOT NULL,
    end_date TEXT DEFAULT 'Present',
    is_current BOOLEAN DEFAULT false,
    description_html TEXT NOT NULL,
    achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
    technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
    company_url TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Education Table
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    start_year TEXT NOT NULL,
    end_year TEXT DEFAULT 'Present',
    grade TEXT DEFAULT '',
    description_html TEXT DEFAULT '',
    activities TEXT[] DEFAULT ARRAY[]::TEXT[],
    certificate_url TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    description_html TEXT NOT NULL,
    thumbnail_url TEXT DEFAULT '',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    category TEXT DEFAULT 'Full Stack',
    live_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    stats JSONB DEFAULT '{"stars": 0, "users": "1k+", "uptime": "99.9%"}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    description TEXT DEFAULT '',
    badge_icon TEXT DEFAULT 'Trophy',
    certificate_url TEXT DEFAULT '',
    credential_id TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Gallery Categories Table
CREATE TABLE IF NOT EXISTS gallery_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    caption TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    category_id UUID REFERENCES gallery_categories(id) ON DELETE SET NULL,
    aspect_ratio TEXT DEFAULT '16:9',
    taken_at TEXT DEFAULT '',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content_html TEXT NOT NULL,
    cover_image_url TEXT DEFAULT '',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    read_time_minutes INTEGER DEFAULT 5,
    views_count INTEGER DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT DEFAULT 'Message from Visitor',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    ip_address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Boot Logs Table
CREATE TABLE IF NOT EXISTS boot_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    delay_ms INTEGER NOT NULL DEFAULT 120,
    status_type TEXT NOT NULL DEFAULT 'OK',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 15. Terminal Commands Table
CREATE TABLE IF NOT EXISTS terminal_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command TEXT NOT NULL UNIQUE,
    response_text TEXT NOT NULL,
    description TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 16. Resume Configuration Table
CREATE TABLE IF NOT EXISTS resume_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pdf_url TEXT DEFAULT '',
    last_updated_date TEXT DEFAULT '2026',
    preview_image_url TEXT DEFAULT '',
    download_filename TEXT DEFAULT 'Mujahid_Al_Mahi_Resume.pdf',
    summary_markdown TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE desktop_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE boot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_config ENABLE ROW LEVEL SECURITY;

-- Idempotent Policies
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can modify site settings" ON site_settings;
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin can modify site settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view desktop apps" ON desktop_apps;
DROP POLICY IF EXISTS "Admin can modify desktop apps" ON desktop_apps;
CREATE POLICY "Public can view desktop apps" ON desktop_apps FOR SELECT USING (true);
CREATE POLICY "Admin can modify desktop apps" ON desktop_apps FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view about content" ON about_content;
DROP POLICY IF EXISTS "Admin can modify about content" ON about_content;
CREATE POLICY "Public can view about content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Admin can modify about content" ON about_content FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view skill categories" ON skill_categories;
DROP POLICY IF EXISTS "Admin can modify skill categories" ON skill_categories;
CREATE POLICY "Public can view skill categories" ON skill_categories FOR SELECT USING (true);
CREATE POLICY "Admin can modify skill categories" ON skill_categories FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view skills" ON skills;
DROP POLICY IF EXISTS "Admin can modify skills" ON skills;
CREATE POLICY "Public can view skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Admin can modify skills" ON skills FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view experiences" ON experiences;
DROP POLICY IF EXISTS "Admin can modify experiences" ON experiences;
CREATE POLICY "Public can view experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Admin can modify experiences" ON experiences FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view education" ON education;
DROP POLICY IF EXISTS "Admin can modify education" ON education;
CREATE POLICY "Public can view education" ON education FOR SELECT USING (true);
CREATE POLICY "Admin can modify education" ON education FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view projects" ON projects;
DROP POLICY IF EXISTS "Admin can modify projects" ON projects;
CREATE POLICY "Public can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admin can modify projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view achievements" ON achievements;
DROP POLICY IF EXISTS "Admin can modify achievements" ON achievements;
CREATE POLICY "Public can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Admin can modify achievements" ON achievements FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view gallery categories" ON gallery_categories;
DROP POLICY IF EXISTS "Admin can modify gallery categories" ON gallery_categories;
CREATE POLICY "Public can view gallery categories" ON gallery_categories FOR SELECT USING (true);
CREATE POLICY "Admin can modify gallery categories" ON gallery_categories FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Admin can modify gallery images" ON gallery_images;
CREATE POLICY "Public can view gallery images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Admin can modify gallery images" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can modify blog posts" ON blog_posts;
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin can modify blog posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin can view and manage contact messages" ON contact_messages;
CREATE POLICY "Public can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view and manage contact messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view boot logs" ON boot_logs;
DROP POLICY IF EXISTS "Admin can modify boot logs" ON boot_logs;
CREATE POLICY "Public can view boot logs" ON boot_logs FOR SELECT USING (true);
CREATE POLICY "Admin can modify boot logs" ON boot_logs FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view terminal commands" ON terminal_commands;
DROP POLICY IF EXISTS "Admin can modify terminal commands" ON terminal_commands;
CREATE POLICY "Public can view terminal commands" ON terminal_commands FOR SELECT USING (true);
CREATE POLICY "Admin can modify terminal commands" ON terminal_commands FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view resume config" ON resume_config;
DROP POLICY IF EXISTS "Admin can modify resume config" ON resume_config;
CREATE POLICY "Public can view resume config" ON resume_config FOR SELECT USING (true);
CREATE POLICY "Admin can modify resume config" ON resume_config FOR ALL USING (auth.role() = 'authenticated');
