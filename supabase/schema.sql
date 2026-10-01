-- =========================================================
-- MahiOS: Consolidated Master Supabase Database Schema
-- Author: Mujahid Al Mahi <mujahidmahi.official@gmail.com>
-- Includes all 26 tables, Row-Level Security (RLS), Indexes, and Seed Data
-- Run this complete file directly in the Supabase SQL Editor (1-Click Setup)
-- =========================================================

-- Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- TABLE DEFINITIONS (26 TABLES)
-- =========================================================

-- 1. Site Settings Table (Single row configuration)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_title TEXT NOT NULL DEFAULT 'MahiOS 95 — Mujahid Al Mahi Digital Biography',
    owner_name TEXT NOT NULL DEFAULT 'Mujahid Al Mahi',
    headline TEXT NOT NULL DEFAULT 'Full-Stack Software Engineer & Creative Technologist',
    bio_short TEXT NOT NULL DEFAULT 'Engineering high-performance distributed systems, modern React/Next.js architectures, and tactile spatial computing experiences with 90s aesthetic soul.',
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
    seo_description TEXT NOT NULL DEFAULT 'Explore the digital biography, engineering portfolio, open-source architectures, and interactive 90s retro desktop operating system of Mujahid Al Mahi.',
    seo_keywords TEXT[] NOT NULL DEFAULT ARRAY['Mujahid Al Mahi', 'Software Engineer', 'Next.js 16', 'Full Stack Developer', 'Retro OS', 'Supabase', 'TypeScript', 'Creative Technologist'],
    og_image_url TEXT DEFAULT '',
    twitter_handle TEXT DEFAULT '@mujahidmahi',
    github_url TEXT DEFAULT 'https://github.com/mujahidalmahi',
    linkedin_url TEXT DEFAULT 'https://linkedin.com/in/mujahidmahi',
    twitter_url TEXT DEFAULT 'https://twitter.com/mujahidmahi',
    email TEXT DEFAULT 'mujahidmahi.official@gmail.com',
    phone TEXT DEFAULT '+880 1700-000000',
    location TEXT DEFAULT 'Dhaka, Bangladesh (GMT+6)',
    status_message TEXT DEFAULT 'MahiOS v2.0.0 — All Systems Operational',
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

-- 3. About Me Content Table
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

-- 17. Philosophies & Principles Table
CREATE TABLE IF NOT EXISTS philosophies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    axiom TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'engineering',
    icon_name TEXT DEFAULT 'Compass',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Feed Posts Table (Live Status Updates)
CREATE TABLE IF NOT EXISTS feed_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name TEXT NOT NULL DEFAULT 'Mujahid Al Mahi',
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT 'Just now',
    tag TEXT DEFAULT '#Engineering',
    media_url TEXT DEFAULT '',
    likes_count INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Biography Milestones Table (Life Chapters)
CREATE TABLE IF NOT EXISTS biography_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period TEXT NOT NULL,
    title TEXT NOT NULL,
    chapter TEXT NOT NULL,
    location TEXT DEFAULT 'Dhaka, Bangladesh',
    story_html TEXT NOT NULL,
    key_learning TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Social Links Table (Verified Digital IDs)
CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_name TEXT NOT NULL,
    username TEXT NOT NULL,
    url TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Globe',
    category TEXT NOT NULL DEFAULT 'social',
    is_verified BOOLEAN NOT NULL DEFAULT true,
    accent_color TEXT DEFAULT '#000080',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Ideologies Table (Tech Ethics & Worldview)
CREATE TABLE IF NOT EXISTS ideologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    summary TEXT NOT NULL,
    content_html TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Scale',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Entertainment Items Table (Media & Games)
CREATE TABLE IF NOT EXISTS entertainment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'game',
    creator TEXT NOT NULL,
    rating_score NUMERIC(3, 1) NOT NULL DEFAULT 9.5,
    review_summary TEXT NOT NULL,
    favorite_quote TEXT DEFAULT '',
    cover_url TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Aim Items Table (Strategic Roadmap)
CREATE TABLE IF NOT EXISTS aim_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_title TEXT NOT NULL,
    timeline_target TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'engineering',
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress',
    deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Dream Items Table (Dreamscape Manifestos)
CREATE TABLE IF NOT EXISTS dream_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    horizon TEXT NOT NULL DEFAULT 'decade',
    vision_manifesto TEXT NOT NULL,
    impact_area TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Sparkles',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. Wish Items Table (3 Wishes for Humanity)
