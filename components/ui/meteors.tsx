"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface Meteor {
  id: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
}

export const Meteors = ({
  number = 20,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const [meteors, setMeteors] = useState<Meteor[]>([]);

  useEffect(() => {
    const meteorArray: Meteor[] = [];
    for (let i = 0; i < number; i++) {
      meteorArray.push({
        id: i,
        left: Math.floor(Math.random() * (400 - -400) + -400),
        animationDelay: Math.random() * (0.8 - 0.2) + 0.2,
        animationDuration: Math.floor(Math.random() * (10 - 2) + 2),
      });
    }
    setMeteors(meteorArray);
  }, [number]);

  return (
    <>
      {meteors.map((meteor) => (
        <span
          key={"meteor" + meteor.id}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: 0,
            left: meteor.left + "px",
            animationDelay: meteor.animationDelay + "s",
            animationDuration: meteor.animationDuration + "s",
          }}
        ></span>
      ))}
    </>
  );
};

