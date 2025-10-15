"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="w-full px-6 md:px-10 py-10">
        <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center text-xs md:text-sm text-gray-300">
          {/* Left - Email */}
          <div>
            <a 
              href="mailto:afonsoburginski@gmail.com" 
              className="hover:text-white transition-colors"
            >
              afonsoburginski@gmail.com
            </a>
          </div>

          {/* Right - Copyright */}
          <div>
            <p>All rights reserved, ©{currentYear}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

