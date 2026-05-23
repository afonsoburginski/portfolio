// Renderiza um ContractDocument em PDF respeitando padrão ABNT-like:
// - A4 (595.28 × 841.89 pt)
// - Margens: superior/esquerda 3 cm, inferior/direita 2 cm
// - Helvetica (substituto de Arial), corpo 12 pt
// - Entrelinhas 1.5
// - Parágrafos justificados
// - Greyscale (sem cores chamativas, perfil corporativo)
//
// Funciona em Cloudflare Workers (sem dependência node-only).

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { Block, ContractDocument } from "./contract-prompt";

/* ── Constantes de página ─────────────────────────────────────────── */

const A4 = { width: 595.28, height: 841.89 };
const CM = 28.3465; // 1cm em pontos
const MARGIN_TOP = 3 * CM;     // 85 pt
const MARGIN_BOTTOM = 2 * CM;  // 57 pt
const MARGIN_LEFT = 3 * CM;    // 85 pt
const MARGIN_RIGHT = 2 * CM;   // 57 pt
const CONTENT_WIDTH = A4.width - MARGIN_LEFT - MARGIN_RIGHT;

const LINE_HEIGHT = 1.5;

const SIZES = {
  title: 16,
  h1: 14,
  h2: 13,
  h3: 12,
  body: 12,
  small: 11,
  meta: 10,
  footer: 9,
} as const;

const COLORS = {
  text: rgb(0.13, 0.13, 0.13),
  muted: rgb(0.42, 0.42, 0.45),
  line: rgb(0.78, 0.78, 0.80),
} as const;

const PARAGRAPH_GAP = 6;
const SECTION_GAP = 12;

/* ── Sanitização WinAnsi ──────────────────────────────────────────── */

function sanitizeForWinAnsi(input: string): string {
  let s = input
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/↑/g, "^")
    .replace(/↓/g, "v")
    .replace(/⇒/g, "=>")
    .replace(/⇐/g, "<=")
    .replace(/↔/g, "<->")
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/–/g, "-")
    .replace(/−/g, "-")
    .replace(/…/g, "...")
    .replace(/[     ]/g, " ")
    .replace(/[✓✔]/g, "v")
    .replace(/[✗✘×]/g, "x")
    .replace(/[★☆]/g, "*")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "");
  // CP1252 strict: ASCII + Latin-1 supplement + Windows-1252 specials
  s = s.replace(/[^\t\n\x20-\x7E\xA0-\xFF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g, "");
  return s;
}

/* ── Tipos internos ───────────────────────────────────────────────── */

interface RenderCtx {
  pdf: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
  doc: ContractDocument;
  pageNumber: number;
}

/* ── Helpers de página ────────────────────────────────────────────── */

function ensurePage(ctx: RenderCtx, neededHeight: number) {
  if (ctx.y - neededHeight < MARGIN_BOTTOM + 20) {
    drawFooter(ctx);
    ctx.page = ctx.pdf.addPage([A4.width, A4.height]);
    ctx.pageNumber += 1;
    ctx.y = A4.height - MARGIN_TOP;
    drawHeader(ctx);
  }
}

function drawHeader(ctx: RenderCtx) {
  // Header só em páginas a partir da 2ª — primeira tem o título grande.
  if (ctx.pageNumber === 1) return;
  const titleRaw = sanitizeForWinAnsi(ctx.doc.title);
  const title = truncateToWidth(titleRaw, ctx.font, SIZES.meta, CONTENT_WIDTH);
  ctx.page.drawText(title, {
    x: MARGIN_LEFT,
    y: A4.height - MARGIN_TOP + 12,
    size: SIZES.meta,
    font: ctx.font,
    color: COLORS.muted,
  });
  ctx.page.drawLine({
    start: { x: MARGIN_LEFT, y: A4.height - MARGIN_TOP + 6 },
    end: { x: A4.width - MARGIN_RIGHT, y: A4.height - MARGIN_TOP + 6 },
    color: COLORS.line,
    thickness: 0.4,
  });
}

