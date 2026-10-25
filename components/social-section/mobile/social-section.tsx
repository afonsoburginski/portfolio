"use client";

import { SiLinkedin, SiGithub, SiInstagram } from "react-icons/si";
import { SocialFeed } from "@/components/contact-section/social-feed";
import type { FeedItem } from "@/lib/feed";

export function SocialSectionMobile({ items }: { items: FeedItem[] }) {
  return (
    <section id="social" className="relative py-16 px-4">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <SocialFeed items={items} />

          <div className="flex items-center gap-5 mt-8 text-white/80">
            <a href="https://www.linkedin.com/in/afonsoburginski/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors">
              <SiLinkedin size={18} />
            </a>
            <div className="w-px h-4 bg-white/30" />
            <a href="https://github.com/afonsoburginski" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white transition-colors">
              <SiGithub size={18} />
            </a>
            <div className="w-px h-4 bg-white/30" />
            <a href="https://www.instagram.com/afonso_burginski?igsh=MWVhYXF0am9jNzIwMw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
              <SiInstagram size={18} />
            </a>
          </div>
      </div>
    </section>
  );
}
