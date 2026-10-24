import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedCaseStudy } from "@/components/public-site";
import { getCaseStudyContent } from "@/lib/content/case-studies";
import { isLocale } from "@/lib/content/portfolio";

export function generateStaticParams() { return [{ locale: "en", slug: "orbit" }, { locale: "en", slug: "studio-stormz" }, { locale: "pt", slug: "orbit" }, { locale: "pt", slug: "studio-stormz" }]; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const study = getCaseStudyContent(slug, locale);
  if (!study) return {};
  const url = `https://afonsodev.com/${locale}/case-study/${slug}`;
  return {
    title: `${study.title} — Afonso Burginski`,
    description: study.summary,
    alternates: {
      canonical: url,
      languages: {
        en: `https://afonsodev.com/en/case-study/${slug}`,
        pt: `https://afonsodev.com/pt/case-study/${slug}`,
      },
    },
    openGraph: { title: study.title, description: study.summary, url, type: "article" },
  };
}

export default async function LocalizedCaseStudyPage({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale) || !["orbit", "studio-stormz"].includes(slug)) notFound(); return <LocalizedCaseStudy locale={locale} slug={slug} />; }
