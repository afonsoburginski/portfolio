"use client";
import { motion } from "motion/react";
import { Code2 } from "lucide-react";
import { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);

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
      <nav className={`max-w-[1600px] mx-auto flex items-center justify-between px-6 py-3 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-md bg-black/40 border border-white/10 shadow-lg rounded-2xl' 
          : ''
      }`}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-white rounded-sm" />
            <div className="w-2 h-2 bg-white rounded-sm" />
          </div>
          <span className="text-white font-normal text-sm ml-1">Afonso Burginski</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <a
            href="#projects"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Projetos
          </a>
          <a
            href="#contact"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Contato
          </a>
        </div>

        <button
          onClick={async () => {
            const cal = await getCalApi();
            cal("modal", { calLink: "rick/get-rick-rolled" });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 border border-white/10 text-sm"
        >
          <span>Vamos Conversar</span>
        </button>
      </nav>
    </header>
  );
};

