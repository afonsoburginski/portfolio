"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { FaqSectionDesktop } from "./desktop/faq-section";
import { FaqSectionMobile } from "./mobile/faq-section";

export const FaqSection = () => {
  const isMobile = useIsMobile();

  return isMobile ? <FaqSectionMobile /> : <FaqSectionDesktop />;
};

