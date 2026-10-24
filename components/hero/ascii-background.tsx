"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const GradientASCII = dynamic(() => import("../ui/gradient-ascii"), { ssr: false });

const COLORS = ["#0b1220", "#1f6feb", "#8957e5"];

export const HeroAsciiBackground = ({ variant }: { variant: "desktop" | "mobile" }) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const isDesktop = variant === "desktop";

  return (
    <>
      <div className="absolute inset-0 w-full h-full" aria-hidden="true">
        <GradientASCII
          className="absolute inset-0"
          colors={COLORS}
          lightMode={false}
          shape="horizon"
          cellSize={isDesktop ? 14 : 18}
          density={0.55}
          glyphOpacity={0.35}
          softness={0.7}
          gradientOpacity={0.6}
          speed={reducedMotion ? 0 : 0.5}
          flow={reducedMotion ? 0 : 0.5}
          mouseInteraction={isDesktop && !reducedMotion}
          clickEffect="none"
          dpr={isDesktop ? 1.5 : 1}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-black pointer-events-none" />
    </>
  );
};
