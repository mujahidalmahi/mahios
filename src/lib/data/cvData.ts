export interface CVProfile {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  photoUrl?: string;
}

export interface CVExperience {
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
}

export interface CVEducation {
  school: string;
  degree: string;
  start: string;
  end: string;
  grade: string;
  field: string;
  achievements?: string;
}

export interface CVCertification {
  name: string;
  issuer: string;
  date: string;
}

export interface CVLanguage {
  name: string;
  level: string;
}

export interface CVReference {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface CVData {
  profile: CVProfile;
  experiences: CVExperience[];
  education: CVEducation[];
  achievements: string[];
  certifications: CVCertification[];
  languages: CVLanguage[];
  skills: string[];
  references: CVReference[];
}

export const officialCVData: CVData = {
  profile: {
    fullName: "Mujahid Al Mahi",
    title: "Software Systems Engineer",
    email: "mujahidmahi.official@gmail.com",
    phone: "+880 1805128634",
    location: "Narayanganj, Bangladesh",
    linkedin: "",
    website: "mujahidmahi.me",
    photoUrl: "/images/profile-cv.png",
    summary: "Software Systems Engineering learner with hands-on experience in low-level software development and full-stack application development. Strongly interested in distributed systems, database engineering, computer networking, software security, and data-intensive system design. I enjoy understanding how systems work under the hood and applying that knowledge through practical projects and experimentation."
  },
  experiences: [
    {
      company: "Akruno",
      role: "Founder",
      start: "Mar 2026",
      end: "Present",
      location: "Dhaka, Bangladesh",
      bullets: [
        "Launched DoctorOS BD for doctors to manage their clinical workflow",
        "Launched BehindTheApp for developers to help them understand how different features work",
        "Launched PinkDotHash to help users get free access to common Windows utilities"
      ]
    }
  ],
  education: [
    {
      school: "Khulna University",
      degree: "B.Sc. in Computer Science and Engineering",
      start: "Jul 2025",
      end: "June 2029",
      grade: "3.74 / 4.00 CGPA",
      field: "Computer Science and Engineering",
      achievements: ""
    },
    {
      school: "Notre Dame College",
      degree: "HSC",
      start: "Feb 2023",
      end: "Aug 2024",
      grade: "5.00 / 5.00 GPA",
      field: "",
      achievements: ""
    },
    {
      school: "B.M. Union High School",
      degree: "SSC",
      start: "Jan 2017",
      end: "Oct 2022",
      grade: "5.00 / 5.00 GPA",
      field: "",
      achievements: ""
    }
  ],
  achievements: [
    "2nd Runner-up in National Biology Olympiad 2023 and 2024",
    "National Candidate for National Earth Olympiad BootCamp",
    "5+ open-source projects"
  ],
  certifications: [
    {
      name: "AWS Systems Architect",
      issuer: "Amazon Web Services",
      date: "2025"
    },
    {
      name: "SQL Masters",
      issuer: "W3Schools",
      date: "2026"
    }
  ],
  languages: [
    {
      name: "Bangla",
      level: "Native"
    },
    {
      name: "English",
      level: "Professional"
    },
    {
      name: "Hindi",
      level: "Conversational"
    },
    {
      name: "Arabic",
      level: "Basic"
    }
  ],
  skills: [
    "C/C++",
    "React.js",
    "Next.js",
    "Nest.js",
    "PostgreSQL",
    "Git/Github",
    "Linux",
    "Docker"
  ],
  references: [
    {
      name: "Cragg Elman",
      title: "Engineering Manager",
      company: "Acme Corp",
      email: "craggelman@acme.com",
      phone: "+1 (555) 352-0487",
      relationship: "Former Manager"
    },
    {
      name: "Sarah Chen",
      title: "Tech Lead",
      company: "Faxla",
      email: "sarahchen@faxla.io",
      phone: "+1 (555) 759-3254",
      relationship: "Former Colleague"
    }
  ]
};

export function resolveCVData(rawSummaryMarkdown?: string): CVData {
  if (!rawSummaryMarkdown || !rawSummaryMarkdown.trim()) {
    return officialCVData;
  }

  const trimmed = rawSummaryMarkdown.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        return {
          profile: {
            ...officialCVData.profile,
            ...(parsed.profile || {}),
            photoUrl: parsed.profile?.photoUrl || parsed.profile?.avatarUrl || officialCVData.profile.photoUrl,
          },
          experiences: Array.isArray(parsed.experiences) ? parsed.experiences : officialCVData.experiences,
          education: Array.isArray(parsed.education) ? parsed.education : officialCVData.education,
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : officialCVData.achievements,
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : officialCVData.certifications,
          languages: Array.isArray(parsed.languages) ? parsed.languages : officialCVData.languages,
          skills: Array.isArray(parsed.skills) ? parsed.skills : officialCVData.skills,
          references: Array.isArray(parsed.references) ? parsed.references : officialCVData.references,
        };
      }
    } catch {
      // Fallback
    }
  }

  return {
    ...officialCVData,
    profile: {
      ...officialCVData.profile,
      summary: trimmed,
    },
  };
}
