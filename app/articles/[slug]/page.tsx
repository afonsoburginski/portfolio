import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getArticle } from "@/lib/articles";

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

  return (
    <div className="relative min-h-screen bg-black">
      <Header />
      <main className="relative z-10 px-6 pt-36 pb-24">
        <article className="mx-auto max-w-3xl">
          <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">← afonsodev.com</Link>
          <h1 className="mt-6 text-[36px] md:text-[52px] font-normal text-white leading-[1.08] tracking-[-0.02em] font-satoshi">
            {article.title}
          </h1>
          <p className="mt-5 text-white/60 text-sm font-sans">
            Afonso Burginski · Senior Software Engineer · {date} · {article.readingMinutes} min read
          </p>

          <div className="mt-12 font-sans text-[17px] leading-8 text-white/75">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: (p) => <h2 className="mt-14 mb-5 text-[28px] font-normal text-white leading-tight font-satoshi" {...p} />,
                h3: (p) => <h3 className="mt-10 mb-4 text-xl font-semibold text-white" {...p} />,
                p: (p) => <p className="my-5" {...p} />,
                strong: (p) => <strong className="font-semibold text-white" {...p} />,
                a: ({ href = "", ...p }) => {
                  const external = href.startsWith("http");
                  return (
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-[#58a6ff] underline decoration-white/20 underline-offset-4 hover:decoration-[#58a6ff] transition-colors"
                      {...p}
                    />
                  );
                },
                ul: (p) => <ul className="my-5 list-disc pl-6 space-y-2 marker:text-white/30" {...p} />,
                ol: (p) => <ol className="my-5 list-decimal pl-6 space-y-2 marker:text-white/30" {...p} />,
                code: (p) => <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] text-white" {...p} />,
                blockquote: (p) => <blockquote className="my-6 border-l-2 border-white/20 pl-5 text-white/60" {...p} />,
                table: (p) => (
                  <div className="my-8 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                    <table className="w-full text-left text-[15px] leading-6" {...p} />
                  </div>
                ),
                th: (p) => <th className="border-b border-white/10 px-4 py-3 font-medium text-white/90" {...p} />,
                td: (p) => <td className="border-b border-white/5 px-4 py-3 align-top text-white/70" {...p} />,
              }}
            >
              {article.body}
            </ReactMarkdown>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
