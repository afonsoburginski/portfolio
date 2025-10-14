"use client";
import { motion } from "framer-motion";

interface GradientBlobProps {
  className?: string;
  delay?: number;
}

export const GradientBlob = ({
  className = "",
  delay = 0,
}: GradientBlobProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.2, 0.4, 0.3, 0.5, 0.2],
        scale: [1, 1.3, 1.1, 1.4, 1],
        x: [0, 100, -50, 80, 0],
        y: [0, -60, 40, -80, 0],
        rotate: [0, 90, -45, 120, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
      }}
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{
        willChange: "transform, opacity",
      }}
    />
  );
};