CREATE TABLE IF NOT EXISTS wish_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wish_number INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    deep_reason TEXT NOT NULL,
    impact_scope TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Favourite Items Table (Personal Hall of Fame)
CREATE TABLE IF NOT EXISTS favourite_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'dev_tools',
    item_name TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    reason TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    rating NUMERIC(3, 1) NOT NULL DEFAULT 10.0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- PERFORMANCE INDEXES
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_desktop_apps_sort ON desktop_apps(sort_order);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_sort ON feed_posts(sort_order);
CREATE INDEX IF NOT EXISTS idx_philosophies_sort ON philosophies(sort_order);
CREATE INDEX IF NOT EXISTS idx_social_links_sort ON social_links(sort_order);
CREATE INDEX IF NOT EXISTS idx_aim_items_sort ON aim_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_entertainment_type ON entertainment_items(type);
CREATE INDEX IF NOT EXISTS idx_favourites_category ON favourite_items(category);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) & IDEMPOTENT POLICIES
-- =========================================================

DO $$ 
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'site_settings', 'desktop_apps', 'about_content', 'skill_categories',
        'skills', 'experiences', 'education', 'projects', 'achievements',
        'gallery_categories', 'gallery_images', 'blog_posts', 'contact_messages',
        'boot_logs', 'terminal_commands', 'resume_config', 'philosophies',
        'feed_posts', 'biography_milestones', 'social_links', 'ideologies',
        'entertainment_items', 'aim_items', 'dream_items', 'wish_items', 'favourite_items'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

-- 1. site_settings
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can modify site settings" ON site_settings;
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin can modify site settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- 2. desktop_apps
DROP POLICY IF EXISTS "Public can view desktop apps" ON desktop_apps;
DROP POLICY IF EXISTS "Admin can modify desktop apps" ON desktop_apps;
CREATE POLICY "Public can view desktop apps" ON desktop_apps FOR SELECT USING (true);
CREATE POLICY "Admin can modify desktop apps" ON desktop_apps FOR ALL USING (auth.role() = 'authenticated');

-- 3. about_content
DROP POLICY IF EXISTS "Public can view about content" ON about_content;
DROP POLICY IF EXISTS "Admin can modify about content" ON about_content;
CREATE POLICY "Public can view about content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Admin can modify about content" ON about_content FOR ALL USING (auth.role() = 'authenticated');

-- 4. skill_categories
DROP POLICY IF EXISTS "Public can view skill categories" ON skill_categories;
DROP POLICY IF EXISTS "Admin can modify skill categories" ON skill_categories;
CREATE POLICY "Public can view skill categories" ON skill_categories FOR SELECT USING (true);
CREATE POLICY "Admin can modify skill categories" ON skill_categories FOR ALL USING (auth.role() = 'authenticated');

-- 5. skills
DROP POLICY IF EXISTS "Public can view skills" ON skills;
DROP POLICY IF EXISTS "Admin can modify skills" ON skills;
CREATE POLICY "Public can view skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Admin can modify skills" ON skills FOR ALL USING (auth.role() = 'authenticated');

-- 6. experiences
DROP POLICY IF EXISTS "Public can view experiences" ON experiences;
DROP POLICY IF EXISTS "Admin can modify experiences" ON experiences;
CREATE POLICY "Public can view experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Admin can modify experiences" ON experiences FOR ALL USING (auth.role() = 'authenticated');

-- 7. education
DROP POLICY IF EXISTS "Public can view education" ON education;
DROP POLICY IF EXISTS "Admin can modify education" ON education;
CREATE POLICY "Public can view education" ON education FOR SELECT USING (true);
CREATE POLICY "Admin can modify education" ON education FOR ALL USING (auth.role() = 'authenticated');

-- 8. projects
DROP POLICY IF EXISTS "Public can view projects" ON projects;
DROP POLICY IF EXISTS "Admin can modify projects" ON projects;
CREATE POLICY "Public can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admin can modify projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- 9. achievements
DROP POLICY IF EXISTS "Public can view achievements" ON achievements;
DROP POLICY IF EXISTS "Admin can modify achievements" ON achievements;
CREATE POLICY "Public can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Admin can modify achievements" ON achievements FOR ALL USING (auth.role() = 'authenticated');

