import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/dashboard-data";
import { projectToCaseStudy } from "@/lib/project-to-case-study";
import { CaseStudyView } from "./case-study-view";

export const dynamic = "force-dynamic";

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    console.error(`Case study not found for slug: ${slug}`);
    return notFound();
  }

  return <CaseStudyView data={projectToCaseStudy(project)} />;
}
