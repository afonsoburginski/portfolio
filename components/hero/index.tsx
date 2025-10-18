"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { HeroDesktop } from "./desktop/hero";
import { HeroMobile } from "./mobile/hero";

export const Hero = () => {
  const isMobile = useIsMobile();

  return isMobile ? <HeroMobile /> : <HeroDesktop />;
};

