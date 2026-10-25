"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { SocialSectionDesktop } from "./desktop/social-section";
import { SocialSectionMobile } from "./mobile/social-section";
import type { SocialPost } from "@/lib/schema";

export const SocialSection = ({ posts }: { posts: SocialPost[] }) => {
  const isMobile = useIsMobile();

  return isMobile ? <SocialSectionMobile posts={posts} /> : <SocialSectionDesktop posts={posts} />;
};
