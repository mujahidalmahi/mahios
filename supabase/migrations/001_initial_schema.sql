-- =========================================================
-- MahiOS: Complete Supabase Database Schema & Initial Seed
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Site Settings Table (Single row configuration)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_title TEXT NOT NULL DEFAULT 'MahiOS v2.0 - Mujahid Mahi Digital Biography',
    owner_name TEXT NOT NULL DEFAULT 'Mujahid Islam Mahi',
    headline TEXT NOT NULL DEFAULT 'Full-Stack Software Engineer & Creative Technologist',
    bio_short TEXT NOT NULL DEFAULT 'Building resilient software, retro digital spaces, and high-performance applications.',
    avatar_url TEXT DEFAULT '',
    favicon_url TEXT DEFAULT '',
    boot_title TEXT NOT NULL DEFAULT 'MahiOS BIOS v4.51PG',
    boot_subtitle TEXT NOT NULL DEFAULT 'Copyright (C) 1995-2026, Mahi Interactive Systems Inc.',
    terminal_speed INTEGER NOT NULL DEFAULT 45,
    crt_scanlines_enabled BOOLEAN NOT NULL DEFAULT true,
    crt_curvature_enabled BOOLEAN NOT NULL DEFAULT true,
    sound_effects_enabled BOOLEAN NOT NULL DEFAULT true,
    matrix_rain_enabled BOOLEAN NOT NULL DEFAULT true,
    seo_title TEXT NOT NULL DEFAULT 'Mujahid Mahi | Digital Biography & Interactive OS',
    seo_description TEXT NOT NULL DEFAULT 'Step inside MahiOS: a 90s vintage CRT digital biography, portfolio, and interactive OS showcasing the engineering journey, projects, and skills of Mujahid Mahi.',
    seo_keywords TEXT[] NOT NULL DEFAULT ARRAY['Mujahid Mahi', 'Full Stack Developer', 'MahiOS', 'Software Engineer', 'Next.js 16', 'Interactive Portfolio', 'Creative Developer'],
    og_image_url TEXT DEFAULT '',
    twitter_handle TEXT DEFAULT '@mujahidmahi',
    github_url TEXT DEFAULT 'https://github.com/mujahidmahi',
    linkedin_url TEXT DEFAULT 'https://linkedin.com/in/mujahidmahi',
    twitter_url TEXT DEFAULT 'https://twitter.com/mujahidmahi',
    email TEXT DEFAULT 'contact@mujahidmahi.xyz',
    phone TEXT DEFAULT '+880 1700-000000',
    location TEXT DEFAULT 'Dhaka, Bangladesh',
    status_message TEXT DEFAULT 'System operational. Coding the future in 8-bit aesthetic.',
    copyright_text TEXT DEFAULT '© 2026 Mujahid Mahi. All Rights Reserved. Built with MahiOS.',
    theme_accent_color TEXT DEFAULT '#000080',
    desktop_background_color TEXT DEFAULT '#008080',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Desktop Applications Table
CREATE TABLE IF NOT EXISTS desktop_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    icon_url TEXT DEFAULT '',
    component_key TEXT NOT NULL,
    default_x INTEGER NOT NULL DEFAULT 100,
    default_y INTEGER NOT NULL DEFAULT 50,
    default_width INTEGER NOT NULL DEFAULT 700,
    default_height INTEGER NOT NULL DEFAULT 500,
    is_system_app BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    category TEXT DEFAULT 'system',
    badge_text TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. About Me Table
