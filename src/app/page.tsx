import React from 'react';
import type { Metadata } from 'next';
import { getBiographyData } from '@/lib/data/fetchBiographyData';
import ResponsiveOSWrapper from '@/components/os/ResponsiveOSWrapper';
import { parseAboutExtras } from '@/lib/data/aboutExtras';
import { generateDynamicSeoMetadata } from '@/lib/seo/dynamicSeoGenerator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const app = typeof searchParams?.app === 'string' ? searchParams.app : undefined;
  const post = typeof searchParams?.post === 'string' ? searchParams.post : undefined;
  const id = typeof searchParams?.id === 'string' ? searchParams.id : undefined;

  const data = await getBiographyData();
  return generateDynamicSeoMetadata(data, { app, post, id });
}

export default async function HomePage() {
  const data = await getBiographyData();
  const { cleanBioHtml, techRadar, trivia } = parseAboutExtras(data.about?.bio_html);

  return (
    <main className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden fixed inset-0">
      {/* 1. Interactive MahiOS Graphical Operating System (Desktop, Mobile, Tablet) */}
      <ResponsiveOSWrapper data={data} />

      {/* 2. Exhaustive Semantic SSR Crawling Layer (Indexed by Google, Bing, and Search Engine Spiders) */}
      <div
        className="sr-only aria-hidden:false"
        aria-label="Mujahid Al Mahi Complete Digital Biography and Engineering Portfolio Archive"
      >
        {/* Author Header & Introduction */}
        <header>
          <h1>{data.settings.owner_name} — {data.settings.headline}</h1>
          <p>{data.settings.bio_short}</p>
          <address>
            <span>Location: {data.settings.location || data.about.location}</span> |{' '}
            <span>Email: <a href={`mailto:${data.settings.email}`}>{data.settings.email}</a></span> |{' '}
            <span>Status: {data.about.status_text}</span>
          </address>
          <div>
            <p>Experience: {data.about.experience_years}+ Years | Projects Completed: {data.about.projects_completed} | Coffee Cups: {data.about.coffee_cups}</p>
          </div>
        </header>

        {/* Section: Biography & Narrative Story */}
        <section id="about-me">
          <h2>About {data.settings.owner_name}</h2>
          <div dangerouslySetInnerHTML={{ __html: cleanBioHtml || data.about.bio_html }} />
          {data.about.quote && (
            <blockquote>
              <p>&ldquo;{data.about.quote}&rdquo;</p>
              {data.about.quote_author && <cite>— {data.about.quote_author}</cite>}
            </blockquote>
          )}
          <h3>Professional Specializations & Interests</h3>
          <ul>
            {data.about.interests?.map((interest, idx) => (
              <li key={idx}>{interest}</li>
            ))}
          </ul>
        </section>

        {/* Section: Engineering Principles & Philosophies */}
        <section id="principles-and-philosophies">
          <h2>Engineering Principles & Architecture Philosophies</h2>
          {data.philosophies.map((p) => (
            <article key={p.id}>
              <h3>{p.title} ({p.category})</h3>
              {p.axiom && <p><strong>Axiom:</strong> &ldquo;{p.axiom}&rdquo;</p>}
              <p>{p.description}</p>
            </article>
          ))}
        </section>

        {/* Section: Technology Radar */}
        <section id="tech-radar">
          <h2>Technology Radar & Exploration Focus</h2>
          {techRadar.map((radar) => (
            <article key={radar.id}>
              <h3>{radar.title}</h3>
              <p><strong>Status:</strong> {radar.status}</p>
              <p>{radar.description}</p>
            </article>
          ))}
        </section>

        {/* Section: Developer Trivia & Q&A */}
        <section id="trivia-and-qa">
          <h2>Developer Trivia & Engineering Q&A</h2>
          <dl>
            {trivia.map((t) => (
              <div key={t.id}>
                <dt><strong>Q: {t.q}</strong></dt>
                <dd>A: {t.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Section: Work Experience */}
        <section id="work-experience">
          <h2>Professional Work Experience & Career Progression</h2>
          {data.experiences.map((exp) => (
            <article key={exp.id}>
              <h3>{exp.role} at {exp.company}</h3>
              <p><time>{exp.start_date}</time> – <time>{exp.end_date}</time> | {exp.location}</p>
              <div dangerouslySetInnerHTML={{ __html: exp.description_html }} />
              {exp.achievements && exp.achievements.length > 0 && (
                <div>
                  <h4>Key Technical Achievements</h4>
                  <ul>
                    {exp.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </section>

        {/* Section: Featured Engineering Projects */}
        <section id="portfolio-projects">
          <h2>Software Engineering Projects & Open Source Systems</h2>
          {data.projects.map((proj) => (
            <article key={proj.id}>
              <h3>{proj.title}</h3>
              <p>{proj.summary}</p>
              <div dangerouslySetInnerHTML={{ __html: proj.description_html }} />
              <p><strong>Technologies & Tools:</strong> {proj.tags?.join(', ')}</p>
              {proj.live_url && (
                <p>Live Platform: <a href={proj.live_url} rel="noopener noreferrer">{proj.live_url}</a></p>
              )}
              {proj.github_url && (
                <p>Source Code Repository: <a href={proj.github_url} rel="noopener noreferrer">{proj.github_url}</a></p>
              )}
            </article>
          ))}
        </section>

        {/* Section: Technical Skills Matrix */}
        <section id="skills-matrix">
          <h2>Technical Skills & Proficiency Matrix</h2>
          {data.categories.map((cat) => (
            <div key={cat.id}>
              <h3>{cat.name}</h3>
              <ul>
                {data.skills
                  .filter((s) => s.category_id === cat.id)
                  .map((skill) => (
                    <li key={skill.id}>
                      <strong>{skill.name}</strong> — {skill.proficiency}% Proficiency ({skill.years_of_experience} Years Experience)
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Section: Academic Education */}
        <section id="academic-education">
          <h2>Academic Education & Honors</h2>
          {data.education.map((edu) => (
            <article key={edu.id}>
              <h3>{edu.degree} in {edu.field_of_study}</h3>
              <p>{edu.institution} ({edu.start_year} – {edu.end_year})</p>
              {edu.grade && <p>Academic Standing: {edu.grade}</p>}
              {edu.activities && <p>Activities: {edu.activities}</p>}
            </article>
          ))}
        </section>

        {/* Section: Dev Notes Blog Articles */}
        <section id="dev-notes-blog">
          <h2>Dev Notes — Technical Articles & Engineering Insights</h2>
          {data.blogPosts
            .filter((p) => p.is_published)
            .map((post) => (
              <article key={post.id}>
                <h3><a href={`/?app=blog&post=${post.slug}`}>{post.title}</a></h3>
                <p>Published: <time>{post.published_at}</time> | Read Time: {post.read_time_minutes} min</p>
                <p>Topics: {post.tags?.join(', ')}</p>
                <p>{post.excerpt}</p>
                <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
              </article>
            ))}
        </section>

        {/* Section: Biography Timeline & Life Milestones */}
        <section id="biography-milestones">
          <h2>Life Journey & Milestone Chapters</h2>
          {data.biographyTimeline.map((item) => (
            <article key={item.id}>
              <h3>{item.period} — {item.title}</h3>
              <p>Chapter: {item.chapter} | Location: {item.location}</p>
              <div dangerouslySetInnerHTML={{ __html: item.story_html }} />
              {item.key_learning && <p><strong>Key Learning:</strong> {item.key_learning}</p>}
            </article>
          ))}
        </section>

        {/* Section: Verified Digital ID & Social Links */}
        <section id="social-identities">
          <h2>Verified Social Profiles & Digital Identification</h2>
          <ul>
            {data.socialLinks.map((s) => (
              <li key={s.id}>
                <a href={s.url} rel="noopener noreferrer me">
                  {s.platform_name}: @{s.username}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Section: Live Feed Status Updates */}
        <section id="live-feed">
          <h2>Live Status Feed & Real-Time Engineering Updates</h2>
          {data.feedPosts.map((feed) => (
            <article key={feed.id}>
              <p><strong>{feed.tag}</strong> — <time>{feed.timestamp}</time></p>
              <p>{feed.content}</p>
            </article>
          ))}
        </section>

        {/* Section: Engineering Ideologies */}
        <section id="ideologies">
          <h2>Core Ideologies & Perspectives</h2>
          {data.ideologies.map((idea) => (
            <article key={idea.id}>
              <h3>{idea.title}</h3>
              {idea.subtitle && <p><strong>Pillar:</strong> {idea.subtitle}</p>}
              <p>{idea.summary}</p>
              <div dangerouslySetInnerHTML={{ __html: idea.content_html }} />
            </article>
          ))}
        </section>

        {/* Section: Aims, Dreams & Wishes */}
        <section id="aspirations">
          <h2>Aims, Dreams & Aspirations</h2>
          <div>
            <h3>Immediate Career Aims</h3>
            <ul>
              {data.aims.map((aim) => (
                <li key={aim.id}>
                  <strong>{aim.goal_title}:</strong> Target: {aim.timeline_target} | Status: {aim.status} ({aim.progress_percentage}% completed)
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Long-Term Dreams</h3>
            <ul>
              {data.dreams.map((dream) => (
                <li key={dream.id}>
                  <strong>{dream.title} ({dream.horizon}):</strong> {dream.vision_manifesto} (Impact: {dream.impact_area})
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Personal Wishes</h3>
            <ul>
              {data.wishes.map((wish) => (
                <li key={wish.id}>
                  <strong>#{wish.wish_number} {wish.title}:</strong> {wish.deep_reason} (Scope: {wish.impact_scope})
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: Favourites & Entertainment */}
        <section id="favourites-and-culture">
          <h2>Curated Favourites & Cultural Inspirations</h2>
          <div>
            <h3>Favourite Tech, Tools & Artifacts</h3>
            <ul>
              {data.favourites.map((fav) => (
                <li key={fav.id}>
                  <strong>{fav.category} — {fav.item_name} ({fav.subcategory}):</strong> {fav.reason} (Rating: {fav.rating}/10)
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Media, Audio & Literature</h3>
            <ul>
              {data.entertainment.map((ent) => (
                <li key={ent.id}>
                  <strong>{ent.type} — {ent.title}:</strong> by {ent.creator} | Review: {ent.review_summary} (Score: {ent.rating_score}/10)
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: MS-DOS Terminal Command Registry */}
        <section id="terminal-cli-commands">
          <h2>MahiOS Interactive Terminal Commands</h2>
          <dl>
            {data.terminalCommands.map((cmd) => (
              <div key={cmd.id}>
                <dt><code>{cmd.command}</code> — {cmd.description}</dt>
                <dd><pre>{cmd.response_text}</pre></dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Section: Complete Resume Text */}
        <section id="resume-text">
          <h2>Complete Professional Resume Archive</h2>
          <pre>{data.resumeConfig.summary_markdown}</pre>
        </section>

        {/* Section: Engineering Achievements */}
        <section id="achievements">
          <h2>Honors, Awards & Recognitions</h2>
          <ul>
            {data.achievements.map((ach) => (
              <li key={ach.id}>
                <strong>{ach.title}</strong> ({ach.issuer}, {ach.issue_date}) — {ach.description}
              </li>
            ))}
          </ul>
        </section>

        {/* Section: Media Gallery */}
        <section id="media-gallery">
          <h2>Visual Media & Workstation Gallery</h2>
          {data.galleryImages.map((img) => (
            <figure key={img.id}>
              <img src={img.image_url} alt={img.caption || img.title} />
              <figcaption><strong>{img.title}</strong>: {img.caption}</figcaption>
            </figure>
          ))}
        </section>

        {/* Footer */}
        <footer>
          <p>{data.settings.copyright_text || '© 2005-2026 Mujahid Al Mahi. All systems operational.'}</p>
        </footer>
      </div>
    </main>
  );
}
