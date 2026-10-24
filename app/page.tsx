import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProjectsSection } from "@/components/projects-section";
import { AboutSection } from "@/components/about-section";
import { ServicesShowcase } from "@/components/services-showcase";
import { FaqSection } from "@/components/faq-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { getHomeProjects } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getHomeProjects();

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="relative z-20">
        <Header />
        <Hero />
        <ProjectsSection projects={projects} />
        <AboutSection />
        <ServicesShowcase />
        <FaqSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
