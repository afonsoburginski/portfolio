"use client";

import { useRef, useState } from "react";
import { downloadPng, downloadSvg } from "@/lib/diagrams/export";

const BUTTON = "text-[11px] text-white/40 underline decoration-white/15 underline-offset-4 transition-colors hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff] disabled:opacity-50";

/** Discreet "Download SVG / PNG" actions. Finds the diagram SVG inside the enclosing <figure>. */
export function DiagramExportButtons({ name }: { name: string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function run(kind: "svg" | "png") {
    const svg = anchor.current?.closest("figure")?.querySelector<SVGSVGElement>("svg[role='img']");
    if (!svg) return;
    setBusy(true);
    setFailed(false);
    try {
      await (kind === "svg" ? downloadSvg(svg, name) : downloadPng(svg, name));
    } catch (error) {
      console.error("[diagrams] export failed:", error);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span ref={anchor} className="flex items-center gap-2 print:hidden">
      <span className="text-[11px] text-white/30">{failed ? "Export failed" : "Download"}</span>
      <button type="button" className={BUTTON} disabled={busy} onClick={() => run("svg")}>SVG</button>
      <button type="button" className={BUTTON} disabled={busy} onClick={() => run("png")}>PNG</button>
    </span>
  );
}
