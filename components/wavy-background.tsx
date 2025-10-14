"use client";
import { GradientBlob } from "./gradient-blob";

export const WavyBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black">
        {/* Multiple organic blobs with different animations */}
        <GradientBlob
          className="w-[800px] h-[800px] bg-gradient-to-br from-gray-800/40 via-gray-900/30 to-transparent top-[-20%] left-[-15%]"
          delay={0}
        />

        <GradientBlob
          className="w-[900px] h-[900px] bg-gradient-to-tr from-neutral-800/30 via-neutral-900/40 to-transparent top-[10%] right-[-20%]"
          delay={2}
        />

        <GradientBlob
          className="w-[700px] h-[700px] bg-gradient-to-bl from-zinc-800/35 via-zinc-900/25 to-transparent bottom-[-15%] left-[5%]"
          delay={4}
        />

        <GradientBlob
          className="w-[600px] h-[600px] bg-gradient-to-tl from-gray-700/30 via-gray-900/20 to-transparent top-[40%] left-[30%]"
          delay={6}
        />

        <GradientBlob
          className="w-[750px] h-[750px] bg-gradient-to-br from-neutral-700/25 via-neutral-900/30 to-transparent bottom-[10%] right-[10%]"
          delay={3}
        />

        <GradientBlob
          className="w-[550px] h-[550px] bg-gradient-to-tr from-zinc-700/20 via-zinc-800/25 to-transparent top-[60%] right-[40%]"
          delay={5}
        />
      </div>

      {/* Heavy blur effect for organic feel */}
      <div className="absolute inset-0 backdrop-blur-[120px]" />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

