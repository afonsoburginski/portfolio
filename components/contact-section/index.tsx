"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { ContactSectionDesktop } from "./desktop/contact-section";
import { ContactSectionMobile } from "./mobile/contact-section";
import type { SocialPost } from "@/lib/schema";

export const ContactSection = ({ posts }: { posts: SocialPost[] }) => {
  const isMobile = useIsMobile();

  return isMobile ? <ContactSectionMobile posts={posts} /> : <ContactSectionDesktop posts={posts} />;
};