-- 10. gallery_categories
DROP POLICY IF EXISTS "Public can view gallery categories" ON gallery_categories;
DROP POLICY IF EXISTS "Admin can modify gallery categories" ON gallery_categories;
CREATE POLICY "Public can view gallery categories" ON gallery_categories FOR SELECT USING (true);
CREATE POLICY "Admin can modify gallery categories" ON gallery_categories FOR ALL USING (auth.role() = 'authenticated');

-- 11. gallery_images
DROP POLICY IF EXISTS "Public can view gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Admin can modify gallery images" ON gallery_images;
CREATE POLICY "Public can view gallery images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Admin can modify gallery images" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');

-- 12. blog_posts
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can modify blog posts" ON blog_posts;
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin can modify blog posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- 13. contact_messages
DROP POLICY IF EXISTS "Public can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin can view and manage contact messages" ON contact_messages;
CREATE POLICY "Public can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view and manage contact messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');

-- 14. boot_logs
DROP POLICY IF EXISTS "Public can view boot logs" ON boot_logs;
DROP POLICY IF EXISTS "Admin can modify boot logs" ON boot_logs;
CREATE POLICY "Public can view boot logs" ON boot_logs FOR SELECT USING (true);
CREATE POLICY "Admin can modify boot logs" ON boot_logs FOR ALL USING (auth.role() = 'authenticated');

-- 15. terminal_commands
DROP POLICY IF EXISTS "Public can view terminal commands" ON terminal_commands;
DROP POLICY IF EXISTS "Admin can modify terminal commands" ON terminal_commands;
CREATE POLICY "Public can view terminal commands" ON terminal_commands FOR SELECT USING (true);
CREATE POLICY "Admin can modify terminal commands" ON terminal_commands FOR ALL USING (auth.role() = 'authenticated');

-- 16. resume_config
DROP POLICY IF EXISTS "Public can view resume config" ON resume_config;
DROP POLICY IF EXISTS "Admin can modify resume config" ON resume_config;
CREATE POLICY "Public can view resume config" ON resume_config FOR SELECT USING (true);
CREATE POLICY "Admin can modify resume config" ON resume_config FOR ALL USING (auth.role() = 'authenticated');

-- 17. philosophies
DROP POLICY IF EXISTS "Public can view philosophies" ON philosophies;
DROP POLICY IF EXISTS "Admin can modify philosophies" ON philosophies;
CREATE POLICY "Public can view philosophies" ON philosophies FOR SELECT USING (true);
CREATE POLICY "Admin can modify philosophies" ON philosophies FOR ALL USING (auth.role() = 'authenticated');

-- 18. feed_posts
DROP POLICY IF EXISTS "Public can view feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Admin can modify feed posts" ON feed_posts;
CREATE POLICY "Public can view feed posts" ON feed_posts FOR SELECT USING (true);
CREATE POLICY "Admin can modify feed posts" ON feed_posts FOR ALL USING (auth.role() = 'authenticated');

-- 19. biography_milestones
DROP POLICY IF EXISTS "Public can view biography milestones" ON biography_milestones;
DROP POLICY IF EXISTS "Admin can modify biography milestones" ON biography_milestones;
CREATE POLICY "Public can view biography milestones" ON biography_milestones FOR SELECT USING (true);
CREATE POLICY "Admin can modify biography milestones" ON biography_milestones FOR ALL USING (auth.role() = 'authenticated');

-- 20. social_links
DROP POLICY IF EXISTS "Public can view social links" ON social_links;
DROP POLICY IF EXISTS "Admin can modify social links" ON social_links;
CREATE POLICY "Public can view social links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Admin can modify social links" ON social_links FOR ALL USING (auth.role() = 'authenticated');

-- 21. ideologies
DROP POLICY IF EXISTS "Public can view ideologies" ON ideologies;
DROP POLICY IF EXISTS "Admin can modify ideologies" ON ideologies;
CREATE POLICY "Public can view ideologies" ON ideologies FOR SELECT USING (true);
CREATE POLICY "Admin can modify ideologies" ON ideologies FOR ALL USING (auth.role() = 'authenticated');

-- 22. entertainment_items
DROP POLICY IF EXISTS "Public can view entertainment items" ON entertainment_items;
DROP POLICY IF EXISTS "Admin can modify entertainment items" ON entertainment_items;
CREATE POLICY "Public can view entertainment items" ON entertainment_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify entertainment items" ON entertainment_items FOR ALL USING (auth.role() = 'authenticated');

