import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProjectsSection } from "@/components/projects-section";
import { ServicesShowcase } from "@/components/services-showcase";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { Spotlight } from "@/components/ui/spotlight-new";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Spotlight - 3 feixes de luz */}
      <div className="absolute inset-0 z-10">
        <Spotlight />
      </div>

      <div className="relative z-20">
        <Header />
        <Hero />
        <ProjectsSection />
        <ServicesShowcase />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
