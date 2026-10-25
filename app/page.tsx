import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProjectsSection } from "@/components/projects-section";
import { AboutSection } from "@/components/about-section";
import { SocialSection } from "@/components/social-section";
import { ServicesShowcase } from "@/components/services-showcase";
import { FaqSection } from "@/components/faq-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { getHomeProjects } from "@/lib/dashboard-data";
import { getSocialPosts } from "@/lib/social-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, posts] = await Promise.all([getHomeProjects(), getSocialPosts(6, "linkedin")]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="relative z-20">
        <Header />
        <Hero />
        <ProjectsSection projects={projects} />
        <AboutSection />
        <SocialSection posts={posts} />
        <ServicesShowcase />
        <FaqSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
