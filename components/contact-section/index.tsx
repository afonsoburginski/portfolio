"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { ContactSectionDesktop } from "./desktop/contact-section";
import { ContactSectionMobile } from "./mobile/contact-section";

export const ContactSection = () => {
  const isMobile = useIsMobile();

  return isMobile ? <ContactSectionMobile /> : <ContactSectionDesktop />;
};

