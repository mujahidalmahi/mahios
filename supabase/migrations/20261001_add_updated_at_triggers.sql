-- =========================================================
-- MahiOS Database Migration
-- Date: 2026-10-01
-- Description: Adds automatic updated_at timestamp triggers across all 25 tables.
-- Safe to run on existing databases (idempotent).
-- =========================================================

-- 1. Create or replace the reusable trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Dynamically attach the trigger to all tables that contain updated_at
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'site_settings', 'desktop_apps', 'about_content', 'skill_categories',
        'skills', 'experiences', 'education', 'projects', 'achievements',
        'gallery_categories', 'gallery_images', 'blog_posts',
        'boot_logs', 'terminal_commands', 'resume_config', 'philosophies',
        'feed_posts', 'biography_milestones', 'social_links', 'ideologies',
        'entertainment_items', 'aim_items', 'dream_items', 'wish_items', 'favourite_items'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_update_%I ON %I;', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_update_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', tbl, tbl);
    END LOOP;
END $$;
