"use client";

export function FooterMobile() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="w-full px-4 py-8">
        <div className="w-full flex flex-col gap-4 items-center text-center text-xs text-gray-300">
          {/* Email */}
          <div>
            <a 
              href="mailto:afonsoburginski@gmail.com" 
              className="hover:text-white transition-colors"
            >
              afonsoburginski@gmail.com
            </a>
          </div>

          {/* Copyright */}
          <div>
            <p>All rights reserved, ©{currentYear}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

