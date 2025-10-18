export type CaseStudy = {
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  image2?: string;
  extraImages?: string[];
  role: string;
  timeline: string;
  stack: string;
  objectives: string[];
  highlights: string[];
  liveUrl?: string;
  githubUrl?: string;
  story?: string;
  challenges?: { title: string; detail: string }[];
  outcomes?: string[];
  revenueNote?: string;
  sections?: { title: string; body: string[]; image?: string; video?: string; subsections?: string[] }[];
};

