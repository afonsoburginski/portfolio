// Renderiza um ContractDocument (gerado pela IA) em PDF usando pdf-lib.
// Funciona em Cloudflare Workers (sem dependências node-only).

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { Block, ContractDocument } from "./contract-prompt";

const A4 = { width: 595.28, height: 841.89 };
const MARGIN_X = 56;
const MARGIN_Y = 64;
const LINE_HEIGHT = 1.45;

const SIZES = {
  h1: 20,
  h2: 14,
  h3: 12,
  p: 10.5,
  small: 9.5,
  meta: 9,
  footer: 8,
} as const;

const COLORS = {
  text: rgb(0.1, 0.1, 0.12),
  muted: rgb(0.42, 0.42, 0.48),
  accent: rgb(0.32, 0.18, 0.62),
  line: rgb(0.85, 0.85, 0.88),
} as const;

interface RenderCtx {
  pdf: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
  doc: ContractDocument;
  pageNumber: number;
}

function ensurePage(ctx: RenderCtx, neededHeight: number) {
  if (ctx.y - neededHeight < MARGIN_Y + 30) {
    drawFooter(ctx);
    ctx.page = ctx.pdf.addPage([A4.width, A4.height]);
    ctx.pageNumber += 1;
    ctx.y = A4.height - MARGIN_Y;
    drawHeader(ctx);
  }
}

function drawHeader(ctx: RenderCtx) {
  // Linha discreta no topo + título do documento
  const text = ctx.doc.title;
  ctx.page.drawText(text, {
    x: MARGIN_X,
    y: A4.height - MARGIN_Y + 18,
    size: SIZES.meta,
    font: ctx.font,
    color: COLORS.muted,
  });
  ctx.page.drawLine({
    start: { x: MARGIN_X, y: A4.height - MARGIN_Y + 10 },
    end: { x: A4.width - MARGIN_X, y: A4.height - MARGIN_Y + 10 },
    color: COLORS.line,
    thickness: 0.5,
  });
}

function drawFooter(ctx: RenderCtx) {
  const txt = `${ctx.doc.metadata.contratado} · Página ${ctx.pageNumber}`;
  ctx.page.drawText(txt, {
    x: MARGIN_X,
    y: MARGIN_Y - 28,
    size: SIZES.footer,
    font: ctx.font,
    color: COLORS.muted,
  });
}

