"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { ServicesShowcaseDesktop } from "./desktop/services-showcase";
import { ServicesShowcaseMobile } from "./mobile/services-showcase";

export const ServicesShowcase = () => {
  const isMobile = useIsMobile();

  return isMobile ? <ServicesShowcaseMobile /> : <ServicesShowcaseDesktop />;
};

