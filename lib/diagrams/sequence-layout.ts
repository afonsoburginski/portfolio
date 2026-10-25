import { nodeBox, textWidth, wrapText, type NodeBox } from "./measure";
import type { DiagramTone } from "./names";
import type { SequenceSpec } from "./schema";

export type SParticipant = { id: string; x: number; box: NodeBox; spec: SequenceSpec["participants"][number] };
export type SRow =
  | { kind: "message"; y: number; x1: number; x2: number; self: boolean; label: string; labelW: number; style: "sync" | "async" | "return"; tone: DiagramTone; n?: number }
  | { kind: "note"; y: number; x: number; w: number; h: number; lines: string[]; tone: DiagramTone }
  | { kind: "phase"; y: number; label: string };
export type SequenceLayout = { width: number; height: number; headerH: number; participants: SParticipant[]; rows: SRow[]; lifelineTop: number; lifelineBottom: number };

const FONT = 10.5;
const MSG_H = 46, SELF_H = 56, PHASE_H = 36, NOTE_PAD = 10, NOTE_LINE = 14, ROW_GAP = 10;
const NUM_SPACE = 44; // room for the numbered badge next to the arrow tail

/**
 * Column spacing is derived from the content: every gap is wide enough for the headers beside it and for the longest
 * message label that has to fit across it, so no label ever runs through a lifeline.
 */
export function layoutSequence(spec: SequenceSpec): SequenceLayout {
  const boxes = spec.participants.map((p) => nodeBox(p));
  const index = new Map(spec.participants.map((p, i) => [p.id, i]));
  const n = spec.participants.length;
  const numbered = spec.numbered !== false;
  const gaps = Array.from({ length: n - 1 }, (_, i) => Math.max(120, (boxes[i].w + boxes[i + 1].w) / 2 + 28));
  let rightRoom = boxes[n - 1].w / 2;
  let leftRoom = boxes[0].w / 2;

  const need = (a: number, b: number, width: number) => {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const have = gaps.slice(lo, hi).reduce((s, g) => s + g, 0);
    if (have < width) { const add = (width - have) / (hi - lo); for (let k = lo; k < hi; k++) gaps[k] += add; }
  };
  const msgs = spec.steps.flatMap((s) => (s.kind === "message" ? [s] : []));
  // Shortest spans first, so wide labels stretch only what they must.
  [...msgs].sort((a, b) => Math.abs(index.get(a.from)! - index.get(a.to)!) - Math.abs(index.get(b.from)! - index.get(b.to)!)).forEach((m) => {
    const a = index.get(m.from)!, b = index.get(m.to)!;
    const w = textWidth(m.label, FONT) + 28 + (numbered ? NUM_SPACE : 0);
    if (a === b) {
      const room = w - (numbered ? NUM_SPACE : 0) + 56;
      if (a < n - 1) need(a, a + 1, room); else rightRoom = Math.max(rightRoom, room);
    } else need(a, b, w);
  });

  const xs = [0];
  gaps.forEach((g) => xs.push(xs[xs.length - 1] + g));
  const left = Math.max(leftRoom, 20) + 8;
  const participants: SParticipant[] = spec.participants.map((p, i) => ({ id: p.id, x: left + xs[i], box: boxes[i], spec: p }));
  const headerH = Math.max(...boxes.map((b) => b.h));
  const width = Math.ceil(left + xs[n - 1] + Math.max(rightRoom, 20) + 8);

  const rows: SRow[] = [];
  let y = headerH + 22, counter = 0;
  for (const s of spec.steps) {
    if (s.kind === "phase") { rows.push({ kind: "phase", y: y + PHASE_H / 2, label: s.label }); y += PHASE_H; continue; }
    if (s.kind === "message") {
      const a = index.get(s.from)!, b = index.get(s.to)!;
      const self = a === b;
      const h = self ? SELF_H : MSG_H;
      rows.push({
        kind: "message", y: y + h - 14, x1: participants[a].x, x2: participants[b].x, self, label: s.label, labelW: textWidth(s.label, FONT),
        style: s.style ?? "sync", tone: s.tone ?? (s.style === "return" ? "plain" : "main"), n: numbered ? ++counter : undefined,
      });
      y += h;
      continue;
    }
    const over = (Array.isArray(s.over) ? s.over : [s.over]).map((id) => index.get(id)!).sort((p, q) => p - q);
    const first = participants[over[0]].x, last = participants[over[over.length - 1]].x;
    const span = last - first;
    const wrapW = span > 0 ? span + 40 : 200;
    const lines = wrapText(s.text, wrapW - NOTE_PAD * 2, FONT, 400, 3);
    const w = span > 0 ? wrapW : Math.min(wrapW, Math.max(...lines.map((l) => textWidth(l, FONT))) + NOTE_PAD * 2);
    const h = lines.length * NOTE_LINE + NOTE_PAD * 2 - 2;
    const x = span > 0 ? first - 20 : first - w / 2;
    rows.push({ kind: "note", y: y + ROW_GAP, x, w, h, lines, tone: s.tone ?? "amber" });
    y += h + ROW_GAP * 2;
  }
  const lifelineBottom = y + 4;
  return { width, height: lifelineBottom + 8, headerH, participants, rows, lifelineTop: headerH, lifelineBottom };
}