/** Quebra o texto em linhas que cabem na largura, respeitando palavras. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  // Normaliza caracteres não suportados pela fonte Helvetica (apenas WinAnsi)
  const normalized = text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/—/g, "—").replace(/–/g, "-");
  const paragraphs = normalized.split(/\n+/);
  const lines: string[] = [];
  for (const p of paragraphs) {
    const words = p.split(/\s+/);
    let line = "";
    for (const w of words) {
      const candidate = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        // Se a palavra sozinha excede largura, quebra brutalmente
        if (font.widthOfTextAtSize(w, size) > maxWidth) {
          let chunk = "";
          for (const ch of w) {
            const cand = chunk + ch;
            if (font.widthOfTextAtSize(cand, size) > maxWidth) {
              lines.push(chunk);
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
    if (line) lines.push(line);
    lines.push(""); // espaço entre parágrafos
  }
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function drawWrapped(
  ctx: RenderCtx,
  text: string,
  opts: { size: number; bold?: boolean; color?: ReturnType<typeof rgb>; indent?: number; afterGap?: number },
) {
  const font = opts.bold ? ctx.fontBold : ctx.font;
  const indent = opts.indent ?? 0;
  const usableWidth = A4.width - MARGIN_X * 2 - indent;
  const lines = wrapText(text, font, opts.size, usableWidth);
  const lh = opts.size * LINE_HEIGHT;
  for (const line of lines) {
    ensurePage(ctx, lh);
    if (line.length > 0) {
      ctx.page.drawText(line, {
        x: MARGIN_X + indent,
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

function drawBlock(ctx: RenderCtx, block: Block) {
  switch (block.type) {
    case "h1":
      ensurePage(ctx, 60);
      ctx.y -= 12;
      drawWrapped(ctx, block.text, { size: SIZES.h1, bold: true, color: COLORS.accent, afterGap: 4 });
      ctx.page.drawLine({
        start: { x: MARGIN_X, y: ctx.y + 4 },
        end: { x: MARGIN_X + 64, y: ctx.y + 4 },
        color: COLORS.accent,
        thickness: 1.5,
      });
      ctx.y -= 10;
      break;
    case "h2":
      ensurePage(ctx, 40);
      ctx.y -= 8;
      drawWrapped(ctx, block.text, { size: SIZES.h2, bold: true, color: COLORS.text, afterGap: 4 });
      break;
    case "h3":
      ensurePage(ctx, 30);
      ctx.y -= 4;
      drawWrapped(ctx, block.text, { size: SIZES.h3, bold: true, color: COLORS.text, afterGap: 2 });
      break;
    case "p":
      drawWrapped(ctx, block.text, { size: SIZES.p, afterGap: 6 });
      break;
    case "ul":
      for (const item of block.items) {
        const lh = SIZES.p * LINE_HEIGHT;
        ensurePage(ctx, lh);
        ctx.page.drawText("•", {
          x: MARGIN_X + 4,
          y: ctx.y - SIZES.p,
          size: SIZES.p,
          font: ctx.fontBold,
          color: COLORS.accent,
        });
        drawWrapped(ctx, item, { size: SIZES.p, indent: 16 });
      }
      ctx.y -= 4;
      break;
    case "kv":
      for (const row of block.rows) {
        const lh = SIZES.p * LINE_HEIGHT;
        ensurePage(ctx, lh);
        // Key
        ctx.page.drawText(`${row.key}:`, {
          x: MARGIN_X + 2,
          y: ctx.y - SIZES.p,
          size: SIZES.p,
          font: ctx.fontBold,
          color: COLORS.muted,
        });
        // Value
        const keyWidth = ctx.fontBold.widthOfTextAtSize(`${row.key}:`, SIZES.p) + 8;
        drawWrapped(ctx, row.value, { size: SIZES.p, indent: keyWidth + 2 });
      }
      ctx.y -= 4;
      break;
    case "clause":
      ensurePage(ctx, 50);
      ctx.y -= 4;
      drawWrapped(
        ctx,
        `${block.number} ${block.title}`,
        { size: SIZES.h3, bold: true, color: COLORS.accent, afterGap: 2 },
      );
      drawWrapped(ctx, block.body, { size: SIZES.p, afterGap: 6 });
      break;
    case "spacer":
      ctx.y -= block.size ?? 12;
      break;
    case "signature":
      ensurePage(ctx, 80);
      ctx.y -= 16;
      // Linha
      ctx.page.drawLine({
        start: { x: MARGIN_X, y: ctx.y },
        end: { x: MARGIN_X + 220, y: ctx.y },
        color: COLORS.text,
        thickness: 0.7,
      });
      ctx.y -= 14;
      ctx.page.drawText(block.party, {
        x: MARGIN_X,
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

function drawMetadataHeader(ctx: RenderCtx) {
  // Top: título grande + subtítulo
  ensurePage(ctx, 90);
  drawWrapped(ctx, ctx.doc.title, { size: 22, bold: true, color: COLORS.text, afterGap: 2 });
  if (ctx.doc.subtitle) {
    drawWrapped(ctx, ctx.doc.subtitle, { size: SIZES.h3, color: COLORS.muted, afterGap: 6 });
  }
  // Bloco metadata: Cliente · Contratado · Data · Validade
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
    ctx.page.drawText(`${k}:`, {
      x: MARGIN_X,
      y: ctx.y - SIZES.meta,
      size: SIZES.meta,
      font: ctx.fontBold,
      color: COLORS.muted,
    });
    const keyWidth = ctx.fontBold.widthOfTextAtSize(`${k}:`, SIZES.meta) + 6;
    ctx.page.drawText(v, {
      x: MARGIN_X + keyWidth,
      y: ctx.y - SIZES.meta,
      size: SIZES.meta,
      font: ctx.font,
      color: COLORS.text,
    });
    ctx.y -= lh;
  }
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.y },
    end: { x: A4.width - MARGIN_X, y: ctx.y },
    color: COLORS.line,
    thickness: 0.5,
  });
  ctx.y -= 12;
}

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
    y: A4.height - MARGIN_Y,
    doc,
    pageNumber: 1,
  };
  drawHeader(ctx);
  drawMetadataHeader(ctx);

  for (const block of doc.blocks) {
    drawBlock(ctx, block);
  }
  drawFooter(ctx);

  return pdf.save();
}