function drawFooter(ctx: RenderCtx) {
  const text = sanitizeForWinAnsi(
    `${ctx.doc.metadata.contratado}  -  Página ${ctx.pageNumber}`,
  );
  const truncated = truncateToWidth(text, ctx.font, SIZES.footer, CONTENT_WIDTH);
  // Centralizado
  const w = ctx.font.widthOfTextAtSize(truncated, SIZES.footer);
  ctx.page.drawText(truncated, {
    x: MARGIN_LEFT + (CONTENT_WIDTH - w) / 2,
    y: MARGIN_BOTTOM - 18,
    size: SIZES.footer,
    font: ctx.font,
    color: COLORS.muted,
  });
}

/* ── Helpers de texto ─────────────────────────────────────────────── */

function truncateToWidth(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  const ellipsis = "...";
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const candidate = text.slice(0, mid) + ellipsis;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) lo = mid + 1;
    else hi = mid;
  }
  return text.slice(0, Math.max(0, lo - 1)) + ellipsis;
}

interface WrapResult {
  lines: string[];
  /** Marca quais linhas são fim de parágrafo (não devem ser justificadas). */
  paragraphEnd: boolean[];
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): WrapResult {
  const normalized = sanitizeForWinAnsi(text);
  const paragraphs = normalized.split(/\n+/);
  const lines: string[] = [];
  const paragraphEnd: boolean[] = [];

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const p = paragraphs[pIdx];
    if (!p.trim()) continue;
    const words = p.split(/\s+/).filter(Boolean);
    let line = "";
    const pLines: string[] = [];
    for (const w of words) {
      const candidate = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) pLines.push(line);
        if (font.widthOfTextAtSize(w, size) > maxWidth) {
          // Palavra maior que a largura: quebra brutalmente
          let chunk = "";
          for (const ch of w) {
            const cand = chunk + ch;
            if (font.widthOfTextAtSize(cand, size) > maxWidth) {
              pLines.push(chunk);
              chunk = ch;
            } else {
              chunk = cand;
            }
          }
          line = chunk;
        } else {
          line = w;
        }
      }
    }
    if (line) pLines.push(line);
    for (let i = 0; i < pLines.length; i++) {
      lines.push(pLines[i]);
      paragraphEnd.push(i === pLines.length - 1);
    }
  }
  return { lines, paragraphEnd };
}

interface DrawOpts {
  size: number;
  bold?: boolean;
  color?: ReturnType<typeof rgb>;
  indent?: number;
  afterGap?: number;
  align?: "left" | "justify";
}

function drawWrapped(ctx: RenderCtx, text: string, opts: DrawOpts) {
  const font = opts.bold ? ctx.fontBold : ctx.font;
  const indent = opts.indent ?? 0;
  const usableWidth = CONTENT_WIDTH - indent;
  const { lines, paragraphEnd } = wrapText(text, font, opts.size, usableWidth);
  const lh = opts.size * LINE_HEIGHT;
  const align = opts.align ?? "left";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLast = paragraphEnd[i];
    ensurePage(ctx, lh);
    if (!line) {
      ctx.y -= lh;
      continue;
    }
    if (align === "justify" && !isLast) {
      drawJustifiedLine(ctx, line, font, opts.size, indent, usableWidth, opts.color);
    } else {
      ctx.page.drawText(line, {
        x: MARGIN_LEFT + indent,
        y: ctx.y - opts.size,
        size: opts.size,
        font,
        color: opts.color ?? COLORS.text,
      });
    }
    ctx.y -= lh;
  }
  if (opts.afterGap) ctx.y -= opts.afterGap;
}

