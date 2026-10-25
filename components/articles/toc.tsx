"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "./slug";

export function TableOfContents({ items, variant }: { items: TocItem[]; variant: "sidebar" | "inline" }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  const list = (
    <ol className="space-y-1.5 border-l border-white/10">
      {items.map((i) => (
        <li key={i.id}>
          <a
            href={`#${i.id}`}
            aria-current={active === i.id ? "location" : undefined}
            className={`-ml-px block border-l py-0.5 text-[13px] leading-5 transition-colors ${i.level === 3 ? "pl-7" : "pl-4"} ${
              active === i.id ? "border-[#2dd4bf] text-white" : "border-transparent text-white/45 hover:text-white/80"
            }`}
          >
            {i.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details className="mb-10 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm lg:hidden">
        <summary className="cursor-pointer text-sm font-medium text-white/80">On this page</summary>
        <nav aria-label="Table of contents" className="mt-3">{list}</nav>
      </details>
    );
  }

  return (
    <nav aria-label="Table of contents" className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/40">On this page</p>
      {list}
    </nav>
  );
}
