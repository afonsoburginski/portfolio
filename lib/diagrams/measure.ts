/**
 * Deterministic text measurement. No DOM, so SSR, tests and export agree on sizes.
 * Widths are per-glyph estimates for a humanist sans at 1em, slightly conservative so text never clips.
 */
const NARROW = new Set("iljtfI.,:;!|'`()[]/\\-· ");
const WIDE = new Set("mwMW@%");
const CAPS = /[A-Z]/;
const DIGIT = /[0-9]/;

function glyph(c: string): number {
  if (c === " ") return 0.28;
  if (NARROW.has(c)) return 0.3;
  if (c === "m" || c === "M") return 0.9;
  if (c === "W") return 1;
  if (WIDE.has(c)) return 0.8;
  if (CAPS.test(c)) return 0.68;
  if (DIGIT.test(c)) return 0.58;
  if (c.charCodeAt(0) > 0x2e80) return 1; // CJK and wide symbols
  return 0.55;
}

export function textWidth(text: string, size: number, weight = 400): number {
  let w = 0;
  for (const c of text) w += glyph(c);
  return w * size * (weight >= 600 ? 1.06 : 1);
}

/** Greedy word wrap. Long words are split by character; overflow past `maxLines` ends in an ellipsis. */
export function wrapText(text: string, maxWidth: number, size: number, weight = 400, maxLines = 2): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  const push = (l: string) => lines.push(l);
  for (const raw of words) {
    let word = raw;
    while (textWidth(word, size, weight) > maxWidth) {
      let cut = word.length - 1;
      while (cut > 1 && textWidth(word.slice(0, cut), size, weight) > maxWidth) cut--;
      if (line) { push(line); line = ""; }
      push(word.slice(0, cut));
      word = word.slice(cut);
    }
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size, weight) <= maxWidth) line = next;
    else { push(line); line = word; }
  }
  if (line) push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.length > 1 && textWidth(`${last}…`, size, weight) > maxWidth) last = last.slice(0, -1);
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

export const NODE_FONT = { label: 12.5, sub: 10.5, labelLine: 16, subLine: 13.5 } as const;

export type NodeContent = { label: string; sub?: string; icon?: unknown; brand?: unknown; step?: number };
export type NodeBox = { w: number; h: number; labelLines: string[]; subLines: string[]; hasGlyph: boolean };

const MIN_W = 116;
const MAX_TEXT_W = 184;
const PAD_X = 16;

/** Size a card from its content: width fits the text (capped, then wrapped), height fits the wrapped lines. */
export function nodeBox(n: NodeContent): NodeBox {
  const hasGlyph = Boolean(n.icon || n.brand);
  const labelLines = wrapText(n.label, MAX_TEXT_W, NODE_FONT.label, 600, 2);
  const subLines = n.sub ? wrapText(n.sub, MAX_TEXT_W, NODE_FONT.sub, 400, 2) : [];
  const textW = Math.max(
    ...labelLines.map((l) => textWidth(l, NODE_FONT.label, 600)),
    ...subLines.map((l) => textWidth(l, NODE_FONT.sub)),
    0,
  );
  const w = Math.ceil(Math.max(MIN_W, textW + PAD_X * 2) / 4) * 4;
  const h = Math.ceil(
    12 + (hasGlyph ? 22 + 8 : 0) + labelLines.length * NODE_FONT.labelLine + (subLines.length ? 2 + subLines.length * NODE_FONT.subLine : 0) + 12,
  );
  return { w, h: Math.max(h, 52), labelLines, subLines, hasGlyph };
}
