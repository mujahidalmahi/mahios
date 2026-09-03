import { ImageResponse } from 'next/og';
import { getBiographyData } from '@/lib/data/fetchBiographyData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const alt = 'MahiOS 05 — Mujahid Al Mahi Digital Biography';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const data = await getBiographyData();
  const name = data.settings.owner_name || 'Mujahid Al Mahi';
  const role = data.experiences?.[0]?.role
    ? `${data.experiences[0].role} at ${data.experiences[0].company}`
    : data.settings.headline || 'Full-Stack Software Engineer & Creative Technologist';
  const location = data.about?.location || 'Dhaka, Bangladesh';
  const expYears = data.about?.experience_years || '1.5';
  const projects = data.about?.projects_completed || '7';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0b0e',
          backgroundImage: 'radial-gradient(#1e2230 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          color: '#ffffff',
          fontFamily: 'monospace',
          padding: '50px 60px',
          border: '12px solid #000080',
          position: 'relative',
        }}
      >
        {/* Retro Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #283046',
            paddingBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#000080',
                border: '3px outset #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '20px',
              }}
            >
              M
            </div>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#00ff66', letterSpacing: '2px' }}>
              MahiOS 05 [v4.08]
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: '#000080',
              color: '#ffffff',
              padding: '6px 18px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px outset #ffffff',
            }}
          >
            SYS_ONLINE • 2005-2026
          </div>
        </div>

        {/* Central Identity Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-1px',
              lineHeight: 1.1,
              textShadow: '0 0 20px rgba(0,255,102,0.3)',
            }}
          >
            {name}
          </div>

          <div
            style={{
              fontSize: '28px',
              color: '#60a5fa',
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            {role}
          </div>

          <div style={{ fontSize: '20px', color: '#94a3b8' }}>
            📍 {location} • Interactive Operating System & Digital Biography
          </div>
        </div>

        {/* Bottom Metrics Deck */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #283046',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', gap: '24px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#161922',
                border: '2px solid #2a3142',
                padding: '10px 20px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>EXPERIENCE</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff66' }}>{expYears}+ Years</span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#161922',
                border: '2px solid #2a3142',
                padding: '10px 20px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>PROJECTS</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8' }}>{projects}+ Systems</span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#161922',
                border: '2px solid #2a3142',
                padding: '10px 20px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>ARCHITECTURE</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>Next.js 16 • Edge</span>
            </div>
          </div>

          <div
            style={{
              fontSize: '20px',
              color: '#00ff66',
              fontWeight: 'bold',
              border: '2px solid #00ff66',
              padding: '10px 20px',
            }}
          >
            mujahidmahi.me
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
