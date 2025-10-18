"use client";
import { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export const HeaderMobile = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isCaseStudy = pathname?.startsWith('/case-study/');

  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", { theme: "dark" });
    })();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'px-4 py-2' : 'px-4 py-3'
      }`}>
        <nav className={`flex items-center justify-between px-4 py-3 transition-all duration-300 ${
          scrolled 
            ? 'backdrop-blur-md bg-black/40 border border-white/10 shadow-lg rounded-2xl' 
            : ''
        }`}>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Afonso Burginski Logo"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-white font-normal text-xs font-satoshi">Afonsodev.com</span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-white"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
            {!isCaseStudy && (
              <>
                <button
                  onClick={() => handleNavClick('about-me')}
                  className="text-white text-2xl font-satoshi hover:text-white/70 transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick('services')}
                  className="text-white text-2xl font-satoshi hover:text-white/70 transition-colors"
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavClick('projects')}
                  className="text-white text-2xl font-satoshi hover:text-white/70 transition-colors"
                >
                  Projects
                </button>
                <button
                  onClick={() => handleNavClick('contact')}
                  className="text-white text-2xl font-satoshi hover:text-white/70 transition-colors"
                >
                  Socials
                </button>
              </>
            )}
            
            <button
              onClick={async () => {
                setMenuOpen(false);
                document.body.classList.add('cal-modal-loading');
                const cal = await getCalApi();
                cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
                setTimeout(() => {
                  document.body.classList.remove('cal-modal-loading');
                }, 300);
              }}
              className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 text-lg font-sans"
            >
              Contact Me
            </button>
          </div>
        </div>
      )}
    </>
  );
};

