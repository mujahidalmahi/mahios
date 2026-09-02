import React from 'react';
import { getBiographyData } from '@/lib/data/fetchBiographyData';
import ResponsiveOSWrapper from '@/components/os/ResponsiveOSWrapper';

export default async function HomePage() {
  const data = await getBiographyData();

  return (
    <main className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden fixed inset-0">
      {/* 1. Interactive MahiOS Desktop / CRT / Tablet / Mobile UI */}
      <ResponsiveOSWrapper data={data} />

      {/* 2. Semantic Crawlable Content (Hidden from visual view, indexed by search engines & screen readers) */}
      <div className="sr-only aria-hidden:false">
        <header>
          <h1>{data.settings.owner_name} - {data.settings.headline}</h1>
          <p>{data.settings.bio_short}</p>
          <address>
            Location: {data.settings.location} | Email: {data.settings.email}
          </address>
        </header>

        <section id="about">
          <h2>About {data.settings.owner_name}</h2>
          <div dangerouslySetInnerHTML={{ __html: data.about.bio_html }} />
          <ul>
            {data.about.interests?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="experience">
          <h2>Work Experience</h2>
          {data.experiences.map((exp) => (
            <article key={exp.id}>
              <h3>{exp.role} at {exp.company}</h3>
              <p>{exp.start_date} to {exp.end_date} | {exp.location}</p>
              <div dangerouslySetInnerHTML={{ __html: exp.description_html }} />
              <ul>
                {exp.achievements?.map((ach, i) => (
                  <li key={i}>{ach}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section id="projects">
          <h2>Engineering Projects</h2>
          {data.projects.map((proj) => (
            <article key={proj.id}>
              <h3>{proj.title}</h3>
              <p>{proj.summary}</p>
              <div dangerouslySetInnerHTML={{ __html: proj.description_html }} />
              <p>Technologies: {proj.tags?.join(', ')}</p>
            </article>
          ))}
        </section>

        <section id="skills">
          <h2>Technical Skills & Competencies</h2>
          {data.categories.map((cat) => (
            <div key={cat.id}>
              <h3>{cat.name}</h3>
              <ul>
                {data.skills.filter((s) => s.category_id === cat.id).map((s) => (
                  <li key={s.id}>{s.name} - {s.proficiency}% Proficiency ({s.years_of_experience} years)</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section id="education">
          <h2>Academic Background</h2>
          {data.education.map((edu) => (
            <article key={edu.id}>
              <h3>{edu.degree} in {edu.field_of_study}</h3>
              <p>{edu.institution} ({edu.start_year} - {edu.end_year})</p>
            </article>
          ))}
        </section>

        <section id="blog">
          <h2>Articles & Notes</h2>
          {data.blogPosts.map((post) => (
            <article key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
