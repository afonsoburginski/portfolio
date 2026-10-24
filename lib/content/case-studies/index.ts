import { orbitCaseStudy } from "./orbit";
import { studioStormzCaseStudy } from "./studio-stormz";
import type { CaseStudyContent } from "./types";

const caseStudies = {
  orbit: orbitCaseStudy,
  "studio-stormz": studioStormzCaseStudy,
} as const;

export function getCaseStudyContent(slug: string, locale: "en" | "pt"): CaseStudyContent | null {
  const study = caseStudies[slug as keyof typeof caseStudies];
  return study?.[locale] ?? null;
}
