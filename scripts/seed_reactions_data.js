const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function seed() {
  const envText = fs.readFileSync('.env.local', 'utf8');
  const env = Object.fromEntries(
    envText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => {
        const idx = l.indexOf('=');
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
      })
  );

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Check blog_posts
  const { data: currentBlogs } = await supabase.from('blog_posts').select('id');
  if (!currentBlogs || currentBlogs.length === 0) {
    console.log('Seeding blog_posts...');
    const initialData = [
      {
        title: 'Building Resilient Edge Workflows with Next.js 16 and Turbopack',
        slug: 'building-resilient-edge-workflows-nextjs-16',
        excerpt: 'A deep architectural dive into crafting lightning-fast, zero-latency distributed applications leveraging Next.js 16, Turbopack bundling, and edge middleware runtime.',
        content_html: `<p>In modern web infrastructure, latency is the ultimate friction. Moving compute as close as possible to end users via Edge networks has transitioned from a competitive luxury to a fundamental prerequisite for scalable engineering.</p>
<h2>1. The Rise of Sub-Millisecond Cold Starts</h2>
<p>By shedding heavy Node.js dependencies in favor of standard Web APIs (Fetch, Streams, Web Crypto), modern edge functions achieve initialization times under 15ms. In high-concurrency systems, this eliminates standard cold-start spikes that plague monolithic architectures.</p>
<h2>2. Distributed State Synchronization</h2>
<p>Edge rendering demands stateless precision paired with globally replicated persistent stores like Supabase PostgreSQL and Redis read-replicas. Combining Next.js ISR (Incremental Static Regeneration) with stale-while-revalidate headers yields instant time-to-first-byte (TTFB) without stale consistency debt.</p>`,
        cover_image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        tags: ['Next.js 16', 'Architecture', 'Turbopack', 'Edge'],
        is_published: true,
        read_time_minutes: 6,
        views_count: 142,
        sort_order: 1,
      },
      {
        title: 'Designing Authentic Retro Operating Systems in the Modern Web',
        slug: 'designing-authentic-retro-operating-systems',
        excerpt: 'How we engineered MahiOS from the ground up: 90s beveled aesthetics, draggable windowing hierarchies, CRT scanline shaders, and modular desktop architecture.',
        content_html: `<p>Nostalgia is powerful, but authentic operating system ergonomics require disciplined software architecture. When designing MahiOS, the mandate was not merely creating a retro skin, but engineering a faithful virtual operating system inside the browser window.</p>
<h2>1. Window Hierarchy and Stacking Contexts</h2>
<p>Desktop OS windowing requires dynamic z-index layering, drag-and-drop mechanics with mouse coordinate delta tracking, viewport boundary clamping, and seamless multi-tasking state isolation via React and Zustand stores.</p>
<h2>2. CRT Shaders & Visual Physics</h2>
<p>Authentic cathode-ray tube displays featured scanlines, phosphor persistence, subtle barrel distortion, and flicker. Using modern CSS hardware-accelerated linear gradients and backdrop filters, we emulate CRT physical monitors with 60FPS fluid rendering.</p>`,
        cover_image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        tags: ['Retro OS', 'CSS', 'UI Engineering', 'Zustand'],
        is_published: true,
        read_time_minutes: 8,
        views_count: 284,
        sort_order: 2,
      },
      {
        title: 'Distributed Systems & Database Resilience with PostgreSQL',
        slug: 'distributed-systems-database-resilience',
        excerpt: 'Practical methodologies for database connection pooling, fault-tolerant schema evolution, multi-region replication, and automated disaster recovery protocols.',
        content_html: `<p>Reliability is not an afterthought—it is the foundation upon which every digital service earns user trust. Building robust database backends requires deep understanding of connection exhaustion, transaction isolation levels, and graceful degradation.</p>
<h2>1. Connection Pooling & Transaction Hygiene</h2>
<p>Unmanaged serverless lambdas can instantly exhaust relational database pool limits. By implementing PgBouncer and Supabase transaction poolers, high-frequency spikes are queue-managed rather than connection-killed.</p>
<h2>2. Zero-Downtime Schema Evolutions</h2>
<p>Altering tables with millions of rows demands backwards-compatible migration steps: expand first, migrate in chunks, and contract only after client compatibility is fully deployed.</p>`,
        cover_image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80',
        tags: ['PostgreSQL', 'Databases', 'DevOps', 'Distributed Systems'],
        is_published: true,
        read_time_minutes: 7,
        views_count: 198,
        sort_order: 3,
      },
    ];

    const { error: blogErr } = await supabase.from('blog_posts').insert(initialData);
    if (blogErr) console.error('Error seeding blogs:', blogErr);
    else console.log('Successfully seeded 3 blog posts into Supabase!');
  }

  // 2. Check feed_posts
  const { data: currentFeed } = await supabase.from('feed_posts').select('id');
  if (!currentFeed || currentFeed.length === 0) {
    console.log('Seeding feed_posts...');
    const initialFeed = [
      {
        author_name: 'Mujahid Al Mahi',
        content: 'Refactored window stacking contexts in MahiOS. Every newly spawned child window now correctly increments the global z-index above maximized parents. Real OS logic feels so good!',
        timestamp: '15 mins ago',
        tag: '#Engineering',
        likes_count: 24,
        sort_order: 1,
      },
      {
        author_name: 'Mujahid Al Mahi',
        content: 'Turbopack build times dropped from 35s down to 3.2s on Next.js 16. The speed of local DX changes the entire flow state of system architecture.',
        timestamp: '3 hours ago',
        tag: '#Turbopack',
        likes_count: 38,
        sort_order: 2,
      },
      {
        author_name: 'Mujahid Al Mahi',
        content: 'Drinking Ethiopian single-origin pour-over while reviewing PostgreSQL connection pooling metrics. Zero connection drops under load testing today.',
        timestamp: 'Yesterday at 11:20 PM',
        tag: '#Coffee & Systems',
        likes_count: 19,
        sort_order: 3,
      },
      {
        author_name: 'Mujahid Al Mahi',
        content: 'Shipped comprehensive Schema.org JSON-LD multi-entity knowledge graphs. Search engines now parse projects, dev notes, and credentials automatically.',
        timestamp: '2 days ago',
        tag: '#SEO',
        likes_count: 47,
        sort_order: 4,
      },
    ];

    const { error: feedErr } = await supabase.from('feed_posts').insert(initialFeed);
    if (feedErr) console.error('Error seeding feed_posts:', feedErr);
    else console.log('Successfully seeded 4 feed posts into Supabase!');
  }
}

seed().catch(console.error);
