-- =========================================================
-- Migration 002: 10 New Dynamic Applications Schema & Seeds
-- Author: Mujahid Al Mahi <mujahidmahi.official@gmail.com>
-- =========================================================

-- 1. Philosophies Table
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

-- 2. Feed Posts Table (Live Status Updates)
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

-- 3. Biography Milestones Table (Life Timeline Chapters)
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

-- 4. Social Links & Digital ID Table
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

-- 5. Ideologies Table (Tech Ethics & Worldview)
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

-- 6. Entertainment Table (Media & Games)
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

-- 7. Aim Items Table (Strategic Roadmap)
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

-- 8. Dream Items Table (Dreamscape Manifestos)
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

-- 9. Wish Items Table (3 Wishes for Humanity)
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

-- 10. Favourite Items Table (Personal Hall of Fame)
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

-- Enable RLS
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

-- Idempotent Policies
DROP POLICY IF EXISTS "Public can view philosophies" ON philosophies;
DROP POLICY IF EXISTS "Admin can modify philosophies" ON philosophies;
CREATE POLICY "Public can view philosophies" ON philosophies FOR SELECT USING (true);
CREATE POLICY "Admin can modify philosophies" ON philosophies FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Admin can modify feed posts" ON feed_posts;
CREATE POLICY "Public can view feed posts" ON feed_posts FOR SELECT USING (true);
CREATE POLICY "Admin can modify feed posts" ON feed_posts FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view biography milestones" ON biography_milestones;
DROP POLICY IF EXISTS "Admin can modify biography milestones" ON biography_milestones;
CREATE POLICY "Public can view biography milestones" ON biography_milestones FOR SELECT USING (true);
CREATE POLICY "Admin can modify biography milestones" ON biography_milestones FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view social links" ON social_links;
DROP POLICY IF EXISTS "Admin can modify social links" ON social_links;
CREATE POLICY "Public can view social links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Admin can modify social links" ON social_links FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view ideologies" ON ideologies;
DROP POLICY IF EXISTS "Admin can modify ideologies" ON ideologies;
CREATE POLICY "Public can view ideologies" ON ideologies FOR SELECT USING (true);
CREATE POLICY "Admin can modify ideologies" ON ideologies FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view entertainment items" ON entertainment_items;
DROP POLICY IF EXISTS "Admin can modify entertainment items" ON entertainment_items;
CREATE POLICY "Public can view entertainment items" ON entertainment_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify entertainment items" ON entertainment_items FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view aim items" ON aim_items;
DROP POLICY IF EXISTS "Admin can modify aim items" ON aim_items;
CREATE POLICY "Public can view aim items" ON aim_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify aim items" ON aim_items FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view dream items" ON dream_items;
DROP POLICY IF EXISTS "Admin can modify dream items" ON dream_items;
CREATE POLICY "Public can view dream items" ON dream_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify dream items" ON dream_items FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view wish items" ON wish_items;
DROP POLICY IF EXISTS "Admin can modify wish items" ON wish_items;
CREATE POLICY "Public can view wish items" ON wish_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify wish items" ON wish_items FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view favourite items" ON favourite_items;
DROP POLICY IF EXISTS "Admin can modify favourite items" ON favourite_items;
CREATE POLICY "Public can view favourite items" ON favourite_items FOR SELECT USING (true);
CREATE POLICY "Admin can modify favourite items" ON favourite_items FOR ALL USING (auth.role() = 'authenticated');
