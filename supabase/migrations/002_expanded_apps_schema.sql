-- =========================================================
-- Migration 002: 10 New Dynamic Applications Schema & Seeds
-- =========================================================

-- 1. Philosophies Table
CREATE TABLE IF NOT EXISTS philosophies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    axiom TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'engineering',
    icon_name TEXT DEFAULT 'Compass',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Feed Posts Table (Micro-pulses)
CREATE TABLE IF NOT EXISTS feed_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name TEXT NOT NULL DEFAULT 'Mujahid Islam Mahi',
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT 'Just now',
    tag TEXT DEFAULT '#Engineering',
    media_url TEXT DEFAULT '',
    likes_count INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Biography Milestones Table (Life Timeline Chapters)
CREATE TABLE IF NOT EXISTS biography_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 4. Social Links & Digital ID Table
CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 5. Ideologies & Technological Ethics Table
CREATE TABLE IF NOT EXISTS ideologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    summary TEXT NOT NULL,
    content_html TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Scale',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Entertainment & Creative Media Table
CREATE TABLE IF NOT EXISTS entertainment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 7. Strategic Aims & Roadmap Table
CREATE TABLE IF NOT EXISTS aim_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 8. Dreamscape & Grand Ambitions Table
CREATE TABLE IF NOT EXISTS dream_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    horizon TEXT NOT NULL DEFAULT 'decade',
    vision_manifesto TEXT NOT NULL,
    impact_area TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Sparkles',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 3 Wishes for Humanity Table
CREATE TABLE IF NOT EXISTS wish_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wish_number INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    deep_reason TEXT NOT NULL,
    impact_scope TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Favourites & Hall of Fame Table
CREATE TABLE IF NOT EXISTS favourite_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
-- ROW LEVEL SECURITY (RLS)
-- =========================================================

ALTER TABLE philosophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE biography_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE entertainment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE aim_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourite_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view philosophies" ON philosophies FOR SELECT USING (true);
CREATE POLICY "Admin can modify philosophies" ON philosophies FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view feed posts" ON feed_posts FOR SELECT USING (true);
CREATE POLICY "Admin can modify feed posts" ON feed_posts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view biography milestones" ON biography_milestones FOR SELECT USING (true);
CREATE POLICY "Admin can modify biography milestones" ON biography_milestones FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view social links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Admin can modify social links" ON social_links FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view ideologies" ON ideologies FOR SELECT USING (true);
CREATE POLICY "Admin can modify ideologies" ON ideologies FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view entertainment items" ON entertainment_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify entertainment items" ON entertainment_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view aim items" ON aim_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify aim items" ON aim_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view dream items" ON dream_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify dream items" ON dream_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view wish items" ON wish_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify wish items" ON wish_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view favourite items" ON favourite_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify favourite items" ON favourite_items FOR ALL USING (auth.role() = 'authenticated');

-- =========================================================
-- INITIAL SEED DATA FOR 10 NEW MODULES
-- =========================================================

INSERT INTO philosophies (title, axiom, description, category, icon_name, sort_order) VALUES
('Simplicity Over Complexity', 'Clean, explicit code with well-defined boundaries always outperforms clever abstractions.', 'Complexity is the silent killer of systems. Write software so readable and transparent that another engineer can grok the intent in seconds without mental gymnastics.', 'engineering', 'Code2', 1),
('User-Obsessed Latency', 'Speed is not a feature; speed is the foundation of digital dignity.', 'A 50ms reduction in UI interaction latency fundamentally shifts how natural, tactile, and dependable software feels. Sluggish tools disrespect user time.', 'design', 'Zap', 2),
('Resilience Through Fallbacks', 'Never assume the network, database, or third-party service will be available.', 'Graceful degradation is a virtue. Offline states, optimistic updates, and resilient static fallback caches make systems indestructible under failure.', 'engineering', 'ShieldCheck', 3),
('Craft & Joy in Computing', 'Software is a craft. Infuse soul, playfulness, and tactile delight into every tool.', 'Life is too short to build boring software. Adding physical metaphors, sound feedback, and delightful micro-interactions transforms everyday utilities into memorable art.', 'life', 'Sparkles', 4)
ON CONFLICT DO NOTHING;

