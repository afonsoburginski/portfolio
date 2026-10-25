"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { SocialSectionDesktop } from "./desktop/social-section";
import { SocialSectionMobile } from "./mobile/social-section";
import type { FeedItem } from "@/lib/feed";

export const SocialSection = ({ items }: { items: FeedItem[] }) => {
  const isMobile = useIsMobile();

  return isMobile ? <SocialSectionMobile items={items} /> : <SocialSectionDesktop items={items} />;
};
