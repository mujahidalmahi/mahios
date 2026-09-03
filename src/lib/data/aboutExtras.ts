export interface TechRadarItem {
  id: string;
  status: string;
  title: string;
  description: string;
}

export interface TriviaItem {
  id: string;
  q: string;
  a: string;
}

export const defaultTechRadarItems: TechRadarItem[] = [
  {
    id: 'radar-1',
    status: '[ADOPT / PRODUCTION]',
    title: 'Next.js 16 App Router & Turbopack',
    description: 'Full-stack React server components with micro-caching.',
  },
  {
    id: 'radar-2',
    status: '[TRIAL / BUILDING]',
    title: 'Autonomous AI Agents & MCP Protocols',
    description: 'Integrating agentic tooling and model context protocols in web architectures.',
  },
  {
    id: 'radar-3',
    status: '[EVALUATING]',
    title: 'Rust WebAssembly & Edge Workers',
    description: 'Offloading compute-heavy tasks to native Wasm binaries on the edge.',
  },
  {
    id: 'radar-4',
    status: '[SPECIAL INTEREST]',
    title: 'Retro UI & Web Audio Synthesizers',
    description: 'Blending spatial computing memories with modern web performance.',
  },
];

export const defaultTriviaItems: TriviaItem[] = [
  {
    id: 'trivia-1',
    q: 'What was Mahi’s first programming language?',
    a: 'C / C++ before diving deep into JavaScript, TypeScript, and Rust.',
  },
  {
    id: 'trivia-2',
    q: 'What is Mahi’s favorite mechanical keyboard switch?',
    a: 'Tactile Holy Pandas with custom lubed stabilizers.',
  },
  {
    id: 'trivia-3',
    q: 'How does Mahi take his coffee?',
    a: 'Black pour-over with single-origin medium roast beans.',
  },
  {
    id: 'trivia-4',
    q: 'What is Mahi’s ideal engineering stack?',
    a: 'Next.js 16, TypeScript, Supabase PostgreSQL, Tailwind CSS 4, and Cloudflare/Vercel Edge.',
  },
];

const METADATA_REGEX = /<!--MAHIOS_ABOUT_EXTRAS:([\s\S]*?):END-->/;

export function parseAboutExtras(bioHtml: string | undefined): {
  cleanBioHtml: string;
  techRadar: TechRadarItem[];
  trivia: TriviaItem[];
} {
  if (!bioHtml) {
    return {
      cleanBioHtml: '',
      techRadar: defaultTechRadarItems,
      trivia: defaultTriviaItems,
    };
  }

  const match = bioHtml.match(METADATA_REGEX);
  if (!match) {
    return {
      cleanBioHtml: bioHtml,
      techRadar: defaultTechRadarItems,
      trivia: defaultTriviaItems,
    };
  }

  try {
    const rawJson = match[1];
    const parsed = JSON.parse(rawJson);
    const cleanBioHtml = bioHtml.replace(match[0], '').trim();
    return {
      cleanBioHtml,
      techRadar:
        Array.isArray(parsed.techRadar) && parsed.techRadar.length > 0
          ? parsed.techRadar
          : defaultTechRadarItems,
      trivia:
        Array.isArray(parsed.trivia) && parsed.trivia.length > 0
          ? parsed.trivia
          : defaultTriviaItems,
    };
  } catch {
    return {
      cleanBioHtml: bioHtml.replace(match[0], '').trim(),
      techRadar: defaultTechRadarItems,
      trivia: defaultTriviaItems,
    };
  }
}

export function packAboutExtras(
  cleanBioHtml: string,
  techRadar: TechRadarItem[],
  trivia: TriviaItem[]
): string {
  const metaObj = {
    techRadar,
    trivia,
  };
  const jsonStr = JSON.stringify(metaObj);
  return `${cleanBioHtml.trim()}\n<!--MAHIOS_ABOUT_EXTRAS:${jsonStr}:END-->`;
}