-- 23. aim_items
DROP POLICY IF EXISTS "Public can view aim items" ON aim_items;
DROP POLICY IF EXISTS "Admin can modify aim items" ON aim_items;
CREATE POLICY "Public can view aim items" ON aim_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify aim items" ON aim_items FOR ALL USING (auth.role() = 'authenticated');

-- 24. dream_items
DROP POLICY IF EXISTS "Public can view dream items" ON dream_items;
DROP POLICY IF EXISTS "Admin can modify dream items" ON dream_items;
CREATE POLICY "Public can view dream items" ON dream_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify dream items" ON dream_items FOR ALL USING (auth.role() = 'authenticated');

-- 25. wish_items
DROP POLICY IF EXISTS "Public can view wish items" ON wish_items;
DROP POLICY IF EXISTS "Admin can modify wish items" ON wish_items;
CREATE POLICY "Public can view wish items" ON wish_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify wish items" ON wish_items FOR ALL USING (auth.role() = 'authenticated');

-- 26. favourite_items
DROP POLICY IF EXISTS "Public can view favourite items" ON favourite_items;
DROP POLICY IF EXISTS "Admin can modify favourite items" ON favourite_items;
CREATE POLICY "Public can view favourite items" ON favourite_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify favourite items" ON favourite_items FOR ALL USING (auth.role() = 'authenticated');

-- =========================================================
-- INITIAL SEED DATA (IDEMPOTENT INSERTS)
-- =========================================================

-- Seed Site Settings
INSERT INTO site_settings (
    site_title, owner_name, headline, bio_short,
    email, location, status_message, copyright_text,
    twitter_handle, github_url, linkedin_url
) VALUES (
    'MahiOS 95 — Mujahid Al Mahi Digital Biography',
    'Mujahid Al Mahi',
    'Full-Stack Software Engineer & Creative Technologist',
    'Engineering high-performance distributed systems, modern React/Next.js architectures, and tactile spatial computing experiences with 90s aesthetic soul.',
    'mujahidmahi.official@gmail.com',
    'Dhaka, Bangladesh (GMT+6)',
    'MahiOS v2.0.0 — All Systems Operational',
    '© 1995-2026 Mujahid Al Mahi. All systems operational.',
    '@mujahidmahi',
    'https://github.com/mujahidalmahi',
    'https://linkedin.com/in/mujahidmahi'
) ON CONFLICT DO NOTHING;

-- Seed About Content
INSERT INTO about_content (
    full_name, taglines, bio_html, location,
    experience_years, projects_completed, coffee_cups,
    quote, quote_author
) VALUES (
    'Mujahid Al Mahi',
    ARRAY['Full-Stack Systems Engineer', 'Next.js 16 & React Specialist', 'Creative Technologist', 'Open Source Craftsman'],
    '<p>Hello world! I am <strong>Mujahid Al Mahi</strong>, a passionate software engineer based in Dhaka, Bangladesh. I specialize in architecting high-throughput full-stack web platforms, edge-rendered applications, and deeply creative digital interfaces.</p><p>My engineering philosophy centers on <em>tactile software design</em> — blending blistering performance (sub-50ms interaction latencies) with memorable, sensory aesthetics.</p>',
    'Dhaka, Bangladesh',
    4.5,
    28,
    1480,
    'Simplicity is prerequisite for reliability.',
    'Edsger W. Dijkstra'
) ON CONFLICT DO NOTHING;

