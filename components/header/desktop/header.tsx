"use client";
import { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const HeaderDesktop = () => {
  const [scrolled, setScrolled] = useState(false);
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'px-6 py-3' : 'px-6 py-4'
    }`}>
      <nav className={`max-w-[1600px] mx-auto relative flex items-center justify-between px-6 py-3 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-md bg-black/40 border border-white/10 shadow-lg rounded-2xl' 
          : ''
      }`}>
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Afonso Burginski Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-white font-normal text-sm font-satoshi">Afonsodev.com</span>
        </Link>

        {!isCaseStudy && pathname !== "/dashboard" && (
          <>
            <div className="hidden md:flex items-center gap-8 text-base font-sans absolute left-1/2 -translate-x-1/2">
              <button
                onClick={() => document.getElementById('about-me')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Projects
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Socials
              </button>
            </div>
            <div className="hidden md:flex items-center gap-8 text-base font-sans ml-auto">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  document.body.classList.add('cal-modal-loading');
                  const cal = await getCalApi();
                  cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
                  setTimeout(() => document.body.classList.remove('cal-modal-loading'), 300);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 border border-white/10"
              >
                <span className="font-sans">Contact Me</span>
              </button>
            </div>
          </>
        )}
        {pathname === "/dashboard" && (
          <>
            <div className="hidden md:flex items-center gap-8 text-base font-sans absolute left-1/2 -translate-x-1/2">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Portfolio
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8 text-base font-sans ml-auto">
              <span className="text-white font-medium" aria-current="page">Dashboard</span>
              <button
                onClick={async () => {
                  document.body.classList.add('cal-modal-loading');
                  const cal = await getCalApi();
                  cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
                  setTimeout(() => document.body.classList.remove('cal-modal-loading'), 300);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 border border-white/10"
              >
                <span className="font-sans">Contact Me</span>
              </button>
            </div>
          </>
        )}
        {isCaseStudy && (
          <button
            onClick={async () => {
              document.body.classList.add('cal-modal-loading');
              const cal = await getCalApi();
              cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
              setTimeout(() => document.body.classList.remove('cal-modal-loading'), 300);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 border border-white/10 text-base ml-auto"
          >
            <span className="font-sans">Contact Me</span>
          </button>
        )}
      </nav>
    </header>
  );
};

