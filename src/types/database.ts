export interface SiteSettings {
  id: string;
  site_title: string;
  owner_name: string;
  headline: string;
  bio_short: string;
  avatar_url: string;
  favicon_url: string;
  boot_title: string;
  boot_subtitle: string;
  terminal_speed: number;
  crt_scanlines_enabled: boolean;
  crt_curvature_enabled: boolean;
  sound_effects_enabled: boolean;
  matrix_rain_enabled: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  og_image_url: string;
  twitter_handle: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  email: string;
  phone: string;
  location: string;
  status_message: string;
  copyright_text: string;
  theme_accent_color?: string;
  desktop_background_color?: string;
  updated_at?: string;
}

export interface DesktopApp {
  id: string;
  app_id: string;
  title: string;
  icon_name: string;
  icon_url?: string;
  component_key: string;
  default_x: number;
  default_y: number;
  default_width: number;
  default_height: number;
  is_system_app: boolean;
  is_visible: boolean;
  sort_order: number;
  category: string;
  badge_text?: string;
  updated_at?: string;
}

export interface AboutContent {
  id: string;
  full_name: string;
  taglines: string[];
  bio_html: string;
  avatar_url?: string;
  resume_url?: string;
  status_text: string;
  location: string;
  experience_years: number;
  projects_completed: number;
  coffee_cups: number;
  interests: string[];
  quote: string;
  quote_author: string;
  updated_at?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon?: string;
  sort_order: number;
  skills?: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  category_id: string;
  proficiency: number;
  icon_name?: string;
  years_of_experience: number;
  is_featured: boolean;
  sort_order: number;
  updated_at?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  employment_type: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description_html: string;
  achievements: string[];
  technologies: string[];
  company_url?: string;
  logo_url?: string;
  sort_order: number;
  updated_at?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  grade?: string;
  description_html?: string;
  activities: string[];
  certificate_url?: string;
  logo_url?: string;
  sort_order: number;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description_html: string;
  thumbnail_url?: string;
  images: string[];
  tags: string[];
  category: string;
  live_url?: string;
  github_url?: string;
  featured: boolean;
  sort_order: number;
  stats?: {
    stars?: number;
    users?: string;
    uptime?: string;
  };
  updated_at?: string;
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  description?: string;
  badge_icon?: string;
  certificate_url?: string;
  credential_id?: string;
  sort_order: number;
  updated_at?: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  updated_at?: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  caption?: string;
  image_url: string;
  category_id?: string;
  aspect_ratio?: string;
  taken_at?: string;
  tags: string[];
  sort_order: number;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  cover_image_url?: string;
  tags: string[];
  is_published: boolean;
  published_at?: string;
  read_time_minutes: number;
  views_count: number;
  sort_order: number;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_starred: boolean;
  ip_address?: string;
  created_at: string;
}

export interface BootLog {
  id: string;
  message: string;
  delay_ms: number;
  status_type: 'OK' | 'INFO' | 'WARN' | 'INIT' | 'COMPLETE';
  sort_order: number;
  is_active: boolean;
}

export interface TerminalCommand {
  id: string;
  command: string;
  response_text: string;
  description: string;
  is_hidden: boolean;
  sort_order: number;
}

export interface ResumeConfig {
  id: string;
  pdf_url?: string;
  last_updated_date: string;
  preview_image_url?: string;
  download_filename: string;
  summary_markdown: string;
  is_active: boolean;
  updated_at?: string;
}

// ------------------- 10 NEW DYNAMIC APPLICATION MODELS -------------------

export interface PhilosophyItem {
  id: string;
  title: string;
  axiom: string;
  description: string;
  category: string;
  icon_name?: string;
  sort_order: number;
}

export interface FeedPost {
  id: string;
  author_name: string;
  content: string;
  timestamp: string;
  tag: string;
  media_url?: string;
  likes_count: number;
  sort_order: number;
}

export interface BiographyMilestone {
  id: string;
  period: string;
  title: string;
  chapter: string;
  location: string;
  story_html: string;
  key_learning: string;
  image_url?: string;
  sort_order: number;
}

export interface SocialLinkItem {
  id: string;
  platform_name: string;
  username: string;
  url: string;
  icon_name: string;
  category: string;
  is_verified: boolean;
  accent_color: string;
  sort_order: number;
}

export interface IdeologyPillar {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  content_html: string;
  icon_name?: string;
  sort_order: number;
}

export interface EntertainmentItem {
  id: string;
  title: string;
  type: string;
  creator: string;
  rating_score: number;
  review_summary: string;
  cover_url?: string;
  favorite_quote?: string;
  sort_order: number;
}

export interface AimItem {
  id: string;
  goal_title: string;
  timeline_target: string;
  category: string;
  progress_percentage: number;
  status: 'planning' | 'in_progress' | 'achieved';
  deliverables: string[];
  sort_order: number;
}

export interface DreamItem {
  id: string;
  title: string;
  horizon: string;
  vision_manifesto: string;
  impact_area: string;
  icon_name?: string;
  sort_order: number;
}

export interface WishItem {
  id: string;
  wish_number: number;
  title: string;
  deep_reason: string;
  impact_scope: string;
  category: string;
}

export interface FavouriteItem {
  id: string;
  category: string;
  item_name: string;
  subcategory: string;
  reason: string;
  image_url?: string;
  rating: number;
  sort_order: number;
}

// Full Aggregated Database Payload
export interface BiographyDatabaseData {
  settings: SiteSettings;
  apps: DesktopApp[];
  about: AboutContent;
  categories: SkillCategory[];
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  achievements: Achievement[];
  galleryCategories: GalleryCategory[];
  galleryImages: GalleryImage[];
  blogPosts: BlogPost[];
  bootLogs: BootLog[];
  terminalCommands: TerminalCommand[];
  resumeConfig: ResumeConfig;
  // 10 New Modules
  philosophies: PhilosophyItem[];
  feedPosts: FeedPost[];
  biographyTimeline: BiographyMilestone[];
  socialLinks: SocialLinkItem[];
  ideologies: IdeologyPillar[];
  entertainment: EntertainmentItem[];
  aims: AimItem[];
  dreams: DreamItem[];
  wishes: WishItem[];
  favourites: FavouriteItem[];
}
