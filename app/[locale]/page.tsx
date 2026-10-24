import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicSite } from "@/components/public-site";
import { getPortfolioContent, isLocale } from "@/lib/content/portfolio";

export function generateStaticParams() { return [{ locale: "en" }, { locale: "pt" }]; }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; const content = getPortfolioContent(locale); return { title: "Afonso Burginski — Senior Software Engineer", description: content.hero.body, alternates: { canonical: `https://afonsodev.com/${locale}`, languages: { en: "https://afonsodev.com/en", pt: "https://afonsodev.com/pt" } }, openGraph: { title: content.hero.title, description: content.hero.body, url: `https://afonsodev.com/${locale}`, type: "website" } }; }
export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); const content = getPortfolioContent(locale); return <><PublicSite content={content} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: "Afonso Kevin Burginski", jobTitle: "Senior Software Engineer", url: `https://afonsodev.com/${locale}`, sameAs: ["https://github.com/afonsoburginski", "https://www.linkedin.com/in/afonsoburginski/"] }) }} /></>; }
