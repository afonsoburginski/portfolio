"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const SpotlightEffect = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.04), transparent 40%)`,
      }}
    />
  );
};

