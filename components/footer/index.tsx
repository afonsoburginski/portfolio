"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { FooterDesktop } from "./desktop/footer";
import { FooterMobile } from "./mobile/footer";

export const Footer = () => {
  const isMobile = useIsMobile();

  return isMobile ? <FooterMobile /> : <FooterDesktop />;
};

