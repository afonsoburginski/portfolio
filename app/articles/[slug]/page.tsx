import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getArticle } from "@/lib/articles";
import { ArticleHeader } from "@/components/articles/article-header";
import { AuthorCard } from "@/components/articles/author-card";
import { MarkdownBody } from "@/components/articles/markdown-body";
import { ReadingProgress } from "@/components/articles/reading-progress";
import { extractToc } from "@/components/articles/slug";
import { TableOfContents } from "@/components/articles/toc";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const url = `https://afonsodev.com/articles/${article.slug}`;
  return {
    title: `${article.title} | Afonso Burginski`,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      authors: ["Afonso Burginski"],
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.description },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return notFound();

  const date = new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const toc = extractToc(article.body);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-black">
      <ReadingProgress targetId="article-content" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 25% 0%, rgba(31,111,235,.18), transparent 70%), radial-gradient(ellipse 50% 90% at 80% 0%, rgba(45,212,191,.12), transparent 70%)",
        }}
      />
      <Header />
      <main className="relative z-10 px-6 pt-36 pb-24">
        <ArticleHeader title={article.title} description={article.description} date={date} readingMinutes={article.readingMinutes} />
        <div className="mx-auto mt-14 grid max-w-[1040px] gap-x-16 lg:grid-cols-[minmax(0,720px)_minmax(0,240px)] lg:justify-between">
          <article id="article-content" className="min-w-0 font-sans text-[17px] leading-[1.8] text-white/75 lg:text-[18px]">
            <TableOfContents items={toc} variant="inline" />
            <MarkdownBody body={article.body} />
            <AuthorCard canonicalUrl={`https://afonsodev.com/articles/${article.slug}`} />
          </article>
          <div className="hidden lg:block">
            <TableOfContents items={toc} variant="sidebar" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
