import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProjectsSection } from "@/components/projects-section";
import { AboutSection } from "@/components/about-section";
import { ServicesShowcase } from "@/components/services-showcase";
import { FaqSection } from "@/components/faq-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
// import { Spotlight } from "@/components/ui/spotlight-new";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="relative z-20">
        <Header />
        <Hero />
        <ProjectsSection />
        <AboutSection />
        <ServicesShowcase />
        <FaqSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