function drawJustifiedLine(
  ctx: RenderCtx,
  line: string,
  font: PDFFont,
  size: number,
  indent: number,
  usableWidth: number,
  color: ReturnType<typeof rgb> | undefined,
) {
  const words = line.split(" ");
  if (words.length < 2) {
    ctx.page.drawText(line, {
      x: MARGIN_LEFT + indent,
      y: ctx.y - size,
      size,
      font,
      color: color ?? COLORS.text,
    });
    return;
  }
  const wordsWidth = words.reduce((s, w) => s + font.widthOfTextAtSize(w, size), 0);
  const spaces = words.length - 1;
  const remaining = usableWidth - wordsWidth;
  const spaceWidth = remaining / spaces;
  // Limita stretch — se a linha está muito curta, evita "rios brancos"
  const naturalSpace = font.widthOfTextAtSize(" ", size);
  if (spaceWidth > naturalSpace * 3.5) {
    // Fallback: deixa esquerda alinhada
    ctx.page.drawText(line, {
      x: MARGIN_LEFT + indent,
      y: ctx.y - size,
      size,
      font,
      color: color ?? COLORS.text,
    });
    return;
  }
  let x = MARGIN_LEFT + indent;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    ctx.page.drawText(w, { x, y: ctx.y - size, size, font, color: color ?? COLORS.text });
    x += font.widthOfTextAtSize(w, size) + spaceWidth;
  }
}

/* ── Block dispatcher ─────────────────────────────────────────────── */

function drawBlock(ctx: RenderCtx, block: Block) {
  switch (block.type) {
    case "h1":
      ensurePage(ctx, 50);
      ctx.y -= SECTION_GAP;
      drawWrapped(ctx, block.text, {
        size: SIZES.h1,
        bold: true,
        color: COLORS.text,
        afterGap: 4,
      });
      ctx.page.drawLine({
        start: { x: MARGIN_LEFT, y: ctx.y + 2 },
        end: { x: A4.width - MARGIN_RIGHT, y: ctx.y + 2 },
        color: COLORS.text,
        thickness: 0.6,
      });
      ctx.y -= 6;
      break;
    case "h2":
      ensurePage(ctx, 36);
      ctx.y -= SECTION_GAP * 0.7;
      drawWrapped(ctx, block.text, {
        size: SIZES.h2,
        bold: true,
        color: COLORS.text,
        afterGap: 2,
      });
      ctx.page.drawLine({
        start: { x: MARGIN_LEFT, y: ctx.y + 1 },
        end: { x: MARGIN_LEFT + 36, y: ctx.y + 1 },
        color: COLORS.muted,
        thickness: 0.4,
      });
      ctx.y -= 4;
      break;
    case "h3":
      ensurePage(ctx, 28);
      ctx.y -= 4;
      drawWrapped(ctx, block.text, {
        size: SIZES.h3,
        bold: true,
        color: COLORS.text,
        afterGap: 2,
      });
      break;
    case "p":
      drawWrapped(ctx, block.text, {
        size: SIZES.body,
        align: "justify",
        afterGap: PARAGRAPH_GAP,
      });
      break;
    case "ul":
      for (const item of block.items) {
        const lh = SIZES.body * LINE_HEIGHT;
        ensurePage(ctx, lh);
        ctx.page.drawText("•", {
          x: MARGIN_LEFT,
          y: ctx.y - SIZES.body,
          size: SIZES.body,
          font: ctx.fontBold,
          color: COLORS.text,
        });
        drawWrapped(ctx, item, { size: SIZES.body, indent: 14, align: "justify" });
      }
      ctx.y -= 4;
      break;
    case "kv":
      for (const row of block.rows) {
        const lh = SIZES.body * LINE_HEIGHT;
        ensurePage(ctx, lh);
        const safeKey = sanitizeForWinAnsi(`${row.key}:`);
        const truncatedKey = truncateToWidth(safeKey, ctx.fontBold, SIZES.body, CONTENT_WIDTH * 0.4);
        ctx.page.drawText(truncatedKey, {
          x: MARGIN_LEFT,
          y: ctx.y - SIZES.body,
          size: SIZES.body,
          font: ctx.fontBold,
          color: COLORS.text,
        });
        const keyWidth = ctx.fontBold.widthOfTextAtSize(truncatedKey, SIZES.body) + 6;
        drawWrapped(ctx, row.value, { size: SIZES.body, indent: keyWidth });
      }
      ctx.y -= 4;
      break;
    case "clause":
      ensurePage(ctx, 42);
      ctx.y -= 4;
      drawWrapped(ctx, `${block.number} ${block.title}`, {
        size: SIZES.h3,
        bold: true,
        color: COLORS.text,
        afterGap: 2,
      });
      drawWrapped(ctx, block.body, {
        size: SIZES.body,
        align: "justify",
        afterGap: PARAGRAPH_GAP,
      });
      break;
    case "spacer":
      ctx.y -= block.size ?? 12;
      break;
    case "signature":
      ensurePage(ctx, 70);
      ctx.y -= 18;
      ctx.page.drawLine({
        start: { x: MARGIN_LEFT, y: ctx.y },
        end: { x: MARGIN_LEFT + 220, y: ctx.y },
        color: COLORS.text,
        thickness: 0.6,
      });
      ctx.y -= 12;
      const party = sanitizeForWinAnsi(block.party);
      const truncatedParty = truncateToWidth(party, ctx.fontBold, SIZES.small, CONTENT_WIDTH);
      ctx.page.drawText(truncatedParty, {
        x: MARGIN_LEFT,
        y: ctx.y - SIZES.small,
        size: SIZES.small,
        font: ctx.fontBold,
        color: COLORS.text,
      });
      ctx.y -= SIZES.small * LINE_HEIGHT;
      for (const line of block.lines) {
        drawWrapped(ctx, line, { size: SIZES.small, color: COLORS.muted });
      }
      ctx.y -= 8;
      break;
  }
}

