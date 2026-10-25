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

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  const list = (
    <ol className="space-y-1 font-sans">
      {items.map((i) => (
        <li key={i.id}>
          <a
            href={`#${i.id}`}
            onClick={(e) => jump(e, i.id)}
            aria-current={active === i.id ? "location" : undefined}
            className={`block py-1 text-[13px] leading-5 transition-colors duration-200 ${i.level === 3 ? "pl-4" : ""} ${
              active === i.id ? "font-medium text-white" : "text-white/50 hover:text-white/80"
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
      <details className="mb-8 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md lg:hidden">
        <summary className="cursor-pointer font-sans text-sm font-medium text-white/80">On this page</summary>
        <nav aria-label="Table of contents" className="mt-3">{list}</nav>
      </details>
    );
  }

  return (
    <nav aria-label="Table of contents" className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <p className="mb-3 font-sans text-xs uppercase tracking-wider text-white/50">On this page</p>
      {list}
    </nav>
  );
}