-- Seed Desktop Applications
INSERT INTO desktop_apps (app_id, title, icon_name, component_key, default_x, default_y, default_width, default_height, is_system_app, sort_order, category) VALUES
('about', 'About Me', 'User', 'AboutApp', 60, 40, 780, 540, true, 1, 'core'),
('experience', 'Career Roles', 'Briefcase', 'ExperienceApp', 90, 60, 800, 550, true, 2, 'core'),
('projects', 'Projects Directory', 'FolderGit2', 'ProjectsApp', 120, 80, 840, 580, true, 3, 'core'),
('skills', 'Skills & Tech Radar', 'Cpu', 'SkillsApp', 150, 100, 780, 540, true, 4, 'skills'),
('philosophy', 'Philosophy', 'Compass', 'PhilosophyApp', 180, 120, 780, 530, false, 5, 'mindset'),
('feed', 'Live Feed', 'Radio', 'FeedApp', 210, 140, 740, 560, false, 6, 'social'),
('biography', 'Life Timeline', 'BookOpen', 'BiographyApp', 100, 70, 820, 560, false, 7, 'core'),
('socials', 'Social Links', 'Share2', 'SocialsApp', 130, 90, 720, 500, false, 8, 'social'),
('ideology', 'Tech Ideology', 'Scale', 'IdeologyApp', 160, 110, 760, 520, false, 9, 'mindset'),
('entertainment', 'Media & Games', 'Gamepad2', 'EntertainmentApp', 190, 130, 800, 550, false, 10, 'lifestyle'),
('aim', 'Strategic Aims', 'Target', 'AimApp', 140, 100, 760, 530, false, 11, 'vision'),
('dream', 'Dreamscape', 'Sparkles', 'DreamApp', 200, 150, 780, 540, false, 12, 'vision'),
('wishes', '3 Wishes', 'Flame', 'WishesApp', 220, 170, 740, 500, false, 13, 'vision'),
('favourites', 'Favourites', 'Star', 'FavouritesApp', 150, 110, 800, 550, false, 14, 'lifestyle'),
('education', 'Education', 'GraduationCap', 'EducationApp', 110, 80, 760, 520, true, 15, 'career'),
('terminal', 'MS-DOS Prompt', 'Terminal', 'TerminalApp', 80, 60, 720, 480, true, 16, 'utilities'),
('gallery', 'Photo Archives', 'Image', 'GalleryApp', 130, 110, 820, 560, true, 17, 'media'),
('achievements', 'Honors & Certs', 'Award', 'AchievementsApp', 160, 140, 760, 530, true, 18, 'career'),
('blog', 'Dev Notes', 'FileText', 'BlogApp', 110, 90, 820, 560, true, 19, 'media'),
('resume', 'Curriculum Vitae', 'FileBadge', 'ResumeApp', 140, 110, 760, 580, true, 20, 'career'),
('contact', 'Mail Client', 'Mail', 'ContactApp', 170, 130, 700, 520, true, 21, 'social'),
('settings', 'Control Panel', 'Settings', 'SettingsApp', 100, 80, 740, 520, true, 22, 'utilities')
ON CONFLICT (app_id) DO NOTHING;

-- Seed Terminal Commands
INSERT INTO terminal_commands (command, response_text, description, is_hidden, sort_order) VALUES
('help', 'Available MahiOS Commands:\n  help        - List all executable CLI commands\n  about       - Print summary biographical story\n  skills      - Survey technical stack and competencies\n  experience  - Review career milestones & companies\n  projects    - Browse active software projects\n  contact     - Direct communication channels\n  calc <expr> - Evaluate mathematical expression\n  theme <clr> - Change wallpaper color (teal, navy, charcoal)\n  neofetch    - System telemetry report\n  dir / ls    - Directory list of virtual files\n  cat <file>  - Output contents of a file\n  matrix      - Toggle matrix phosphor rain\n  reboot      - Cold system reboot\n  clear / cls - Clear terminal display', 'Displays system commands', false, 1),
('about', 'Mujahid Al Mahi -- Full-Stack Software Engineer based in Dhaka, Bangladesh. Passionate about Next.js 16, Supabase, TypeScript, and high-performance tactile software.', 'Displays biographical summary', false, 2),
('whoami', 'Guest Operator @ MahiOS Terminal [Authenticated via SSL Session]', 'Displays current session user', false, 3),
('quote', '"Simplicity is prerequisite for reliability." -- Edsger W. Dijkstra', 'Prints random engineering wisdom', false, 4)
ON CONFLICT (command) DO NOTHING;

-- Seed 3 Wishes for Humanity
INSERT INTO wish_items (wish_number, title, deep_reason, impact_scope, category) VALUES
(1, 'Universal Clean & Abundant Fusion Energy', 'Energy abundance is the fundamental constraint on water desalination, compute power, and human progress.', 'Planetary / Civilizational', 'energy'),
(2, 'Eradication of Neurological & Cognitive Diseases', 'Preserving memory, cognitive dignity, and consciousness across all human lifespans.', 'Biological / Healthcare', 'health'),
(3, 'Frictionless Open Access to Human Knowledge', 'Democratizing high-level algorithmic education, research tools, and compute for every aspiring mind.', 'Intellectual / Educational', 'education')
ON CONFLICT (wish_number) DO NOTHING;