CREATE TABLE IF NOT EXISTS about_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL DEFAULT 'Mujahid Islam Mahi',
    taglines TEXT[] NOT NULL DEFAULT ARRAY['Full-Stack Architect', 'System Thinker', 'Retro Enthusiast', 'Open Source Contributor'],
    bio_html TEXT NOT NULL DEFAULT '<p>Hello world! I am <strong>Mujahid Islam Mahi</strong>, a passionate software engineer and creative technologist who builds high-impact web apps, robust architectures, and memorable interactive web experiences.</p><p>With a deep appreciation for the aesthetic and simplicity of early computing combined with modern high-performance cloud architecture, I turn complex problems into elegant software solutions.</p>',
    avatar_url TEXT DEFAULT '',
    resume_url TEXT DEFAULT '',
    status_text TEXT DEFAULT 'Available for high-impact roles & creative engineering projects',
    location TEXT DEFAULT 'Dhaka, Bangladesh',
    experience_years NUMERIC DEFAULT 4.5,
    projects_completed INTEGER DEFAULT 35,
    coffee_cups INTEGER DEFAULT 2840,
    interests TEXT[] NOT NULL DEFAULT ARRAY['Operating Systems', 'Retro Computing', 'Cloud Architecture', 'Distributed Systems', 'Pixel Art', 'Sci-Fi Literature'],
    quote TEXT DEFAULT 'Simplicity is prerequisite for reliability.',
    quote_author TEXT DEFAULT 'Edsger W. Dijkstra',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Skill Categories Table
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Code',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    stats JSONB DEFAULT ''{"stars": 0, "users": "1k+", "uptime": "99.9%"}''::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Achievements & Certifications Table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT DEFAULT 'Message from MahiOS Visitor',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    ip_address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Boot Log Sequences Table (Hacker Boot Sequence)
CREATE TABLE IF NOT EXISTS boot_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    delay_ms INTEGER NOT NULL DEFAULT 120,
    status_type TEXT NOT NULL DEFAULT 'OK',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 15. Terminal Commands Table (Interactive Terminal App)
CREATE TABLE IF NOT EXISTS terminal_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    command TEXT NOT NULL UNIQUE,
    response_text TEXT NOT NULL,
    description TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 16. Resume Configuration Table
CREATE TABLE IF NOT EXISTS resume_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_url TEXT DEFAULT '',
    last_updated_date TEXT DEFAULT '2026',
    preview_image_url TEXT DEFAULT '',
    download_filename TEXT DEFAULT 'Mujahid_Mahi_Resume.pdf',
    summary_markdown TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

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

CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin can modify site settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view desktop apps" ON desktop_apps FOR SELECT USING (true);
CREATE POLICY "Admin can modify desktop apps" ON desktop_apps FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view about content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Admin can modify about content" ON about_content FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view skill categories" ON skill_categories FOR SELECT USING (true);
CREATE POLICY "Admin can modify skill categories" ON skill_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Admin can modify skills" ON skills FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Admin can modify experiences" ON experiences FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view education" ON education FOR SELECT USING (true);
CREATE POLICY "Admin can modify education" ON education FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admin can modify projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Admin can modify achievements" ON achievements FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view gallery categories" ON gallery_categories FOR SELECT USING (true);
CREATE POLICY "Admin can modify gallery categories" ON gallery_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view gallery images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Admin can modify gallery images" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin can modify blog posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view and manage contact messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view boot logs" ON boot_logs FOR SELECT USING (true);
CREATE POLICY "Admin can modify boot logs" ON boot_logs FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view terminal commands" ON terminal_commands FOR SELECT USING (true);
CREATE POLICY "Admin can modify terminal commands" ON terminal_commands FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view resume config" ON resume_config FOR SELECT USING (true);
CREATE POLICY "Admin can modify resume config" ON resume_config FOR ALL USING (auth.role() = 'authenticated');

-- =========================================================
-- INITIAL SEED DATA
-- =========================================================

