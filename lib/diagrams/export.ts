/** Client-side export of a rendered diagram: SVG with resolved styles, or PNG through a canvas. */

const BG = "#0d1117";
const FALLBACK_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export type SvgExportOptions = { background?: string };

/** Serializes an inline <svg> into a standalone SVG string: explicit size, resolved font, solid background, no animation classes. */
export function serializeSvg(svg: SVGSVGElement, { background = BG }: SvgExportOptions = {}): { markup: string; width: number; height: number } {
  const viewBox = svg.viewBox.baseVal;
  const width = Math.round(viewBox.width || svg.clientWidth || 800);
  const height = Math.round(viewBox.height || svg.clientHeight || 450);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const font = (typeof getComputedStyle === "function" ? getComputedStyle(svg).fontFamily : "") || FALLBACK_FONT;

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("class");
  clone.setAttribute("style", `font-family:${font.replace(/"/g, "'")}`);
  // Flow animation lives in CSS, which a standalone file does not have: keep the lines static.
  clone.querySelectorAll(".dg-flow").forEach((el) => { el.removeAttribute("class"); el.setAttribute("stroke-dasharray", "none"); });
  clone.querySelectorAll("[style*='text-transform']").forEach((el) => {
    if (el.textContent) el.textContent = el.textContent.toUpperCase();
    el.removeAttribute("style");
  });
  const bg = clone.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x", String(viewBox.x));
  bg.setAttribute("y", String(viewBox.y));
  bg.setAttribute("width", String(width));
  bg.setAttribute("height", String(height));
  bg.setAttribute("fill", background);
  clone.insertBefore(bg, clone.firstChild);
  return { markup: new XMLSerializer().serializeToString(clone), width, height };
}

export function svgBlob(svg: SVGSVGElement, options?: SvgExportOptions): Blob {
  return new Blob([serializeSvg(svg, options).markup], { type: "image/svg+xml;charset=utf-8" });
}

/** Rasterizes the diagram. `scale` 2 gives a sharp image on high-density screens. */
export async function pngBlob(svg: SVGSVGElement, scale = 2, options?: SvgExportOptions): Promise<Blob> {
  const { markup, width, height } = serializeSvg(svg, options);
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("SVG could not be rasterized")); image.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encoding failed"))), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const exportFileName = (name: string, ext: "svg" | "png") => `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "diagram"}.${ext}`;

export async function downloadSvg(svg: SVGSVGElement, name: string): Promise<void> {
  downloadBlob(svgBlob(svg), exportFileName(name, "svg"));
}
export async function downloadPng(svg: SVGSVGElement, name: string): Promise<void> {
  downloadBlob(await pngBlob(svg), exportFileName(name, "png"));
}
