"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="w-full px-6 md:px-10 py-10">
        <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 items-center text-xs md:text-sm text-gray-300">
          {/* Left - Email */}
          <div className="justify-self-start mb-4 md:mb-0">
            <a 
              href="mailto:contato@afonsodev.com" 
              className="hover:text-white transition-colors"
            >
              contato@afonsodev.com
            </a>
          </div>

          {/* Center - Credits */}
          <div className="justify-self-center">
            <span>Design In </span>
            <a 
              href="https://www.framer.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline"
            >
              Framer
            </a>
          </div>

          {/* Right - Copyright */}
          <div className="justify-self-end">
            <p>All rights reserved, ©{currentYear}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

