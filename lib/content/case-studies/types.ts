import type { Locale } from "@/lib/content/portfolio";

export type CaseStudySection = {
  id: string;
  title: string;
  intro: string;
  points?: string[];
};

export type CaseStudyContent = {
  slug: "orbit" | "studio-stormz";
  locale: Locale;
  eyebrow: string;
  title: string;
  summary: string;
  tags: string[];
  architectureLabel: string;
  architectureDescription: string;
  flowLabel: string;
  flowDescription: string;
  sections: CaseStudySection[];
  verifiedLabel: string;
  verifiedItems: string[];
  evidenceNote: string;
  statusLabel: string;
};
