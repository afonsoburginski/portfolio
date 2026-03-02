"use client";

import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className }: NotificationBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-purple-500 text-white font-bold tabular-nums leading-none",
        count > 9 ? "min-w-[18px] px-1 text-[9px] h-[18px]" : "size-[18px] text-[10px]",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