INSERT INTO feed_posts (author_name, content, timestamp, tag, likes_count, sort_order) VALUES
('Mujahid Islam Mahi', '🚀 Just compiled the complete 37-route MahiOS administrative suite with zero Turbopack build errors! Full Category CRUD, logo uploaders, and live card previews are active.', 'Just now', '#Engineering', 24, 1),
('Mujahid Islam Mahi', '☕ Pouring a fresh cup of Ethiopian Yirgacheffe medium roast. Listening to synthwave while fine-tuning Web Audio synthesizer oscillators for 8-bit retro sound feedback.', '2 hours ago', '#Life & Coffee', 18, 2),
('Mujahid Islam Mahi', '💡 Next.js 16 with React 19 Server Components continues to blow my mind. Sub-50ms cold starts when combined with Supabase connection poolers.', 'Yesterday', '#Nextjs16', 35, 3)
ON CONFLICT DO NOTHING;

INSERT INTO biography_milestones (period, title, chapter, location, story_html, key_learning, sort_order) VALUES
('2014 – 2018', 'The Spark: Discovering the Terminal', 'Chapter I: Origins & Curiosity', 'Dhaka, Bangladesh', '<p>It began with tinkering with old CRT monitors, modding vintage games, and writing my first lines of C and batch scripts. Seeing code turn into visual interactive responses on screen sparked a lifelong obsession with computing.</p>', 'Curiosity is the ultimate multiplier. Building things for pure fun teaches faster than any curriculum.', 1),
('2019 – 2022', 'Diving Deep into Web Protocols & Full-Stack Mastery', 'Chapter II: The Modern Web', 'Dhaka, Bangladesh', '<p>Transitioned into modern full-stack development. Mastered JavaScript, TypeScript, Node.js, and PostgreSQL. Built dozens of web platforms, participated in national hackathons, and fell in love with distributed systems architecture.</p>', 'Master the fundamentals of HTTP, databases, and memory management before jumping on trendy frameworks.', 2),
('2023 – 2026', 'Architecting MahiOS & Next-Gen Spatial Computing', 'Chapter III: The Craft of Tactile Software', 'Dhaka & Global', '<p>Led high-impact engineering squads, developed enterprise SaaS platforms, and created MahiOS — blending retro tactile nostalgia with the raw power of Next.js 16 and Supabase.</p>', 'Great software is not just functional; it makes the user feel something memorable.', 3)
ON CONFLICT DO NOTHING;

INSERT INTO social_links (platform_name, username, url, icon_name, category, is_verified, accent_color, sort_order) VALUES
('GitHub', '@mujahidmahi', 'https://github.com/mujahidmahi', 'Github', 'code', true, '#24292e', 1),
('LinkedIn', 'in/mujahidmahi', 'https://linkedin.com/in/mujahidmahi', 'Linkedin', 'social', true, '#0077b5', 2),
('Twitter / X', '@mujahidmahi', 'https://twitter.com/mujahidmahi', 'Twitter', 'social', true, '#000000', 3),
('Email (Direct)', 'contact@mujahidmahi.xyz', 'mailto:contact@mujahidmahi.xyz', 'Mail', 'contact', true, '#ea4335', 4),
('Discord', 'mahi#0001', 'https://discord.com', 'MessageSquare', 'gaming', true, '#5865F2', 5),
('Telegram', '@mujahidmahi', 'https://t.me/mujahidmahi', 'Send', 'contact', true, '#0088cc', 6),
('Spotify', 'Mahi Soundwaves', 'https://spotify.com', 'Music', 'media', false, '#1DB954', 7)
ON CONFLICT DO NOTHING;

