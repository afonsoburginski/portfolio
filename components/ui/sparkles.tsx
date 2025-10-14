"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const SparklesCore = (props: {
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleColor?: string;
  className?: string;
  particleDensity?: number;
}) => {
  const {
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleColor = "#FFF",
    className,
    particleDensity = 100,
  } = props;

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const particles = Array.from({ length: particleDensity });

  return (
    <svg
      className={cn("absolute inset-0", className)}
      width={dimensions.width}
      height={dimensions.height}
      style={{ background }}
    >
      {particles.map((_, index) => (
        <Particle
          key={index}
          minSize={minSize}
          maxSize={maxSize}
          color={particleColor}
          dimensions={dimensions}
        />
      ))}
    </svg>
  );
};

const Particle = ({
  minSize,
  maxSize,
  color,
  dimensions,
}: {
  minSize: number;
  maxSize: number;
  color: string;
  dimensions: { width: number; height: number };
}) => {
  const r = Math.random() * (maxSize - minSize) + minSize;
  const x = Math.random() * dimensions.width;
  const y = Math.random() * dimensions.height;
  const duration = Math.random() * 20 + 10;

  return (
    <motion.circle
      cx={x}
      cy={y}
      r={r}
      fill={color}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

