"use client";
import React from "react";

export function GridBackground() {
  return (
    <div className="absolute inset-0 w-full h-full bg-black bg-grid-white/[0.02]">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
    </div>
  );
}