INSERT INTO ideologies (title, subtitle, summary, content_html, icon_name, sort_order) VALUES
('The Open Source Imperative', 'Knowledge Compounding in Public', 'Software is humanity’s shared intellectual infrastructure. Open-source collaboration accelerates scientific progress by orders of magnitude.', '<p>When we publish code openly, we stand on the shoulders of giants while simultaneously offering our shoulders for the next generation. Proprietary black boxes stifle serendipitous innovation; open protocols democratize human capability.</p>', 'Scale', 1),
('Human-Centric Artificial Intelligence', 'Symbiosis over Replacement', 'AI should be designed as a cognitive exoskeleton that elevates human creativity, craftsmanship, and agency — not a substitute that devalues humanity.', '<p>The most profound tools in history (the telescope, the printing press, the personal computer) expanded human perception and autonomy. AGI must follow the same ethos: empowering human creators to solve intractable diseases, climate resilience, and interstellar exploration.</p>', 'Cpu', 2),
('Digital Sovereignty & Privacy', 'Owning Your Data and Identity', 'Users must own their cryptographic identity and personal data. Surveillance capitalism and closed platform monopolies must give way to local-first, peer-to-peer web standards.', '<p>Privacy is not about having something to hide; it is the fundamental precondition for human autonomy, free thought, and authentic intellectual exploration.</p>', 'Shield', 3)
ON CONFLICT DO NOTHING;

