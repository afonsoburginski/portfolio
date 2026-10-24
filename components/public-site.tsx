import { ArrowLeft, ArrowUpRight, Check, CircleAlert, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { ArchitectureDiagram, DataFlowDiagram } from "@/components/case-study-diagrams";
import { getCaseStudyContent } from "@/lib/content/case-studies";
import type { CaseStudyContent } from "@/lib/content/case-studies/types";
import type { PortfolioContent, PortfolioProject } from "@/lib/content/portfolio";

function SiteHeader({ content }: { content: PortfolioContent }) {
  return (
    <header className="site-header">
      <Link href={`/${content.locale}`} className="site-mark" aria-label="Afonso Burginski home">
        <span className="site-mark-dot" />AB
      </Link>
      <nav className="site-nav" aria-label="Primary">
        <a href="#work">{content.nav.work}</a>
        <a href="#experience">{content.nav.experience}</a>
        <a href="#contact">{content.nav.contact}</a>
        <Link href={`/${content.alternateLocale}`} className="site-language">{content.nav.language}</Link>
      </nav>
    </header>
  );
}

function StatusLine({ children }: { children: React.ReactNode }) {
  return <div className="status-line"><span className="status-pulse" />{children}</div>;
}

function ProjectCard({ project, content }: { project: PortfolioProject; content: PortfolioContent }) {
  return (
    <Link href={`/${content.locale}/case-study/${project.slug}`} className={`project-card project-card-${project.accent}`}>
      <div className="project-card-top"><span>{project.eyebrow[content.locale]}</span><ArrowUpRight size={18} aria-hidden /></div>
      <div className="project-signal" aria-hidden><span /><span /><span /><span /><span /><span /></div>
      <div className="project-card-bottom">
        <div><h3>{project.title[content.locale]}</h3><p>{project.summary[content.locale]}</p></div>
        <div className="project-meta"><span>{project.status[content.locale]}</span><div>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
      </div>
    </Link>
  );
}

export function PublicSite({ content }: { content: PortfolioContent }) {
  return (
    <div className="site-shell">
      <SiteHeader content={content} />
      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy"><StatusLine>{content.hero.eyebrow}</StatusLine><h1 id="hero-title">{content.hero.title}</h1><p>{content.hero.body}</p><div className="hero-actions"><a className="button button-primary" href="#work">{content.hero.primaryCta}<ArrowUpRight size={16} /></a><a className="button button-secondary" href="#contact">{content.hero.secondaryCta}</a></div></div>
          <div className="hero-visual" aria-label="A simplified media delivery signal diagram"><div className="hero-visual-label">SYSTEM / 01</div><div className="signal-path"><span className="signal-node signal-node-active">ingest</span><i /><span className="signal-node">process</span><i /><span className="signal-node">deliver</span><i /><span className="signal-node">observe</span></div><div className="hero-visual-foot"><span>video systems</span><span>distributed state</span></div></div>
        </section>
        <section className="section section-work" id="work"><div className="section-heading"><div><span className="section-kicker">01 / {content.sections.selectedWork}</span><h2>{content.sections.selectedWork}</h2></div><p>{content.sections.selectedWorkIntro}</p></div><div className="project-list">{content.projects.map((project) => <ProjectCard key={project.slug} project={project} content={content} />)}</div></section>
        <section className="section expertise-section" id="expertise"><div className="section-heading"><div><span className="section-kicker">02 / {content.sections.expertise}</span><h2>{content.sections.expertise}</h2></div></div><div className="expertise-grid">{content.expertise.map((item, index) => <article className="expertise-item" key={item.title}><span className="expertise-index">0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p><div className="tool-list">{item.tools.map((tool) => <span key={tool}>{tool}</span>)}</div></article>)}</div></section>
        <section className="section experience-section" id="experience"><div className="section-heading"><div><span className="section-kicker">03 / {content.sections.experience}</span><h2>{content.sections.experience}</h2></div></div>{content.experience.map((item) => <article className="experience-row" key={item.company}><div><span className="experience-period">{item.period}</span><h3>{item.company}</h3></div><div><h4>{item.role}</h4><p>{item.body}</p></div></article>)}</section>
        <section className="section principles-section"><div className="section-heading"><div><span className="section-kicker">04 / {content.sections.philosophy}</span><h2>{content.sections.philosophy}</h2></div></div><div className="principles-list">{content.philosophy.map((item) => <article key={item.title}><Check size={18} /><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div></section>
        <section className="section open-source-section"><div className="section-heading"><div><span className="section-kicker">05 / {content.sections.openSource}</span><h2>{content.sections.openSource}</h2></div></div><div className="open-source-list">{content.openSource.map((item) => <article key={item.title}><Github size={18} /><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div></section>
        <section className="contact-section" id="contact"><div><span className="section-kicker">06 / {content.sections.contact}</span><h2>{content.sections.contact}</h2><p>{content.sections.contactBody}</p></div><a className="contact-link" href={`mailto:${content.footer.email}`}>{content.footer.email}<ArrowUpRight size={20} /></a></section>
      </main>
      <footer className="site-footer"><span>{content.footer.availability}</span><div><a href="https://github.com/afonsoburginski" target="_blank" rel="noreferrer"><Github size={17} />{content.footer.source}</a><a href="https://www.linkedin.com/in/afonsoburginski/" target="_blank" rel="noreferrer"><Linkedin size={17} />LinkedIn</a></div></footer>
    </div>
  );
}

export function LocalizedCaseStudy({ locale, slug }: { locale: "en" | "pt"; slug: string }) {
  const study = getCaseStudyContent(slug, locale);
  if (!study) return null;

  return <CaseStudyPage study={study} />;
}

function CaseStudyPage({ study }: { study: CaseStudyContent }) {
  const homeLabel = study.locale === "pt" ? "Voltar ao portfólio" : "Back to portfolio";
  const talkLabel = study.locale === "pt" ? "Vamos conversar" : "Let’s talk";

  return (
    <div className="case-shell">
      <header className="case-header"><Link href={`/${study.locale}`} className="back-link"><ArrowLeft size={16} />{homeLabel}</Link><span>CASE STUDY / {study.title}</span></header>
      <main className="case-main">
        <div className="case-hero"><span className="section-kicker">{study.eyebrow}</span><h1>{study.title}</h1><p>{study.summary}</p><div className="case-tags">{study.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><span className="case-status">{study.statusLabel}</span></div>
        <ArchitectureDiagram project={study.slug} locale={study.locale} label={study.architectureLabel} description={study.architectureDescription} />
        <DataFlowDiagram project={study.slug} locale={study.locale} label={study.flowLabel} description={study.flowDescription} />
        <div className="case-sections">{study.sections.map((section, index) => <CaseSection key={section.id} section={section} index={index} />)}</div>
        <aside className="evidence-note"><CircleAlert size={17} /><div><strong>{study.verifiedLabel}</strong>{study.verifiedItems.map((item) => <span key={item}>{item}</span>)}<em>{study.evidenceNote}</em></div></aside>
      </main>
      <footer className="site-footer case-footer"><Link href={`/${study.locale}`}>Afonso Burginski</Link><a href="mailto:afonsoburginski@gmail.com">{talkLabel}<ArrowUpRight size={17} /></a></footer>
    </div>
  );
}

function CaseSection({ section, index }: { section: CaseStudyContent["sections"][number]; index: number }) {
  return <section className="case-section" id={section.id}><div className="case-section-heading"><span className="section-kicker">{String(index + 1).padStart(2, "0")} / {section.title}</span><h2>{section.title}</h2></div><div className="case-section-body"><p>{section.intro}</p>{section.points && <ul className="case-list">{section.points.map((point) => <li key={point}><Check size={16} />{point}</li>)}</ul>}</div></section>;
}