INSERT INTO site_settings (
    site_title, owner_name, headline, bio_short, 
    boot_title, boot_subtitle, terminal_speed, 
    crt_scanlines_enabled, crt_curvature_enabled, 
    sound_effects_enabled, matrix_rain_enabled,
    seo_title, seo_description, seo_keywords,
    email, location, status_message
) VALUES (
    'MahiOS v2.0 - Mujahid Mahi Digital Biography',
    'Mujahid Islam Mahi',
    'Full-Stack Software Engineer & Creative Technologist',
    'Building high-performance web systems, distributed backends, and creative interactive experiences with retro soul.',
    'MahiOS Energy Star BIOS v4.51PG',
    'Copyright (C) 1995-2026, Mahi Interactive Architecture Inc.',
    40,
    true, true, true, true,
    'Mujahid Mahi | Full-Stack Engineer & Creative Developer',
    'Enter MahiOS: An interactive 90s vintage operating system showcasing the full-stack engineering portfolio, projects, skills, and biography of Mujahid Islam Mahi.',
    ARRAY['Mujahid Mahi', 'Mujahid Islam Mahi', 'Software Engineer', 'Full Stack Developer', 'Next.js 16', 'React', 'Node.js', 'PostgreSQL', 'MahiOS', 'Vintage Portfolio', 'Creative UI'],
    'contact@mujahidmahi.xyz',
    'Dhaka, Bangladesh',
    'Online - Crafting high-performance digital systems'
) ON CONFLICT DO NOTHING;

INSERT INTO desktop_apps (app_id, title, icon_name, component_key, default_x, default_y, default_width, default_height, is_system_app, is_visible, sort_order, category, badge_text) VALUES
('about', 'About Me', 'User', 'AboutApp', 80, 50, 720, 520, true, true, 1, 'personal', 'Bio'),
('experience', 'Experience.exe', 'Briefcase', 'ExperienceApp', 120, 70, 740, 540, false, true, 2, 'work', '4+ Yrs'),
('projects', 'Projects_Dir', 'FolderGit2', 'ProjectsApp', 160, 90, 800, 560, false, true, 3, 'work', 'Featured'),
('skills', 'Tech_Stack.dll', 'Cpu', 'SkillsApp', 200, 110, 700, 500, false, true, 4, 'skills', 'Verified'),
('education', 'Education.doc', 'GraduationCap', 'EducationApp', 240, 130, 680, 480, false, true, 5, 'education', ''),
('terminal', 'MS-DOS Prompt', 'Terminal', 'TerminalApp', 280, 80, 680, 440, true, true, 6, 'system', 'CLI'),
('gallery', 'Memories.bmp', 'Image', 'GalleryApp', 140, 100, 760, 520, false, true, 7, 'media', 'Photos'),
('achievements', 'Trophies.dat', 'Award', 'AchievementsApp', 180, 120, 680, 480, false, true, 8, 'awards', 'Certs'),
('blog', 'Dev_Notes.txt', 'FileText', 'BlogApp', 220, 60, 750, 540, false, true, 9, 'articles', 'Read'),
('resume', 'Resume.pdf', 'FileBadge', 'ResumeApp', 100, 80, 700, 560, false, true, 10, 'career', 'PDF'),
('contact', 'Mail_Client.exe', 'Mail', 'ContactApp', 260, 140, 640, 480, false, true, 11, 'contact', 'Send'),
('settings', 'Control Panel', 'Settings', 'SettingsApp', 300, 160, 600, 440, true, true, 12, 'system', 'Config')
ON CONFLICT (app_id) DO NOTHING;

INSERT INTO about_content (
    full_name, taglines, bio_html, status_text, location, experience_years, projects_completed, coffee_cups, interests, quote, quote_author
) VALUES (
    'Mujahid Islam Mahi',
    ARRAY['Full-Stack Software Engineer', 'Distributed Systems Enthusiast', 'Creative Technologist', 'Open Source Hacker'],
    '<p>Hi, I am <strong>Mujahid Islam Mahi</strong>! I am a full-stack engineer driven by curiosity, architectural elegance, and the art of crafting engaging digital products.</p><p>My engineering philosophy blends <em>high-throughput backend architecture</em> with <em>meticulously designed frontends</em>. From scalable microservices and database optimizations to novel web interactions like this vintage 90s OS interface, I build software that leaves a lasting impression.</p><p>When I am not coding or architecting systems, you can find me exploring vintage computing history, tinkering with retro hardware emulators, and sharing knowledge with fellow builders.</p>',
    'Open for Engineering Leadership, Full-Stack Roles & High-Impact Freelance',
    'Dhaka, Bangladesh (Available Worldwide Remote)',
    4.5,
    35,
    2840,
    ARRAY['Distributed Systems', 'Retro OS Design', 'Next.js & React', 'PostgreSQL & Database Tuning', 'Microservices', 'Creative Web Experiences'],
    'Computers are like bicycles for our minds.',
    'Steve Jobs'
) ON CONFLICT DO NOTHING;