INSERT INTO entertainment_items (title, type, creator, rating_score, review_summary, favorite_quote, cover_url, sort_order) VALUES
('Cyberpunk 2077 (Phantom Liberty)', 'game', 'CD Projekt RED', 9.8, 'Masterpiece in environmental world-building, dystopian narrative depth, and breathtaking ray-traced visuals.', '"Never stop fighting."', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80', 1),
('Interstellar', 'movie', 'Christopher Nolan', 9.9, 'An emotional and scientific triumph about human survival, gravitational physics, and the boundless courage to explore the cosmos.', '"Do not go gentle into that good night."', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80', 2),
('Steins;Gate', 'anime', 'White Fox / 5pb.', 9.7, 'The ultimate hard sci-fi masterwork on causality, time travel theory, and moral accountability.', '"No one knows what the future holds. That’s why its potential is infinite."', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80', 3),
('Dune (Books I – VI)', 'book', 'Frank Herbert', 9.9, 'The greatest sociological, ecological, and philosophical sci-fi saga ever written.', '"I must not fear. Fear is the mind-killer."', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80', 4)
ON CONFLICT DO NOTHING;

INSERT INTO aim_items (goal_title, timeline_target, category, progress_percentage, status, deliverables, sort_order) VALUES
('Architect a Generational Open-Source Web Framework', '2026 – 2027', 'engineering', 75, 'in_progress', ARRAY['Complete sub-5ms localized edge caching library.', 'Author comprehensive documentation and benchmark test suite.', 'Reach 5,000+ GitHub stars and active production adoption.'], 1),
('Found a High-Impact Deep-Tech Software Venture', '2027 – 2028', 'career', 45, 'planning', ARRAY['Assemble a world-class founding engineering squad.', 'Solve core latency and data orchestration bottlenecks in spatial computing.', 'Deliver tools that empower 100,000+ engineers worldwide.'], 2),
('Mentor 100+ Aspiring Software Engineers', 'Ongoing (2026)', 'impact', 60, 'in_progress', ARRAY['Host open-source hackathons and free architecture workshops.', 'Conduct 1-on-1 code reviews and career mentorship sessions.'], 3)
ON CONFLICT DO NOTHING;

INSERT INTO dream_items (title, horizon, vision_manifesto, impact_area, icon_name, sort_order) VALUES
('Building Universal Spatial Web Operating Systems', 'decade', 'Transforming how humans interact with computational knowledge by blending tactile spatial physical metaphors with frictionless neural and voice interfaces.', 'Human-Computer Symbiosis', 'Globe', 1),
('Accelerating Interplanetary Digital Infrastructure', 'lifetime', 'Engineering resilient, delay-tolerant mesh communication protocols and decentralized database architectures capable of synchronizing across interplanetary distances.', 'Space Exploration & Civilization', 'Rocket', 2),
('Democratizing Advanced Technological Education to Zero Cost', 'civilizational', 'Ensuring that every human child on Earth, regardless of geography or economic background, has access to world-class software engineering and AI education.', 'Global Education & Human Equity', 'Sparkles', 3)
ON CONFLICT DO NOTHING;

INSERT INTO wish_items (wish_number, title, deep_reason, impact_scope, category) VALUES
(1, 'The Eradication of All Neurological and Degenerative Diseases', 'To see every human mind retain its memories, dignity, curiosity, and vitality across their entire lifespan without the tragedy of cognitive decline.', 'Global Health & Human Longevity', 'Medicine & Biology'),
(2, 'Abundant, Unlimited Clean Fusion Energy for Every City on Earth', 'Energy abundance eliminates scarcity, powers clean water desalinization worldwide, reverses environmental degradation, and enables humanity to explore the stars.', 'Planetary Sustainability & Scarcity Elimination', 'Physics & Energy'),
(3, 'Universal Digital Empathy and Global Human Peace', 'For humanity to overcome tribal zero-sum conflicts and realize our collective destiny as stewards of this fragile pale blue dot in an infinite cosmos.', 'Civilizational Unity & Human Evolution', 'Philosophy & Society')
ON CONFLICT (wish_number) DO NOTHING;

INSERT INTO favourite_items (category, item_name, subcategory, reason, rating, sort_order) VALUES
('dev_tools', 'Next.js 16 & React 19', 'Full-Stack Framework', 'Unmatched developer velocity, server components, and native edge streaming.', 10.0, 1),
('dev_tools', 'Supabase & PostgreSQL', 'Database & Auth', 'Row-level security, instant realtime subscriptions, and raw SQL power.', 10.0, 2),
('books', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'The definitive bible on distributed systems, replication, and consensus.', 10.0, 3),
('books', 'Structure and Interpretation of Computer Programs (SICP)', 'Abelson & Sussman', 'Rewired how I think about computation, abstraction, and meta-linguistic mechanics.', 10.0, 4),
('gear', 'Custom 65% Tactile Mechanical Keyboard', 'Holy Panda Switches', 'Hand-lubed switches with aluminum case offering blissful tactile acoustics.', 9.9, 5),
('gear', 'Vintage 19" CRT Monitor (Sony Trinitron)', 'Display Hardware', 'Zero input lag, infinite phosphor contrast, and authentic scanlines.', 9.8, 6),
('cuisine', 'Single-Origin Ethiopian Pour-Over Coffee', 'Beverage', 'Floral jasmine notes with clean citric acidity. Essential rocket fuel for code.', 10.0, 7),
('cities', 'Tokyo, Japan', 'City & Culture', 'The sublime fusion of hyper-futuristic neon cyberpunk and serene ancient tradition.', 9.9, 8)
ON CONFLICT DO NOTHING;

-- Also insert the 10 new apps into desktop_apps if not already present
INSERT INTO desktop_apps (app_id, title, icon_name, component_key, default_x, default_y, default_width, default_height, is_system_app, is_visible, sort_order, category, badge_text) VALUES
('feed', 'Live Pulse', 'Radio', 'FeedApp', 170, 110, 740, 520, false, true, 5, 'social', 'LIVE'),
('biography', 'Biography', 'BookOpen', 'BiographyApp', 130, 90, 820, 560, false, true, 6, 'core', ''),
('philosophy', 'Philosophy', 'Compass', 'PhilosophyApp', 190, 140, 780, 540, false, true, 7, 'mindset', ''),
('socials', 'Social Hub', 'Share2', 'SocialsApp', 210, 160, 720, 500, false, true, 8, 'social', ''),
('ideology', 'Ideology & Ethics', 'Scale', 'IdeologyApp', 160, 120, 780, 540, false, true, 9, 'mindset', ''),
('entertainment', 'Media & Games', 'Gamepad2', 'EntertainmentApp', 180, 130, 800, 550, false, true, 10, 'lifestyle', 'FUN'),
('aim', 'Aim & Roadmap', 'Target', 'AimApp', 140, 100, 760, 530, false, true, 11, 'vision', ''),
('dream', 'Dreamscape', 'Sparkles', 'DreamApp', 200, 150, 780, 540, false, true, 12, 'vision', ''),
('wishes', '3 Wishes', 'Flame', 'WishesApp', 220, 170, 740, 500, false, true, 13, 'vision', '★3'),
('favourites', 'Favourites', 'Star', 'FavouritesApp', 150, 110, 800, 550, false, true, 14, 'lifestyle', '')
ON CONFLICT (app_id) DO NOTHING;
