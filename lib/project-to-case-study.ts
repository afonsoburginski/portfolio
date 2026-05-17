import type { Project } from "./schema";
import type { CaseStudy } from "./case-study-types";

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Map a DB `projects` row to the rich CaseStudy view-model. */
export function projectToCaseStudy(p: Project): CaseStudy {
  return {
    title: p.title,
    subtitle: p.subtitle ?? undefined,
    description: p.description,
    image: p.image ?? "",
    image2: p.image2 ?? undefined,
    extraImages: parseJson<string[]>(p.extra_images, []),
    role: p.role ?? "",
    timeline: p.timeline ?? "",
    stack: p.stack ?? "",
    objectives: parseJson<string[]>(p.objectives, []),
    highlights: parseJson<string[]>(p.highlights, []),
    liveUrl: p.live_url ?? undefined,
    githubUrl: p.github_url ?? undefined,
    story: p.story ?? undefined,
    challenges: parseJson<{ title: string; detail: string }[]>(p.challenges, []),
    outcomes: parseJson<string[]>(p.outcomes, []),
    revenueNote: p.revenue_note ?? undefined,
    sections: parseJson<CaseStudy["sections"] extends undefined ? never : NonNullable<CaseStudy["sections"]>>(p.sections, []),
  };
}
