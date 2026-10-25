"use client";

import { getCalApi } from "@calcom/embed-react";

export function CalButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const cal = await getCalApi();
        cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
      }}
    >
      {children}
    </button>
  );
}
