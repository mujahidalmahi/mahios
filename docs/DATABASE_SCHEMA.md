# MahiOS Database Schema Guide

MahiOS is backed by **26 Supabase PostgreSQL tables** organized into core system categories with complete Row Level Security (RLS) policies.

---

## 📊 Summary of Tables

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| `site_settings` | Global metadata, titles, theme, CRT shaders | `site_title`, `crt_enabled`, `sound_enabled` |
| `desktop_apps` | Registered OS applications and views | `app_id`, `title`, `component_key`, `category` |
| `about_content` | Main narrative biography & stats | `full_name`, `bio_html`, `taglines`, `interests` |
| `skills` | Technical proficiencies & badges | `name`, `category_id`, `proficiency`, `icon_name` |
| `skill_categories` | Skill module categories | `title`, `slug`, `sort_order` |
| `experiences` | Career history & work experience | `company`, `role`, `employment_type`, `description_html` |
| `education` | Academic degrees & honors | `institution`, `degree`, `activities`, `grade` |
| `projects` | Engineering portfolio projects | `title`, `slug`, `summary`, `tags`, `category` |
| `achievements` | Awards, certificates, trophies | `title`, `issuer`, `credential_id`, `badge_icon` |
| `gallery_images` | Visual photography archive | `image_url`, `title`, `caption`, `category_id` |
| `gallery_categories`| Photo gallery albums | `name`, `slug`, `sort_order` |
| `blog_posts` | Articles, essays, and notes | `title`, `slug`, `content_html`, `tags`, `reading_time` |
| `contact_messages` | Inbound visitor messages | `sender_name`, `sender_email`, `message`, `is_read` |
| `boot_logs` | BIOS terminal boot sequence | `message`, `status_type`, `delay_ms`, `sort_order` |
| `terminal_commands` | Interactive MS-DOS commands | `command`, `response_text`, `description` |
| `resume_config` | ATS resume viewer configuration | `pdf_url`, `summary_markdown`, `download_filename` |
| `philosophies` | Mental models & guiding principles | `title`, `axiom`, `category`, `description` |
| `feed_posts` | Live status updates & micro-posts | `content`, `tag`, `likes_count`, `media_url` |
| `biography_milestones`| Chronological life timeline | `period`, `chapter`, `story_html`, `key_learning` |
| `social_links` | Verified digital identities | `platform_name`, `username`, `url`, `is_verified` |
| `ideologies` | Tech ethics & philosophical pillars| `title`, `subtitle`, `content_html`, `summary` |
| `entertainment_items`| Games, anime, cinema, books | `title`, `type`, `creator`, `rating_score`, `review_summary` |
| `aim_items` | Strategic goals & roadmap | `goal_title`, `category`, `progress_percentage`, `status` |
| `dream_items` | Long-term vision manifestos | `title`, `horizon`, `vision_manifesto`, `impact_area` |
| `wish_items` | 3 Wishes for humanity | `wish_number`, `title`, `deep_reason`, `impact_scope` |
| `favourite_items` | Personal hall of fame & tools | `item_name`, `category`, `reason`, `rating` |

---

## 🗄️ Master SQL Script Location

The complete, consolidated PostgreSQL migration script containing all table definitions, indexes, RLS policies, and seed data is located at:
📁 [`supabase/schema.sql`](../supabase/schema.sql)

Individual incremental migrations are stored in:
📁 [`supabase/migrations/`](../supabase/migrations/)

---

## 🛡️ Row Level Security (RLS) Policies

All tables are locked down with strict RLS policies:
1. **Public Read (`SELECT`)**: Anyone can read public biography and portfolio records.
2. **Authenticated Write (`INSERT`, `UPDATE`, `DELETE`)**: Only authenticated users (via Supabase Auth or Service Role Key) can mutate records.

Example Policy Pattern:
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Admin All Access"
  ON projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```