INSERT INTO skill_categories (id, name, icon, sort_order) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 'Frontend Engineering', 'Layout', 1),
('a1b2c3d4-e5f6-4a5b-8c9d-012345678902', 'Backend & APIs', 'Server', 2),
('a1b2c3d4-e5f6-4a5b-8c9d-012345678903', 'Databases & Storage', 'Database', 3),
('a1b2c3d4-e5f6-4a5b-8c9d-012345678904', 'Cloud, DevOps & Tools', 'Cloud', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (name, category_id, proficiency, icon_name, years_of_experience, is_featured, sort_order) VALUES
('Next.js 16 / React 19', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 95, 'Layers', 4, true, 1),
('TypeScript / JavaScript (ESNext)', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 94, 'FileCode2', 4.5, true, 2),
('Tailwind CSS 4 & Responsive UI', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 96, 'Palette', 4, true, 3),
('Framer Motion & Interactive Animations', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901', 90, 'Sparkles', 3, true, 4),
('Node.js / Express / NestJS', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678902', 92, 'Terminal', 4, true, 1),
('RESTful APIs & GraphQL', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678902', 93, 'Network', 4, true, 2),
('Authentication & OAuth / Supabase Auth', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678902', 90, 'ShieldCheck', 3.5, true, 3),
('PostgreSQL & Row-Level Security', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678903', 92, 'Database', 4, true, 1),
('Supabase (PostgreSQL, Realtime, Storage)', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678903', 94, 'DatabaseZap', 3.5, true, 2),
('Redis Caching & Pub/Sub', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678903', 85, 'Flame', 3, true, 3),
('Git, GitHub Actions & CI/CD', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678904', 92, 'GitBranch', 4, true, 1),
('Docker & Containerization', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678904', 85, 'Box', 3, true, 2),
('Vercel, AWS & Cloudflare Edge', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678904', 88, 'CloudRain', 3.5, true, 3),
('SEO Optimization & Web Vitals', 'a1b2c3d4-e5f6-4a5b-8c9d-012345678904', 95, 'SearchCheck', 4, true, 4)
ON CONFLICT DO NOTHING;

INSERT INTO experiences (company, role, location, employment_type, start_date, end_date, is_current, description_html, achievements, technologies, company_url, sort_order) VALUES
('Tech Innovations Inc.', 'Senior Full-Stack Engineer', 'Remote', 'Full-time', '2024-01', 'Present', true, 
'<p>Leading frontend and backend engineering initiatives for high-load cloud platforms. Architecting real-time collaboration engines and optimizing server-side render pipelines.</p>',
ARRAY['Reduced initial page load by 54% using Next.js caching and edge streaming', 'Architected multi-tenant database structure using PostgreSQL with strict RLS policies', 'Mentored junior developers and established automated CI/CD deployment pipelines'],
ARRAY['Next.js 16', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'Redis'],
'https://example.com', 1),
('Digital Matrix Labs', 'Full-Stack Developer', 'Dhaka, Bangladesh', 'Full-time', '2022-06', '2023-12', false,
'<p>Engineered dynamic web applications, interactive dashboards, and REST API microservices for global clients.</p>',
ARRAY['Built 12+ production client web portals with 99.9% uptime', 'Integrated payment gateways, real-time notifications, and dynamic analytics', 'Refactored legacy monolith into clean, testable service layers'],
ARRAY['React', 'Node.js', 'Express', 'PostgreSQL', 'REST APIs', 'AWS S3', 'Framer Motion'],
'https://example.com', 2),
('Creative Pixels Studio', 'Frontend Engineer & UI Specialist', 'Dhaka, Bangladesh', 'Part-time', '2021-01', '2022-05', false,
'<p>Designed and built highly interactive user interfaces with custom animations and pixel-perfect design systems.</p>',
ARRAY['Engineered custom canvas animations and responsive design systems', 'Achieved 100/100 Lighthouse performance scores across all delivered client sites'],
ARRAY['JavaScript', 'CSS3', 'React', 'Animation APIs', 'Figma'],
'https://example.com', 3)
ON CONFLICT DO NOTHING;

INSERT INTO education (institution, degree, field_of_study, start_year, end_year, grade, description_html, activities, sort_order) VALUES
('Leading University', 'Bachelor of Science (B.Sc.)', 'Computer Science & Engineering', '2019', '2023', 'First Class Distinction',
'<p>Specialized in Algorithms, Distributed Systems, Software Engineering Methodologies, and Database Systems. Authored research on high-concurrency web architecture.</p>',
ARRAY['President of University Programming & Tech Club', 'Champion in Inter-University Hackathon 2022', 'Organized national tech workshops and competitive coding bootcamps'],
1)
ON CONFLICT DO NOTHING;

INSERT INTO projects (title, slug, summary, description_html, tags, category, live_url, github_url, featured, sort_order, stats) VALUES
('MahiOS - Digital Biography Operating System', 'mahios-retro-biography', 'A fully dynamic 90s vintage CRT digital biography OS built with Next.js 16, Supabase, and Tailwind CSS.',
'<p>MahiOS is an innovative personal website masquerading as a nostalgic 1990s desktop operating system running inside a CRT monitor. It features window management, draggable panels, hacker-style boot sequences, a complete administrative control panel, and 100% dynamic database-driven content.</p>',
ARRAY['Next.js 16', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Zustand', 'Framer Motion'],
'Full Stack', 'https://mujahidmahi.xyz', 'https://github.com/mujahidmahi/biography', true, 1,
'{"stars": 142, "users": "5k+", "uptime": "100%"}'::JSONB),
('CloudPulse - Realtime Server Telemetry & Monitoring', 'cloudpulse-telemetry', 'A high-throughput distributed infrastructure monitoring dashboard with live metrics and alerts.',
'<p>Real-time analytics engine processing server metrics, memory utilization, and network logs with sub-second websocket streaming and alerting triggers.</p>',
ARRAY['Node.js', 'React', 'PostgreSQL', 'Redis', 'WebSockets', 'Chart.js'],
'DevOps / Backend', 'https://example.com', 'https://github.com/mujahidmahi', true, 2,
'{"stars": 89, "users": "2k+", "uptime": "99.98%"}'::JSONB),
('RetroSynth - 8-Bit Web Audio Synthesizer', 'retrosynth-8bit-audio', 'A browser-based retro synthesizer and chiptune audio workstation with customizable sound waves.',
'<p>Web Audio API based synthesizer creating authentic 8-bit sound effects, vintage chords, and exportable soundscapes.</p>',
ARRAY['TypeScript', 'Web Audio API', 'Canvas', 'Tailwind CSS'],
'Creative Tech', 'https://example.com', 'https://github.com/mujahidmahi', true, 3,
'{"stars": 65, "users": "800+", "uptime": "100%"}'::JSONB)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO achievements (title, issuer, issue_date, description, badge_icon, sort_order) VALUES
('National Hackathon Champion 2022', 'Tech Innovation Council', '2022-10', '1st Place out of 120+ teams for building an automated disaster relief coordination network.', 'Trophy', 1),
('Certified PostgreSQL Professional & Data Architect', 'Postgres Global Council', '2023-04', 'Demonstrated proficiency in database indexing, query planning, and high-concurrency replication.', 'Award', 2),
('Open Source Excellence Contributor Award', 'Dev Community', '2024-08', 'Recognized for impactful contributions to modern developer tooling and web libraries.', 'Star', 3)
ON CONFLICT DO NOTHING;

INSERT INTO boot_logs (message, delay_ms, status_type, sort_order, is_active) VALUES
('MAHI-BIOS (C) 1995-2026 Interactive Systems Corp.', 180, 'INFO', 1, true),
('Main Processor: Quantum RISC-V @ 4.80 GHz [8 Cores Detected]', 160, 'INFO', 2, true),
('Memory Test: 65536KB OK (Shadow RAM Initialized)', 220, 'OK', 3, true),
('Checking Primary Master: [SUPABASE-PG-SQL-DRIVE] ... Detected', 240, 'OK', 4, true),
('Checking Primary Slave: [CLOUDINARY-STORAGE-CACHE] ... Mounted', 240, 'OK', 5, true),
('Initializing MahiOS Kernel v2.0.26-release...', 280, 'INIT', 6, true),
('Mounting Virtual Filesystems: /biography, /projects, /skills...', 260, 'OK', 7, true),
('Decrypting Neural Archives & Personal Logs...', 320, 'OK', 8, true),
('Loading CRT Display Driver (Scanlines: Active, Curvature: 100%)...', 250, 'OK', 9, true),
('Starting Desktop Window Manager (MahiOS UI Engine)...', 280, 'OK', 10, true),
('SYSTEM READY: Booting into Interactive User Space...', 350, 'COMPLETE', 11, true)
ON CONFLICT DO NOTHING;

INSERT INTO terminal_commands (command, response_text, description, is_hidden, sort_order) VALUES
('help', 'Available commands: help, about, skills, experience, projects, contact, resume, clear, matrix, reboot, date, whoami, quote, sudo', 'List all available shell commands', false, 1),
('about', 'Mujahid Islam Mahi -- Full-Stack Software Engineer & Creative Technologist based in Dhaka, Bangladesh.', 'Display quick overview of Mahi', false, 2),
('skills', 'Tech Stack: Next.js 16, React 19, TypeScript, Node.js, PostgreSQL, Supabase, Tailwind CSS 4, Docker, Redis.', 'Show technical skill highlights', false, 3),
('projects', 'Key projects: 1) MahiOS (Retro Biography)  2) CloudPulse (Telemetry)  3) RetroSynth (Audio Synthesizer). Type "open projects" to view in GUI.', 'List top engineering projects', false, 4),
('contact', 'Email: contact@mujahidmahi.xyz | GitHub: github.com/mujahidmahi | LinkedIn: linkedin.com/in/mujahidmahi', 'Show contact channels', false, 5),
('whoami', 'visitor@mahios:~$ You are an esteemed guest exploring the digital mind of Mujahid Mahi.', 'Display current user session', false, 6),
('quote', '"Simplicity is prerequisite for reliability." -- Edsger W. Dijkstra', 'Print a random engineering quote', false, 7),
('sudo', 'Nice try! Permission denied: You need physical access to the CRT monitor.', 'Execute superuser privilege', true, 8),
('matrix', 'Entering the rabbit hole... Matrix Rain mode engaged.', 'Trigger visual Matrix hacker mode', false, 9),
('reboot', 'Initiating system cold reboot sequence...', 'Restart MahiOS boot sequence', false, 10),
('date', 'Current System Time: September 2026 - The Future is Built Today.', 'Display operating system timestamp', false, 11)
ON CONFLICT (command) DO NOTHING;

INSERT INTO resume_config (pdf_url, last_updated_date, download_filename, summary_markdown) VALUES
('https://example.com/mujahid_mahi_resume.pdf', 'September 2026', 'Mujahid_Islam_Mahi_Resume.pdf', 
'### Mujahid Islam Mahi
**Full-Stack Software Engineer** | Dhaka, Bangladesh | contact@mujahidmahi.xyz

#### Professional Summary
Experienced Software Engineer with expertise in modern full-stack web applications, distributed architecture, and cloud database optimization.

#### Core Competencies
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Performance Tuning
- **Backend**: Node.js, Express, REST/GraphQL APIs, Microservices, Auth Security
- **Databases**: PostgreSQL, Supabase, Redis, Query Optimization
- **DevOps**: Docker, CI/CD, Git, Vercel, Cloud Architecture')
ON CONFLICT DO NOTHING;