/* ── Capa / metadata header ───────────────────────────────────────── */

function drawDocumentHeader(ctx: RenderCtx) {
  ensurePage(ctx, 110);
  drawWrapped(ctx, ctx.doc.title, {
    size: SIZES.title,
    bold: true,
    color: COLORS.text,
    afterGap: 2,
  });
  if (ctx.doc.subtitle) {
    drawWrapped(ctx, ctx.doc.subtitle, {
      size: SIZES.h3,
      color: COLORS.muted,
      afterGap: 8,
    });
  } else {
    ctx.y -= 6;
  }

  const m = ctx.doc.metadata;
  const rows: Array<[string, string]> = [
    ["Contratante", m.cliente],
    ["Contratado", m.contratado],
    ["Data", m.data],
  ];
  if (m.validade) rows.push(["Validade", m.validade]);

  for (const [k, v] of rows) {
    const lh = SIZES.meta * LINE_HEIGHT;
    ensurePage(ctx, lh);
    const safeKey = sanitizeForWinAnsi(`${k}:`);
    const safeVal = sanitizeForWinAnsi(v);
    ctx.page.drawText(safeKey, {
      x: MARGIN_LEFT,
      y: ctx.y - SIZES.meta,
      size: SIZES.meta,
      font: ctx.fontBold,
      color: COLORS.muted,
    });
    const keyWidth = ctx.fontBold.widthOfTextAtSize(safeKey, SIZES.meta) + 8;
    const valueMaxWidth = CONTENT_WIDTH - keyWidth;
    const truncatedVal = truncateToWidth(safeVal, ctx.font, SIZES.meta, valueMaxWidth);
    ctx.page.drawText(truncatedVal, {
      x: MARGIN_LEFT + keyWidth,
      y: ctx.y - SIZES.meta,
      size: SIZES.meta,
      font: ctx.font,
      color: COLORS.text,
    });
    ctx.y -= lh;
  }
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN_LEFT, y: ctx.y },
    end: { x: A4.width - MARGIN_RIGHT, y: ctx.y },
    color: COLORS.line,
    thickness: 0.4,
  });
  ctx.y -= 14;
}

/* ── Entry point ──────────────────────────────────────────────────── */

export async function renderContractToPdf(doc: ContractDocument): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const firstPage = pdf.addPage([A4.width, A4.height]);
  const ctx: RenderCtx = {
    pdf,
    page: firstPage,
    font,
    fontBold,
    y: A4.height - MARGIN_TOP,
    doc,
    pageNumber: 1,
  };
  drawDocumentHeader(ctx);
  for (const block of doc.blocks) drawBlock(ctx, block);
  drawFooter(ctx);
  return pdf.save();
}
