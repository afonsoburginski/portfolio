"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { use, useEffect, useState, useMemo } from "react";
import { ExternalLink, Github } from "lucide-react";
import { CASE_STUDIES } from "@/lib/case-studies";

// Case studies are now imported from lib/case-studies/
// Each project has its own file to prevent interference between case studies

export default function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const data = CASE_STUDIES[slug];
  
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  // Build TOC with hierarchy - cada projeto tem seções específicas
  const toc = useMemo(() => {
    if (!data) return [];
    
    const items: { id: string; label: string; level: number }[] = [];

    // Sempre incluir seções básicas
    if (data.story) items.push({ id: "story", label: "Vision & MVP", level: 0 });
    items.push({ id: "stack", label: "Stack", level: 0 });
    items.push({ id: "objectives", label: "Objectives", level: 0 });

    // Challenges só como tópico principal, sem subtópicos
    if (data.challenges && data.challenges.length) {
      items.push({ id: "challenges", label: "Challenges & Solutions", level: 0 });
    }

    items.push({ id: "highlights", label: "Key Highlights", level: 0 });

    // Seções específicas de cada projeto com seus próprios subtópicos
    if (data.sections) {
      data.sections.forEach((s) => {
        const sectionId = slugify(s.title);
        items.push({ id: sectionId, label: s.title, level: 0 });
        
        // Adicionar subsections se existirem
        if (s.subsections && s.subsections.length > 0) {
          s.subsections.forEach((subsection) => {
            items.push({ 
              id: `${sectionId}-${slugify(subsection)}`, 
              label: subsection, 
              level: 1 
            });
          });
        }
      });
    }

    if (data.outcomes && data.outcomes.length) items.push({ id: "results", label: "Results", level: 0 });

    return items;
  }, [data]);

  const [activeId, setActiveId] = useState<string>(toc[0]?.id || "");

  useEffect(() => {
    const handleScroll = () => {
      const ids = toc.map((t) => t.id);
      const elements = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));

      if (!elements.length) return;

      // Get current scroll position
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // If we're at the bottom of the page, activate the last item
      if (scrollY + windowHeight >= documentHeight - 100) {
        setActiveId(ids[ids.length - 1]);
        return;
      }

      // Find the section that's currently in view
      // A section is "active" when its top is above 30% of viewport
      let currentActiveId = ids[0];

      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top;

        // Section is active if its top is above 30% of viewport
        if (elementTop <= windowHeight * 0.3) {
          currentActiveId = element.id;
          break;
        }
      }

      setActiveId(currentActiveId);
    };

    // Run once on mount
    handleScroll();

    // Add scroll listener with throttle
    let rafId: number | null = null;
    const scrollListener = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [toc]);

  if (!data) {
    console.error(`Case study not found for slug: ${slug}`);
    return notFound();
  }

  return (
    <div className="relative min-h-screen bg-black overflow-visible">
      <div className="relative z-20">
        <Header />
        <section className="relative pt-32 pb-20 px-6">
          <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-10">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-white/50 text-xs mb-3 font-sans uppercase tracking-wider">On this page</p>
                <nav className="text-white/70 text-sm font-sans space-y-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.getElementById(item.id);
                        target?.scrollIntoView({ behavior: "smooth", block: "start" });
                        setActiveId(item.id);
                      }}
                      className={`block py-1 transition-colors duration-200 ${
                        item.level === 1 ? "pl-4 text-[13px]" : ""
                      } ${
                        activeId === item.id
                          ? "text-white font-medium"
                          : "text-white/50 hover:text-white/80"
                      }`}
                      aria-current={activeId === item.id ? "true" : undefined}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="max-w-[820px]">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[42px] md:text-[52px] font-normal leading-[1.15] text-white font-satoshi mb-4"
            >
              {data.title}
            </motion.h1>

            {/* Metadata + Links */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-4 text-white/60 text-sm font-sans">
                <span>{data.role}</span>
                <span>•</span>
                <span>{data.timeline}</span>
              </div>

              {(data.liveUrl || data.githubUrl) && (
                <div className="flex items-center gap-3">
                  {data.liveUrl && (
                    <a
                      href={data.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] rounded-lg text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-all text-sm font-sans"
                    >
                      <ExternalLink size={16} />
                      <span>Live Site</span>
                    </a>
                  )}
                  {data.githubUrl && (
                    <a
                      href={data.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] rounded-lg text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-all text-sm font-sans"
                    >
                      <Github size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Hero Images */}
            <div className="space-y-6 mb-12">
              <div className="group relative rounded-lg overflow-hidden aspect-[3/4] md:aspect-[4/3] bg-black/40 max-w-[1200px] mx-auto">
                <Image
                  src={data.image}
                  alt={`${data.title} screenshot`}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-contain transition-all duration-500 md:filter md:grayscale md:group-hover:grayscale-0 group-hover:scale-105"
                  priority
                />
              </div>
              
              {data.image2 && (
                <div className="group relative rounded-lg overflow-hidden aspect-[3/4] md:aspect-[4/3] bg-black/40 max-w-[1200px] mx-auto">
                  <Image
                    src={data.image2}
                    alt={`${data.title} screenshot 2`}
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-contain transition-all duration-500 md:filter md:grayscale md:group-hover:grayscale-0 group-hover:scale-105"
                  />
                </div>
              )}
            </div>

            {/* Story / Proposal */}
            {data.story && (
              <div className="mb-16 scroll-mt-32" id="story">
                <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Vision & MVP</h2>
                <p className="text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                  {data.story}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mb-16">
              <p className="text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                {data.description}
              </p>
            </div>

            {/* Stack */}
            <div className="mb-16 scroll-mt-32" id="stack">
              <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Stack</h2>
              <p className="text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                {data.stack}
              </p>
            </div>

            {/* Objectives */}
            <div className="mb-16 scroll-mt-32" id="objectives">
              <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Objectives</h2>
              <ul className="space-y-4 text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                {data.objectives.map((o) => (
                  <li key={o} className="pl-8 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-white/40 before:rounded-full">
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            {data.challenges && data.challenges.length > 0 && (
              <div className="mb-16 scroll-mt-32" id="challenges">
                <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Challenges & Solutions</h2>
                <div className="space-y-6">
                  {data.challenges.map((c) => (
                    <div
                      key={c.title}
                      className="rounded-lg bg-[#0d0d0d] p-5 border border-white/5"
                    >
                      <p className="text-white font-sans mb-2">{c.title}</p>
                      <p className="text-white/70 font-sans text-[15px] leading-relaxed">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            <div className="mb-16 scroll-mt-32" id="highlights">
              <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Key Highlights</h2>
              <ul className="space-y-4 text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                {data.highlights.map((h) => (
                  <li key={h} className="pl-8 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-white/40 before:rounded-full">
                    {h}
                  </li>
                ))}
              </ul>
            </div>


            {/* Sections with direct anchors */}
            {data.sections && data.sections.length > 0 && (
              <div className="mb-16">
                {data.sections.map((s) => {
                  const sectionId = slugify(s.title);
                  return (
                    <div key={s.title} className="mb-12 scroll-mt-32" id={sectionId}>
                      <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">{s.title}</h2>
                      <div className="space-y-4">
                        {s.body.map((p, idx) => (
                          <p key={idx} className="text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">{p}</p>
                        ))}
                      </div>
                      
                      {/* Subsections */}
                      {s.subsections && s.subsections.length > 0 && (
                        <div className="mt-8 space-y-6">
                          {s.subsections.map((subsection) => (
                            <div key={subsection} id={`${sectionId}-${slugify(subsection)}`} className="scroll-mt-32">
                              <h3 className="text-white font-satoshi text-[20px] mb-3 font-normal">{subsection}</h3>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {s.image && (
                        <div className="group relative rounded-lg overflow-hidden aspect-[3/4] md:aspect-[4/3] bg-black/40 mt-8 max-w-[1200px] mx-auto">
                          <Image
                            src={s.image}
                            alt={`${s.title} screenshot`}
                            fill
                            sizes="(max-width: 768px) 100vw, 1200px"
                            className="object-contain transition-all duration-500 md:filter md:grayscale md:group-hover:grayscale-0 group-hover:scale-105"
                          />
                        </div>
                      )}
                      
                      {s.video && (
                        <div className="group relative rounded-lg overflow-hidden aspect-[3/4] md:aspect-[4/3] bg-black/40 mt-8 max-w-[1200px] mx-auto">
                          <video
                            src={s.video}
                            controls
                            className="w-full h-full object-contain"
                            poster={s.image}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Outcomes */}
            {data.outcomes && data.outcomes.length > 0 && (
              <div className="mb-10 scroll-mt-32" id="results">
                <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Resultados</h2>
                <ul className="space-y-3 text-white/80 font-sans text-base leading-relaxed">
                  {data.outcomes.map((o) => (
                    <li key={o} className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-white/40">
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.revenueNote && (
              <div className="rounded-lg bg-[#0d0d0d] p-5 border border-white/5 text-white/80 font-sans">
                {data.revenueNote}
              </div>
            )}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
