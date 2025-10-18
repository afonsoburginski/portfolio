"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { HeaderDesktop } from "./desktop/header";
import { HeaderMobile } from "./mobile/header";

export const Header = () => {
  const isMobile = useIsMobile();

  return isMobile ? <HeaderMobile /> : <HeaderDesktop />;
};

